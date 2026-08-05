const axios_like_fetch = global.fetch; // Node 18+ has fetch built-in
const Product = require("../models/product");
const User = require("../models/user");
const { asyncHandler } = require("../middleware/errorHandler");



const getRapidMinerRecommendations = async (userId) => {
  if (!process.env.RAPIDMINER_API_URL) return null;

  try {
    const response = await fetch(process.env.RAPIDMINER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RAPIDMINER_API_KEY || ""}`,
      },
      body: JSON.stringify({ userId }),
      // fail fast so we can fall back locally
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.recommendedProductIds || null;
  } catch (error) {
    console.warn("RapidMiner service unreachable, falling back to local recommendation logic.");
    return null;
  }
};


const getLocalRecommendations = async (user, limit) => {
  const interactedIds = [...(user.viewedProducts || []), ...(user.purchasedProducts || [])];

  let seedProducts = [];
  if (interactedIds.length > 0) {
    seedProducts = await Product.find({ _id: { $in: interactedIds } });
  }

  const categories = [...new Set(seedProducts.map((p) => p.category))];
  const tags = [...new Set(seedProducts.flatMap((p) => p.tags))];

  const excludeIds = user.purchasedProducts || [];

  let recommendations = [];

  if (categories.length > 0 || tags.length > 0) {
    recommendations = await Product.find({
      _id: { $nin: excludeIds },
      $or: [{ category: { $in: categories } }, { tags: { $in: tags } }],
    })
      .sort({ ratingsAverage: -1, createdAt: -1 })
      .limit(limit);
  }

  // If not enough personalized matches, pad with top-rated / newest products
  if (recommendations.length < limit) {
    const excludeMore = [...excludeIds, ...recommendations.map((p) => p._id)];
    const fallback = await Product.find({ _id: { $nin: excludeMore } })
      .sort({ ratingsAverage: -1, createdAt: -1 })
      .limit(limit - recommendations.length);
    recommendations = [...recommendations, ...fallback];
  }

  return recommendations;
};

// @route   GET /api/analytics/recommendations
// @access  Private (user, admin)
const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const user = await User.findById(req.user._id);

  const rapidMinerIds = await getRapidMinerRecommendations(user._id.toString());

  let recommendations;
  let source;

  if (rapidMinerIds && rapidMinerIds.length > 0) {
    recommendations = await Product.find({ _id: { $in: rapidMinerIds } }).limit(limit);
    source = "rapidminer";
  } else {
    recommendations = await getLocalRecommendations(user, limit);
    source = "local-fallback";
  }

  res.status(200).json({
    success: true,
    source,
    count: recommendations.length,
    data: recommendations,
  });
});

module.exports = { getRecommendations };
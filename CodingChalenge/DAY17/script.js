let cartCount = 0;

function addToCart() {
  cartCount++;

  // Update badge
  document.getElementById("cart-count").textContent = cartCount;
}
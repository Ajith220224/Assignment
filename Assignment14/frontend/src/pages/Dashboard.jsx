// src/pages/Dashboard.js
// Main CRM page: list, create, edit, delete customers.

import { useState, useEffect } from "react";
import api from "../services/api";
import CustomerForm from "../components/CustomerForm";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null); // customer being edited, or null
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/customers");
      setCustomers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (form) => {
    try {
      await api.post("/customers", form);
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer");
    }
  };

  const handleUpdate = async (form) => {
    try {
      await api.put(`/customers/${editing._id}`, form);
      setEditing(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update customer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Customers</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); }}>
          + Add Customer
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <CustomerForm
          initialData={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers yet. Add your first one above.</p>
      ) : (
        <table className="customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.company}</td>
                <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                <td>
                  <button onClick={() => { setEditing(c); setShowForm(false); }}>Edit</button>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
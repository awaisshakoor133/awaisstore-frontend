import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

function AdminCustomersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/orders`)
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Customers load nahi ho paaye");
      })
      .finally(() => setLoading(false));
  }, []);

  // Unique customers from orders
  const customersMap = {};
  orders.forEach((order) => {
    const key = order.customer?.email || order.customer?.phone;
    if (key && !customersMap[key]) {
      customersMap[key] = {
        ...order.customer,
        orderCount: 0,
        totalSpent: 0,
      };
    }
    if (key) {
      customersMap[key].orderCount += 1;
      customersMap[key].totalSpent += order.total || 0;
    }
  });

  const customers = Object.values(customersMap);

  if (loading) return <p className="muted">Loading customers...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Customers ({customers.length})</h2>
      </div>

      {customers.length === 0 ? (
        <div className="admin-empty">
          <p>Abhi tak koi customer nahi aaya.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td className="muted">{customer.email || "N/A"}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className="admin-badge">
                      {customer.orderCount}
                    </span>
                  </td>
                  <td>
                    <strong>
                      Rs. {customer.totalSpent.toLocaleString()}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminCustomersPage;
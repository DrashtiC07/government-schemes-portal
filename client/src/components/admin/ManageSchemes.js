import React, { useEffect, useState } from "react";

export default function ManageSchemes() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await fetch("http://localhost:5001/admin/schemes", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const delItem = async (id) => {
    await fetch(`http://localhost:5001/admin/schemes/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    setItems(items.filter((x) => x._id !== id));
  };

  return (
    <section>
      <h3>Manage Schemes</h3>
      {items.length === 0 ? (
        <p>No schemes found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Scheme</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id}>
                <td>{s.schemeFullName}</td>
                <td>{s.status}</td>
                <td>{new Date(s.updatedAt).toLocaleString()}</td>
                <td>
                  {/* Simple delete; you can add edit modal later */}
                  <button
                    onClick={() => delItem(s._id)}
                    className="btn btn-outline-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

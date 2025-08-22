import React, { useEffect, useState } from "react";

export default function PendingSchemes() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await fetch(
      "http://localhost:5000/admin/schemes?status=pending",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, action) => {
    await fetch(`http://localhost:5000/admin/schemes/${id}/${action}`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
    setItems(items.filter((x) => x._id !== id));
  };

  return (
    <section>
      <h3>Pending Schemes</h3>
      {items.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Scheme</th>
              <th>Ministry</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id}>
                <td>{s.schemeFullName}</td>
                <td>{s.schemeMinistry || "-"}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => act(s._id, "approve")}
                    className="btn btn-success"
                  >
                    Approve
                  </button>{" "}
                  <button
                    onClick={() => act(s._id, "reject")}
                    className="btn btn-danger"
                  >
                    Reject
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

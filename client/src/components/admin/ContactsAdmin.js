import React, { useEffect, useState } from "react";

export default function ContactsAdmin() {
  const [items, setItems] = useState([]);
  const [reply, setReply] = useState({});
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await fetch("http://localhost:5001/admin/contacts", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const saveReply = async (id) => {
    await fetch(`http://localhost:5001/admin/contacts/${id}/reply`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ reply: reply[id] || "" }),
    });
    await load();
  };

  return (
    <section>
      <h3>Contact Messages</h3>
      {items.length === 0 ? (
        <p>No messages.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Reply</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.message}</td>
                <td>
                  <input
                    value={reply[m._id] ?? (m.reply || "")}
                    onChange={(e) =>
                      setReply({ ...reply, [m._id]: e.target.value })
                    }
                  />
                </td>
                <td>
                  <button
                    onClick={() => saveReply(m._id)}
                    className="btn btn-primary"
                  >
                    Save Reply
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

import React, { useEffect, useState } from "react";

export default function AdminPDF() {
  const [pdfs, setPdfs] = useState([]);
  const token = localStorage.getItem("token");

  // Load PDFs
  useEffect(() => {
    fetch("http://localhost:5001/pdfs")
      .then((res) => res.json())
      .then((data) => setPdfs(data));
  }, []);

  const handleUpload = async () => {
    const title = prompt("Enter PDF title:");
    const url = prompt("Enter PDF URL (e.g., Google Drive link):");

    await fetch("http://localhost:5001/admin/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title, url }),
    });

    alert("PDF Uploaded");
    window.location.reload();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5001/admin/pdf/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    alert("PDF Deleted");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📂 Manage PDFs</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpload}
      >
        Upload PDF
      </button>
      <ul className="mt-4">
        {pdfs.map((pdf) => (
          <li
            key={pdf._id}
            className="flex justify-between items-center border p-2 rounded mb-2"
          >
            <a
              href={pdf.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600"
            >
              {pdf.title}
            </a>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => handleDelete(pdf._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

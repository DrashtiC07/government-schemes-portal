"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Plus,
  Mail,
  TrendingUp,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
const STATES = [
  "All India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const MINISTRIES = ["All", "NPTEL", "AYUSH", "AICTE", "ISRO", "KVPY"];
const GENDERS = ["All", "Male", "Female", "Other"];
const CASTES = ["All", "General", "OBC", "SC", "ST", "EWS", "Minority"];
const AGES = ["All", "16–25", "18+", "60+"];

const AdminDashboard = () => {
  const [schemes, setSchemes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editScheme, setEditScheme] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchemes: 0,
    pendingSchemes: 0,
    approvedSchemes: 0,
    rejectedSchemes: 0,
    totalContacts: 0,
    unreadContacts: 0,
  });
  const [formData, setFormData] = useState({
    schemeFullName: "",
    schemeImageLink: "",
    schemeDetails: "",
    shortDetail: "",
    benefits: "",
    city: "",
    state: "",
    ministry: "",
    gender: "",
    caste: "",
    age: "",
    originalSchemeLink: "",
    documentsRequired: [],
  });

  const token = localStorage.getItem("token");

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSchemes(), fetchContacts()]);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schemes
  const fetchSchemes = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/schemes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSchemes(data);
        updateStats(data, contacts);
      } else {
        toast.error("Failed to load schemes");
      }
    } catch (error) {
      toast.error("Failed to load schemes");
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/contacts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setContacts(data);
        updateStats(schemes, data);
      } else {
        toast.error("Failed to load contacts");
      }
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  // Update statistics
  const updateStats = (schemesData, contactsData) => {
    const pending = schemesData.filter(
      (s) => s.status === "pending" || !s.status
    ).length;
    const approved = schemesData.filter((s) => s.status === "approved").length;
    const rejected = schemesData.filter((s) => s.status === "rejected").length;
    const unread = contactsData.filter((c) => !c.replied).length;

    setStats({
      totalSchemes: schemesData.length,
      pendingSchemes: pending,
      approvedSchemes: approved,
      rejectedSchemes: rejected,
      totalContacts: contactsData.length,
      unreadContacts: unread,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle scheme actions
  const handleSchemeAction = async (id, action) => {
    try {
      let url = `http://localhost:5001/api/admin/schemes/${id}`;
      let method = "PUT";

      if (action === "approve") url += "/approve";
      else if (action === "reject") url += "/reject";
      else if (action === "delete") method = "DELETE";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Scheme ${action}d successfully`);
        fetchSchemes();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      console.error("Admin action error:", err);
      toast.error("Server error");
    }
  };

  // Handle contact reply
  const handleContactReply = async (id, reply) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/contacts/${id}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Reply saved successfully");
        fetchContacts();
      } else {
        toast.error(data.error || "Failed to save reply");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  // Open form for add/edit
  const openForm = (scheme = null) => {
    if (scheme) {
      setEditScheme(scheme);
      setFormData({ ...scheme });
    } else {
      setEditScheme(null);
      setFormData({
        schemeFullName: "",
        schemeImageLink: "",
        schemeDetails: "",
        shortDetail: "",
        benefits: "",
        city: "",
        state: "",
        ministry: "",
        gender: "",
        caste: "",
        age: "",
        originalSchemeLink: "",
        documentsRequired: [],
      });
    }
    setFormVisible(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked
        ? [...(prevFormData[name] || []), value]
        : prevFormData[name].filter((item) => item !== value),
    }));
  };

  // Save scheme
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editScheme
        ? `http://localhost:5001/api/admin/schemes/${editScheme._id}`
        : "http://localhost:5001/api/admin/schemes";
      const method = editScheme ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Saved successfully");
        setFormVisible(false);
        fetchSchemes();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      console.error("Save scheme error:", err);
      toast.error("Server error");
    }
  };

  // Filter schemes
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      (scheme.schemeFullName &&
        scheme.schemeFullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (scheme.shortDetail &&
        scheme.shortDetail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" ||
      scheme.status === statusFilter ||
      (statusFilter === "pending" &&
        (!scheme.status || scheme.status === "pending"));
    return matchesSearch && matchesStatus;
  });

  // Statistics cards
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const documentOptions = [
    "Aadhar card",
    "Pan card",
    "Ration Card",
    "12th Marksheet",
    "10th Marksheet",
    "Driving License",
    "Passport",
    "Voter ID",
    "Birth Certificate",
    "Income Certificate",
    "Caste Certificate",
    "Domicile Certificate",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage government schemes and user inquiries
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Schemes"
            value={stats.totalSchemes}
            icon={FileText}
            color="bg-blue-500"
          />
          <StatCard
            title="Pending Approval"
            value={stats.pendingSchemes}
            icon={AlertCircle}
            color="bg-yellow-500"
          />
          <StatCard
            title="Approved Schemes"
            value={stats.approvedSchemes}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Unread Messages"
            value={stats.unreadContacts}
            icon={Mail}
            color="bg-red-500"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "schemes", label: "Schemes", icon: FileText },
                { id: "contacts", label: "Messages", icon: Mail },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {schemes.slice(0, 5).map((scheme) => (
                  <div
                    key={scheme._id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {scheme.schemeFullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            scheme.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : scheme.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {scheme.status || "pending"}
                        </span>
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(scheme.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "schemes" && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  onClick={() => openForm()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add New Scheme</span>
                </button>
              </div>
            </div>

            {/* Schemes List */}
            <div className="space-y-4">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {scheme.schemeFullName || "Untitled Scheme"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            scheme.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : scheme.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {scheme.status || "pending"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {scheme.shortDetail || "No description available"}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>State: {scheme.state || "Not specified"}</span>
                        <span>
                          Ministry: {scheme.ministry || "Not specified"}
                        </span>
                        <span>
                          Created:{" "}
                          {scheme.createdAt
                            ? new Date(scheme.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {(!scheme.status || scheme.status === "pending") && (
                        <>
                          <button
                            onClick={() =>
                              handleSchemeAction(scheme._id, "approve")
                            }
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle size={16} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              handleSchemeAction(scheme._id, "reject")
                            }
                            className="flex items-center space-x-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openForm(scheme)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleSchemeAction(scheme._id, "delete")}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contact.name}
                    </h3>
                    <p className="text-gray-600">{contact.email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(
                        contact.createdAt || contact.timestamp
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contact.replied
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {contact.replied ? "Replied" : "Pending"}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-gray-700">{contact.message}</p>
                </div>
                {contact.replied && contact.reply && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Admin Reply:
                    </p>
                    <p className="text-gray-600">{contact.reply}</p>
                    {contact.repliedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Replied on:{" "}
                        {new Date(contact.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        handleContactReply(contact._id, e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input =
                        e.target.parentElement.querySelector("input");
                      if (input.value.trim()) {
                        handleContactReply(contact._id, input.value.trim());
                        input.value = "";
                      } else {
                        toast.error("Please enter a reply message");
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {formVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editScheme ? "Edit Scheme" : "Add New Scheme"}
                </h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheme Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="schemeFullName"
                        value={formData.schemeFullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter the complete scheme name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheme Image Link{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="schemeImageLink"
                        value={formData.schemeImageLink}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter a URL for the scheme image"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Scheme Link{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="originalSchemeLink"
                        value={formData.originalSchemeLink}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter the official website link"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Detailed Information
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="shortDetail"
                        value={formData.shortDetail}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter a brief description of the scheme (100-150 words)"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Scheme Details{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="schemeDetails"
                        value={formData.schemeDetails}
                        onChange={handleChange}
                        rows="6"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter comprehensive details about the scheme"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefits <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="List all benefits provided by this scheme"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer text-gray-700"
                          required
                        >
                          <option value="">Select State</option>
                          {STATES.map((s, i) => (
                            <option key={i} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Ministry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ministry <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="ministry"
                          value={formData.ministry}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer text-gray-700"
                          required
                        >
                          <option value="">Select Ministry</option>
                          {MINISTRIES.map((m, i) => (
                            <option key={i} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer text-gray-700"
                          required
                        >
                          <option value="">Select Gender</option>
                          {GENDERS.map((g, i) => (
                            <option key={i} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Caste */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caste <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="caste"
                          value={formData.caste}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer text-gray-700"
                          required
                        >
                          <option value="">Select Caste</option>
                          {CASTES.map((c, i) => (
                            <option key={i} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer text-gray-700"
                        required
                      >
                        <option value="">Select Age</option>
                        {AGES.map((a, i) => (
                          <option key={i} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Documents Required */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Required Documents
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select all documents required for this scheme
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      {documentOptions.map((document, index) => (
                        <label
                          key={index}
                          className="inline-flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            name="documentsRequired"
                            value={document}
                            checked={formData.documentsRequired.includes(
                              document
                            )}
                            onChange={handleCheckboxChange}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                          />
                          <span>{document}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormVisible(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editScheme ? "Update" : "Create"} Scheme
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

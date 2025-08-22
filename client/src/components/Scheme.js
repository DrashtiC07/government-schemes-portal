"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import {
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  FileText,
  Award,
  Bookmark,
  ChevronDown,
  Heart,
} from "lucide-react";

const Scheme = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSchemes, setSavedSchemes] = useState(new Set());
  const [filters, setFilters] = useState({
    age: "",
    gender: "",
    state: "",
    ministry: "",
    caste: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [schemesPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSchemes();
    if (token) {
      fetchSavedSchemes();
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [schemes, filters, searchQuery]);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/get-schemes");
      const data = await response.json();
      setSchemes(data);
      setFilteredSchemes(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setIsLoading(false);
    }
  };

  const fetchSavedSchemes = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        "http://localhost:5000/api/me/saved-schemes",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const data = await response.json();
      setSavedSchemes(new Set(data.map((scheme) => scheme._id)));
    } catch (error) {
      console.error("Error fetching saved schemes:", error);
    }
  };

  const saveScheme = async (id) => {
    if (!token) {
      alert("Please login to save schemes");
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/me/saved-schemes/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      setSavedSchemes((prev) => new Set([...prev, id]));
    } catch (error) {
      console.error("Error saving scheme:", error);
    }
  };

  const unsaveScheme = async (id) => {
    if (!token) return;
    try {
      await fetch(`http://localhost:5000/api/me/saved-schemes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      setSavedSchemes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error("Error unsaving scheme:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      age: "",
      gender: "",
      state: "",
      ministry: "",
      caste: "",
    });
    setSearchQuery("");
  };

  const applyFiltersAndSearch = () => {
    let filtered = schemes;

    // Convert searchQuery to lowercase for case-insensitive search
    const searchRegex = new RegExp(searchQuery.toLowerCase(), "i");

    filtered = filtered.filter((scheme) => {
      // Check schemeFullName, state, city, and other fields for a match
      return (
        searchRegex.test(scheme.schemeFullName?.toLowerCase() || "") ||
        searchRegex.test(scheme.state?.toLowerCase() || "")
        // Add more fields as needed
      );
    });

    // Apply other filters
    Object.keys(filters).forEach((filter) => {
      if (filters[filter]) {
        filtered = filtered.filter((scheme) => {
          if (filter === "age") {
            const age = Number.parseInt(scheme[filter], 10);
            const filterValue = Number.parseInt(filters[filter], 10);
            switch (filters[filter]) {
              case "9":
                return age < 10;
              case "17":
                return age >= 10 && age < 18;
              case "19":
                return age >= 18 && age < 50;
              case "50":
                return age >= 50;
              default:
                return true;
            }
          } else {
            return (
              scheme[filter]?.toString().toLowerCase() ===
              filters[filter].toLowerCase()
            );
          }
        });
      }
    });

    setFilteredSchemes(filtered);
    setCurrentPage(1);
  };

  const indexOfLastScheme = currentPage * schemesPerPage;
  const indexOfFirstScheme = indexOfLastScheme - schemesPerPage;
  const currentSchemes = filteredSchemes.slice(
    indexOfFirstScheme,
    indexOfLastScheme
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get category icon based on ministry
  const getCategoryIcon = (ministry) => {
    switch (ministry?.toLowerCase()) {
      case "nptel":
        return <Award size={16} className="text-blue-600" />;
      case "ayush":
        return <Briefcase size={16} className="text-green-600" />;
      case "aicte":
        return <FileText size={16} className="text-purple-600" />;
      case "isro":
        return <Calendar size={16} className="text-red-600" />;
      case "kvpy":
        return <Users size={16} className="text-orange-600" />;
      default:
        return <Bookmark size={16} className="text-gray-600" />;
    }
  };

  // Get formatted state name
  const getFormattedState = (state) => {
    if (!state) return "All India";
    return state
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (
      let i = 1;
      i <= Math.ceil(filteredSchemes.length / schemesPerPage);
      i++
    ) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center mt-8">
        <button
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-green-700 hover:bg-green-100"
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 mx-1 font-medium rounded ${
              currentPage === number
                ? "bg-green-600 text-white"
                : "text-green-700 border border-green-200 hover:bg-green-100"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() =>
            currentPage < Math.ceil(filteredSchemes.length / schemesPerPage) &&
            paginate(currentPage + 1)
          }
          disabled={
            currentPage === Math.ceil(filteredSchemes.length / schemesPerPage)
          }
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === Math.ceil(filteredSchemes.length / schemesPerPage)
              ? "text-gray-400 cursor-not-allowed"
              : "text-green-700 hover:bg-green-100"
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="p-5 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Find Government Schemes
              </h2>
              <p className="text-gray-600">
                Use the filters below to find schemes that match your
                requirements
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center w-full mb-6">
              <input
                type="text"
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Search Any Scheme Here..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {/* Filter by Age */}
              <div className="flex flex-col">
                <label
                  htmlFor="filterAge"
                  className="text-sm font-medium text-gray-700 mb-2 uppercase"
                >
                  Filter by Age
                </label>
                <div className="relative">
                  <select
                    id="filterAge"
                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    onChange={(e) => handleFilterChange("age", e.target.value)}
                    value={filters.age}
                  >
                    <option value="">All Ages</option>
                    <option value="9">Age below 10</option>
                    <option value="17">Below 18</option>
                    <option value="19">Above 18</option>
                    <option value="50">Above 50</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Filter by Gender */}
              <div className="flex flex-col">
                <label
                  htmlFor="filterGender"
                  className="text-sm font-medium text-gray-700 mb-2 uppercase"
                >
                  Filter by Gender
                </label>
                <div className="relative">
                  <select
                    id="filterGender"
                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    onChange={(e) =>
                      handleFilterChange("gender", e.target.value)
                    }
                    value={filters.gender}
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Search by State */}
              <div className="flex flex-col">
                <label
                  htmlFor="filterState"
                  className="text-sm font-medium text-gray-700 mb-2 uppercase"
                >
                  Search by State
                </label>
                <div className="relative">
                  <select
                    id="filterState"
                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    onChange={(e) =>
                      handleFilterChange("state", e.target.value)
                    }
                    value={filters.state}
                  >
                    <option value="">All States</option>
                    <option value="andhra pradesh">Andhra Pradesh</option>
                    <option value="arunachal pradesh">Arunachal Pradesh</option>
                    <option value="assam">Assam</option>
                    <option value="bihar">Bihar</option>
                    <option value="chandigarh">Chandigarh</option>
                    <option value="chhattisgarh">Chhattisgarh</option>
                    <option value="delhi">Delhi</option>
                    <option value="goa">Goa</option>
                    <option value="gujarat">Gujarat</option>
                    <option value="haryana">Haryana</option>
                    <option value="himachal pradesh">Himachal Pradesh</option>
                    <option value="jammu and kashmir">Jammu and Kashmir</option>
                    <option value="jharkhand">Jharkhand</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="kerala">Kerala</option>
                    <option value="ladakh">Ladakh</option>
                    <option value="lakshadweep">Lakshadweep</option>
                    <option value="madhya pradesh">Madhya Pradesh</option>
                    <option value="maharashtra">Maharashtra</option>
                    <option value="manipur">Manipur</option>
                    <option value="meghalaya">Meghalaya</option>
                    <option value="mizoram">Mizoram</option>
                    <option value="nagaland">Nagaland</option>
                    <option value="odisha">Odisha</option>
                    <option value="puducherry">Puducherry</option>
                    <option value="punjab">Punjab</option>
                    <option value="rajasthan">Rajasthan</option>
                    <option value="sikkim">Sikkim</option>
                    <option value="tamil nadu">Tamil Nadu</option>
                    <option value="telangana">Telangana</option>
                    <option value="tripura">Tripura</option>
                    <option value="uttar pradesh">Uttar Pradesh</option>
                    <option value="uttarakhand">Uttarakhand</option>
                    <option value="west bengal">West Bengal</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Filter by Ministry */}
              <div className="flex flex-col">
                <label
                  htmlFor="filterMinistry"
                  className="text-sm font-medium text-gray-700 mb-2 uppercase"
                >
                  Filter by Ministry
                </label>
                <div className="relative">
                  <select
                    id="filterMinistry"
                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    onChange={(e) =>
                      handleFilterChange("ministry", e.target.value)
                    }
                    value={filters.ministry}
                  >
                    <option value="">All Ministries</option>
                    <option value="nptel">NPTEL</option>
                    <option value="ayush">AYUSH</option>
                    <option value="aicte">AICTE</option>
                    <option value="isro">ISRO</option>
                    <option value="kvpy">KVPY</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Filter by Caste */}
              <div className="flex flex-col">
                <label
                  htmlFor="filterCaste"
                  className="text-sm font-medium text-gray-700 mb-2 uppercase"
                >
                  Filter by Caste
                </label>
                <div className="relative">
                  <select
                    id="filterCaste"
                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    onChange={(e) =>
                      handleFilterChange("caste", e.target.value)
                    }
                    value={filters.caste}
                  >
                    <option value="">All Categories</option>
                    <option value="general">GENERAL</option>
                    <option value="obc">OBC</option>
                    <option value="st">ST</option>
                    <option value="sc">SC</option>
                    <option value="ews">EWS</option>
                    <option value="minority">MINORITY</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center px-6 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <RefreshCw size={18} className="mr-2" />
                Reset Filters
              </button>
              <button
                type="button"
                onClick={applyFiltersAndSearch}
                className="flex items-center px-6 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Filter size={18} className="mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Featured Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg mb-10">
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="dots"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <div className="py-8 px-6 text-center relative z-10">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">
              Discover Our Latest Government Schemes
            </h2>
            <p className="text-white text-base mb-6 max-w-3xl mx-auto">
              Elevate your growth and success with the help of government
              schemes and enhance your opportunities for a better future.
            </p>
            <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-green-700 bg-white rounded-lg hover:bg-green-50 transition-colors shadow-md">
              <span>Explore Featured Schemes</span>
              <ChevronRight className="ml-2" size={18} />
            </button>
          </div>
        </div>

        {/* Schemes Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
            <div className="mx-auto h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No schemes found
            </h3>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              We couldn't find any schemes matching your search criteria. Try
              adjusting your filters or search for something else.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentSchemes.map((scheme) => (
                <div
                  key={scheme._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-200 flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform transition-transform hover:scale-105 duration-500"
                      src={
                        scheme.schemeImageLink ||
                        "https://via.placeholder.com/400x200?text=Scheme+Image" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={scheme.schemeFullName}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x200?text=Government+Scheme";
                      }}
                    />

                    {/* Save/Unsave Button */}
                    {token && (
                      <div className="absolute top-3 left-3">
                        {savedSchemes.has(scheme._id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              unsaveScheme(scheme._id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                          >
                            <Heart size={16} fill="white" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveScheme(scheme._id);
                            }}
                            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full shadow-lg transition-colors"
                          >
                            <Heart size={16} />
                          </button>
                        )}
                      </div>
                    )}

                    {scheme.ministry && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        {getCategoryIcon(scheme.ministry)}
                        <span className="ml-1">
                          {scheme.ministry.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Status Badge - NEW ADDITION */}
                    <div className="absolute bottom-3 right-3">
                      {scheme.status === "approved" && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                          ✓ Approved
                        </span>
                      )}
                      {scheme.status === "pending" && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                          ⏳ Pending
                        </span>
                      )}
                      {scheme.status === "rejected" && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                          ✗ Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {scheme.schemeFullName}
                    </h3>
                    {scheme.shortDetail && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {scheme.shortDetail}
                      </p>
                    )}

                    <div className="mt-auto space-y-2">
                      {scheme.state && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={16} className="mr-2 flex-shrink-0" />
                          <span>{getFormattedState(scheme.state)}</span>
                        </div>
                      )}
                      {scheme.caste && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users size={16} className="mr-2 flex-shrink-0" />
                          <span className="capitalize">{scheme.caste}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/inscheme/${scheme._id}`}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight size={16} className="ml-2" />
                      </Link>

                      {/* Save/Unsave Button for Mobile */}
                      {token && (
                        <div className="flex gap-1">
                          {savedSchemes.has(scheme._id) ? (
                            <button
                              onClick={() => unsaveScheme(scheme._id)}
                              className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors font-medium text-sm"
                            >
                              Saved
                            </button>
                          ) : (
                            <button
                              onClick={() => saveScheme(scheme._id)}
                              className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Need help finding the right scheme?
              </h3>
              <p className="text-gray-600">
                Our team of experts can guide you through available schemes
                based on your eligibility and requirements.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <span>Get Assistance</span>
              <ChevronRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Scheme;

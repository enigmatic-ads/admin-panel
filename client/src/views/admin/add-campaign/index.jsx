import React, { useState, useEffect } from "react";
import Card from "components/card";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus",
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
  "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function AddCampaign() {
  const [feedUrl, setFeedUrl] = useState("");
  const [source, setSource] = useState("");
  const [country, setCountry] = useState("");
  const [cap, setCap] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/sign-in";
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
        const timer = setTimeout(() => {
        setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }
    }, [successMessage]);

  const handleAddCampaign = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in.");
      window.location.href = "/auth/sign-in";
      return;
    }

    let newErrors = {};
    if (!feedUrl.trim()) newErrors.feedUrl = "*Feed URL is required";
    if (!feedUrl.includes("{keyword}")) newErrors.feedUrl = "*Feed URL must contain {keyword}";
    if (!source.trim()) newErrors.source = "*Source is required";
    if (!country.trim()) newErrors.country = "*Country is required";
    if (!cap.trim()) newErrors.cap = "*Cap is required";
    else if (isNaN(cap) || parseInt(cap) <= 0)
      newErrors.cap = "*Cap must be a positive integer";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/campaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feedUrl, source, country, cap: parseInt(cap) }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Campaign added successfully!");
        setFeedUrl("");
        setSource("");
        setCountry("");
        setCap("");
      } else {
        const data = await response.json();
        alert(data.error || "Error adding campaign.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 dark:bg-navy-900">
      <Card extra="w-full max-w-4xl h-full sm:overflow-auto px-10 py-8 mt-12 bg-white dark:bg-navy-800 dark:text-white">
        <div className="flex flex-col items-center p-6 w-full max-w-3xl mx-auto space-y-6">

          {/* Feed URL Input */}
          <div className="w-full">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
              Feed URL
            </label>
            <input
              type="text"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
              placeholder="Enter Feed URL"
            />
            {errors.feedUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.feedUrl}</p>
            )}
          </div>

          {/* Source Dropdown */}
          <div className="w-full">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
            >
              <option value="">-- Select Source --</option>
              <option value="Facebook">Facebook</option>
              <option value="Taboola">Taboola</option>
              <option value="Outbrain">Outbrain</option>
            </select>
            {errors.source && (
              <p className="text-red-600 text-sm mt-1">{errors.source}</p>
            )}
          </div>

          {/* Country Dropdown */}
          <div className="w-full">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
            >
              <option value="">-- Select Country --</option>
              {countries.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-600 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          {/* Cap Input */}
          <div className="w-full">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
              Cap
            </label>
            <input
              type="number"
              value={cap}
              onChange={(e) => setCap(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
              placeholder="Enter Cap"
            />
            {errors.cap && (
              <p className="text-red-600 text-sm mt-1">{errors.cap}</p>
            )}
          </div>

          {/* Add Campaign Button */}
          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={handleAddCampaign}
              className="linear rounded-[20px] bg-brand-900 px-6 py-3 text-lg font-medium text-white transition duration-200 hover:bg-brand-700 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
            >
              Add Campaign
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <p className="text-green-600 dark:text-green-400 text-sm mt-3">
              {successMessage}
            </p>
          )}

        </div>
      </Card>
    </div>
  );
}
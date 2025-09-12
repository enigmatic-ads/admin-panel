// import React, { useState, useEffect } from "react";
// import Card from "components/card";

// const countries = [
//   "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
//   "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus",
//   "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
//   "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
//   "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
//   "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
//   "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
//   "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
//   "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
//   "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
//   "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
//   "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
//   "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
//   "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico",
//   "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
//   "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
//   "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine",
//   "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
//   "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia",
//   "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia",
//   "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
//   "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo",
//   "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine",
//   "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
//   "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
// ];

// export default function Campaigns() {
//   const [feedUrl, setFeedUrl] = useState("");
//   const [campaignId, setCampaignId] = useState("");
//   const [source, setSource] = useState("");
//   const [country, setCountry] = useState("");
//   const [cap, setCap] = useState("");
//   const [errors, setErrors] = useState({});
//   const [successMessage, setSuccessMessage] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       window.location.href = "/auth/sign-in";
//     }
//   }, []);

//   useEffect(() => {
//     if (successMessage) {
//         const timer = setTimeout(() => {
//         setSuccessMessage("");
//         }, 3000);

//         return () => clearTimeout(timer);
//     }
//     }, [successMessage]);

//   const handleAddCampaign = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("Unauthorized! Please log in.");
//       window.location.href = "/auth/sign-in";
//       return;
//     }

//     let newErrors = {};
//     if (!feedUrl.trim()) newErrors.feedUrl = "*Feed URL is required";
//     if (!campaignId.trim()) newErrors.campaignId = "*Campaign ID is required";
//     if (!feedUrl.includes("{keyword}")) newErrors.feedUrl = "*Feed URL must contain {keyword}";
//     if (!source.trim()) newErrors.source = "*Source is required";
//     if (!country.trim()) newErrors.country = "*Country is required";
//     if (!cap.trim()) newErrors.cap = "*Cap is required";
//     else if (isNaN(cap) || parseInt(cap) <= 0)
//       newErrors.cap = "*Cap must be a positive integer";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     setErrors({});
//     setSuccessMessage("");

//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BACKEND_BASE_URL}/api/campaign`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ campaignId, feedUrl, source, country, cap: parseInt(cap) }),
//         }
//       );

//       if (response.ok) {
//         setSuccessMessage("Campaign added successfully!");
//         setCampaignId("");
//         setFeedUrl("");
//         setSource("");
//         setCountry("");
//         setCap("");
//       } else {
//         const data = await response.json();
//         alert(data.error || "Error adding campaign.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Something went wrong.");
//     }
//   };

//   return (
//     <div className="flex justify-center min-h-screen bg-gray-50 dark:bg-navy-900">
//       <Card extra="w-full max-w-4xl h-full sm:overflow-auto px-10 py-8 mt-12 bg-white dark:bg-navy-800 dark:text-white">
//         <div className="flex flex-col items-center p-6 w-full max-w-3xl mx-auto space-y-6">

//           {/* Campaign ID Input */}
//           <div className="w-full">
//             <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
//               Campaign ID
//             </label>
//             <input
//               type="text"
//               value={campaignId}
//               onChange={(e) => setCampaignId(e.target.value)}
//               className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
//               placeholder="Enter Campaign ID"
//             />
//             {errors.campaignId && (
//               <p className="text-red-600 text-sm mt-1">{errors.campaignId}</p>
//             )}
//           </div>

//           {/* Feed URL Input */}
//           <div className="w-full">
//             <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
//               Feed URL
//             </label>
//             <input
//               type="text"
//               value={feedUrl}
//               onChange={(e) => setFeedUrl(e.target.value)}
//               className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
//               placeholder="Enter Feed URL"
//             />
//             {errors.feedUrl && (
//               <p className="text-red-600 text-sm mt-1">{errors.feedUrl}</p>
//             )}
//           </div>

//           {/* Source Dropdown */}
//           <div className="w-full">
//             <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
//               Source
//             </label>
//             <select
//               value={source}
//               onChange={(e) => setSource(e.target.value)}
//               className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
//             >
//               <option value="">-- Select Source --</option>
//               <option value="Facebook">Facebook</option>
//               <option value="Taboola">Taboola</option>
//               <option value="Outbrain">Outbrain</option>
//             </select>
//             {errors.source && (
//               <p className="text-red-600 text-sm mt-1">{errors.source}</p>
//             )}
//           </div>

//           {/* Country Dropdown */}
//           <div className="w-full">
//             <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
//               Country
//             </label>
//             <select
//               value={country}
//               onChange={(e) => setCountry(e.target.value)}
//               className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
//             >
//               <option value="">-- Select Country --</option>
//               {countries.map((c, idx) => (
//                 <option key={idx} value={c}>{c}</option>
//               ))}
//             </select>
//             {errors.country && (
//               <p className="text-red-600 text-sm mt-1">{errors.country}</p>
//             )}
//           </div>

//           {/* Cap Input */}
//           <div className="w-full">
//             <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
//               Cap
//             </label>
//             <input
//               type="number"
//               value={cap}
//               onChange={(e) => setCap(e.target.value)}
//               className="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
//               placeholder="Enter Cap"
//             />
//             {errors.cap && (
//               <p className="text-red-600 text-sm mt-1">{errors.cap}</p>
//             )}
//           </div>

//           {/* Add Campaign Button */}
//           <div className="flex items-center space-x-4 mt-4">
//             <button
//               onClick={handleAddCampaign}
//               className="linear rounded-[20px] bg-brand-900 px-6 py-3 text-lg font-medium text-white transition duration-200 hover:bg-brand-700 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
//             >
//               Add Campaign
//             </button>
//           </div>

//           {/* Success Message */}
//           {successMessage && (
//             <p className="text-green-600 dark:text-green-400 text-sm mt-3">
//               {successMessage}
//             </p>
//           )}

//         </div>
//       </Card>
//     </div>
//   );
// }


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

export default function Campaigns() {
  const [mode, setMode] = useState("add"); // "add" or "manage"

  // Shared states
  const [source, setSource] = useState("");
  const [country, setCountry] = useState("");
  const [cap, setCap] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Add campaign states
  const [campaignId, setCampaignId] = useState("");
  const [feedUrl, setFeedUrl] = useState("");

  // Manage campaign states
  const [searchId, setSearchId] = useState("");
  const [campaignData, setCampaignData] = useState(null);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");

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
      return;
    }

    let newErrors = {};
    if (!campaignId.trim()) newErrors.campaignId = "*Campaign ID is required";
    if (!feedUrl.trim()) newErrors.feedUrl = "*Feed URL is required";
    if (!feedUrl.includes("{keyword}")) newErrors.feedUrl = "*Feed URL must contain {keyword}";
    if (!source.trim()) newErrors.source = "*Source is required";
    if (!country.trim()) newErrors.country = "*Country is required";
    if (!cap.trim() || isNaN(cap) || parseInt(cap) <= 0) newErrors.cap = "*Cap must be a positive integer";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/campaign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ campaignId, feedUrl, source, country, cap: parseInt(cap) }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Campaign added successfully!");
        setCampaignId(""); setFeedUrl(""); setSource(""); setCountry(""); setCap("");
        setErrors({});
      } else {
        const data = await response.json();
        alert(data.error || "Error adding campaign.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const handleSearchCampaign = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized! Please log in.");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/campaign/${searchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaignData(data);
        setSource(data.source || "");
        setCountry(data.country || "");
        setCap(data.cap?.toString() || "");
      } else {
        setSearchErrorMessage("No campaign found for the given campaign id !");
        setTimeout(() => setSearchErrorMessage(""), 4000);
        setCampaignData(null);
        return;
      }
    } catch (err) {
      console.error(err);
      setSearchErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleSaveCampaign = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized! Please log in.");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/campaign/${searchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ source, country, cap: parseInt(cap) }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Campaign saved successfully!");
      } else {
        alert("Error saving campaign.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };
  
  const handleResetCampaign = () => {
    setCampaignData(null);
    setSearchId("");
    setSource("");
    setCountry("");
    setCap("");
    setSuccessMessage("");
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 dark:bg-navy-900">
      <Card extra="w-full max-w-4xl h-full sm:overflow-auto px-10 py-8 mt-12 bg-white dark:bg-navy-800 dark:text-white">
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-6">
          {/* Mode Selector */}
          <div className="w-full flex justify-center space-x-6">
            <label>
              <input type="radio" value="add" checked={mode === "add"} onChange={(e) => setMode(e.target.value)} />
              <span className="ml-2">Add Campaign</span>
            </label>
            <label>
              <input type="radio" value="manage" checked={mode === "manage"} onChange={(e) => setMode(e.target.value)} />
              <span className="ml-2">Manage Campaign</span>
            </label>
          </div>

          {/* Add Campaign */}
          {mode === "add" && (
            <>
              <div className="w-full">
                <label className="block text-sm mb-2">Campaign ID</label>
                <input type="text" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full p-2 border rounded-lg" />
                {errors.campaignId && <p className="text-red-600 text-sm mt-1">{errors.campaignId}</p>}
              </div>
              <div className="w-full">
                <label className="block text-sm mb-2">Feed URL</label>
                <input type="text" value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} className="w-full p-2 border rounded-lg" />
                {errors.feedUrl && <p className="text-red-600 text-sm mt-1">{errors.feedUrl}</p>}
              </div>
              <div className="w-full">
                <label className="block text-sm mb-2">Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full p-2 border rounded-lg">
                  <option value="">-- Select Source --</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Taboola">Taboola</option>
                  <option value="Outbrain">Outbrain</option>
                </select>
                {errors.source && <p className="text-red-600 text-sm mt-1">{errors.source}</p>}
              </div>
              <div className="w-full">
                <label className="block text-sm mb-2">Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2 border rounded-lg">
                  <option value="">-- Select Country --</option>
                  {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
              </div>
              <div className="w-full">
                <label className="block text-sm mb-2">Cap</label>
                <input type="number" value={cap} onChange={(e) => setCap(e.target.value)} className="w-full p-2 border rounded-lg" />
                {errors.cap && <p className="text-red-600 text-sm mt-1">{errors.cap}</p>}
              </div>
              <button onClick={handleAddCampaign} className="bg-brand-900 text-white px-6 py-3 rounded-lg">Add Campaign</button>
            </>
          )}

          {/* Manage Campaign */}
          {mode === "manage" && (
            <>
              <div className="w-full flex space-x-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm mb-2">Search your campaign</label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter Campaign ID"
                  />
                </div>
                <button
                  onClick={handleSearchCampaign}
                  className="bg-brand-900 text-white px-4 py-2 rounded-lg"
                >
                  Search
                </button>
              </div>

              {searchErrorMessage && (
                <p className="text-red-600 text-sm mt-2">{searchErrorMessage}</p>
              )}

              {campaignData && (
                <div className="w-full space-y-4 mt-4 p-4 border rounded-lg">
                  {/* Non-editable URL */}
                  <div>
                    <label className="block text-sm mb-2">Feed URL</label>
                    <input
                      type="text"
                      value={campaignData.url}
                      readOnly
                      className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Taboola">Taboola</option>
                      <option value="Outbrain">Outbrain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      {countries.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Cap</label>
                    <input
                      type="number"
                      value={cap}
                      onChange={(e) => setCap(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveCampaign}
                      className="bg-brand-900 text-white px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleResetCampaign}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Success Message */}
          {successMessage && <p className="text-green-600 text-sm mt-3">{successMessage}</p>}
        </div>
      </Card>
    </div>
  );
}
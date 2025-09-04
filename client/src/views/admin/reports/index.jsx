import React, { useState, useEffect } from "react";
import Card from "components/card";

export default function Reports() {
  const [campaignId, setCampaignId] = useState("");
  const [urlId, setUrlId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [forToday, setForToday] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});  

  // Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/sign-in";
    }
  }, []);

  // On initial load → set today's date and tomorrow
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();

    const formatDate = (date) => date.toISOString().split("T")[0];
    const start = formatDate(today);
    const end = formatDate(tomorrow);

    setFromDate(start);
    setToDate(end);
    setForToday(true);

    handleGetReport(start, end, true);
    // eslint-disable-next-line
  }, []);

  const handleGetReport = async (start, end, skipValidation = false) => {
    let newErrors = {};

    if (!start && !end && !forToday && !skipValidation) {
      if (!fromDate) newErrors.fromDate = "*From Date is required";
      if (!toDate) newErrors.toDate = "*To Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (campaignId) params.append("campaignId", campaignId);
      if (urlId) params.append("urlId", urlId);

      if (start && end) {
        params.append("startDate", start);
        params.append("endDate", end);
      } else {
        params.append("startDate", fromDate);
        params.append("endDate", toDate);
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/report?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setReportData(Array.isArray(data) ? data : []);
      } else {
        alert(data.error || "Failed to fetch report.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCampaignId("");
    setUrlId("");
    setFromDate("");
    setToDate("");
    setForToday(false);
    setReportData([]);
    setErrors({});
    setExpandedRows({});
  };

  const handleForTodayChange = (e) => {
    const checked = e.target.checked;
    setForToday(checked);
    if (checked) {
      const today = new Date();
      const tomorrow = new Date();
      const formatDate = (date) => date.toISOString().split("T")[0];
      setFromDate(formatDate(today));
      setToDate(formatDate(tomorrow));
    }
  };

  const toggleExpandRow = (campaignId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 dark:bg-navy-900">
      <Card extra="w-full max-w-6xl h-full sm:overflow-auto px-10 py-8 mt-12 bg-white dark:bg-navy-800">
        <div className="flex flex-col items-center p-6 w-full max-w-5xl mx-auto space-y-6">
          {/* Filters */}
          <div className="w-full">
            <h3 className="text-gray-800 dark:text-white font-semibold mb-2">
              Filters :
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              {/* Campaign ID */}
              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  Campaign ID
                </label>
                <input
                  type="text"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-32 px-2 py-1 text-sm border rounded focus:outline-none bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                  placeholder="Campaign ID"
                />
              </div>

              {/* URL ID */}
              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  URL ID
                </label>
                <input
                  type="text"
                  value={urlId}
                  onChange={(e) => setUrlId(e.target.value)}
                  className="w-32 px-2 py-1 text-sm border rounded focus:outline-none bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                  placeholder="URL ID"
                />
              </div>

              {/* From Date */}
              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40 px-2 py-1 text-sm border rounded focus:outline-none bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                  disabled={forToday}
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-40 px-2 py-1 text-sm border rounded focus:outline-none bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                  disabled={forToday}
                />
              </div>

              {/* For Today */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={forToday}
                  onChange={handleForTodayChange}
                  className="h-4 w-4 text-brand-900 border-gray-300 rounded"
                />
                <label className="text-gray-700 dark:text-gray-300 text-sm">
                  Today
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 ml-auto">
                <button
                  onClick={() => handleGetReport()}
                  disabled={loading}
                  className="rounded-lg bg-brand-900 px-4 py-1 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
                >
                  {loading ? "Loading..." : "Apply"}
                </button>
                <button
                  onClick={handleReset}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Report Table */}
          {reportData.length > 0 && (
            <div className="w-full mt-6">
              <div className="overflow-x-auto border rounded-lg dark:border-navy-600">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200">
                      <th className="px-4 py-2 text-left">Campaign ID</th>
                      <th className="px-4 py-2 text-left">Successful Hits</th>
                      <th className="px-4 py-2 text-left">Failed Hits</th>
                      <th className="px-4 py-2 text-left">Total Hits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((campaign) => (
                      <React.Fragment key={campaign.campaign_id}>
                        <tr
                          onClick={() => toggleExpandRow(campaign.campaign_id)}
                          className="border-t dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-600 transition cursor-pointer"
                        >
                          <td className="px-4 py-2">{campaign.campaign_id}</td>
                          <td className="px-4 py-2">{campaign.successHits}</td>
                          <td className="px-4 py-2">{campaign.failedHits}</td>
                          <td className="px-4 py-2">{campaign.totalHits}</td>
                        </tr>

                        {expandedRows[campaign.campaign_id] && (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <div className="bg-gray-50 dark:bg-navy-700 p-4">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-gray-100 dark:bg-navy-600 text-gray-700 dark:text-gray-200">
                                      <th className="px-4 py-2 text-left">
                                        URL ID
                                      </th>
                                      <th className="px-4 py-2 text-left">
                                        URL
                                      </th>
                                      <th className="px-4 py-2 text-left">
                                        Successful Hits
                                      </th>
                                      <th className="px-4 py-2 text-left">
                                        Failed Hits
                                      </th>
                                      <th className="px-4 py-2 text-left">
                                        Total Hits
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {campaign.keywordHits.map((url) => (
                                      <tr
                                        key={url.urlId}
                                        className="border-t dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-600"
                                      >
                                        <td className="px-4 py-2">{url.urlId}</td>
                                        <td className="px-4 py-2">{url.url}</td>
                                        <td className="px-4 py-2">{url.successHits}</td>
                                        <td className="px-4 py-2">{url.failedHits}</td>
                                        <td className="px-4 py-2">{url.totalHits}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
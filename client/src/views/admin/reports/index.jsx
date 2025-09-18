import React, { useState, useEffect } from "react";
import Card from "components/card";

export default function Reports() {
  const [campaignId, setCampaignId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [forToday, setForToday] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [insightsData, setInsightsData] = useState([]);
  const [timeRangeInput, setTimeRangeInput] = useState("today");
  const [insightsFromDate, setInsightsFromDate] = useState('');
  const [insightsToDate, setInsightsToDate] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightSource, setInsightSource] = useState("facebook");
  const [insightSourceInput, setInsightSourceInput] = useState("facebook");
  const [insightLevel, setInsightLevel] = useState(
    insightSource === "facebook" ? "adset" : "ad"
  );
  const [insightLevelInput, setInsightLevelInput] = useState(
    insightSourceInput === "facebook" ? "adset" : "ad"
  );


  

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

  useEffect(() => {
    setInsightLevelInput(insightSourceInput === "facebook" ? "adset" : "ad");
  }, [insightSourceInput]);


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
        setReportData(Array.isArray(data.result) ? data.result : []);
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

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);

      const params = new URLSearchParams();
      params.append("level", insightLevelInput);

      if (timeRangeInput === "custom" && insightsFromDate && insightsToDate) {
        params.append("since", insightsFromDate);
        params.append("until", insightsToDate);
      } else {
        params.append("timeRange", timeRangeInput);
      }

      const endpoint =
        insightSourceInput === "facebook"
          ? `/api/facebook/insights?${params.toString()}`
          : `/api/taboola/insights?${params.toString()}`;

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}${endpoint}`
      );

      const data = await res.json();
      if (data.success) {
        setInsightsData(Array.isArray(data.insights) ? data.insights : []);
        setInsightLevel(insightLevelInput);
        setInsightSource(insightSourceInput);
        console.log("insightSource used →", insightSourceInput);
      } else {
        setInsightsData([]);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsightsData([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleReset = () => {
    setCampaignId("");
    setFromDate("");
    setToDate("");
    setForToday(false);
    setReportData([]);
    setErrors({});
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

  const formatCurrency = (value) => {
    if (!value) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  function roundToTwo(value) {
    let num = Number(value);

    if (isNaN(num)) {
      // Try parsing as integer
      num = parseInt(value, 10);
    }

    if (isNaN(num)) return 0; // still invalid

    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 dark:bg-navy-900">
      <Card extra="w-full max-w-6xl h-full sm:overflow-auto px-10 py-8 mt-12 bg-white dark:bg-navy-800">
        <div className="flex flex-col items-center p-6 w-full max-w-5xl mx-auto">
          {/* Encrypted URLs section */}
          <div className="w-full">
          <h3 className="text-gray-800 dark:text-white font-semibold mb-2">
            Encrypted URLs Traffic
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

        {reportData.length > 0 && (
          <div className="w-full mt-6">
            <div className="overflow-x-auto border rounded-lg dark:border-navy-600">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200">
                    <th className="px-4 py-2 text-left">Campaign ID</th>
                    <th className="px-4 py-2 text-left">URL</th>
                    <th className="px-4 py-2 text-left">Hits</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-600 transition"
                    >
                      <td className="px-4 py-2">{row.campaign_id}</td>
                      <td className="px-4 py-2">{row.url}</td>
                      <td className="px-4 py-2">{row.hits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

          {/* Insights Section */}
          <div className="w-full mt-16">
            <h3 className="text-gray-800 dark:text-white font-semibold mb-4">
              Marketing Insights
            </h3>

            {/* Filters for Insights */}
            <div className="flex flex-col md:flex-row flex-wrap md:items-end gap-4 mb-4">
              {/* Source Dropdown */}
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  Source
                </label>
                <select
                  value={insightSourceInput}
                  onChange={(e) => setInsightSourceInput(e.target.value)}
                  className="px-2 py-1 text-sm border rounded bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                >
                  <option value="facebook">Facebook</option>
                  <option value="taboola">Taboola</option>
                </select>
              </div>
              {/* Level Dropdown */}
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  Level
                </label>
                <select
                  value={insightLevelInput}
                  onChange={(e) => setInsightLevelInput(e.target.value)}
                  className="px-2 py-1 text-sm border rounded bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                >
                  {insightSourceInput === "facebook" ? (
                      <>
                        <option value="adset">Adset</option>
                        <option value="campaign">Campaign</option>
                        <option value="account">Account</option>
                      </>
                    ) : (
                      <>
                        <option value="ad">Ad</option>
                        <option value="campaign">Campaign</option>
                        <option value="account">Account</option>
                      </>
                    )}
                </select>
              </div>

              {/* Time Range Dropdown */}
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                  Time Range
                </label>
                <select
                  value={timeRangeInput}
                  onChange={(e) => setTimeRangeInput(e.target.value)}
                  className="px-2 py-1 text-sm border rounded bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7d">Last 7 Days</option>
                  <option value="last_30d">Last 30 Days</option>
                  <option value="last_90d">Last 90 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {timeRangeInput === "custom" && (
                <>
                  {/* From Date */}
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">From</label>
                    <input
                      type="date"
                      value={insightsFromDate}
                      onChange={(e) => setInsightsFromDate(e.target.value)}
                      className="px-2 py-1 text-sm border rounded bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="text-gray-700 dark:text-gray-300 text-xs mb-1">To</label>
                    <input
                      type="date"
                      value={insightsToDate}
                      onChange={(e) => setInsightsToDate(e.target.value)}
                      className="px-2 py-1 text-sm border rounded bg-white dark:bg-navy-700 dark:text-white dark:border-navy-600"
                    />
                  </div>
                </>
              )}

              {/* Button */}
              <div className="flex flex-col mt-auto">
                {/* <label className="text-transparent mb-1 select-none">.</label> */}
                <button
                  onClick={fetchInsights}
                  className="rounded-lg bg-brand-900 px-4 py-1 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
                >
                  Load Insights
                </button>
              </div>
            </div>

            {insightsLoading ? (
              <div className="flex justify-center items-center py-10">
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  Loading insights...
                </span>
              </div>
            ) : insightsData && insightsData.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg dark:border-navy-600">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200">
                      {insightLevel === "adset" && (
                        <>
                          <th className="px-4 py-2 text-left">Adset</th>
                          <th className="px-4 py-2 text-left">Campaign</th>
                        </>
                      )}
                      {insightLevel === "ad" && (
                        <>
                          <th className="px-4 py-2 text-left">Ad Name</th>
                          <th className="px-4 py-2 text-left">Campaign</th>
                        </>
                      )}
                      {insightLevel === "campaign" && (
                        <th className="px-4 py-2 text-left">Campaign</th>
                      )}
                      {insightSource === "facebook" && (
                        <th className="px-4 py-2 text-left">Reach</th>
                      )}

                      {/* Common columns */}
                      <th className="px-4 py-2 text-left">Impressions</th>
                      <th className="px-4 py-2 text-left">Clicks</th>
                      <th className="px-4 py-2 text-left">CTR</th>
                      <th className="px-4 py-2 text-left">CPC</th>
                      <th className="px-4 py-2 text-left">CPM</th>
                      <th className="px-4 py-2 text-left">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insightsData.map((row, idx) => (
                      <tr key={idx} className="border-t dark:border-navy-600">
                        {(insightLevel === "adset" || insightLevel === 'ad') && (
                          <>
                            <td className="px-4 py-2">{row.adset_name || row.ad_name }</td>
                            <td className="px-4 py-2">{row.campaign_name}</td>
                          </>
                        )}
                        {insightLevel === "campaign" && (
                          <td className="px-4 py-2">{row.campaign_name}</td>
                        )}
                        {insightSource === 'facebook' && (
                          <td className="px-4 py-2">{row.reach}</td>
                        )}
                        <td className="px-4 py-2">{row.impressions}</td>
                        <td className="px-4 py-2">{row.clicks}</td>
                        <td className="px-4 py-2">{roundToTwo(row.ctr) + "%"}</td>
                        <td className="px-4 py-2">{formatCurrency(row.cpc)}</td>
                        <td className="px-4 py-2">{formatCurrency(row.cpm)}</td>
                        <td className="px-4 py-2">{formatCurrency(row.spend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex justify-center items-center py-10">
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  No insights available.
                </span>
              </div>
            )}
            
          </div>
        </div>
      </Card>
    </div>
  );
}
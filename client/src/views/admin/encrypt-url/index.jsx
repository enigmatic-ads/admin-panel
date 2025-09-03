import React, { useState, useEffect } from "react";
import UrlInput from "./components/UrlInput";
import EncyptedUrlResultBox from "./components/EncryptedUrlResultBox";
import KeywordsInput from "./components/KeywordsInput";
import Card from "components/card";
import { Download, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Encrypt() {
  const [inputUrl, setInputUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [resultUrls, setResultUrls] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [errors, setErrors] = useState({});
  const [showButtons, setShowButtons] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [source, setSource] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [modalCampaignId, setModalCampaignId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/sign-in";
    }
  }, []);

  const handleGenerate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized! Please log in.");
      window.location.href = "/auth/sign-in";
      return;
    }

    let newErrors = {};
    if (!inputUrl.trim()) {
      newErrors.inputUrl = "*URL is required";
    } else if (!inputUrl.includes("{keyword}")) {
      newErrors.inputUrl = "*Incorrect format: should contain {keyword}";
    }
    if (!keywords.trim()) {
      newErrors.keywords = "*Keyword/s are required";
    }
    if (!campaignId.trim()) {
      newErrors.campaignId = "*Campaign ID is required";
    } else if (isNaN(campaignId)) {
      newErrors.campaignId =
        "*Incorrect format: Campaign ID should be an integer";
    }
    if (!source.trim()) {
      newErrors.source = "*Source is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/generate-encrypted-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: inputUrl, keywords, campaignId, source }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const combined = (data.encryptedUrls || []).map((url, index) => ({
          url,
          keyword: data.keywords ? data.keywords[index] : null,
        }));
        setResultUrls(combined);
        setShowButtons(true);
      } else {
        alert("Error generating URL.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleCopy = async (url) => {
    if (!url) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      setCopiedUrl(url); // mark as copied
      setTimeout(() => setCopiedUrl(null), 2000); // reset after 2 sec
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      resultUrls.map((url, index) => ({ SNo: index + 1, URL: url }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Encrypted URLs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "encrypted_urls.xlsx");
  };

  const handleDownloadAll = () => {
    window.location.href =
      `${process.env.REACT_APP_BACKEND_BASE_URL}/api/download-all-encrypted-urls`;
  };

  const handleReset = () => {
    setInputUrl("");
    setKeywords("");
    setCampaignId("");
    setResultUrls([]);
    setErrors({});
    setShowButtons(false);
    setShowResults(false);
    setSource("");
  };

  const handleDownload = () => {
    const baseUrl = `${process.env.REACT_APP_BACKEND_BASE_URL}/api/download-all-encrypted-urls`;
    const url = modalCampaignId
      ? `${baseUrl}?campaignId=${modalCampaignId}`
      : baseUrl;

    window.location.href = url;
    setShowDownloadModal(false);
    setModalCampaignId("");
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <Card extra={"w-full max-w-4xl h-full sm:overflow-auto px-10 py-8 mt-12"}>
        {/* Download link in top-right */}
        <div className="absolute top-4 right-6">
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center space-x-1 text-brand-600 hover:text-brand-800 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Download all encrypted URLs</span>
          </button>
        </div>

        {/* Modal */}
        {showDownloadModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Download Encrypted URLs</h2>
                <button onClick={() => setShowDownloadModal(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="w-full bg-brand-600 text-white py-2 px-4 rounded-lg hover:bg-brand-700"
                >
                  Download All
                </button>
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Or enter Campaign ID
                  </label>
                  <input
                    type="text"
                    value={modalCampaignId}
                    onChange={(e) => setModalCampaignId(e.target.value)}
                    placeholder="Campaign ID"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  disabled={!modalCampaignId}
                  className={`w-full py-2 px-4 rounded-lg text-white ${
                    modalCampaignId
                      ? "bg-brand-600 hover:bg-brand-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Download by Campaign ID
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center p-6 w-full max-w-3xl mx-auto space-y-6">
          {/* URL Input */}
          <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter URL
            </label>
            <UrlInput
              inputUrl={inputUrl}
              setInputUrl={setInputUrl}
              className="w-full"
            />
            {errors.inputUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.inputUrl}</p>
            )}
          </div>

          {/* Keywords Input */}
          <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter Keywords
            </label>
            <KeywordsInput
              keywords={keywords}
              setKeywords={setKeywords}
              className="w-full"
            />
            {errors.keywords && (
              <p className="text-red-600 text-sm mt-1">{errors.keywords}</p>
            )}
          </div>

          {/* Campaign ID Input */}
          <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter Campaign ID
            </label>
            <div className="flex w-full mb-4">
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="flex-1 p-2 border rounded-l-lg focus:outline-none"
                placeholder="Campaign ID"
              />
            </div>
            {errors.campaignId && (
              <p className="text-red-600 text-sm mt-1">{errors.campaignId}</p>
            )}
          </div>

          {/* Source Dropdown */}
          <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Select Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none"
            >
              <option value="">-- Select Source --</option>
              <option value="Outbrain">Outbrain</option>
              <option value="Facebook">Facebook</option>
              <option value="Taboola">Taboola</option>
            </select>
            {errors.source && (
              <p className="text-red-600 text-sm mt-1">{errors.source}</p>
            )}
          </div>

          {/* Generate + Reset */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleGenerate}
              className="linear rounded-[20px] bg-brand-900 px-6 py-3 text-lg font-medium text-white transition duration-200 hover:bg-brand-700 active:bg-brand-700"
            >
              Generate
            </button>

            {showButtons && (
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Extra Buttons (Download + Show Results) */}
          {showButtons && resultUrls.length > 0 && (
            <div className="mt-4 flex items-center space-x-6">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center space-x-1 text-brand-600 hover:text-brand-800 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download results as Excel</span>
              </button>
              <button
                onClick={() => setShowResults(true)}
                className="flex items-center space-x-1 text-brand-600 hover:text-brand-800 text-sm font-medium"
              >
                <span>Show Results Here</span>
              </button>
            </div>
          )}

          {/* Results */}
          {showResults && resultUrls.length > 0 && (
            <div className="w-full space-y-3 mt-6">
              {resultUrls.map((item, index) => (
                <EncyptedUrlResultBox
                  key={index}
                  resultUrl={item.url}
                  keyword={item.keyword}
                  handleCopy={() => handleCopy(item.url)}
                  isCopied={copiedUrl === item.url}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
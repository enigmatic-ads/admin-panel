import React, { useState, useEffect } from "react";
import UrlInput from "./components/UrlInput";
import EncyptedUrlResultBox from "./components/EncryptedUrlResultBox";
import DownloadButton from "./components/DownloadButton";
import KeywordsInput from "./components/KeywordsInput";
import Card from "components/card";
import { Download } from "lucide-react";

export default function Encrypt() {
  const [inputUrl, setInputUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [resultUrls, setResultUrls] = useState([]);
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);

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

    if (!inputUrl.trim()) {
      alert("Please enter a URL.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/generate-encrypted-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: inputUrl, keywords }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Encrypted URLs:", data.encryptedUrls);
        setResultUrls(data.encryptedUrls || []);
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
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(url);
      } else {
        // fallback
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadAll = () => {
    window.location.href = "http://localhost:4000/api/download-all-encrypted-urls";
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
        <Card extra={"w-full max-w-4xl h-full sm:overflow-auto px-10 py-8 mt-12"}>
        {/* Download link in top-right */}
        <div className="absolute top-4 right-6">
            <button
            onClick={handleDownloadAll}
            className="flex items-center space-x-1 text-brand-600 hover:text-brand-800 text-sm font-medium"
            >
            <Download className="w-4 h-4" />
            <span>Download all encrypted URLs</span>
            </button>
        </div>

        <div className="flex flex-col items-center p-6 w-full max-w-3xl mx-auto space-y-6">
            
            {/* URL Input with label */}
            <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter URL
            </label>
            <UrlInput inputUrl={inputUrl} setInputUrl={setInputUrl} className="w-full" />
            </div>

            {/* Keywords Input with label */}
            <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter Keywords
            </label>
            <KeywordsInput keywords={keywords} setKeywords={setKeywords} className="w-full" />
            </div>

            {/* Generate button */}
            <button
            onClick={handleGenerate}
            className="linear rounded-[20px] bg-brand-900 px-6 py-3 text-lg font-medium text-white transition duration-200 hover:bg-brand-700 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90 mb-4 w-max-xl"
            >
            Generate
            </button>

            {/* Render each encrypted URL in its own result box */}
            {resultUrls.length > 0 && (
            <div className="w-full space-y-3">
                {resultUrls.map((url, index) => (
                <EncyptedUrlResultBox
                    key={index}
                    resultUrl={url}
                    handleCopy={() => handleCopy(url)}
                />
                ))}
            </div>
            )}
            
        </div>
        </Card>
    </div>
    );
}
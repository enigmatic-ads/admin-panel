import { Check } from "lucide-react";

export default function EncyptedUrlResultBox({ resultUrl, keyword, handleCopy, isCopied }) {
  if (!resultUrl) return null;

  return (
    <div className="flex flex-col w-full mb-4">
      {/* Keyword label */}
      {keyword && (
        <span className="mb-1 text-sm text-gray-600 font-medium">
          Keyword: {keyword}
        </span>
      )}

      {/* URL + Copy button */}
      <div className="flex w-full">
        <input
          type="text"
          value={resultUrl}
          readOnly
          className="flex-1 p-2 border rounded-l-lg bg-gray-100 dark:bg-navy-900 dark:text-gray-100 dark:border-navy-600"
        />
        <button
          onClick={handleCopy}
          className={`px-4 rounded-r-lg text-white transition ${
            isCopied ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isCopied ? (
            <span className="flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Copied</span>
            </span>
          ) : (
            "Copy"
          )}
        </button>
      </div>
    </div>
  );
}
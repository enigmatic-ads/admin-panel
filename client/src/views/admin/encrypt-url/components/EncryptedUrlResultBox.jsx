import { Check } from "lucide-react";

export default function EncyptedUrlResultBox({ resultUrl, handleCopy, isCopied }) {
  if (!resultUrl) return null;

  return (
    <div className="flex w-full mb-4">
      <input
        type="text"
        value={resultUrl}
        readOnly
        className="flex-1 p-2 border rounded-l-lg bg-gray-100"
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
  );
}
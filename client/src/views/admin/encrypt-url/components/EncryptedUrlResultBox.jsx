export default function EncyptedUrlResultBox({ resultUrl, handleCopy }) {
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
        className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700"
      >
        Copy
      </button>
    </div>
  );
}

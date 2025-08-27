export default function DownloadButton({ handleDownloadAll }) {
  return (
    <button
      onClick={handleDownloadAll}
      className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900"
    >
      Download All Encrypted URLs
    </button>
  );
}

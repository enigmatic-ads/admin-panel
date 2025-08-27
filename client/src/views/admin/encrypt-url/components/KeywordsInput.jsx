export default function KeywordsInput({ keywords, setKeywords }) {
  return (
    <div className="w-full mb-4">
      <input
        type="text"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Comma-separated keywords"
        className="w-full p-2 border rounded-lg focus:outline-none"
      />
    </div>
  );
}
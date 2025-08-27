export default function UrlInput({ inputUrl, setInputUrl }) {
  return (
    <div className="flex w-full mb-4">
      <input
        type="text"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="URL"
        className="flex-1 p-2 border rounded-l-lg focus:outline-none"
      />
    </div>
  );
}

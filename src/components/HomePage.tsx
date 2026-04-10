export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1e3a5f] mb-4">Welcome to Ga Bible Study</h1>
      <p className="text-gray-600 mb-8">
        An interactive Bible study tool with synchronized audio, devotional commentaries,
        and parallel text viewing in Ga and English.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-2">Bible Reader</h2>
          <p className="text-gray-500 text-sm">Read Scripture with parallel Ga/English views</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-2">Audio</h2>
          <p className="text-gray-500 text-sm">Listen to Ga audio with verse synchronization</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-2">Study Notes</h2>
          <p className="text-gray-500 text-sm">Access Spurgeon Treasury, Lady Guyon Diaries, and Strong&apos;s</p>
        </div>
      </div>
    </div>
  );
}

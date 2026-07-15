export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-pink-700">
          SkinSense AI
        </h1>

        <p className="mt-6 text-xl text-gray-700">
          Your Personal AI Skin Analyzer
        </p>

        <button className="mt-10 px-8 py-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition">
          Analyze My Skin
        </button>
      </div>
    </main>
  );
}
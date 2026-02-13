import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
      {/* Admin Icon in Top Right */}
      <div className="absolute top-6 right-6 group">
        <Link
          href="/admin"
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="Login"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </Link>
        {/* Tooltip */}
        <div className="absolute top-14 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Login
        </div>
      </div>

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-red-600 mb-4">
            💕 Valentines Compatibility Quiz 💕
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Find your perfect match this Valentine's Day!
          </p>
          
          <div className="space-y-4">
            <Link
              href="/join"
              className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors text-xl"
            >
              Join a Quiz Session
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Participants: Join with a 4-character code</p>
          </div>
        </div>
      </div>
    </main>
  );
}

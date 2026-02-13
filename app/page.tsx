import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
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
            
            <Link
              href="/admin"
              className="block w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-lg transition-colors text-xl"
            >
              Admin Panel
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Host: Create templates and start sessions</p>
            <p>Participants: Join with a 4-character code</p>
          </div>
        </div>
      </div>
    </main>
  );
}

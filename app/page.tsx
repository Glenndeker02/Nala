export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Welcome to Nala
        </h1>
        <p className="text-2xl text-center text-gray-600 mb-12">
          Performance-Based UGC Agency Platform
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-8 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors">
            <h2 className="text-2xl font-semibold mb-4">For Creators</h2>
            <p className="text-gray-600 mb-6">
              Earn guaranteed base fees plus unlimited performance bonuses.
              Get paid for every view your content generates.
            </p>
            <a
              href="/auth/register?type=creator"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign Up as Creator
            </a>
          </div>
          <div className="p-8 border border-gray-200 rounded-lg hover:border-secondary-500 transition-colors">
            <h2 className="text-2xl font-semibold mb-4">For Founders</h2>
            <p className="text-gray-600 mb-6">
              Only pay for actual views achieved. Automatic refunds for
              unspent budget. Zero financial risk.
            </p>
            <a
              href="/auth/register?type=founder"
              className="inline-block px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Sign Up as Founder
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

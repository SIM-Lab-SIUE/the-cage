import { redirect } from 'next/navigation';
import { auth } from '../../auth';

export default async function Home() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // For unauthenticated users, show the welcome page
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-32 px-8 bg-white dark:bg-black">
        <h1 className="text-5xl font-bold text-center text-black dark:text-white mb-4">
          Welcome to The Cage
        </h1>
        <p className="text-xl text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl">
          SIUE Mass Communications Equipment Checkout System
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Equipment Catalog */}
          <a
            href="/catalog"
            className="flex flex-col p-8 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg bg-white dark:bg-zinc-900"
          >
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              📹 Browse Catalog
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              View available equipment, check availability, and make reservations
            </p>
          </a>

          {/* Reservation Calendar */}
          <a
            href="/calendar"
            className="flex flex-col p-8 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg bg-white dark:bg-zinc-900"
          >
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              📅 Calendar
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              View and manage your equipment reservations
            </p>
          </a>

          {/* Admin Scanner */}
          <a
            href="/admin/scan"
            className="flex flex-col p-8 rounded-lg border-2 border-gray-200 hover:border-purple-500 transition-all hover:shadow-lg bg-white dark:bg-zinc-900"
          >
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              🔍 Staff Scanner
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Scan QR codes for quick checkout/checkin (Staff Only)
            </p>
          </a>

          {/* API Documentation */}
          <a
            href="/api-docs"
            className="flex flex-col p-8 rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-lg bg-white dark:bg-zinc-900"
          >
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              📚 API Docs
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              View API endpoints and integration documentation
            </p>
          </a>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/api/auth/signin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In to Get Started
          </a>
        </div>

        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>Need help? Contact the Mass Communications Equipment Office</p>
        </div>
      </main>
    </div>
  );
}

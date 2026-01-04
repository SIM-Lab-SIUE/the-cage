import { redirect } from 'next/navigation';
import { auth } from '../../auth';

export default async function Home() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // For unauthenticated users, show sign-in page
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            The Cage
          </h1>
          <p className="text-lg text-gray-600">
            Equipment Checkout System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            SIUE Mass Communications
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  Sign in with your SIUE account to view equipment, check availability, and make reservations.
                </p>
              </div>
            </div>
          </div>

          <div>
            <a
              href="/api/auth/signin"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with SIUE Account
            </a>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact aleith@siue.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
}

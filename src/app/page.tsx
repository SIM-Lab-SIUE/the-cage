export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold text-center text-black dark:text-white">
          Welcome to The Cage
        </h1>
        <p className="mt-4 text-lg text-center text-zinc-600 dark:text-zinc-400">
          Everything is running smoothly. Stay tuned for exciting updates and
          features coming soon!
        </p>
        <div className="mt-8 flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[158px]"
            href="#"
          >
            Learn More
          </a>
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-600 px-5 text-white transition-colors hover:bg-gray-700 md:w-[158px]"
            href="#"
          >
            Contact Us
          </a>
        </div>
      </main>
    </div>
  );
}

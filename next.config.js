/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Turbopack that the root of the project is the current directory.
  // It will now correctly look for `package.json` and `.env.local` here.
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
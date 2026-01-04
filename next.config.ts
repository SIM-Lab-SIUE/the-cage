import type { NextConfig } from "next";

// Derive Snipe-IT host from env so images served from local IPs are allowed
const SNIPE_IT_API_URL = process.env.SNIPE_IT_API_URL || process.env.SNIPEIT_API_URL || '';

const baseRemotePatterns = [
  // Default localhost/dev patterns for Snipe-IT images
  { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/**' },
  { protocol: 'https', hostname: 'localhost', port: '8443', pathname: '/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/**' },
  { protocol: 'https', hostname: '127.0.0.1', port: '8443', pathname: '/**' },
  // Docker network hostname
  { protocol: 'http', hostname: 'snipeit', port: '8080', pathname: '/**' },
  { protocol: 'https', hostname: 'snipeit', port: '8443', pathname: '/**' },
];

// If SNIPE_IT_API_URL is set to an IP or host (e.g. http://192.168.0.178:8080), add it
try {
  if (SNIPE_IT_API_URL) {
    const url = new URL(SNIPE_IT_API_URL);
    const port = url.port ? url.port : undefined;
    const pattern: any = {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      pathname: '/**',
    };
    if (port) pattern.port = port;
    baseRemotePatterns.push(pattern);
  }
} catch (e) {
  // ignore malformed env value
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Cast to any to avoid type incompatibilities in the build container's Next types
    remotePatterns: baseRemotePatterns as any,
  },
};

export default nextConfig;

import nextTranspileModules from "next-transpile-modules";
const withTM = nextTranspileModules(["@codecabana/web-components"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true, // Allow importing from outside the Next.js root. See: https://github.com/vercel/next.js/pull/22867
  },
};

export default withTM(nextConfig);

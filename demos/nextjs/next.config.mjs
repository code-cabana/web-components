import nextTranspileModules from "next-transpile-modules";
const withTM = nextTranspileModules(["@codecabana/web-components"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withTM(nextConfig);

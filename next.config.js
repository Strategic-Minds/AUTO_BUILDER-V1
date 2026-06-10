const { withWorkflow } = require("workflow/next");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname)
};

module.exports = withWorkflow(nextConfig);

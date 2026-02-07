import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 如果是生产环境构建，且部署在 GitHub Pages 子路径，需要设置 basePath
  // 假设仓库名是 jxr-to-png，那么 GitHub Pages 路径通常是 /jxr-to-png
  basePath: isProd ? '/jxr-to-png' : '',
  // basePath 会自动处理 assetPrefix，通常不需要重复设置，除非有 CDN 需求
  // assetPrefix: isProd ? '/jxr-to-png/' : '',
};

export default nextConfig;

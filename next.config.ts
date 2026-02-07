import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'jxr-to-png';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 恢复 basePath 以适配 GitHub Pages 默认子路径访问 (https://user.github.io/repo/)
  // 如果后续绑定了自定义域名 (如 example.com)，请将下面两行注释掉
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
};

export default nextConfig;

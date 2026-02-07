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
  assetPrefix: isProd ? '/jxr-to-png/' : '',
  
  // 静态导出不支持 headers 配置，这部分配置仅在开发模式有效 (next dev)
  // 生产环境通过 coi-serviceworker.js 实现相同效果
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

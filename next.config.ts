import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 绑定自定义域名后，不需要设置 basePath，因为域名会直接映射到根目录
  // 如果你后续取消绑定域名，需要恢复下面的配置：
  // basePath: process.env.NODE_ENV === 'production' ? '/jxr-to-png' : '',
};

export default nextConfig;

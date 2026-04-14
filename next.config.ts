import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // styled-components SSR 컴파일러 플러그인 활성화
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;

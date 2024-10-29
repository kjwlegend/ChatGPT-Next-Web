import webpack from "webpack"
import withBundleAnalyzer from '@next/bundle-analyzer'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import crypto from 'crypto-browserify' // 使用 import 语法
import stream from 'stream-browserify' // 使用 import 语法
import http from 'stream-http' // 使用 import 语法
import https from 'https-browserify' // 使用 import 语法
import zlib from 'browserify-zlib' // 使用 browserify-zlib 作为 zlib 的替代
import os from 'os-browserify' // 使用 os-browserify 作为 os 的替代

const mode = process.env.BUILD_MODE ?? "standalone"
console.log("[Next] build mode", mode)

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export"
console.log("[Next] build with chunk: ", !disableChunk)

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack (config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    if (disableChunk) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      )
    }

    config.resolve.fallback = {
      child_process: false,
      crypto: ['crypto-browserify'], // 使用字符串数组
      stream: ['stream-browserify'],   // 使用字符串数组
      http: ['stream-http'],            // 使用字符串数组
      https: ['https-browserify'],      // 使用字符串数组
      zlib: ['browserify-zlib'], // 添加 zlib 的 fallback
      os: ['os-browserify'], // 添加 os 的 fallback
    }

    // config.plugins.push(new NodePolyfillPlugin())

    return config
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'xiaoguangai.oss-cn-shanghai.aliyuncs.com',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: false,
  experimental: {
    forceSwcTransforms: true
    // esmExternals: false
  },
}

const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Max-Age",
    value: "86400",
  },
]

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
    ]
  }

  nextConfig.rewrites = async () => {
    const ret = [
      // adjust for previous version directly using "/api/proxy/" as proxy base route
      {
        source: "/api/proxy/v1/:path*",
        destination: "https://api.openai.com/v1/:path*",
      },
      {
        source: "/api/proxy/google/:path*",
        destination: "https://generativelanguage.googleapis.com/:path*",
      },
      {
        source: "/api/proxy/openai/:path*",
        destination: "https://api.openai.com/:path*",
      },
      {
        source: "/api/proxy/anthropic/:path*",
        destination: "https://api.anthropic.com/:path*",
      },
      {
        source: "/google-fonts/:path*",
        destination: "https://fonts.googleapis.com/:path*",
      },
      {
        source: "/sharegpt",
        destination: "https://sharegpt.com/api/conversations",
      },
    ]

    return {
      beforeFiles: ret,
    }
  }
}

// 集成 bundle-analyzer
const withBundleAnalyzerWrapper = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// 应用 bundle-analyzer 包装器
const finalConfig = withBundleAnalyzerWrapper(nextConfig)

export default finalConfig

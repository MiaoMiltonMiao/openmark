// @ts-check
const siteUrl = process.env.SITE_URL || 'https://miaomiltonmiao.github.io';
const baseUrl = process.env.BASE_URL || '/openmark/'; // Vercel 會覆蓋成 '/'

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenMark',
  url: siteUrl,
  baseUrl: baseUrl,
  // 可選：建議開啟，避免 404 資源問題
  trailingSlash: false,

  // 其餘原本設定照放…
  // favicon, presets, themeConfig, plugins ...
};

module.exports = config;

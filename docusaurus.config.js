// @ts-check
// Docusaurus config for OpenMark
// - Uses env var BASE_URL to switch between GitHub Pages and Vercel.
//   * GitHub Pages build (Actions): BASE_URL not set -> '/openmark/'
//   * Vercel build: BASE_URL='/' (set by `npm run build:vercel`)
// - You can also override SITE_URL if needed.

const isProd = process.env.NODE_ENV === 'production';
const siteUrl = process.env.SITE_URL || 'https://miaomiltonmiao.github.io';
const baseUrl = process.env.BASE_URL || '/openmark/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenMark',
  tagline: 'From chat to reusable Markdown.',
  url: siteUrl,
  baseUrl: baseUrl,
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: undefined, // set to 'img/favicon.ico' if you add one under /static/img

  // GitHub pages deployment config.
  organizationName: 'MiaoMiltonMiao', // Usually your GitHub org/user name.
  projectName: 'openmark', // Usually your repo name.

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // If you want "Edit this page" links, set your repo URL here:
          // editUrl: 'https://github.com/MiaoMiltonMiao/openmark/edit/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'OpenMark',
        // logo: { alt: 'OpenMark', src: 'img/logo.svg' },
        items: [
          { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' },
          { href: 'https://github.com/MiaoMiltonMiao/openmark', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [{label: 'Intro', to: '/docs/intro'}],
          },
          {
            title: 'Community',
            items: [
              {label: 'GitHub', href: 'https://github.com/MiaoMiltonMiao/openmark'},
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} OpenMark.`,
      },
      prism: {
        theme: require('prism-react-renderer/themes/github'),
        darkTheme: require('prism-react-renderer/themes/dracula'),
      },
    }),
};

module.exports = config;

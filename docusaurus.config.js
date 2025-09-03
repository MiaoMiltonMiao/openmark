// @ts-check
// Docusaurus config WITHOUT explicit Prism theme overrides.
// This avoids requiring 'prism-react-renderer' in your app deps.
// Docusaurus will use its defaults internally.

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

  organizationName: 'MiaoMiltonMiao',
  projectName: 'openmark',

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
        items: [
          { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' },
          { href: 'https://github.com/MiaoMiltonMiao/openmark', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          { title: 'Docs', items: [{ label: 'Intro', to: '/docs/intro' }] },
          { title: 'Community', items: [{ label: 'GitHub', href: 'https://github.com/MiaoMiltonMiao/openmark' }] },
        ],
        copyright: `© ${new Date().getFullYear()} OpenMark.`,
      },
      // No 'prism' field here; use defaults to avoid extra dep.
    }),
};

module.exports = config;

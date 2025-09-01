// @ts-check
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenMark',
  tagline: 'Chat → Markdown → Open Knowledge',
  favicon: 'img/logo.svg', // use logo as favicon to avoid missing .ico

  // Your production URL and base path (GitHub Pages)
  url: 'https://miaomiltonmiao.github.io',
  baseUrl: '/openmark/',

  // GitHub org/user and repo names
  organizationName: 'MiaoMiltonMiao',
  projectName: 'openmark',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/MiaoMiltonMiao/openmark/edit/main/',
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
        logo: { alt: 'OpenMark', src: 'img/logo.svg' },
        items: [
          { to: '/docs/intro', label: 'Docs', position: 'left' },
          { href: 'https://github.com/MiaoMiltonMiao/openmark', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          { title: 'Docs', items: [{ label: 'Intro', to: '/docs/intro' }] },
          { title: 'Community', items: [{ label: 'Discussions', href: 'https://github.com/MiaoMiltonMiao/openmark/discussions' }] },
          { title: 'More', items: [{ label: 'GitHub', href: 'https://github.com/MiaoMiltonMiao/openmark' }] },
        ],
        copyright: `© ${new Date().getFullYear()} OpenMark — CC BY 4.0 content, MIT code.`,
      },
      prism: {
        // Use the new export style to avoid "Cannot find module '.../themes/github'"
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;

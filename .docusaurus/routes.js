import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/openmark/__docusaurus/debug',
    component: ComponentCreator('/openmark/__docusaurus/debug', '5a3'),
    exact: true
  },
  {
    path: '/openmark/__docusaurus/debug/config',
    component: ComponentCreator('/openmark/__docusaurus/debug/config', '752'),
    exact: true
  },
  {
    path: '/openmark/__docusaurus/debug/content',
    component: ComponentCreator('/openmark/__docusaurus/debug/content', '2ff'),
    exact: true
  },
  {
    path: '/openmark/__docusaurus/debug/globalData',
    component: ComponentCreator('/openmark/__docusaurus/debug/globalData', 'c71'),
    exact: true
  },
  {
    path: '/openmark/__docusaurus/debug/metadata',
    component: ComponentCreator('/openmark/__docusaurus/debug/metadata', '1c1'),
    exact: true
  },
  {
    path: '/openmark/__docusaurus/debug/registry',
    component: ComponentCreator('/openmark/__docusaurus/debug/registry', '2dc'),
    exact: true
  },
  {
    path: '/openmark/__docusaurus/debug/routes',
    component: ComponentCreator('/openmark/__docusaurus/debug/routes', '7eb'),
    exact: true
  },
  {
    path: '/openmark/upload',
    component: ComponentCreator('/openmark/upload', '813'),
    exact: true
  },
  {
    path: '/openmark/upload',
    component: ComponentCreator('/openmark/upload', 'd18'),
    exact: true
  },
  {
    path: '/openmark/docs',
    component: ComponentCreator('/openmark/docs', '7d9'),
    routes: [
      {
        path: '/openmark/docs',
        component: ComponentCreator('/openmark/docs', '6b2'),
        routes: [
          {
            path: '/openmark/docs',
            component: ComponentCreator('/openmark/docs', 'ef4'),
            routes: [
              {
                path: '/openmark/docs/intro',
                component: ComponentCreator('/openmark/docs/intro', '8f6'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/openmark/docs/Wallet_Pay_Vibe_Prompt_Playbook',
                component: ComponentCreator('/openmark/docs/Wallet_Pay_Vibe_Prompt_Playbook', 'd5f'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/openmark/',
    component: ComponentCreator('/openmark/', 'eac'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];

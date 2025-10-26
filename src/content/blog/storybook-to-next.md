---
title: Next.jsにStorybookを導入する
description: 'Next.jsにStorybookを導入する方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-10-16'
---

## 環境情報

- pnpm           8.9.0
- node           16.14.0
- Next.js        v13.5.4 (App Router)
- storybook@next 7.5.0-alpha.7

## 手順

### Storybook を導入する

```bash
pnpx storybook init
```

```bash
pnpm add -D @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/blocks @storybook/addon-styling @storybook/nextjs @storybook/react @storybook/testing-library eslint-plugin-storybook
```

下記コマンドで立ち上げる

```bash
pnpm storybook
```

下記のような画面が立ち上がればOK

![](/images/blog/storybook-to-next/after-install.png)



### コンポーネント用Storyファイルを作成する

src/stories/ 内に `{コンポーネント名}.stories.tsx` を作成する。

#### ex) Pagination.tsx のStoryファイルを作成する場合

##### src/components/Pagination.tsx

```tsx
import Link from 'next/link';

type Props = {
  pages: number[];
  currentPage: number;
  baseUrl?: string;
}

const Pagination = ({ pages, currentPage = 1, baseUrl = '/articles/page/' }: Props) => {
  return (
    <div className="c-pagination">
      {pages.length > 1 &&
        pages.map((page) => (
          <Link href={`${baseUrl}${page}`} key={page} className={`c-pagination__link c-pagination__link--${currentPage == page ? 'current' : page
            }`}>
            {page}
          </Link>
        ))}
    </div>
  );
};

export default Pagination;
```

##### src/stories/Pagination.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react';

import Pagination from '../components/Pagination';

// 最大ページ数
const maxPages = 10;

// pages用配列作成 
const maxPagesArray = [];
for (let i = 1; i <= maxPages; i++) {
  maxPagesArray.push(i);
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    pages: maxPagesArray,
    currentPage: 1,
  },
  argTypes: {
    currentPage: {
      control: {
        type: 'number',
        min: 1,
        max: maxPages,
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sample: Story = {
  args: {
    currentPage: 1,
  },
};
```

下記のようにコンポーネントが表示されればOK

![](/images/blog/storybook-to-next/create-story.png)

### Styleを読み込む

.storybook/main.ts に `@storybook/addon-styling` の読み込みを追加

```diff
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
+   "@storybook/addon-styling",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
```

.storybook/preview.ts import文を追加

```diff
import type { Preview } from "@storybook/react";
+ import "../src/styles/style.scss";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

Styleが当たっていればOK

![](/images/blog/storybook-to-next/imported-style.png)




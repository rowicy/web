import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { parseDocument, isSeq, isScalar } from 'yaml';

type TransformResult = {
  changed: boolean;
  content: string;
};

type Transformer = (
  content: string,
  filePath: string
) => TransformResult | Promise<TransformResult>;

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getMarkdownFiles(res) : res;
    })
  );
  return files.flat().filter(file => file.endsWith('.md'));
}

function transformFrontmatter(content: string): TransformResult {
  const parsed = matter(content);

  if (!parsed.matter || parsed.matter.trim() === '') {
    return { changed: false, content };
  }

  const doc = parseDocument(parsed.matter);
  if (doc.errors.length > 0) {
    return { changed: false, content };
  }

  let hasChanges = false;

  if (doc.contents && 'items' in doc.contents) {
    if ('delete' in doc.contents && doc.contents.has('mention')) {
      doc.contents.delete('mention');
      hasChanges = true;
    }

    doc.contents.items.forEach((item: any) => {
      const key = item.key?.value;

      /**
       * 1. 配列を Flow に
       */
      if (isSeq(item.value) && !item.value.flow) {
        item.value.flow = true;
        hasChanges = true;
      }

      /**
       * 2. pubDate を 'YYYY-MM-DD'
       */
      if (key === 'pubDate' && isScalar(item.value)) {
        const val = String(item.value.value);
        if (
          /^\d{4}-\d{2}-\d{2}$/.test(val) &&
          item.value.type !== 'QUOTE_SINGLE'
        ) {
          item.value.type = 'QUOTE_SINGLE';
          hasChanges = true;
        }
      }

      /**
       * 3. title: null → "{{タイトルを入力}}"
       */
      if (
        key === 'title' &&
        isScalar(item.value) &&
        item.value.value === null
      ) {
        item.value.value = '{{タイトルを入力}}';
        item.value.type = 'PLAIN';
        hasChanges = true;
      }

      /**
       * 4. description: null → 本文から自動生成
       */
      if (
        key === 'description' &&
        isScalar(item.value) &&
        item.value.value === null
      ) {
        // ① HTMLタグ除去
        const noHtml = parsed.content.replace(/<[^>]*>/g, '');

        // ② エスケープ
        const escaped = escapeHtml(noHtml);

        // ③ 改行除去して1行に
        const singleLine = escaped
          .replace(/\r\n|\r|\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // ④ 255文字でカット
        const sliced = singleLine.slice(0, 255);

        item.value.value = sliced;
        item.value.type = 'PLAIN';
        hasChanges = true;
      }
    });
  }

  if (!hasChanges) {
    return { changed: false, content };
  }

  const newYaml = doc.toString({
    flowCollectionPadding: false,
    lineWidth: 0,
  });

  const newContent =
    `---\n${newYaml.trimEnd()}\n---\n\n` + parsed.content.trimStart();

  return {
    changed: true,
    content: newContent,
  };
}

function transformWikiLink(content: string): TransformResult {
  const replaced = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_m, p1) => `[${p1}](${p1})`
  );

  if (replaced === content) {
    return { changed: false, content };
  }

  return {
    changed: true,
    content: replaced,
  };
}

/**
 * Markdownの画像リンクをHTMLのimgタグに変換しつつ、
 * パスを (assets/...) → (/images/blog/...) に変換する
 */
export function transformAssetsPath(content: string): TransformResult {
  let changed = false;

  // 正規表現の解説:
  // !\[(.*?)\] -> 画像のaltテキストをキャプチャ
  // \((assets\/[^)]+)\) -> assets/から始まるパスをキャプチャ
  const replaced = content.replace(
    /!\[(.*?)\]\((assets\/[^)]+)\)/g,
    (_match, alt, _path) => {
      changed = true;
      const newPath = `/images/blog/${_path.slice('assets/'.length).replaceAll('_', '-').toLowerCase()}`;
      return `<img src="${newPath}" alt="${alt}" style="height: 50vh; width: auto; max-width: 100%; object-fit: contain;">`;
    }
  );

  if (!changed) {
    return { changed: false, content };
  }

  return {
    changed: true,
    content: replaced,
  };
}

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public/images/blog');

/**
 * MDファイルで参照されていない画像を public/images/blog/<slug>/ から削除する
 */
async function deleteUnlinkedImages(
  content: string,
  filePath: string
): Promise<TransformResult> {
  const slug = path.basename(filePath, '.md');
  const imgDir = path.join(PUBLIC_IMAGES_DIR, slug);

  try {
    await fs.access(imgDir);
  } catch {
    return { changed: false, content };
  }

  const entries = await fs.readdir(imgDir, { withFileTypes: true });
  const imageFiles = entries.filter(e => e.isFile()).map(e => e.name);
  if (imageFiles.length === 0) return { changed: false, content };

  // <img src="/images/blog/slug/file"> と ![alt](/images/blog/slug/file) の両方を収集
  const referenced = new Set<string>();
  const patterns = [
    /src="\/images\/blog\/[^/]+\/([^"]+)"/g,
    /!\[.*?\]\(\/images\/blog\/[^/]+\/([^)]+)\)/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      referenced.add(match[1]);
    }
  }

  for (const file of imageFiles) {
    if (!referenced.has(file)) {
      await fs.unlink(path.join(imgDir, file));
      console.log(`🗑️  Deleted: public/images/blog/${slug}/${file}`);
    }
  }

  return { changed: false, content };
}

const transformers: Transformer[] = [
  transformFrontmatter,
  transformWikiLink,
  transformAssetsPath,
  deleteUnlinkedImages,
];

async function run() {
  const files = await getMarkdownFiles(BLOG_DIR);

  for (const filePath of files) {
    let content = await fs.readFile(filePath, 'utf-8');
    let changed = false;

    for (const transform of transformers) {
      const result = await transform(content, filePath);
      if (result.changed) {
        content = result.content;
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    }
  }
}

run().catch(console.error);

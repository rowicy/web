import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { parseDocument, isSeq, isScalar } from 'yaml';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getMarkdownFiles(res) : res;
    })
  );
  return files.flat().filter((file) => file.endsWith('.md'));
}

async function formatFrontmatter() {
  try {
    const files = await getMarkdownFiles(BLOG_DIR);

    for (const filePath of files) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(fileContent);

      if (!parsed.matter || parsed.matter.trim() === '') continue;

      const doc = parseDocument(parsed.matter);
      if (doc.errors.length > 0) {
        console.warn(`⚠️ Syntax Error (Skipped): ${path.relative(process.cwd(), filePath)}`);
        continue;
      }

      let hasChanges = false;

      if (doc.contents && 'items' in doc.contents) {
        doc.contents.items.forEach((item: any) => {
          const key = item.key?.value;

          // 1. 配列の処理 (Block -> Flow [A, B])
          if (isSeq(item.value)) {
            if (!item.value.flow) {
              item.value.flow = true;
              hasChanges = true;
            }
          }

          // 2. pubDate の処理 ('YYYY-MM-DD' 形式に強制)
          if (key === 'pubDate' && isScalar(item.value)) {
            const val = String(item.value.value);
            // 日付形式 (YYYY-MM-DD) にマッチするか確認
            const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(val);
            
            // 既にシングルクォートでない、かつ日付形式なら修正
            if (isDateFormat && item.value.type !== 'QUOTE_SINGLE') {
              item.value.type = 'QUOTE_SINGLE';
              hasChanges = true;
            }
          }
        });
      }

      // 修正が必要な箇所が一つもなければ保存をスキップ
      if (!hasChanges) {
        continue;
      }

      const newYaml = doc.toString({
        flowCollectionPadding: false,
        lineWidth: 0,
      });

      const newContent = `---\n${newYaml.trimEnd()}\n---\n${parsed.content.trimStart()}`;

      await fs.writeFile(filePath, newContent, 'utf-8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    }

    console.log('\n✨ 処理が完了しました。');
  } catch (error) {
    console.error('❌ 実行エラー:', error);
  }
}

formatFrontmatter();
#!/usr/bin/env node

import { readdir, writeFile, mkdir, copyFile, stat } from 'fs/promises';
import { dirname, join, basename, extname } from 'path';
import { existsSync } from 'fs';
import * as readline from 'readline';

interface RepoFile {
  name: string;
  path: string;
  download_url: string;
  created_at?: string;
}

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

// ANSIカラーコード
const colors = {
  green: '\x1b[32m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'pnpm-fetch-tool'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }
  
  return headers;
}

async function fetchGitHubContent(repo: string, path: string): Promise<any> {
  const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository or path not found: ${repo}/${path}`);
    } else if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication failed. Please set GITHUB_TOKEN environment variable for private repositories.`);
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  
  return response.json();
}

async function downloadFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  return response.text();
}

async function getFileCreationDate(repo: string, path: string): Promise<string> {
  try {
    const url = `${GITHUB_API}/repos/${repo}/commits?path=${path}&page=1&per_page=1`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const commits = await response.json();
      if (commits.length > 0) {
        return commits[0].commit.author.date;
      }
    }
  } catch (error) {
    // エラーの場合は現在時刻を返す
  }
  return new Date().toISOString();
}

async function getMdFiles(repo: string): Promise<RepoFile[]> {
  console.log('📦 Fetching files from repository...');
  const contents = await fetchGitHubContent(repo, '');
  
  const mdFiles = contents.filter((file: any) => 
    file.type === 'file' && file.name.endsWith('.md')
  );

  // 作成日時を取得
  const filesWithDates = await Promise.all(
    mdFiles.map(async (file: any) => {
      const created_at = await getFileCreationDate(repo, file.path);
      return {
        name: file.name,
        path: file.path,
        download_url: file.download_url,
        created_at
      };
    })
  );

  // 作成日時でソート（新しい順）
  filesWithDates.sort((a, b) => 
    new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  );

  return filesWithDates;
}

async function getLocalFiles(): Promise<Set<string>> {
  const blogDir = 'src/content/blog';
  const localFiles = new Set<string>();
  
  if (existsSync(blogDir)) {
    const files = await readdir(blogDir);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        localFiles.add(file);
      }
    });
  }
  
  return localFiles;
}

async function interactiveSelect(files: RepoFile[], localFiles: Set<string>): Promise<RepoFile[]> {
  return new Promise((resolve) => {
    const selected = new Set<number>();
    let cursor = 0;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const render = () => {
      console.clear();
      console.log(`${colors.cyan}Select files to fetch (Space: toggle, Enter: confirm, ↑/↓: navigate)${colors.reset}\n`);
      
      files.forEach((file, i) => {
        const isSelected = selected.has(i);
        const isCursor = i === cursor;
        const isNew = !localFiles.has(file.name);
        
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const arrow = isCursor ? '→ ' : '  ';
        const nameColor = isNew ? colors.green : '';
        const nameReset = isNew ? colors.reset : '';
        
        console.log(`${arrow}${checkbox} ${nameColor}${file.name}${nameReset}`);
      });
      
      console.log(`\n${colors.yellow}Selected: ${selected.size} file(s)${colors.reset}`);
    };

    render();

    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'up') {
        cursor = Math.max(0, cursor - 1);
        render();
      } else if (key.name === 'down') {
        cursor = Math.min(files.length - 1, cursor + 1);
        render();
      } else if (key.name === 'space') {
        if (selected.has(cursor)) {
          selected.delete(cursor);
        } else {
          selected.add(cursor);
        }
        render();
      } else if (key.name === 'return') {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        rl.close();
        process.stdin.removeAllListeners('keypress');
        
        const selectedFiles = Array.from(selected).map(i => files[i]);
        resolve(selectedFiles);
      } else if (key.ctrl && key.name === 'c') {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        rl.close();
        process.exit(0);
      }
    });
  });
}

async function copyAssetsDirectory(repo: string, mdFileName: string): Promise<void> {
  const baseName = basename(mdFileName, extname(mdFileName));
  const assetsPath = `assets/${baseName}`;
  
  try {
    const assetsContents = await fetchGitHubContent(repo, assetsPath);
    
    if (Array.isArray(assetsContents)) {
      const destDir = join('public', 'images', 'blog', baseName);
      await mkdir(destDir, { recursive: true });
      
      for (const item of assetsContents) {
        if (item.type === 'file') {
          const content = await downloadFile(item.download_url);
          const destPath = join(destDir, item.name);
          
          // バイナリファイルの場合
          const response = await fetch(item.download_url);
          const buffer = await response.arrayBuffer();
          await writeFile(destPath, new Uint8Array(buffer));
          
          console.log(`  📷 Copied asset: ${item.name}`);
        }
      }
    }
  } catch (error) {
    // assetsディレクトリが存在しない場合はスキップ
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || !args[0]) {
    console.error('Usage: pnpm fetch <owner/repo>');
    console.error('\nFor private repositories, set GITHUB_TOKEN environment variable:');
    console.error('  export GITHUB_TOKEN=ghp_your_token_here');
    console.error('  pnpm fetch owner/repo');
    process.exit(1);
  }

  const repo = args[0];

  // トークンの確認
  if (GITHUB_TOKEN) {
    console.log(`${colors.cyan}🔑 Using GitHub token for authentication${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  No GitHub token found. Only public repositories will be accessible.${colors.reset}`);
  }

  try {
    // リポジトリのファイル一覧を取得
    const files = await getMdFiles(repo);
    
    if (files.length === 0) {
      console.log('No .md files found in the repository.');
      return;
    }

    // ローカルファイル一覧を取得
    const localFiles = await getLocalFiles();

    // インタラクティブ選択
    const selectedFiles = await interactiveSelect(files, localFiles);

    if (selectedFiles.length === 0) {
      console.log('\nNo files selected.');
      return;
    }

    console.log(`\n✨ Fetching ${selectedFiles.length} file(s)...\n`);

    // ディレクトリ作成
    await mkdir('src/content/blog', { recursive: true });

    // 選択されたファイルをダウンロード
    for (const file of selectedFiles) {
      const content = await downloadFile(file.download_url);
      const destPath = join('src', 'content', 'blog', file.name);
      await writeFile(destPath, content, 'utf-8');
      console.log(`✓ Created: ${file.name}`);

      // 関連するassetsディレクトリをコピー
      await copyAssetsDirectory(repo, file.name);
    }

    console.log(`\n${colors.green}✨ Done! Successfully fetched ${selectedFiles.length} file(s).${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error instanceof Error ? error.message : error}${colors.reset}`);
    
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      console.error(`\n${colors.yellow}Tip: Create a Personal Access Token at:`);
      console.error('https://github.com/settings/tokens');
      console.error('Then set it as an environment variable:');
      console.error(`  export GITHUB_TOKEN=your_token_here${colors.reset}`);
    }
    
    process.exit(1);
  }
}

main();
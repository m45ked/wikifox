import * as fs from 'fs';
import * as path from 'path';

interface CleanupOptions {
  verbose?: boolean;
  addIIFE?: boolean;
  removeComments?: boolean;
  recursive?: boolean;
}

/**
 * Główna funkcja czyszcząca
 */
export function cleanAll(distDir: string, options: CleanupOptions = {}): void {
  const opts = {
    verbose: true,
    addIIFE: true,
    removeComments: false,
    recursive: true,
    ...options
  };

  if (!fs.existsSync(distDir)) {
    console.error('❌ Folder dist nie istnieje:', distDir);
    process.exit(1);
  }

  console.log(`🧹 Czyszczenie plików w: ${distDir}${opts.recursive ? ' (rekurencyjnie)' : ''}`);
  
  const files = findJSFiles(distDir, opts.recursive);
  
  if (files.length === 0) {
    console.log('ℹ️  Nie znaleziono plików .js do oczyszczenia');
    return;
  }
  
  console.log(`📁 Znaleziono ${files.length} plików .js`);
  
  let cleanedCount = 0;
  
  files.forEach(file => {
    try {
      if (cleanFile(file, distDir, opts)) {
        cleanedCount++;
      }
    } catch (error) {
      console.error(`   ❌ Błąd przy ${file}:`, error);
    }
  });
  
  console.log(`✅ Gotowe! Przetworzono ${cleanedCount}/${files.length} plików`);
}

/**
 * Znajduje wszystkie pliki .js rekurencyjnie
 */
function findJSFiles(dir: string, recursive: boolean): string[] {
  const results: string[] = [];
  
  const scanDirectory = (currentDir: string) => {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && recursive) {
        scanDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  };
  
  scanDirectory(dir);
  return results;
}

/**
 * Czyści pojedynczy plik .js
 */
function cleanFile(filePath: string, distDir: string, options: CleanupOptions): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // Usuń exporty
    content = removeExports(content);
    
    // Usuń require()
    content = removeRequires(content);
    
    // Usuń komentarze jeśli potrzebne
    if (options.removeComments) {
      content = removeComments(content);
    }
    
    // Dodaj IIFE wrapper
    if (options.addIIFE && content.trim().length > 0) {
      content = wrapInIIFE(content, filePath);
    }
    
    // Zapisz jeśli były zmiany
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content);
      
      if (options.verbose) {
        const relativePath = path.relative(distDir, filePath);
        console.log(`   ✅ ${relativePath}`);
      }
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    throw new Error(`Błąd przetwarzania: ${error}`);
  }
}

/**
 * Usuń export statements
 */
function removeExports(content: string): string {
  const patterns = [
    /Object\.defineProperty\s*\(\s*exports\s*,\s*["']__esModule["'].*?\)\s*;?\s*/gs,
    /exports\.\w+\s*=\s*[^;]+;\s*/g,
    /exports\.default\s*=.*;\s*/g,
    /module\.exports\s*=.*;\s*/g,
    /export\s*\{[^}]*\}\s*;?\s*/g,
    /import\s+.*from\s+['"][^'"]+['"]\s*;?\s*/g
  ];
  
  let result = content;
  patterns.forEach(pattern => {
    result = result.replace(pattern, '');
  });
  
  return result;
}

/**
 * Usuń require() statements
 */
function removeRequires(content: string): string {
  // Usuń require() bez przypisania
  let result = content.replace(/^\s*require\(["'][^"']+["']\)\s*;?\s*$/gm, '');
  
  // Zamień const x = require('y') na const x = {};
  return result.replace(
    /(const|let|var)\s+(\w+)\s*=\s*require\(["'][^"']+["']\)\s*;?\s*/g,
    '$1 $2 = {};'
  );
}

/**
 * Usuń komentarze
 */
function removeComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

/**
 * Opakuj w IIFE
 */
function wrapInIIFE(content: string, filePath: string): string {
  const trimmed = content.trim();
  
  if (trimmed.length === 0 || 
      trimmed.startsWith('(function') || 
      trimmed.startsWith('!function')) {
    return content;
  }
  
  const filename = path.basename(filePath);
  const wrapper = filename.includes('background') ? 'Background script' :
                  filename.includes('content') ? 'Content script' :
                  'Extension script';
  
  return `// ${wrapper} - auto-generated\n(function() {\n"use strict";\n${content}\n})();`;
}

// ============================================================================
// CLI INTERFACE (bez klasy!)
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parsowanie argumentów
  const distDir = args.find(arg => !arg.startsWith('--')) || './dist';
  const options: CleanupOptions = {
    verbose: !args.includes('--quiet'),
    addIIFE: !args.includes('--no-iife'),
    removeComments: args.includes('--remove-comments'),
    recursive: !args.includes('--no-recursive')
  };
  
  if (!fs.existsSync(distDir)) {
    console.error(`❌ Folder ${distDir} nie istnieje!`);
    process.exit(1);
  }
  
  // Analiza czy czyszczenie
  if (args.includes('--analyze') && options.recursive) {
    const files = findJSFiles(distDir, options.recursive);
    console.log(`📊 Znaleziono ${files.length} plików .js w ${distDir}:`);
    files.forEach(file => {
      const relative = path.relative(distDir, file);
      const hasExports = /exports\.|module\.exports/.test(fs.readFileSync(file, 'utf8'));
      console.log(`   ${relative} ${hasExports ? '❌' : '✅'}`);
    });
    
  } else {
    // Normalne czyszczenie
    cleanAll(distDir, options);
  }
}
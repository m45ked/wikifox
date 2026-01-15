import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { basename, join } from 'path';

function cleanFile(filePath) {
  let content = readFileSync(filePath, 'utf8');

  content = content
    .replace(/Object\.defineProperty\(exports, "__esModule", \{ value: true \}\);\s*/g, '')
    .replace(/exports\.\w+ = \w+;\s*/g, '')
    .replace(/exports\.default = .*;\s*/g, '')
    .replace(/module\.exports = .*;\s*/g, '');

  if (!content.includes('(function()') && !content.includes('window.'))
    content = `(function() {\n${content}\n})();`;

  writeFileSync(filePath, content);
  console.log(`✅ Wyczyczono: ${basename(filePath)}`);
}

const distDir = join(".", 'dist');
readdirSync(distDir).forEach(file => {
  if (file.endsWith('.js')) {
    cleanFile(join(distDir, file));
  }
});
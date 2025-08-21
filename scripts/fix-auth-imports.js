// scripts/fix-auth-imports.js - Fix auth provider imports
const fs = require('fs');
const path = require('path');

function updateAuthImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      updateAuthImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace old auth import
      const oldImport = /import\s*{\s*useAuth\s*}\s*from\s*["']@\/components\/auth\/auth-provider["']/g;
      const newImport = 'import { useAuth } from "@/hooks/useAuth"';
      
      if (oldImport.test(content)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  });
}

console.log('🔧 Fixing auth imports...');
updateAuthImports('./src');
console.log('✅ Auth imports fixed!');

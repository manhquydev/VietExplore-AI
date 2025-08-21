#!/usr/bin/env node

/**
 * Simple Sitemap Tree Generator - File Output Only
 * Tạo sitemap tree đơn giản xuất ra file txt
 */

const fs = require('fs');
const path = require('path');

// Lấy tất cả routes từ app directory
function scanAppDirectory(dirPath, basePath = '') {
  const routes = [];
  
  if (!fs.existsSync(dirPath)) {
    return routes;
  }

  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory()) {
      const itemPath = path.join(dirPath, item.name);
      
      // Skip nếu là dynamic route parameter
      if (item.name.startsWith('[') && item.name.endsWith(']')) {
        const paramName = item.name.slice(1, -1);
        const dynamicPath = basePath + '/' + `[${paramName}]`;
        
        // Kiểm tra có page.tsx không
        if (fs.existsSync(path.join(itemPath, 'page.tsx'))) {
          routes.push({
            path: dynamicPath,
            type: 'dynamic',
            param: paramName
          });
        }
        
        // Scan subfolder
        const subRoutes = scanAppDirectory(itemPath, dynamicPath);
        routes.push(...subRoutes);
      } 
      // Skip nếu là [...slug] catch-all route
      else if (item.name.startsWith('[...') && item.name.endsWith(']')) {
        const paramName = item.name.slice(4, -1);
        const catchAllPath = basePath + '/' + `[...${paramName}]`;
        
        if (fs.existsSync(path.join(itemPath, 'page.tsx'))) {
          routes.push({
            path: catchAllPath,
            type: 'catch-all',
            param: paramName
          });
        }
      }
      // Normal directory
      else {
        const newBasePath = basePath + '/' + item.name;
        
        // Kiểm tra có page.tsx không
        if (fs.existsSync(path.join(itemPath, 'page.tsx'))) {
          routes.push({
            path: newBasePath,
            type: 'static'
          });
        }
        
        // Scan subfolder
        const subRoutes = scanAppDirectory(itemPath, newBasePath);
        routes.push(...subRoutes);
      }
    }
  }
  
  return routes;
}

// Parse sitemap.xml
function parseSitemapXml(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    return [];
  }
  
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
  
  if (!urlMatches) return [];
  
  return urlMatches.map(match => {
    const url = match.replace(/<\/?loc>/g, '');
    const path = url.replace(/https?:\/\/[^\/]+/, '') || '/';
    return path;
  });
}

// Tạo tree structure từ routes
function createRouteTree(routes) {
  const tree = {};
  
  // Root route
  tree['/'] = {
    type: 'static',
    children: {}
  };
  
  routes.forEach(route => {
    const parts = route.path.split('/').filter(part => part !== '');
    let current = tree['/'].children;
    let currentPath = '';
    
    parts.forEach((part, index) => {
      currentPath += '/' + part;
      
      if (!current[part]) {
        current[part] = {
          type: route.type,
          param: route.param,
          path: currentPath,
          children: {}
        };
      }
      
      current = current[part].children;
    });
  });
  
  return tree;
}

// In tree structure to array
function printTreeToArray(tree, output, prefix = '', isLast = true, level = 0) {
  const entries = Object.entries(tree);
  
  entries.forEach(([key, node], index) => {
    const isLastItem = index === entries.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    
    let typeIndicator = '';
    if (node.type === 'dynamic') {
      typeIndicator = ' [dynamic]';
    } else if (node.type === 'catch-all') {
      typeIndicator = ' [catch-all]';
    }
    
    output.push(prefix + connector + key + typeIndicator);
    
    if (Object.keys(node.children).length > 0) {
      const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
      printTreeToArray(node.children, output, newPrefix, false, level + 1);
    }
  });
}

// Main function
function generateSitemapTreeFile() {
  const output = [];
  
  output.push('🌳 VietExplore-AI Sitemap Tree Generator');
  output.push('==================================================');
  output.push('');
  
  const appDirPath = path.join(process.cwd(), 'src', 'app');
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-0.xml');
  
  // 1. Scan app directory routes
  output.push('📁 App Directory Routes:');
  const routes = scanAppDirectory(appDirPath);
  const routeTree = createRouteTree(routes);
  printTreeToArray(routeTree, output);
  
  output.push('');
  output.push(`📊 Total Routes: ${routes.length + 1}`); // +1 for root
  output.push('');
  
  // 2. Parse sitemap.xml
  output.push('🗺️ Generated Sitemap URLs:');
  const sitemapUrls = parseSitemapXml(sitemapPath);
  
  if (sitemapUrls.length > 0) {
    // Group URLs by category
    const categorized = {
      'Core Pages': [],
      'Places': [],
      'Community': [],
      'AI Assistant': [],
      'Auth': [],
      'Legal': [],
      'Other': []
    };
    
    sitemapUrls.forEach(url => {
      if (url === '/' || url.includes('/about') || url.includes('/help') || url.includes('/resources')) {
        categorized['Core Pages'].push(url);
      } else if (url.includes('/places')) {
        categorized['Places'].push(url);
      } else if (url.includes('/community')) {
        categorized['Community'].push(url);
      } else if (url.includes('/ai-assistant')) {
        categorized['AI Assistant'].push(url);
      } else if (url.includes('/auth')) {
        categorized['Auth'].push(url);
      } else if (url.includes('/legal')) {
        categorized['Legal'].push(url);
      } else {
        categorized['Other'].push(url);
      }
    });
    
    Object.entries(categorized).forEach(([category, urls]) => {
      if (urls.length > 0) {
        output.push('');
        output.push(`${category}: (${urls.length} URLs)`);
        urls.forEach((url, index) => {
          const isLast = index === urls.length - 1;
          const connector = isLast ? '└── ' : '├── ';
          output.push(connector + url);
        });
      }
    });
    
    output.push('');
    output.push(`📊 Total Sitemap URLs: ${sitemapUrls.length}`);
  }
  
  // 3. Route analysis
  output.push('');
  output.push('📈 Route Analysis:');
  const staticRoutes = routes.filter(r => r.type === 'static').length + 1; // +1 for root
  const dynamicRoutes = routes.filter(r => r.type === 'dynamic').length;
  const catchAllRoutes = routes.filter(r => r.type === 'catch-all').length;
  
  output.push(`├── Static Routes: ${staticRoutes}`);
  output.push(`├── Dynamic Routes: ${dynamicRoutes}`);
  output.push(`└── Catch-all Routes: ${catchAllRoutes}`);
  
  output.push('');
  output.push('✨ Generation completed!');
  output.push('');
  output.push(`Generated on: ${new Date().toISOString()}`);
  
  // Write to file
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sitemap-tree-${timestamp}.txt`;
  const filepath = path.join(process.cwd(), 'docs', filename);
  
  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Write file with UTF-8 encoding
  fs.writeFileSync(filepath, output.join('\n'), 'utf-8');
  
  console.log(`✅ Sitemap tree saved to: ${filename}`);
  console.log(`📁 Full path: ${filepath}`);
  console.log(`📄 Total lines: ${output.length}`);
  
  return filepath;
}

// Run the generator
if (require.main === module) {
  generateSitemapTreeFile();
}

module.exports = { generateSitemapTreeFile };

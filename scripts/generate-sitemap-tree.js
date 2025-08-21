#!/usr/bin/env node

/**
 * Sitemap Tree Generator for VietExplore-AI
 * Tạo sitemap dạng tree từ app directory và sitemap.xml
 */

const fs = require('fs');
const path = require('path');

// Màu sắc cho console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Ký tự tree
const treeChars = {
  branch: '├── ',
  lastBranch: '└── ',
  vertical: '│   ',
  space: '    '
};

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
        const paramName = item.name.slice(4, -1); // Remove "[..." and "]"
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

// In tree structure
function printTree(tree, prefix = '', isLast = true, level = 0) {
  const entries = Object.entries(tree);
  
  entries.forEach(([key, node], index) => {
    const isLastItem = index === entries.length - 1;
    const connector = isLastItem ? treeChars.lastBranch : treeChars.branch;
    
    // Tạo màu sắc dựa trên type
    let colorKey = key;
    let typeIndicator = '';
    
    if (node.type === 'dynamic') {
      colorKey = colors.yellow + key + colors.reset;
      typeIndicator = colors.cyan + ' [dynamic]' + colors.reset;
    } else if (node.type === 'catch-all') {
      colorKey = colors.magenta + key + colors.reset;
      typeIndicator = colors.cyan + ' [catch-all]' + colors.reset;
    } else if (level === 0) {
      colorKey = colors.green + colors.bright + key + colors.reset;
    } else {
      colorKey = colors.blue + key + colors.reset;
    }
    
    console.log(prefix + connector + colorKey + typeIndicator);
    
    if (Object.keys(node.children).length > 0) {
      const newPrefix = prefix + (isLastItem ? treeChars.space : treeChars.vertical);
      printTree(node.children, newPrefix, false, level + 1);
    }
  });
}

// Parse sitemap.xml để lấy actual URLs
function parseSitemapXml(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    console.log(colors.red + '❌ Sitemap.xml not found. Run "npm run build" first.' + colors.reset);
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

// Main function
function generateSitemapTree(outputToFile = false) {
  const output = [];
  const log = outputToFile ? (text) => output.push(text) : console.log;
  
  log(colors.bright + colors.green + '🌳 VietExplore-AI Sitemap Tree Generator' + colors.reset);
  log('='.repeat(50));
  
  const appDirPath = path.join(process.cwd(), 'src', 'app');
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-0.xml');
  
  // 1. Scan app directory routes
  log(colors.bright + '\n📁 App Directory Routes:' + colors.reset);
  const routes = scanAppDirectory(appDirPath);
  const routeTree = createRouteTree(routes);
  
  if (outputToFile) {
    printTreeToArray(routeTree, output);
  } else {
    printTree(routeTree);
  }
  
  log(colors.cyan + `\n📊 Total Routes: ${routes.length + 1}` + colors.reset); // +1 for root
  
  // 2. Parse sitemap.xml
  log(colors.bright + '\n🗺️  Generated Sitemap URLs:' + colors.reset);
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
        log(colors.yellow + `\n${category}:` + colors.reset);
        urls.forEach((url, index) => {
          const isLast = index === urls.length - 1;
          const connector = isLast ? treeChars.lastBranch : treeChars.branch;
          log(connector + colors.blue + url + colors.reset);
        });
      }
    });
    
    log(colors.cyan + `\n📊 Total Sitemap URLs: ${sitemapUrls.length}` + colors.reset);
  }
  
  // 3. Route analysis
  log(colors.bright + '\n📈 Route Analysis:' + colors.reset);
  const staticRoutes = routes.filter(r => r.type === 'static').length + 1; // +1 for root
  const dynamicRoutes = routes.filter(r => r.type === 'dynamic').length;
  const catchAllRoutes = routes.filter(r => r.type === 'catch-all').length;
  
  log(`${treeChars.branch}Static Routes: ${colors.green}${staticRoutes}${colors.reset}`);
  log(`${treeChars.branch}Dynamic Routes: ${colors.yellow}${dynamicRoutes}${colors.reset}`);
  log(`${treeChars.lastBranch}Catch-all Routes: ${colors.magenta}${catchAllRoutes}${colors.reset}`);
  
  log(colors.bright + '\n✨ Generation completed!' + colors.reset);
  
  // Write to file if requested
  if (outputToFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `sitemap-tree-${timestamp}.txt`;
    const filepath = path.join(process.cwd(), 'docs', filename);
    
    // Ensure docs directory exists
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Remove color codes for file output
    const cleanOutput = output.map(line => 
      line.replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
    ).join('\n');
    
    fs.writeFileSync(filepath, cleanOutput, 'utf-8');
    console.log(colors.green + `✅ Sitemap tree saved to: ${filename}` + colors.reset);
    console.log(colors.cyan + `📁 Full path: ${filepath}` + colors.reset);
    
    return filepath;
  }
}

// Function to print tree to array instead of console
function printTreeToArray(tree, output, prefix = '', isLast = true, level = 0) {
  const entries = Object.entries(tree);
  
  entries.forEach(([key, node], index) => {
    const isLastItem = index === entries.length - 1;
    const connector = isLastItem ? treeChars.lastBranch : treeChars.branch;
    
    // Create clean text without colors for file output
    let typeIndicator = '';
    if (node.type === 'dynamic') {
      typeIndicator = ' [dynamic]';
    } else if (node.type === 'catch-all') {
      typeIndicator = ' [catch-all]';
    }
    
    output.push(prefix + connector + key + typeIndicator);
    
    if (Object.keys(node.children).length > 0) {
      const newPrefix = prefix + (isLastItem ? treeChars.space : treeChars.vertical);
      printTreeToArray(node.children, output, newPrefix, false, level + 1);
    }
  });
}

// Run the generator
if (require.main === module) {
  // Check command line arguments
  const args = process.argv.slice(2);
  const outputToFile = args.includes('--file') || args.includes('-f');
  
  generateSitemapTree(outputToFile);
}

module.exports = { generateSitemapTree, scanAppDirectory, createRouteTree };

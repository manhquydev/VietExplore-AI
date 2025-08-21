import React from 'react'

interface RouteNode {
  path: string
  type: 'static' | 'dynamic' | 'catch-all'
  param?: string
  children: Record<string, RouteNode>
}

interface SitemapTreeViewerProps {
  routes: RouteNode
  sitemapUrls: string[]
}

const SitemapTreeViewer: React.FC<SitemapTreeViewerProps> = ({ routes, sitemapUrls }) => {
  const renderTree = (node: RouteNode, key: string, level: number = 0, isLast: boolean = false) => {
    const indent = '  '.repeat(level)
    const connector = isLast ? '└── ' : '├── '
    
    const getTypeStyle = (type: string) => {
      switch (type) {
        case 'dynamic':
          return 'text-yellow-600 font-medium'
        case 'catch-all':
          return 'text-purple-600 font-medium'
        default:
          return 'text-blue-600'
      }
    }
    
    const getTypeIndicator = (type: string, param?: string) => {
      if (type === 'dynamic') return ` [${param}]`
      if (type === 'catch-all') return ` [...${param}]`
      return ''
    }

    return (
      <div key={key} className="font-mono text-sm">
        <div className={getTypeStyle(node.type)}>
          {indent}{connector}{key}{getTypeIndicator(node.type, node.param)}
        </div>
        {Object.entries(node.children).map(([childKey, childNode], index, array) =>
          renderTree(childNode, childKey, level + 1, index === array.length - 1)
        )}
      </div>
    )
  }

  const categorizeUrls = (urls: string[]) => {
    const categories = {
      'Core Pages': [] as string[],
      'Places': [] as string[],
      'Community': [] as string[],
      'AI Assistant': [] as string[],
      'Auth': [] as string[],
      'Legal': [] as string[],
      'Other': [] as string[]
    }

    urls.forEach(url => {
      if (url === '/' || url.includes('/about') || url.includes('/help') || url.includes('/resources')) {
        categories['Core Pages'].push(url)
      } else if (url.includes('/places')) {
        categories['Places'].push(url)
      } else if (url.includes('/community')) {
        categories['Community'].push(url)
      } else if (url.includes('/ai-assistant')) {
        categories['AI Assistant'].push(url)
      } else if (url.includes('/auth')) {
        categories['Auth'].push(url)
      } else if (url.includes('/legal')) {
        categories['Legal'].push(url)
      } else {
        categories['Other'].push(url)
      }
    })

    return categories
  }

  const categorizedUrls = categorizeUrls(sitemapUrls)

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow-lg">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🌳 Sitemap Tree Viewer</h2>
        <p className="text-gray-600 mb-6">Chi tiết cấu trúc routes và URLs của dự án VietExplore-AI</p>
      </div>

      {/* App Directory Routes */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📁 App Directory Routes</h3>
        <div className="bg-white p-3 rounded border">
          {Object.entries(routes.children).map(([key, node], index, array) =>
            renderTree(node, key, 0, index === array.length - 1)
          )}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <span className="text-blue-600">■</span> Static Routes &nbsp;
          <span className="text-yellow-600">■</span> Dynamic Routes &nbsp;
          <span className="text-purple-600">■</span> Catch-all Routes
        </div>
      </div>

      {/* Generated Sitemap URLs */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🗺️ Generated Sitemap URLs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categorizedUrls).map(([category, urls]) => (
            urls.length > 0 && (
              <div key={category} className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">{category} ({urls.length})</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {urls.map(url => (
                    <div key={url} className="text-sm text-blue-600 font-mono truncate">
                      {url}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{sitemapUrls.length}</div>
            <div className="text-sm text-gray-600">Total URLs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{categorizedUrls['Places'].length}</div>
            <div className="text-sm text-gray-600">Places</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{categorizedUrls['Other'].length}</div>
            <div className="text-sm text-gray-600">Dynamic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{Object.keys(routes.children).length}</div>
            <div className="text-sm text-gray-600">Route Groups</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SitemapTreeViewer

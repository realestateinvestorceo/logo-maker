import { useMemo } from 'react'
import { buildVersionTree } from '../../lib/treeUtils'

export default function VersionTree({ logos }) {
  const tree = useMemo(() => buildVersionTree(logos), [logos])

  if (tree.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>No logos to display in the version tree.</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-auto">
      <div className="space-y-6">
        {tree.map((root) => (
          <TreeNode key={root.id} node={root} depth={0} />
        ))}
      </div>
    </div>
  )
}

function TreeNode({ node, depth }) {
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex items-center gap-3 group">
        {depth > 0 && (
          <div className="w-4 h-0.5 bg-gray-200 -ml-4 flex-shrink-0" />
        )}
        <div className="flex items-center gap-3 bg-surface rounded-lg border border-border p-2 pr-4 hover:shadow-sm transition-shadow">
          <img
            src={node.storage_path || node.thumbnail_path}
            alt="Logo version"
            className="w-12 h-12 object-contain rounded bg-gray-50 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                node.generation_type === 'initial' ? 'bg-blue-100 text-blue-700' :
                node.generation_type === 'branch' ? 'bg-purple-100 text-purple-700' :
                node.generation_type === 'refine' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {node.generation_type}
              </span>
              {node.scores?.composite != null && (
                <span className="text-xs font-bold text-gray-600">{node.scores.composite}/100</span>
              )}
              {node.is_favorite && (
                <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </div>
            {node.refinement_instruction && (
              <p className="text-xs text-gray-400 truncate max-w-48 mt-0.5">
                "{node.refinement_instruction}"
              </p>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

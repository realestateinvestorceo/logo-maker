/**
 * Build a tree structure from flat logo records using parent_logo_id
 */
export function buildVersionTree(logos) {
  const childMap = new Map()

  logos.forEach((logo) => {
    if (logo.parent_logo_id) {
      if (!childMap.has(logo.parent_logo_id)) {
        childMap.set(logo.parent_logo_id, [])
      }
      childMap.get(logo.parent_logo_id).push(logo)
    }
  })

  function buildNode(logo) {
    const children = (childMap.get(logo.id) || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(buildNode)

    return { ...logo, children }
  }

  const roots = logos
    .filter((l) => !l.parent_logo_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  return roots.map(buildNode)
}

/**
 * Convert version tree to React Flow nodes and edges
 */
export function treeToFlowElements(tree, startX = 0, startY = 0, spacingX = 250, spacingY = 150) {
  const nodes = []
  const edges = []
  let currentY = startY

  function traverse(node, x, parentId) {
    const nodeId = node.id
    nodes.push({
      id: nodeId,
      type: 'logoNode',
      position: { x, y: currentY },
      data: node,
    })

    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        label: node.generation_type,
      })
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        currentY += spacingY
        traverse(child, x + spacingX, nodeId)
      })
    }
  }

  tree.forEach((root, i) => {
    if (i > 0) currentY += spacingY * 2
    traverse(root, startX, null)
  })

  return { nodes, edges }
}

/**
 * Find all ancestors of a logo in the flat list
 */
export function getAncestors(logoId, logos) {
  const logoMap = new Map(logos.map((l) => [l.id, l]))
  const ancestors = []
  let current = logoMap.get(logoId)

  while (current?.parent_logo_id) {
    current = logoMap.get(current.parent_logo_id)
    if (current) ancestors.unshift(current)
  }

  return ancestors
}

/**
 * Find all descendants of a logo
 */
export function getDescendants(logoId, logos) {
  const childMap = new Map()
  logos.forEach((l) => {
    if (l.parent_logo_id) {
      if (!childMap.has(l.parent_logo_id)) childMap.set(l.parent_logo_id, [])
      childMap.get(l.parent_logo_id).push(l)
    }
  })

  const descendants = []
  function collect(id) {
    const children = childMap.get(id) || []
    children.forEach((child) => {
      descendants.push(child)
      collect(child.id)
    })
  }
  collect(logoId)

  return descendants
}

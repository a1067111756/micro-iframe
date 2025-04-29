import type { MicroIFrameRouteNode, MicroIFrameFlatRoute } from '../types/index.d'

// 方法 - 将树扁平化，同时带上每个节点的 keyPath
export function flattenTreeWithKeyPath(tree: MicroIFrameRouteNode): MicroIFrameFlatRoute[] {
  const result: MicroIFrameFlatRoute[] = [];

  function traverse(node: MicroIFrameRouteNode, path: string[]) {
    const { name, iframeId, origin } = node;
    const currentPath = [...path, name];

    result.push({
      name,
      iframeId,
      origin,
      keyPath: currentPath,
      children: node?.children?.map(it => it.name) || []
    });

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child, currentPath));
    }
  }

  try {
    traverse(tree, []);
    return result;
  } catch (error) {
    console.error('[micro-iframe] flattenTreeWithKeyPath error:', error);
    throw new Error('[micro-iframe] 路由表数据结构不正确，解析失败，请检查!!!');
  }
}
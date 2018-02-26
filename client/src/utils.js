import { isEmpty } from "lodash";


export const flattenTree = (root, isSearching) => { 
  
  const flattenNodes = (nodes, depth = 0) => {
    return nodes.reduce((acc, node) => {
      const { id, children, name, size } = node;
      const isExpanded = node.isExpanded || false;
      const isInPath = node.isInPath || false;

      const enhancedNode = {
        id,
        isExpanded,
        isInPath,
        name,
        size,
        depth
      };

      if (isSearching && !isInPath) {
        return acc;
      }

      if (!isExpanded) {
        return [...acc, enhancedNode];
      }

      return [...acc, enhancedNode, ...flattenNodes(children, depth + 1)];
    }, []);
  };

  return (isEmpty(root) ? [] : flattenNodes([root]));
}

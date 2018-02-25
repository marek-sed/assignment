import { isEmpty } from "lodash";

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

    if (!isExpanded) {
      return [...acc, enhancedNode];
    }

    return [...acc, enhancedNode, ...flattenNodes(children, depth + 1)];
  }, []);
};

export const flattenTree = root => (isEmpty(root) ? 
[] : 
flattenNodes([root]));

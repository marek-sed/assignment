import { isEmpty } from "lodash";
/**
 * returns {Array} of children on keys provided after first argument
 * @param  {any} notFound - value returned if get fails
 * @param  {Strings} ...args
 */
export const getAll = (notFound, ...args) => data =>
  args.map(key => data.get(key, notFound));

const flattenNodes = (nodes, parents = []) => {
  return nodes.reduce((acc, node) => {
    const { id, children, name, size } = node;
    const isExpanded = node.isExpanded || false;
    const isInPath = node.isInPath || false;
    const depth = parents.length;
    const childrenIds = children.map(child => child.id);

    const enhancedNode = {
      id,
      isExpanded,
      isInPath,
      name,
      size,
      depth,
      children: childrenIds,
      parents
    };

    if (!isExpanded) {
      return [...acc, enhancedNode];
    }

    return [...acc, enhancedNode, ...flattenNodes(children, [...parents, id])];
  }, []);
};

export const flattenTree = root => (isEmpty(root) ? 
[] : 
flattenNodes([root]));

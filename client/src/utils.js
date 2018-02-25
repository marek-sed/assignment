/**
 * returns {Array} of children on keys provided after first argument
 * @param  {any} notFound - value returned if get fails
 * @param  {Strings} ...args
 */
export const getAll = (notFound, ...args) => data =>
  args.map(key => data.get(key, notFound));

const flattenNodes = (nodes, parents = []) => {
  return nodes.reduce((acc, node) => {
    const id = node.get("id");
    const children = node.get("children");
    const name = node.get("name");
    const size = node.get("size");
    const isExpanded = node.get('isExpanded', false);
    const isInPath = node.get('isInPath', false);
    const depth = parents.length;
    const childrenIds = children.map(child => child.get('id'));

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

export const flattenTree = root => (root.isEmpty() ? [] : flattenNodes([root]));

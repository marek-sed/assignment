const last = require("lodash/fp/last");

// O(n) the rows are ordered so we do not have to traverse the tree
// If we had to traverse it would be O(n^2) worst case and O(nlogn) best case

function treeOfLife(rows) {
  console.log('planting tree');

  const r1 = rows.shift();
  const root = {
    name: r1.name,
    size: r1.size,
    children: []
  };

  let openedTags = [root];
  rows.forEach((el, i) => {
    const fullPath = el.name.split(" > ");
    let parent = last(openedTags);

    const parentDepth = openedTags.length;
    const elementDepth = fullPath.length;

    // distance can be
    //  < -2 is invalid state because the collection is sorted
    //    -2 we nest deeper element becomes new parent
    //    -1 this belongs to [parent]
    //  >  0 we are poppin
    const distance = parentDepth - elementDepth;

    if (distance === -2) {
      const nextParent = last(parent.children);
      openedTags.push(nextParent);
      nextParent.children.push({
        name: last(fullPath),
        size: el.size,
        children: []
      });
    } else if (distance === -1) {
      parent.children.push({
        name: last(fullPath),
        size: el.size,
        children: []
      });
    } else if (distance >= 0) {
      openedTags = openedTags.slice(0, openedTags.length - distance - 1);
      const nextParent = last(openedTags);
      nextParent.children.push({
        name: last(fullPath),
        size: el.size,
        children: []
      });
    } else {
      console.log("invalid state", parent.name, el.name, distance);
    }
  });

  return root;
}

module.exports = {
  treeOfLife
};

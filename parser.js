import Parser from "node-xml-stream";
import last from "lodash/fp/last";

// we suplay array result to collect results
export function createParser() {
  const parser = new Parser();

  // this is a stack for all open tags
  const openTags = [];

  const result = [];

  // when we open a new child tag we increment parents size by 1
  parser.on("opentag", (name, { wnid, words }) => {
    // we are only interested in nodes with wnid
    if (!wnid) {
      return;
    }

    const parent = last(openTags);
    if (parent) {
      parent.size = parent.size + 1;
      openTags.push({ wnid, name: `${parent.name} > ${words}`, size: 0 });
    } else {
      // this is top level node
      openTags.push({ wnid, name: words, size: 0 });
    }
  });

  // when we close tag we need add size to its parent
  parser.on("closetag", (name, attrs) => {
    const closedTag = openTags.pop();
    if (closedTag) {
      if (closedTag.size === 0) {
        result.push(closedTag)
      } else {
        // size is count of items inserted between opening and closing so we can kepep the collection sorted easily
        result.splice(result.length - closedTag.size, 0, closedTag);
      }
    }

    if (openTags.length > 0) {
      const parent = last(openTags);
      parent.size = parent.size + closedTag.size;
    }
  });

  const parsedRecords = new Promise((resolve, reject) => {
    parser.on("finish", () => resolve(result));
    parser.on("error", err => reject(err));
  });

  return { parsedRecords, wStream: parser };
}

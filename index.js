import https from "https";
import fetch from "node-fetch";
import Parser from 'node-xml-stream';
import last from 'lodash/fp/last';
import initial from 'lodash/fp/initial'

const parser = new Parser();
const openTags = [];
const result = [];
parser.on('opentag', (name, { wnid, words }) => {
  if (!wnid) {
    return;
  }

  const parent = last(openTags);
  if (parent) {
    parent.size = parent.size + 1;
    openTags.push({ wnid, name: `${parent.words} > ${words}`, size: 0 });  
  } else {
    console.log('no parent');
    openTags.push({ wnid, name: words, size: 0 });  
  }
})
parser.on('closetag', (name, attrs) => {
  // close tag
  const closedTag = openTags.pop(); 
  if (closedTag) {
    result.push(closedTag);
  }

  if (openTags.length > 0) {
    const openedTag = last(openTags);
    openedTag.size = openedTag.size + closedTag.size;
    console.log('increasing size', last(openTags).size, openedTag.size)
  }
})

parser.on('finish', () => {
  console.log('stream completed')
  console.log(result.filter(r => r.words.includes('organism, being > plant, flora, plant life > wilding')));
})
const url =
  "https://s3.amazonaws.com/static.operam.com/assignment/structure_released.xml";

const promisify = fn => (...args) => {
  return new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

async function loadData(url) {
  let res;
  try {
    const res = await fetch(url)
    res.body.pipe(parser);
  } catch (e) {
    console.log("error", e);
  }

  return 1;
}

try {
  loadData(url);
} catch (e) {
  console.log("error hapenned", e);
}

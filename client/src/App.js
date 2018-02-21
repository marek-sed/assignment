import React from "react";
import { injectGlobal } from "styled-components";
import I, { fromJS } from "immutable";
import { Loading, List, Page, Header, H1, Input } from "./Components";
import { Node } from "./Tree";
import { getAll } from "./utils";

injectGlobal`
  html, body {
    height: 100%;
    padding:0; 
    margin: 0;
    font-family: sans-serif;
    background-color: #2c2525;
    font-size: 1rem;
  }

  #root {
    height: 100%;
  }
`;

/**
 * expands or collapse a node
 * we can only expand or collapse one node at time so we use id
 * also chldnodes will remember their expanded state this way
 * @param  {ImmutableJS.Map} node
 * @param  {Number} id
 */
function toggleNode(node, id) {
  if (id === node.get("id")) {
    const isExpanded = node.get("isExpanded", false);
    return node.set("isExpanded", !isExpanded);
  }

  const size = node.get("size");
  return size === 0
    ? node
    : node.update("children", children => children.map(n => toggleNode(n, id)));
}

/**
 * Search is filtering the resulting tree,
 * only items which have "isInPath" equal to true are visible
 * @param  {ImmutableJS.Map} node
 * @param  {String} term
 */
function search(node, term) {
  // we recurse first so we set setInPath on children first
  const nextNode = node.update("children", children =>
    children.map(n => search(n, term))
  );
  const [name, children] = getAll(null, "name", "children")(nextNode);
  if (children.some(n => n.get("isInPath"))) {
    return nextNode.set("isInPath", true).set("isExpanded", true);
  } else if (name.includes(term)) {
    return nextNode
      .update("children", children =>
        children.map(n => n.set("isInPath", true))
      )
      .set("isInPath", true);
  }
  return nextNode;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      root: I.Map(),
      searchedRoot: null,
      isFetching: false,
      searchTerm: ""
    };

    this.toggle = this.toggle.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.setState({ isFetching: true });
    fetch("/tree")
      .then(res => res.json())
      .then(json =>
        this.setState({ root: fromJS(json), isFetching: false })
      )
      .catch(err => {
        console.log("fetch failed");
      });
  }

  toggle(path) {
    const tree = this.state.root;
    const newTree = toggleNode(tree, path);
    this.setState({ root: newTree });
  }

  search(evt) {
    // we use timeout to trigger search after 0.3 of not typing
    if (this._doneTyping) {
      clearTimeout(this._doneTyping);
    }

    const term = evt.target.value;
    const isSearching = term.length > 2;
    this.setState({ searchTerm: term, isSearching });
    if (isSearching) {
      this._doneTyping = setTimeout(() => {
        this.setState(state => {
          const searchedRoot = search(state.root, state.searchTerm);
          return {
            ...state,
            searchedRoot,
            isSearching: false
          };
        });
      }, 300);
    } else {
      this.setState({ searchedRoot: null, isSearching: false });
    }
  }

  render() {
    const {
      root,
      searchedRoot,
      isFetching,
      isSearching,
      searchTerm
    } = this.state;
    const tree = searchedRoot !== null ? searchedRoot : root;
    window.root = root;

    return (
      <Page>
        <Header>
          <H1>Tree explorer</H1>
        </Header>
        <Input
          placeholder="Search the tree..."
          value={searchTerm}
          onChange={this.search}
        />
        {isFetching ? (
          <Loading>...loading</Loading>
        ) : (
          <List marginTop="1rem">
            {isSearching && <span>...searching</span>}
            <Node
              data={tree}
              isSearching={isSearching}
              searchTerm={searchTerm}
              toggle={this.toggle}
            />
          </List>
        )}
      </Page>
    );
  }
}

export default App;

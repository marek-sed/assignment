import React from "react";
import { injectGlobal } from "styled-components";
import I, { fromJS } from "immutable";
import { Loading, List, Page, Header, H1, Input } from "./Components";
import { Node, Display } from "./Tree";
import { getAll, flattenTree } from "./utils";
import { List as VList, AutoSizer } from "react-virtualized";
import { throttle } from "throttle-debounce";

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
    return node.update("isExpanded", isExpanded => !isExpanded);
  }

  const size = node.get("size");
  if (size === 0) {
    return node;
  }
  return node.update("children", children =>
    children.map(n => toggleNode(n, id))
  );
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
  const name = nextNode.get("name");
  const children = nextNode.get("children");
  if (children.some(n => n.get("isInPath"))) {
    return nextNode.set("isInPath", true).set("isExpanded", true);
  } else if (name.includes(term)) {
    return nextNode
      .update("children", children =>
        children.map(n => n.set("isInPath", true))
      )
      .set("isInPath", true);
  } else {
    return nextNode
      .update("children", children =>
        children.map(n => n.set("isInPath", false))
      )
      .set("isInPath", false);
  }
  return nextNode;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: I.Map({}),
      searchedTree: I.Map({}),
      searchTerm: "",
      isFetching: false
    };

    this.toggle = this.toggle.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.setState({ isFetching: true });
    fetch("/tree")
      .then(res => res.json())
      .then(json => this.setState({ tree: fromJS(json), isFetching: false }))
      .catch(err => {
        console.log("fetch failed");
      });
  }

  toggle(id) {
    const tree =
      this.state.searchTerm.length > 2
        ? this.state.searchedTree
        : this.state.tree;
    if (this.state.searchTerm.length > 2) {
      const newTree = toggleNode(this.state.searchedTree, id);
      this.setState({ searchedTree: newTree });
    } else {
      const newTree = toggleNode(this.state.tree, id);
      this.setState({ tree: newTree });
    }
  }

  search(evt) {
    if (this._doneTyping) {
      clearTimeout(this._doneTyping);
    }

    const term = evt.target.value;
    const isSearching = term.length > 2;
    this.setState({ searchTerm: term, isSearching });
    if (isSearching) {
      this._doneTyping = setTimeout(() => {
        this.setState(state => {
          const searchedTree = search(state.tree, state.searchTerm);
          return {
            ...state,
            searchedTree,
            isSearching: false
          };
        });
      }, 200);
    } else {
      this.setState({ searchedTree: I.Map({}), isSearching: false });
    }
  }

  render() {
    const {
      tree,
      searchedTree,
      isFetching,
      isSearching,
      searchTerm
    } = this.state;
    window.root = tree;

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
          <Tree
            searchTerm={searchTerm}
            tree={searchTerm.length > 2 ? searchedTree : tree}
            toggle={this.toggle}
            searchTerm={searchTerm}
          />
        )}
      </Page>
    );
  }
}

class Tree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flatTree: flattenTree(props.tree)
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log("new porps", nextProps.tree);
    if (nextProps.searchTerm.length > 2) {
      const flatTree = flattenTree(nextProps.tree).filter(n => n.isInPath);
      this.setState({ flatTree });
    } else {
      this.setState({
        flatTree: flattenTree(nextProps.tree)
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flatTree.length === this.state.flatTree.length) {
      if (prevProps.searchTerm !== this.props.searchTerm) {
        this._list.forceUpdateGrid();
      }
    }
  }

  _rowRenderer = ({ index, style, key }) => {
    const { flatTree } = this.state;
    const { searchTerm } = this.props;
    // const visibleTree = expanded.reduce((acc, idx) => [
    //   ...acc,
    //   tree[idx].children], [])

    if (flatTree.length > 0) {
      const {
        id,
        name,
        size,
        children,
        depth,
        isExpanded,
        isInPath
      } = flatTree[index];

      console.log("rendering row", index, isInPath);
      return (
        <Display
          key={key}
          style={style}
          name={name}
          size={size}
          depth={depth}
          searchTerm={searchTerm}
          isInPath={true}
          isExpanded={isExpanded}
          toggle={() => this.props.toggle(id)}
        />
      );
    }

    return null;
  };

  render() {
    const {
      flatTree,
      isFetching,
      isSearching,
      searchTerm,
      expanded
    } = this.state;
    console.log("flatTree", flatTree);

    return (
      <div style={{ margin: "1rem 0 0 1.5rem" }}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <VList
              ref={ref => (this._list = ref)}
              height={1500}
              overscanRowCount={10}
              rowCount={flatTree.length}
              rowHeight={24.5}
              rowRenderer={this._rowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
export default App;

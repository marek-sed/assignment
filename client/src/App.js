import React from "react";
import { injectGlobal } from "styled-components";
import { Loading, List, Page, Header, H1, Input } from "./Components";
import { Node, Display } from "./Tree";
import { getAll, flattenTree } from "./utils";
import { List as VList, AutoSizer } from "react-virtualized";

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
  if (id === node.id) {
    return { ...node, isExpanded: !node.isExpanded };
  }

  if (node.size === 0) {
    return { ...node };
  }

  return {
    ...node,
    children: [...node.children.map(n => toggleNode(n, id))]
  };
}

/**
 * Search is filtering the resulting tree,
 * only items which have "isInPath" equal to true are visible
 * @param  {ImmutableJS.Map} node
 * @param  {String} term
 */
function search(node, term) {
  // we recurse first so we set setInPath on children first
  const nextNode = {
    ...node,
    children: [...node.children.map(n => search(n, term))]
  };

  if (nextNode.children.some(n => n.isInPath)) {
    return {
      ...nextNode,
      isInPath: true,
      isExpanded: true
    };
  } else if (nextNode.name.includes(term)) {
    return {
      ...nextNode,
      children: [...nextNode.children.map(n => ({ ...n, isInPath: true }))],
      isInPath: true
    };
  }

  return nextNode;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: {},
      searchedTree: {},
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
      .then(json => this.setState({ tree: json, isFetching: false }))
      .catch(err => {
        console.log("fetch failed");
      });
  }

  toggle(id) {
    if (this.state.searchTerm.length > 2) {
      const newTree = toggleNode(this.state.searchedTree, id);
      this.setState({ searchedTree: newTree });
    } else {
      const newTree = toggleNode(this.state.tree, id);
      this.setState({ tree: newTree });
    }
  }

  search(evt) {
    const term = evt.target.value;
    const isSearching = term.length > 2;
    this.setState({ searchTerm: term, isSearching });
    if (isSearching) {
      this.setState(state => {
        const searchedTree = search(state.tree, state.searchTerm);
        return {
          ...state,
          searchedTree,
          isSearching: false
        };
      });
    } else {
      this.setState({ searchedTree: {}, isSearching: false });
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

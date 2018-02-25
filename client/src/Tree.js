import React from "react";
import Highlighter from "react-highlight-words";
import { Size, Name, Triangle } from "./Components";
import { List as VList, AutoSizer } from "react-virtualized";
import { flattenTree } from "./utils";

export const Display = props => {
  const {
    style,
    id,
    name,
    size,
    depth,
    searchTerm,
    isExpanded,
    isInPath,
    toggle
  } = props;
  const clickable = size > 0;
  return (
    <Name
      depth={depth}
      style={style}
      isExpanded={isExpanded}
      clickable={clickable}
      onClick={toggle}
    >
      {clickable && <Triangle isExpanded={isExpanded} />}
      <Highlighter
        caseSensitive={true}
        highlightStyle={{ color: "#85dacc", backgroundColor: "transparent" }}
        textToHighlight={name || ""}
        searchWords={[searchTerm]}
      />
      <Size>({size})</Size>
    </Name>
  );
};

export class Tree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flatTree: flattenTree(props.tree)
    };
  }

  componentWillReceiveProps(nextProps) {
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
        // highlighter wont work on same size list
        this._list.forceUpdateGrid();
      }
    }
  }

  _rowRenderer = ({ index, style, key }) => {
    const { flatTree } = this.state;
    const { searchTerm } = this.props;

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
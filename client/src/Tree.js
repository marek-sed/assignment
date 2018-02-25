import React from "react";
import Highlighter from "react-highlight-words";
import { Li, List, Size, Name, Triangle } from "./Components";
import { getAll } from "./utils";

const ListItem = ({
  name,
  size,
  clickable,
  children,
  searchTerm,
  isExpanded,
  isInPath,
  onClick
}) => (
  <Li clickable={clickable}>
    <Name
      isExpanded={isExpanded}
      clickable={clickable && searchTerm.length < 2}
      onClick={onClick}
    >
      {clickable && <Triangle isExpanded={isExpanded} />}
      <Highlighter
        caseSensitive={true}
        highlightStyle={{ color: "#AE6855", backgroundColor: "transparent" }}
        textToHighlight={name || ""}
        searchWords={[searchTerm]}
      />
      <Size>({size})</Size>
    </Name>
    {children}
  </Li>
);

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
  console.log("rendering", searchTerm);
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
        highlightStyle={{ color: "#AE6855", backgroundColor: "transparent" }}
        textToHighlight={name || ""}
        searchWords={[searchTerm]}
      />
      <Size>({size})</Size>
    </Name>
  );
};

export class Node extends React.Component {
  /**
   * component updates when data changes, we use ImmuatableJs,
   * so comparing complex trees is cheap
   * we also disable rendrering while searching due to performance issues
   * @param  {object} nextProps
   */
  shouldComponentUpdate(nextProps) {
    return (
      !this.props.data.equals(nextProps.data) ||
      (nextProps.isSearching === false &&
        this.props.searchTerm !== nextProps.searchTerm)
    );
  }

  render() {
    const { data, toggle, searchTerm, isSearching } = this.props;
    const [id, name, size, children] = getAll(
      null,
      "id",
      "name",
      "size",
      "children"
    )(data);

    const [isExpanded, isInPath] = getAll(false, "isExpanded", "isInPath")(
      data
    );
    const clickable = size > 0;

    return (
      <ListItem
        name={name}
        size={size}
        searchTerm={searchTerm}
        isExpanded={isExpanded}
        isInPath={isInPath}
        clickable={clickable}
        onClick={() => clickable && searchTerm.length < 2 && toggle(id)}
      >
        {(isInPath || isExpanded) &&
          size > 0 && (
            <List>
              {children
                .filter(n => (searchTerm.length > 2 ? n.get("isInPath") : true))
                .map((node, i) => (
                  <Node
                    key={node.get("id")}
                    isSearching={isSearching}
                    searchTerm={searchTerm}
                    data={node}
                    toggle={toggle}
                  />
                ))}
            </List>
          )}
      </ListItem>
    );
  }
}

import styled, { css } from "styled-components";

// just styled components in here

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: #635b5b;
`;

export const Header = styled.header`
  margin: 1.5rem 1.5rem 0 1.5rem;
`;

export const Loading = styled.div`
  margin: 1rem 1.5rem;
`;

export const List = styled.ul`
  padding: 0;
  margin: 0;
  margin-top: ${props => props.marginTop || 0};
  margin-left: 1.5rem;
`;

export const Li = styled.li`
  display: block;
  line-height: 20px;
  list-style: none;
`;

export const Triangle = styled.div`
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  padding: 0 3px;
  border-top: 5px solid transparent;
  border-left: 10px solid #ea617a;
  border-bottom: 5px solid transparent;
  ${props =>
    props.isExpanded &&
    css`
      transform: translate(-2.5px, 2.5px) rotate(90deg);
    `};
`;
export const H1 = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  color: #c1b4b5;
`;

export const Name = styled.div`
  display: inline-block;
  line-height: 1.5rem;
  vertical-align: middle;
  color: ${props => (props.isExpanded ? "#AE6855": "#C1B4B5")};
  cursor: default;

  ${props =>
    css`
      cursor: ${props.clickable ?  'pointer' : 'default'};
      margin-left: ${props.depth > 0 ? `${props.depth * 1.5}rem` : 0 };
    `};
`;
export const Size = styled.span`
  font-size: 0.9rem;
  padding-left: 3px;
  color: rgb(99, 91, 91);
`;

export const Input = styled.input`
  color: #85dacc;
  font-size: 1.1rem;
  line-height: 2rem;
  padding: 0rem 0rem;
  margin: 1.5rem 1.5rem 0 1.5rem;
  border: 0rem;
  border-bottom: 0.1rem solid #ea617a;
  border-radius: 2px;
  background-color: transparent;
`;

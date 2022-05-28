import { styled } from "solid-styled-components";

const H1 = styled("h1")(() => ({
  margin: 0,
}));

export const Heading = ({ children }: { children: any }) => <H1>{children}</H1>;

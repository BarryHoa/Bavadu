import styled, { x } from "@xstyled/emotion";

const FlexBox = styled(x.div)({
  display: "flex",
  flexDirection: "row",
  gap: "xs",
  width: "100%",
  margin: 0,
  padding: 0,

  // Default styles
});

export default FlexBox;

// Usage example:
// <FlexBox display="flex" flexDirection="column" gap="md" />

const getInputSizeStyles = (size: string) => {
  const h = {
    sm: "2rem",
    md: "2.5rem",
    lg: "3rem",
  };
  const px = {
    sm: "sm",
    md: "md",
    lg: "lg",
  };
  const fontSize = {
    sm: "xs",
    md: "sm",
    lg: "base",
  };
  return {
    h: h[size as keyof typeof h],
    px: px[size as keyof typeof px],
    fontSize: fontSize[size as keyof typeof fontSize] ?? "sm",
  };
};
export default getInputSizeStyles;

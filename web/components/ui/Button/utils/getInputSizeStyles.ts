const getButtonSizeStyles = (size: string) => {
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
  const py = {
    sm: "xs",
    md: "sm",
    lg: "md",
  };
  const fontSize = {
    sm: "xs",
    md: "sm",
    lg: "base",
  };
  return {
    h: h[size as keyof typeof h] ?? h["sm"],
    px: px[size as keyof typeof px] ?? px["sm"],
    py: py[size as keyof typeof py] ?? py["sm"],
    fontSize: fontSize[size as keyof typeof fontSize] ?? fontSize["sm"],
  };
};
export default getButtonSizeStyles;

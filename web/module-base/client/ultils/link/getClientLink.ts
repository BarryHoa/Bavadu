import isEmpty from "lodash/isEmpty";

export const getClientLink = (props: {
  mdl: string;
  path: string;
  as?: string;
  params?: Record<string, string>;
}) => {
  const { mdl, path, as, params = {} } = props;
  const isParams = !isEmpty(params);
  const paramsString = isParams
    ? `?${Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}`
    : "";
  const fullPath = `/workspace/modules/${mdl}/${path}${paramsString}`;
  const fullAsPath = `/workspace/modules/${mdl}/${as}${paramsString}`;
  return {
    path: fullPath,
    as: as ? fullAsPath : fullPath,
  };
};

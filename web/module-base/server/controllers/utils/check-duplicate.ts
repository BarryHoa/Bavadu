import { NextApiRequest, NextApiResponse } from "next";
import getModuleQueryByModel from "../../utils/getModuleQueryByModel";

export const checkDuplicate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { model, params } = req.body;
  return await getModuleQueryByModel({
    model,
    modelMethod: "isExistInModelByFieldAndValue",
    params,
  });
};

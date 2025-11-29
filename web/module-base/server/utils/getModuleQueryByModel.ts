import { JSONResponse } from "./JSONResponse";
import getEnv from "./getEnv";

type GetModuleQueryByModelProps = {
  model: string;
  modelMethod: string;
  params?: Record<string, any>;
};
const getModuleQueryByModel = async (props: GetModuleQueryByModelProps) => {
  const { model, modelMethod, params } = props ?? {};
  const modelKey = model;

  // validate model key and method
  if (!modelKey) {
    return JSONResponse({ status: 400, message: "MODEL IS REQUIRED" });
  }
  if (!modelMethod) {
    return JSONResponse({ status: 400, message: "METHOD ARE REQUIRED" });
  }
  // get env
  const env = getEnv();
  // validate env
  if (!env) {
    return JSONResponse({ status: 500, message: "ENVIRONMENT NOT FOUND" });
  }
  // get model
  const modelInstance = env.getModel(modelKey);
  // validate model
  if (!modelInstance) {
    return JSONResponse({ status: 500, message: "MODEL NOT FOUND" });
  }
  const method = (modelInstance as any)[modelMethod] as (
    params?: Record<string, any>
  ) => Promise<any>;

  if (!method) {
    return JSONResponse({ status: 500, message: "METHOD NOT FOUND" });
  }
  try {
    const result = await method(params);
    return JSONResponse({ status: 200, data: result });
  } catch (error) {
    console.error("Error in getModuleQueryByModel", error);
    return JSONResponse({
      status: 500,
      message: "ERROR IN METHOD",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default getModuleQueryByModel;

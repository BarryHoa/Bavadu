import { NextResponse } from "next/server";
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
    return NextResponse.json({ status: 400, message: "MODEL IS REQUIRED" });
  }
  if (!modelMethod) {
    return NextResponse.json({ status: 400, message: "METHOD ARE REQUIRED" });
  }
  // get env
  const env = getEnv();
  // validate env
  if (!env) {
    return NextResponse.json({ status: 500, message: "ENVIRONMENT NOT FOUND" });
  }
  // get model
  const modelInstance = env.getModel(modelKey);
  // validate model
  if (!modelInstance) {
    return NextResponse.json({ status: 500, message: "MODEL NOT FOUND" });
  }
  const method = (modelInstance as any)[modelMethod] as (
    params?: Record<string, any>
  ) => Promise<any>;

  if (!method) {
    return NextResponse.json({ status: 500, message: "METHOD NOT FOUND" });
  }
  try {
    const result = await method(params);
    return NextResponse.json({ status: 200, data: result });
  } catch (error) {
    console.error("Error in getModuleQueryByModel", error);
    return NextResponse.json({
      status: 500,
      message: "ERROR IN METHOD",
      error: error,
    });
  }
};

export default getModuleQueryByModel;

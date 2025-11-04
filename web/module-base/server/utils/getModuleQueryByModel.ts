import { NextResponse } from "next/server";
import getEnv from "./getEnv";


type GetModuleQueryByModelProps = {
  modelId: string;
  modelMethod: string
  params?: Record<string, any>;
};
const getModuleQueryByModel = async (props: GetModuleQueryByModelProps) => {
  const { modelId, modelMethod, params } = props ?? {};

  // validate has modelId and modelMethod
  if (!modelId ) {
    return NextResponse.json({ status: 400, message: 'MODEL ID ARE REQUIRED' });
  }
  if (!modelMethod) {
    return NextResponse.json({ status: 400, message: 'METHOD ARE REQUIRED' });
  }
  // get env
  const env = getEnv();
  // validate env
  if (!env) {
    return NextResponse.json({ status: 500, message: 'ENVIRONMENT NOT FOUND' });
  }
  // get model
  const model = env.getModel(modelId);
  // validate model
  if (!model) {
    return NextResponse.json({ status: 500, message: 'MODEL NOT FOUND' });
  }
  const method = model[modelMethod];

  if (!method) {
    return NextResponse.json({ status: 500, message: 'METHOD NOT FOUND' });
  }
  try {
    const result = await method(params);
    return NextResponse.json({ status: 200, data: result });
  } catch (error) {
    console.error("Error in getModuleQueryByModel", error);
    return NextResponse.json({ status: 500, message: 'ERROR IN METHOD', error: error });
  }
};

export default getModuleQueryByModel;
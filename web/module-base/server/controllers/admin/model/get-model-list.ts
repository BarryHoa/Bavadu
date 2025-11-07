
import getEnv from "../../../utils/getEnv";
import { NextResponse } from "next/server";

const getModelList = async () => {
  const env = getEnv();
  const modelKeys = env?.getModelKeys() ?? [];
  return modelKeys;
};

export async function GET() {
  const modelList = await getModelList();
  return NextResponse.json({
    success: true,
    data: modelList,
    message: `Loaded ${modelList.length} model(s)`,
  });
}

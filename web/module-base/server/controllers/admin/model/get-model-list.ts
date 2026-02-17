import { NextRequest } from "next/server";

import { requirePermissions } from "@base/server/middleware";
import { JSONResponse } from "@base/server/utils/JSONResponse";

import { RuntimeContext } from "../../../runtime/RuntimeContext";

const getModelList = async () => {
  const modelInstance = await RuntimeContext.getModelInstance();
  const modelKeys = modelInstance?.getAllModels() ?? [];
  // sort by module name
  const sortedModelKeys = modelKeys
    .sort((a, b) => a.module.localeCompare(b.module))
    .map((model) => {
      return {
        key: model.key,
        module: model.module,
        path: model.path,
      };
    });

  return sortedModelKeys;
};

const REQUIRED_PERMISSIONS = ["system.models.read"];

export async function GET(request: NextRequest) {
  const authzResponse = await requirePermissions(request, REQUIRED_PERMISSIONS);

  if (authzResponse) {
    return authzResponse;
  }

  const modelList = await getModelList();

  return JSONResponse({
    data: modelList,
    total: modelList.length,
    message: `Loaded ${modelList.length} model(s)`,
    status: 200,
  });
}

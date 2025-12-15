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

export async function GET() {
  const modelList = await getModelList();
  return JSONResponse({
    data: modelList,
    total: modelList.length,
    message: `Loaded ${modelList.length} model(s)`,
    status: 200,
  });
}

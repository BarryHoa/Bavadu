import Environment from "../env";
import type { SystemRuntimeVariables } from "../types/global";

const getEnv = (): Environment => {
  const systemRuntimeVariables: SystemRuntimeVariables | undefined = globalThis.systemRuntimeVariables;
  if (!systemRuntimeVariables?.env) {
    throw new Error("Environment not initialized. let's create it first.");
  }
  return systemRuntimeVariables.env;
};

export default getEnv as () => Environment;

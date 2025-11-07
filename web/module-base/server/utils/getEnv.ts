import Environment from "../env";

const getEnv = (): Environment | null => {
  const systemRuntimeVariables = (globalThis as any).systemRuntimeVariables;
  if (!systemRuntimeVariables?.env) {
    throw new Error("Environment not initialized. let's create it first.");
  }
  return systemRuntimeVariables.env as unknown as Environment;
};

export default getEnv as () => Environment;

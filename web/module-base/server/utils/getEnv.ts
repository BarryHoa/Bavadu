import Environment from "../env";

const getEnv: Environment | null  = () => {
  return (globalThis as any)?.systemRuntimeVariables?.env || null;
}

export default getEnv;
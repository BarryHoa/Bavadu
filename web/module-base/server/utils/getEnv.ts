const getEnv = () => {
  return (globalThis as any)?.systemRuntimeVariables?.env || null;
}

export default getEnv;
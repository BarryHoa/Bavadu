/**
 * Next.js Instrumentation Hook
 * This file runs code on server startup
 * https://nextjs.org/docs/app/api-reference/instrumentation
 */
import getEnv from "@base/server/env"; //import env
export async function register() {
  await getEnv().init(); //init env
} //end register

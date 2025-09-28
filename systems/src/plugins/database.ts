import fp from "fastify-plugin";
import { db } from "../db";

async function databasePlugin(fastify: any, options: any) {
  // Decorate fastify with db instance
  fastify.decorate("db", db);
}

export default fp(databasePlugin);

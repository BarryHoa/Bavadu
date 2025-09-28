import fp from "fastify-plugin";
import { FastifyRequest, FastifyReply } from "fastify";

async function authenticatePlugin(fastify: any, options: any) {
  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
}

export default fp(authenticatePlugin);

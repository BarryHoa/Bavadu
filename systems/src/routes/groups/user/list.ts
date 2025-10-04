import { GetUserListReq } from "@/Models/Users/UserInterface";
import usersModel from "@/Models/Users/UsersModel";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";



async function listUsersRouter(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: GetUserListReq;
  }>(
    "/",
    async (request, reply: FastifyReply) => {
      try {


        const result = await usersModel.getUsers(request.query);

        return {
          success: true,
          ...result
         
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
}

export { listUsersRouter };

import { FastifyInstance } from "fastify";
import { RegisterUserController } from "./controllers/register-user-controller.js";
import { AuthenticateUserController } from "./controllers/authenticate-user-controller.js";

const registerUserController = new RegisterUserController();
const authenticateUserController = new AuthenticateUserController();

export async function appRoutes(app: FastifyInstance) {
  app.post("/users", registerUserController.handle);
  app.post("/sessions", authenticateUserController.handle);
}

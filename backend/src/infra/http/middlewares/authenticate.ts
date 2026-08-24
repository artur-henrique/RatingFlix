import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ message: "Unauthorized. Missing token." });
    }

    const [, token] = authHeader.split(" ");

    const secret = process.env.JWT_SECRET ?? "super-secret-default-key";
    
    const decoded = jwt.verify(token, secret) as { sub: string; username: string };

    (request as any).user = {
      id: decoded.sub,
      username: decoded.username,
    };
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized. Invalid token." });
  }
}

import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

// Igual a `authenticate`, mas nunca retorna 401: se não houver token, ou o
// token for inválido, `request.user` simplesmente não é definido e a rota
// segue como uma requisição anônima. Usado em rotas públicas que se
// comportam de forma diferente para quem está logado (ex: "eu já sigo esse
// usuário?", "eu já votei nesta review?") sem deixar de ser públicas.
export async function authenticateOptional(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return;

    const [, token] = authHeader.split(" ");
    const secret = process.env.JWT_SECRET ?? "super-secret-default-key";
    const decoded = jwt.verify(token, secret) as { sub: string; username: string };

    (request as any).user = {
      id: decoded.sub,
      username: decoded.username,
    };
  } catch {
    // Token ausente/inválido em uma rota opcional: segue anônimo.
  }
}

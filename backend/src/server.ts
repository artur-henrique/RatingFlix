import { fastify } from "fastify";
import { ZodError } from "zod";
import { appRoutes } from "./infra/http/routes.js";

const app = fastify({
  logger: true,
});

// Register routes
app.register(appRoutes);

app.get("/", async (request, reply) => {
  return { message: "Welcome to RatingFlix API! 🍿" };
});

// Global Error Handler
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error.",
      issues: error.format(),
    });
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // Send to external observability tool (like Sentry/Datadog) in production
  }

  return reply.status(500).send({ message: "Internal server error." });
});

const start = async () => {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("🚀 Server running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

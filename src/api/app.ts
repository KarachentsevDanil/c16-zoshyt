import Fastify, { type FastifyServerOptions } from "fastify";
import type { CoursesRepo } from "../courses/repo";

export interface AppDeps {
  courses: CoursesRepo;
  now: () => Date;
}

export function buildApp(deps: AppDeps, options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  app.get("/health", async () => ({ status: "ok" }));

  app.get<{ Params: { slug: string } }>("/courses/:slug/deadlines", async (request) => ({
    deadlines: await deps.courses.upcomingDeadlines(request.params.slug, deps.now()),
  }));

  return app;
}

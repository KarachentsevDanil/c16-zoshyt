import Fastify, { type FastifyServerOptions } from "fastify";
import type { CoursesRepo } from "../courses/repo";
import type { SubmissionsRepo } from "../submissions/repo";

export interface AppDeps {
  courses: CoursesRepo;
  submissions: SubmissionsRepo;
  enqueueGrading: (submissionId: number) => Promise<void>;
  now: () => Date;
}

export function buildApp(deps: AppDeps, options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  app.get("/health", async () => ({ status: "ok" }));

  app.get<{ Params: { slug: string } }>("/courses/:slug/deadlines", async (request) => ({
    deadlines: await deps.courses.upcomingDeadlines(request.params.slug, deps.now()),
  }));

  app.get<{ Params: { id: string } }>("/submissions/:id", async (request, reply) => {
    const submission = await deps.submissions.find(Number(request.params.id));
    return submission ?? reply.code(404).send({ error: "SUBMISSION_NOT_FOUND" });
  });

  app.post<{ Params: { id: string } }>("/submissions/:id/grade", async (request, reply) => {
    const id = Number(request.params.id);
    if (!(await deps.submissions.find(id))) {
      return reply.code(404).send({ error: "SUBMISSION_NOT_FOUND" });
    }
    await deps.submissions.markQueued(id);
    await deps.enqueueGrading(id);
    return reply.code(202).send({ id, status: "queued" });
  });

  return app;
}

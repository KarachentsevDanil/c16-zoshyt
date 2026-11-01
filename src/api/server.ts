import { PrismaCoursesRepo } from "../courses/repo";
import { createDb } from "../store/db";
import { buildApp } from "./app";

const db = createDb(process.env.DATABASE_URL ?? "");

const app = buildApp({ courses: new PrismaCoursesRepo(db), now: () => new Date() }, { logger: true });

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });

import type { Db } from "../store/db";

export interface SubmissionState {
  id: number;
  status: string;
  score: number | null;
}

export interface SubmissionsRepo {
  find(id: number): Promise<SubmissionState | null>;
  markQueued(id: number): Promise<void>;
}

export class PrismaSubmissionsRepo implements SubmissionsRepo {
  constructor(private readonly db: Db) {}

  async find(id: number): Promise<SubmissionState | null> {
    return this.db.submission.findUnique({
      where: { id },
      select: { id: true, status: true, score: true },
    });
  }

  async markQueued(id: number): Promise<void> {
    await this.db.submission.update({ where: { id }, data: { status: "queued", score: null } });
  }
}

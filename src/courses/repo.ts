import type { Db } from "../store/db";

export interface Deadline {
  assignment: string;
  title: string;
  deadlineAt: Date;
}

export interface Recipient {
  id: number;
  name: string;
  email: string;
}

export interface StudentGrades extends Recipient {
  grades: { assignment: string; score: number }[];
}

export interface CoursesRepo {
  upcomingDeadlines(courseSlug: string, now: Date): Promise<Deadline[]>;
  enrolledStudents(courseSlug: string): Promise<Recipient[]>;
  grades(courseSlug: string): Promise<StudentGrades[]>;
}

export class PrismaCoursesRepo implements CoursesRepo {
  constructor(private readonly db: Db) {}

  async upcomingDeadlines(courseSlug: string, now: Date): Promise<Deadline[]> {
    const assignments = await this.db.assignment.findMany({
      where: { course: { slug: courseSlug }, deadlineAt: { gt: now } },
      orderBy: { deadlineAt: "asc" },
    });
    return assignments.map(({ slug, title, deadlineAt }) => ({
      assignment: slug,
      title,
      deadlineAt,
    }));
  }

  async enrolledStudents(courseSlug: string): Promise<Recipient[]> {
    const enrollments = await this.db.enrollment.findMany({
      where: { course: { slug: courseSlug } },
      include: { student: true },
      orderBy: { studentId: "asc" },
    });
    return enrollments.map(({ student }) => ({
      id: student.id,
      name: student.name,
      email: student.email,
    }));
  }

  async grades(courseSlug: string): Promise<StudentGrades[]> {
    const enrollments = await this.db.enrollment.findMany({
      where: { course: { slug: courseSlug } },
      include: {
        student: {
          include: {
            grades: {
              where: { assignment: { course: { slug: courseSlug } } },
              include: { assignment: true },
            },
          },
        },
      },
      orderBy: { studentId: "asc" },
    });
    return enrollments.map(({ student }) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      grades: student.grades.map(({ assignment, score }) => ({ assignment: assignment.title, score })),
    }));
  }
}

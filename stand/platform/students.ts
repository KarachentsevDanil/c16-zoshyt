// Вигадані студенти для навчального стенда. Перші двоє — автори посилок із кейса.
const FIRST_NAMES = [
  ["Андрій", "andrii"],
  ["Богдан", "bohdan"],
  ["Вікторія", "viktoriia"],
  ["Дарина", "daryna"],
  ["Ірина", "iryna"],
  ["Максим", "maksym"],
  ["Наталія", "nataliia"],
  ["Олег", "oleh"],
  ["Софія", "sofiia"],
  ["Тарас", "taras"],
] as const;

const LAST_NAMES = [
  ["Бойко", "boiko"],
  ["Гончар", "honchar"],
  ["Кравець", "kravets"],
  ["Левченко", "levchenko"],
  ["Мороз", "moroz"],
  ["Павленко", "pavlenko"],
  ["Савчук", "savchuk"],
  ["Ткаченко", "tkachenko"],
] as const;

export const STUDENT_COUNT = 1200;

export interface DumpStudent {
  id: number;
  name: string;
  email: string;
  scores: { assignment: string; score: number }[];
}

function pseudoScore(id: number): number {
  return 60 + ((id * 7919) % 41);
}

export function buildStudents(): DumpStudent[] {
  const students: DumpStudent[] = [
    { id: 1, name: "Олена Коваленко", email: "olena.kovalenko@gmail.com", scores: [] },
    { id: 2, name: "Марія Бондар", email: "m.bondar@ukr.net", scores: [] },
  ];

  for (let id = 3; id <= STUDENT_COUNT; id += 1) {
    const [first, firstLatin] = FIRST_NAMES[id % FIRST_NAMES.length]!;
    const [last, lastLatin] = LAST_NAMES[id % LAST_NAMES.length]!;
    students.push({
      id,
      name: `${first} ${last}`,
      email: `${firstLatin}.${lastLatin}.${id}@pupil-mail.example`,
      scores: [],
    });
  }

  return students.map((student) => ({
    ...student,
    scores: [{ assignment: "hw-05", score: pseudoScore(student.id) }],
  }));
}

/**
 * Student-language understanding for the RVRJC Assistant.
 *
 * Turns shorthand like "CSE 2.1 mid 1 schedule", "2-1 cse first mid",
 * "bro when is mid 1?" into a structured context (branch / program / year /
 * section / exam / regulation) plus an expanded query used for retrieval.
 *
 * Pure text logic — no facts are invented here.
 */

export type StudentContext = {
  branch?: string; // canonical branch code, e.g. "CSE"
  branchName?: string; // human name, e.g. "Computer Science & Engineering"
  program?: string; // B.Tech | M.Tech | MBA | MCA | BBA
  year?: number; // 1..4
  semester?: 1 | 2; // odd (1) / even (2) semester within the year
  section?: string; // "1", "2", "A" ...
  exam?: "mid-1" | "mid-2" | "semester-end" | "supplementary";
  regulation?: string; // R26 | R24 | R20 | R18
};

const BRANCHES: { code: string; name: string; aliases: string[] }[] = [
  { code: "CSE", name: "Computer Science & Engineering", aliases: ["cse", "computer science", "cs"] },
  { code: "AI", name: "Artificial Intelligence", aliases: ["ai", "artificial intelligence"] },
  { code: "AIDS", name: "AI & Data Science", aliases: ["aids", "ai and data science", "data science", "ds"] },
  { code: "CSD", name: "CSE (Data Science)", aliases: ["csd", "cse data science"] },
  { code: "CSO", name: "CSE (IoT)", aliases: ["cso", "cse iot", "iot"] },
  { code: "CSBS", name: "Computer Science & Business Systems", aliases: ["csbs", "business systems"] },
  { code: "IT", name: "Information Technology", aliases: ["it", "information technology"] },
  { code: "ECE", name: "Electronics & Communication Engineering", aliases: ["ece", "electronics"] },
  { code: "EEE", name: "Electrical & Electronics Engineering", aliases: ["eee", "electrical"] },
  // "me" is far more often the English pronoun ("give me my timetable") than Mechanical.
  { code: "ME", name: "Mechanical Engineering", aliases: ["mech", "mechanical"] },

  { code: "CE", name: "Civil Engineering", aliases: ["ce", "civil"] },
  { code: "CHEM", name: "Chemical Engineering", aliases: ["chemical", "chem engineering"] },
  { code: "MBA", name: "Master of Business Administration", aliases: ["mba"] },
  { code: "MCA", name: "Master of Computer Applications", aliases: ["mca"] },
  { code: "BBA", name: "Bachelor of Business Administration", aliases: ["bba"] },
];

const YEAR_WORDS: [RegExp, number][] = [
  [/\b(1st|first|i)\s*(year|yr)\b/, 1],
  [/\b(2nd|second|ii)\s*(year|yr)\b/, 2],
  [/\b(3rd|third|iii)\s*(year|yr)\b/, 3],
  [/\b(4th|fourth|final|iv)\s*(year|yr)\b/, 4],
];

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4 };

/** Matches "2.1", "2-1", "2/1", "II-1", "2 1" style class codes. */
const CLASS_CODE = /\b(iv|iii|ii|i|[1-4])\s*[.\-/ ]\s*([1-4])\b/;

function detectBranch(q: string) {
  // Prefer the longest alias so "csbs" never matches "cs".
  const found = BRANCHES.flatMap((b) => b.aliases.map((a) => ({ b, a })))
    .filter(({ a }) => new RegExp(`(^|[^a-z])${a.replace(/ /g, "\\s+")}([^a-z]|$)`).test(q))
    .sort((x, y) => y.a.length - x.a.length)[0];
  return found?.b;
}

function detectExam(q: string): StudentContext["exam"] | undefined {
  if (/\b(mid\s*-?\s*(1|i|one)|1st\s*mid|first\s*mid|mid1)\b/.test(q)) return "mid-1";
  if (/\b(mid\s*-?\s*(2|ii|two)|2nd\s*mid|second\s*mid|mid2)\b/.test(q)) return "mid-2";
  if (/\b(sem\s*end|semester\s*end|end\s*sem|final\s*exam|external)\b/.test(q)) return "semester-end";
  if (/\b(supply|supple|supplementary|betterment)\b/.test(q)) return "supplementary";
  if (/\bmids?\b/.test(q)) return "mid-1";
  return undefined;
}

/** Parse a single message into whatever context it reveals. */
export function parseContext(message: string): StudentContext {
  const q = " " + message.toLowerCase().replace(/[^a-z0-9./\- ]/g, " ").replace(/\s+/g, " ") + " ";
  const ctx: StudentContext = {};

  const branch = detectBranch(q);
  if (branch) {
    ctx.branch = branch.code;
    ctx.branchName = branch.name;
    if (branch.code === "MBA" || branch.code === "MCA") ctx.program = branch.code;
    else if (branch.code === "BBA") ctx.program = "BBA";
    else ctx.program = "B.Tech";
  }

  const cls = q.match(CLASS_CODE);
  if (cls) {
    const y = ROMAN[cls[1]!] ?? Number(cls[1]);
    if (y >= 1 && y <= 4) {
      ctx.year = y;
      // "2-1" means year 2, semester 1 for a semester code, and year 2 section 1
      // in classroom shorthand. Keep both readings.
      const second = Number(cls[2]);
      ctx.semester = second === 2 ? 2 : 1;
      ctx.section = String(second);
    }
  }

  for (const [re, y] of YEAR_WORDS) if (re.test(q)) ctx.year = y;
  const secWord = q.match(/\b(?:section|sec)\s*-?\s*([1-9a-d])\b/) ??
    q.match(/\b([1-4])(?:st|nd|rd|th)?\s*section\b/);
  if (secWord) ctx.section = secWord[1]!.toUpperCase();
  if (/\bodd\s*sem/.test(q)) ctx.semester = 1;
  if (/\beven\s*sem/.test(q)) ctx.semester = 2;

  const exam = detectExam(q);
  if (exam) ctx.exam = exam;

  const reg = q.match(/\br\s*-?\s*(26|24|20|18|16)\b/);
  if (reg) ctx.regulation = "R" + reg[1];

  if (/\bm\.?\s?tech\b/.test(q)) ctx.program = "M.Tech";
  if (/\bb\.?\s?tech\b/.test(q)) ctx.program = "B.Tech";

  return ctx;
}

/** Later messages win, but earlier context is retained (sticky conversation). */
export function mergeContext(prev: StudentContext, next: StudentContext): StudentContext {
  return { ...prev, ...Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined)) };
}

/** Build the sticky context from the whole conversation, oldest first. */
export function contextFromHistory(userMessages: string[]): StudentContext {
  return userMessages.reduce<StudentContext>((acc, m) => mergeContext(acc, parseContext(m)), {});
}

const ORDINAL = ["", "I", "II", "III", "IV"];

/** One-line human description of the resolved context, for prompts and titles. */
export function describeContext(ctx: StudentContext): string {
  const parts: string[] = [];
  if (ctx.branch) parts.push(`${ctx.branch}${ctx.branchName ? ` (${ctx.branchName})` : ""}`);
  if (ctx.program) parts.push(ctx.program);
  if (ctx.year) parts.push(`${ORDINAL[ctx.year]} Year / ${ctx.year}${ctx.year === 1 ? "st" : ctx.year === 2 ? "nd" : ctx.year === 3 ? "rd" : "th"} year`);
  if (ctx.semester) parts.push(`${ctx.semester === 1 ? "odd" : "even"} semester`);
  if (ctx.section) parts.push(`Section ${ctx.section}`);
  if (ctx.regulation) parts.push(`Regulation ${ctx.regulation}`);
  if (ctx.exam)
    parts.push(
      ctx.exam === "mid-1"
        ? "First Mid examination"
        : ctx.exam === "mid-2"
          ? "Second Mid examination"
          : ctx.exam === "semester-end"
            ? "Semester-end examination"
            : "Supplementary examination",
    );
  return parts.join(" · ");
}

/** Short display title, e.g. "CSE 2.1 — First Mid". */
export function contextTitle(ctx: StudentContext): string {
  const left = [ctx.branch, ctx.year ? `${ctx.year}${ctx.section ? "." + ctx.section : ""}` : ""]
    .filter(Boolean)
    .join(" ");
  const right =
    ctx.exam === "mid-1"
      ? "First Mid"
      : ctx.exam === "mid-2"
        ? "Second Mid"
        : ctx.exam === "semester-end"
          ? "Semester-end Exams"
          : "";
  return [left, right].filter(Boolean).join(" — ");
}

/**
 * Expand shorthand into retrieval-friendly words so the keyword index of the
 * knowledge base can match student slang.
 */
export function expandQuery(question: string, ctx: StudentContext): string {
  const extra: string[] = [];
  if (ctx.branchName) extra.push(ctx.branch!, ctx.branchName);
  if (ctx.program) extra.push(ctx.program);
  if (ctx.year) extra.push(`${ORDINAL[ctx.year]} year`, `${ctx.year} year`);
  if (ctx.exam === "mid-1") extra.push("first mid", "mid exam", "academic calendar", "exam timetable");
  if (ctx.exam === "mid-2") extra.push("second mid", "mid exam", "academic calendar", "exam timetable");
  if (ctx.exam === "semester-end") extra.push("semester end exams", "exam timetable", "hall ticket");
  if (ctx.exam === "supplementary") extra.push("supplementary exam", "exam timetable", "exam fee");
  if (ctx.regulation) extra.push(ctx.regulation, "regulation", "syllabus");
  if (/\btime\s*table|timetable|schedule\b/.test(question.toLowerCase()))
    extra.push("exam timetable", "schedule", "academic calendar");
  if (/\bsyllabus|units?\b/.test(question.toLowerCase())) extra.push("syllabus", "scheme and syllabus");
  return [question, ...extra].join(" ");
}

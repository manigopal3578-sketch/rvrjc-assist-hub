import { createFileRoute } from "@tanstack/react-router";
import { KB, type KbChunk } from "@/lib/rvrjc-kb";
import {
  contextFromHistory,
  contextTitle,
  describeContext,
  expandQuery,
  mergeContext,
  parseContext,
  type StudentContext,
} from "@/lib/rvrjc-intent";

/**
 * POST /api/public/ask
 * Body:     { question: string, history?: { role: "user" | "bot", text: string }[] }
 * Response: { answer, sourceLabel?, sourceUrl?, pdfUrl?, mode: "rvrjc" | "general" }
 *
 * Pipeline:
 *  1. Understand the student's language: "CSE 2.1 mid 1 schedule", "2-1 cse first mid",
 *     "bro when is mid 1?" are all resolved into a structured context (branch, year,
 *     section, semester, exam, regulation) that STICKS across the conversation.
 *  2. Retrieve against the verified RVRJC knowledge base using the context-expanded
 *     query, ranking with the resolved context (regulation / year / program).
 *  3. Compose a short, structured, student-friendly answer from the retrieved chunks
 *     only, with the official deep link (and PDF download link when one is verified).
 *  4. Never invent an RVRJC fact; when the exact document isn't in the KB, say so and
 *     offer the closest verified information.
 */

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "of", "for", "to", "in", "on", "at", "and", "or",
  "do", "does", "did", "how", "what", "when", "where", "which", "who", "why", "i", "my",
  "me", "can", "could", "should", "would", "please", "tell", "about", "there", "this",
  "that", "it", "be", "you", "your", "get", "find", "any", "much", "many", "bro", "sir",
  "pls", "plz", "give", "show", "need", "want", "know",
]);

const RVRJC_HINTS = [
  "rvrjc", "rvr", "jc", "college", "campus", "admission", "admissions", "fee", "fees",
  "exam", "exams", "examination", "timetable", "time table", "calendar", "result",
  "results", "placement", "placements", "hostel", "bus", "transport", "department",
  "departments", "branch", "semester", "sem", "bonafide", "certificate", "scholarship",
  "regulation", "library", "btech", "b.tech", "mtech", "mba", "mca", "bba", "eapcet",
  "ecet", "notice", "circular", "principal", "autonomous", "guntur", "mid", "mids",
  "syllabus", "attendance", "moodle", "hall ticket",
];


const ACADEMIC_DOC_HINTS = [
  "syllabus", "unit", "units", "course objective", "course objectives",
  "course outcome", "course outcomes", "objective", "objectives", "outcome",
  "outcomes", "purpose", "topic", "topics", "content", "subject code",
  "subject", "paper", "course", "credits", "credit", "text book",
  "textbook", "learning resources", "course structure", "l t p c", "ltpc",
  "prerequisite",
];

const BRANCH_ALIASES: Array<[RegExp, string]> = [
  [/\bcs\b/gi, "CSE"],
  [/\bcomputer science(?: and engineering)?\b/gi, "CSE"],
  [/\bcivil\b/gi, "CE"],
  [/\bmechanical\b/gi, "ME"],
  [/\belectrical and electronics\b/gi, "EEE"],
  [/\belectronics and communication\b/gi, "ECE"],
];

function normalizeAcademicQuery(question: string): string {
  let q = question;
  for (const [pattern, replacement] of BRANCH_ALIASES) {
    q = q.replace(pattern, replacement);
  }
  return q.replace(/\s+/g, " ").trim();
}

/** Normalize a user's branch reply without changing course-code prefixes. */
function canonicalBranch(question: string): string | null {
  const q = question
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\bdepartment\b|\bbranch\b|\bdept\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const aliases: Array<[RegExp, string]> = [
    [/^(?:cse|cs|computer science|computer science and engineering)$/, "CSE"],
    [/^(?:ece|electronics and communication|electronics and communication engineering)$/, "ECE"],
    [/^(?:eee|electrical and electronics|electrical and electronics engineering)$/, "EEE"],
    [/^(?:it|information technology)$/, "IT"],
    [/^(?:me|mechanical|mechanical engineering)$/, "ME"],
    [/^(?:ce|civil|civil engineering)$/, "CE"],
    [/^(?:chemical|chemical engineering|ch)$/, "CH"],
    [/^(?:mca|master of computer applications)$/, "MCA"],
    [/^(?:mba|master of business administration)$/, "MBA"],
    [/^(?:bba|bachelor of business administration)$/, "BBA"],
  ];

  for (const [pattern, branch] of aliases) {
    if (pattern.test(q)) return branch;
  }
  return null;
}

/** Return the course-code prefix used by RVRJC's syllabus codes. */
function coursePrefixForBranch(branch: string): string {
  const map: Record<string, string> = {
    CSE: "CS",
    ECE: "ECE",
    EEE: "EEE",
    IT: "IT",
    ME: "ME",
    CE: "CE",
    CH: "CH",
    MCA: "MCA",
    MBA: "MBA",
    BBA: "BBA",
  };
  return map[branch] ?? branch;
}

function canonicalizeNumericCourseCode(question: string): string {
  // Only canonicalize a bare 3-digit course code when the same message
  // contains an explicit branch. This prevents ordinary numbers from being
  // rewritten and leaves already-qualified codes untouched.
  const match = question.match(/(?:^|\s)(\d{3})(?=\s|$)/);
  if (!match) return question;

  const branchMatch = question.match(
    /\b(?:CSE|CS|ECE|EEE|IT|ME|CE|CIVIL|CHEMICAL|CH|MCA|MBA|BBA)\b/i,
  );
  if (!branchMatch) return question;

  const branch = canonicalBranch(branchMatch[0]);
  if (!branch) return question;

  const code = `${coursePrefixForBranch(branch)}${match[1]}`;
  return question.replace(match[1], code);
}

function hasExplicitBranch(question: string): boolean {
  // Detect a branch anywhere in the user's message, not only when the
  // entire message is itself a branch reply. This is essential for direct
  // queries such as "211 syllabus CSE" and "CSE 211 syllabus".
  const branchPattern = /\b(?:CSE|CS|ECE|EEE|IT|ME|CE|CIVIL|CHEMICAL|CH|MCA|MBA|BBA|computer science(?: and engineering)?|electronics and communication(?: engineering)?|electrical and electronics(?: engineering)?|information technology|mechanical(?: engineering)?|civil engineering|chemical engineering|master of computer applications|master of business administration|bachelor of business administration)\b/i;
  return branchPattern.test(question);
}

function hasCourseCode(question: string): boolean {
  // Qualified codes are unambiguous.
  if (hasPrefixedCourseCode(question)) return true;

  // A bare 3-digit number is a course code only when the surrounding
  // language looks academic. This prevents false positives such as
  // "Room 211", "Page 215", "Roll number 211", etc.
  if (!/\b\d{3}\b/.test(question)) return false;

  const q = question.toLowerCase();
  const nonCoursePrefix = /^(?:room|page|pages|roll|roll\s*number|phone|mobile|year|marks?|score|question|q)\s*[:#-]?\s*\d{3}\b/i;
  if (nonCoursePrefix.test(q)) return false;

  return (
    ACADEMIC_DOC_HINTS.some((h) => q.includes(h)) ||
    /\b(?:syllabus|subject|course|paper|unit|units|objective|objectives|outcome|outcomes|credits?|code)\b/i.test(q) ||
    (hasExplicitBranch(question) && !nonCoursePrefix.test(q))
  );
}

function hasPrefixedCourseCode(question: string): boolean {
  return /\b(?:CS|CSE|ECE|EEE|IT|ME|CE|CH|MCA|MBA|BBA)\s*\d{3}\b/i.test(question);
}

function isAcademicDocQuery(question: string): boolean {
  const q = question.toLowerCase();
  return ACADEMIC_DOC_HINTS.some((h) => q.includes(h)) || hasCourseCode(question);
}

function shouldAskForAcademicClarification(
  question: string,
  ctx: StudentContext,
  nearbyScore: number,
): string | null {
  const q = question.trim();
  const hasBranch = hasExplicitBranch(q);
  const prefixedCode = hasPrefixedCourseCode(q);
  const numericOrUnqualifiedCode =
    /\b\d{3}\b/.test(q) &&
    !hasPrefixedCourseCode(q) &&
    hasCourseCode(q);
  const academicIntent = isAcademicDocQuery(q);

  if (numericOrUnqualifiedCode && !hasBranch) {
    return "Which department/branch is this for? Please give the code, e.g. CSE (or CS), ECE, EEE, IT, ME, CE.";
  }

  if (prefixedCode) return null;

  if (academicIntent && !hasBranch && !prefixedCode) {
    return "Which department/branch is this for? Please give the code, e.g. CSE (or CS), ECE, EEE, IT, ME, CE.";
  }

  const branchOnly = /^(?:cse|cs|ece|eee|it|me|ce|civil|chemical|ch|mca|mba|bba)(?:\s+(?:one|one\s*subject|syllabus|subjects?))?$/i.test(q);
  if ((academicIntent && hasBranch && !prefixedCode && nearbyScore < 0.15) || branchOnly) {
    return "Which subject or course code do you need? For example: CS213, CS215, or Discrete Mathematical Structures.";
  }

  const words = q.split(/\s+/).filter(Boolean).length;
  const hasQuestionWord = /\b(what|how|why|when|where|which|who|can|does|is|are)\b/i.test(q);
  if (!hasBranch && words <= 6 && nearbyScore >= 0.15 && !hasQuestionWord) {
    return "Which department/branch is this subject for? Please give the code, e.g. CSE (or CS), ECE, EEE, IT, ME, CE.";
  }

  return null;
}

type ClarificationKind = "branch" | "subject" | null;

function clarificationKind(text: string): ClarificationKind {
  const q = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (
    q.includes("which department/branch") ||
    q.includes("which department") ||
    q.includes("which branch")
  ) return "branch";

  if (q.includes("which subject") || q.includes("which subject or course code")) return "subject";
  return null;
}

function previousUserQuestion(history: Msg[], beforeIndex: number): string {
  // The clarification should normally immediately follow the user's request.
  // If it does not, refuse to guess which earlier user message it referred to.
  const previous = history[beforeIndex - 1];
  return previous?.role === "user" ? previous.text : "";
}

function latestPendingClarification(
  history: Msg[],
  currentQuestion: string,
): { kind: ClarificationKind; assistantIndex: number } | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn?.role !== "assistant") continue;

    const kind = clarificationKind(turn.text);
    if (!kind) continue;

    // History may include the current user turn or omit it. After the
    // clarification there must therefore be either zero turns, or exactly
    // one user turn equal to the current question. Anything else means this
    // clarification is stale and must not contaminate the new question.
    const after = history.slice(i + 1);
    const currentNormalized = normalizeAcademicQuery(currentQuestion);
    if (after.length === 0) return { kind, assistantIndex: i };
    if (
      after.length === 1 &&
      after[0]?.role === "user" &&
      normalizeAcademicQuery(after[0].text) === currentNormalized
    ) {
      return { kind, assistantIndex: i };
    }

    return null;
  }
  return null;
}

function isLikelyClarificationAnswer(
  question: string,
  kind: ClarificationKind,
): boolean {
  const q = question.trim();
  if (!q || !kind) return false;

  if (kind === "branch") {
    return Boolean(canonicalBranch(q));
  }

  if (hasCourseCode(q)) return true;

  const words = q.split(/\s+/).filter(Boolean);
  const hasQuestionWord = /\b(what|how|why|when|where|which|who|can|does|is|are)\b/i.test(q);
  return words.length <= 8 && !hasQuestionWord;
}

function extractPrefixedCourseCode(text: string): string | null {
  const match = text.match(/\b(?:CS|CSE|ECE|EEE|IT|ME|CE|CH|MCA|MBA|BBA)\s*\d{3}\b/i);
  return match ? match[0].replace(/\s+/g, "").toUpperCase() : null;
}

function isAcademicFollowUp(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /\b(?:what|which|list|show|give|tell)\b/.test(q) &&
    /\b(?:unit|units|topic|topics|objective|objectives|outcome|outcomes|credits?|code|syllabus|prerequisite|textbook|content|course|subject)\b/.test(q)
  ) || /^(?:units?|topics?|objectives?|outcomes?|syllabus|credits?|course outcomes?)\??$/i.test(question.trim());
}

function latestStickyCourseCode(history: Msg[]): string | null {
  // Only explicit codes written by the student establish academic context.
  // Never learn a sticky course code from an assistant answer, because an
  // answer may legitimately mention alternative courses or examples.
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]?.role !== "user") continue;
    const code = extractPrefixedCourseCode(history[i]?.text ?? "");
    if (code) return code;
  }
  return null;
}

function buildResolvedAcademicQuery(question: string, history: Msg[]): string {
  let normalized = normalizeAcademicQuery(question);
  if (!normalized) return normalized;

  // Canonicalize a numeric course number whenever the same message explicitly
  // identifies its branch. This handles direct one-message forms such as
  // "211 syllabus CSE" and "CSE 211 syllabus", not only clarification turns.
  if (hasCourseCode(normalized) && hasExplicitBranch(normalized)) {
    normalized = canonicalizeNumericCourseCode(normalized);
  }

  // First resolve an active clarification.
  const pending = latestPendingClarification(history, question);
  if (pending) {

    // Explicitly qualified codes are always self-contained and override stale
    // clarification state. A bare branch is handled below as the intended
    // answer to a branch clarification.
    if (hasPrefixedCourseCode(normalized)) return normalized;

    if (isLikelyClarificationAnswer(normalized, pending.kind)) {
      const previous = normalizeAcademicQuery(
        previousUserQuestion(history, pending.assistantIndex),
      );
      if (previous && previous !== normalized) {
        // A branch reply completes a numeric course code. Canonicalize it to the
        // actual RVRJC course-code form (e.g. "213 syllabus" + "CSE" -> "CS213 syllabus").
        if (pending.kind === "branch") {
          const branch = canonicalBranch(normalized);
          if (branch) {
            const combined = `${previous} ${branch}`.replace(/\s+/g, " ").trim();
            return canonicalizeNumericCourseCode(combined);
          }
        }

        return `${previous} ${normalized}`.replace(/\s+/g, " ").trim();
      }
    }
  }

  // Sticky academic course context: once the student explicitly established
  // a course (e.g. CS215), short follow-ups such as "What are the units?"
  // continue to refer to that course. Only academic follow-ups inherit it,
  // so ordinary questions are never hijacked by an old course code.
  if (!hasPrefixedCourseCode(normalized) && isAcademicFollowUp(normalized)) {
    const sticky = latestStickyCourseCode(history);
    if (sticky && !normalized.toLowerCase().includes(sticky.toLowerCase())) {
      return `${sticky} ${normalized}`.replace(/\s+/g, " ").trim();
    }
  }

  return normalized;
}

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s.&]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Keyword/phrase overlap score, normalised to 0..1. */
function score(question: string, chunk: KbChunk): number {
  const q = question.toLowerCase();
  const qTokens = tokens(question);
  if (qTokens.length === 0) return 0;

  let hits = 0;
  for (const kw of chunk.keywords) {
    if (kw.includes(" ")) {
      if (q.includes(kw)) hits += 2.5;
    } else if (qTokens.includes(kw)) {
      hits += 1;
    }
  }

  if (q.includes(chunk.topic.toLowerCase())) hits += 2;

  return hits / Math.max(3, qTokens.length);
}

/** Context-aware boost so the best-matching document wins over a generic one. */
function contextBoost(chunk: KbChunk, ctx: StudentContext): number {
  let b = 0;
  const text = (chunk.answer + " " + chunk.topic).toLowerCase();

  if (ctx.regulation && text.includes(ctx.regulation.toLowerCase())) b += 0.12;
  if (ctx.exam?.startsWith("mid") && /\bmid\b/.test(text)) b += 0.12;
  if (ctx.exam === "semester-end" && /semester-end|hall ticket/.test(text)) b += 0.1;

  if (
    ctx.year &&
    text.includes(
      `${ctx.year === 1 ? "i" : ctx.year === 2 ? "ii" : ctx.year === 3 ? "iii" : "iv"} year`,
    )
  ) {
    b += 0.08;
  }

  if (ctx.program && text.includes(ctx.program.toLowerCase())) b += 0.05;

  return b;
}

const THRESHOLD = 0.34;

function looksRvrjcSpecific(question: string, ctx: StudentContext): boolean {
  const q = question.toLowerCase();
  const own = parseContext(question);

  return (
    RVRJC_HINTS.some((h) => q.includes(h)) ||
    ACADEMIC_DOC_HINTS.some((h) => q.includes(h)) ||
    hasCourseCode(question) ||
    Boolean(own.branch || own.exam || own.year) ||
    (Boolean(ctx.branch || ctx.exam || ctx.year) &&
      /\b(my|our|college|class)\b/.test(q))
  );
}

type AskResponse = {
  answer: string;
  sourceLabel?: string | undefined;
  sourceUrl?: string | undefined;
  pdfUrl?: string | undefined;
  mode: "rvrjc" | "general";
};

const json = (
  body: AskResponse | { error: string },
  status = 200,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Friendly small talk handled locally so the bot always chats, even without AI. */
function smallTalk(question: string): string | null {
  const q = question
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .trim();

  const has = (...w: string[]) =>
    w.some(
      (x) =>
        q === x ||
        q.startsWith(x + " ") ||
        q.includes(" " + x),
    );

  if (
    has(
      "hi",
      "hello",
      "hey",
      "namaste",
      "hii",
      "good morning",
      "good evening",
      "good afternoon",
    )
  ) {
    return "Namaste! 🙏 I'm the RVRJC Assistant. Tell me your class (for example “CSE 2.1”) and ask away — mids, syllabus, fees, hostel, results or anything else.";
  }

  if (has("thanks", "thank you", "thankyou", "ty")) {
    return "Happy to help! Ask me anything else about RVRJC or any general question.";
  }

  if (has("bye", "goodbye", "see you")) {
    return "Bye! Come back any time you need RVRJC info. All the best 👍";
  }

  if (
    q.includes("who are you") ||
    q.includes("your name") ||
    q.includes("what can you do")
  ) {
    return "I'm the RVRJC Assistant. I answer questions about R.V.R. & J.C. College of Engineering from its official pages (admissions, fees, syllabus, exams, hostel, library, placements) and I can also chat and answer general questions.";
  }

  if (q.includes("how are you")) {
    return "I'm doing great, thanks for asking! What would you like to know about RVRJC?";
  }

  return null;
}

type Msg = {
  role: "user" | "assistant";
  text: string;
};

async function searchRvrjcPdfs(question: string) {
  try {
    const searchQuery = question
      .replace(
        /\b(pdf|pdfs|file|files|document|documents|download)\b/gi,
        " ",
      )
      .replace(/\s+/g, " ")
      .trim();

    const res = await fetch(
      "https://kalki11.app.n8n.cloud/webhook/8c33de64-2912-4149-8578-604ffe513622",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery || question,
        }),
      },
    );

    if (!res.ok) return [];

    const data = await res.json();

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Answer conversationally; RVRJC facts come only from the supplied context. */
async function compose(
  question: string,
  apiKey: string,
  opts: {
    context: string;
    ctx: StudentContext;
    turns: Msg[];
  },
): Promise<string> {
  const ctxLine = describeContext(opts.ctx);
  const title = contextTitle(opts.ctx);

  const instructions = [
    "You are the RVRJC Assistant for R.V.R. & J.C. College of Engineering (Autonomous), Guntur — a sharp, friendly student information assistant, not a document search engine.",
    "",
    "HOW TO ANSWER",
    "• Work out what the student actually wants, then answer THAT first, in one or two short lines.",
    "• Open with a compact heading line using a fitting emoji, e.g. '📅 CSE 2.1 — First Mid'.",
    "• Then the direct answer (date / amount / step). Then at most 3 short bullet lines of genuinely relevant supporting detail. Total under 130 words.",
    "• Plain text only (no markdown asterisks or headings). Use • for bullets and blank lines between blocks.",
    "• Student-friendly, warm, no padding, no repeating the question back, no unrelated info dump.",
    "",
    "RVRJC FACTS",
    "• Use ONLY the CONTEXT block for anything specific to RVRJC (dates, fees, rules, links, documents). Never invent or estimate a date, fee, subject, regulation or document.",
    "• Do not simply paste the raw context text — rewrite it as the answer to this student's question.",
    "• Never confuse the academic-calendar examination PERIOD with a subject-wise examination TIMETABLE, a class timetable or an exam notification. If the context gives a calendar date only, say plainly that this is the academic-calendar date and that the subject-wise timetable is published separately by the Examination Cell.",
    "• If the exact requested document is not in the context, say clearly: \"I couldn't find a verified official RVRJC document with that exact detail\", then give the closest verified information and where to get the exact one.",
    "• If several regulations or classes could apply and the context can't settle it, ask ONE short clarifying question instead of guessing.",
    "• When the context names an official page or PDF that answers the question, mention in one closing line that the official document is linked below (the app renders the link).",
    "",
    "NON-RVRJC QUESTIONS",
    "• General knowledge, study help or casual chat: answer normally, briefly and accurately, no source line needed.",
    ctxLine
      ? `\nRESOLVED STUDENT CONTEXT (carried from this conversation): ${ctxLine}${title ? ` — suggested heading: ${title}` : ""}. Treat "my"/"our" as referring to it, and never ask again for details already listed here.`
      : "",
  ].join("\n");

  const input = [
    ...opts.turns.slice(-6).map((t) => ({
      role: t.role,
      content: [
        {
          type: t.role === "user" ? "input_text" : "output_text",
          text: t.text,
        },
      ],
    })),
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: opts.context
            ? `CONTEXT (verified official RVRJC pages):\n${opts.context}\n\nQUESTION: ${question}`
            : question,
        },
      ],
    },
  ];

  const res = await fetch(
    "https://ai.gateway.lovable.dev/v1/responses",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        stream: true,
        store: false,
        reasoning: {
          effort: "low",
          summary: "auto",
        },
        instructions,
        input,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();

    throw Object.assign(
      new Error(`Gateway ${res.status}: ${body}`),
      {
        status: res.status,
        body,
      },
    );
  }

  // Read the SSE stream and accumulate the output text deltas.
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, {
      stream: true,
    });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      const payload = line.slice(5).trim();

      if (!payload || payload === "[DONE]") continue;

      try {
        const evt = JSON.parse(payload);

        if (
          evt.type === "response.output_text.delta" &&
          typeof evt.delta === "string"
        ) {
          text += evt.delta;
        } else if (
          evt.type === "response.completed" &&
          !text
        ) {
          text = evt.response?.output_text ?? "";
        }
      } catch {
        /* ignore keep-alive / partial frames */
      }
    }
  }

  return text.trim();
}

/** Deterministic, well-structured fallback built straight from a verified chunk. */
function chunkAnswer(
  chunk: KbChunk,
  ctx: StudentContext,
): string {
  const title = contextTitle(ctx);
  const head = title ? `📅 ${title}\n\n` : "";

  return `${head}${chunk.answer}`;
}

export const Route = createFileRoute("/api/public/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let question = "";
        let history: Msg[] = [];

        try {
          const body = (await request.json()) as {
            question?: unknown;
            history?: unknown;
          };

          question =
            typeof body.question === "string"
              ? body.question.trim()
              : "";

          if (Array.isArray(body.history)) {
            history = body.history
              .filter(
                (
                  m,
                ): m is {
                  role: string;
                  text: string;
                } =>
                  !!m &&
                  typeof (m as { text?: unknown }).text ===
                    "string",
              )
              .slice(-8)
              .map((m) => ({
                role:
                  m.role === "user"
                    ? "user"
                    : "assistant",
                text: String(m.text).slice(0, 1500),
              }));
          }
        } catch {
          return json(
            { error: "Invalid JSON body" },
            400,
          );
        }

        if (!question || question.length > 600) {
          return json(
            {
              error:
                "A question of 1-600 characters is required",
            },
            400,
          );
        }

        // 1 — understand the student's language, sticky across the conversation.
        const ctx = mergeContext(
          contextFromHistory(
            history
              .filter((m) => m.role === "user")
              .map((m) => m.text),
          ),
          parseContext(question),
        );

        // Friendly small talk — always works, no AI needed.
        const chit =
          !ctx.exam && !ctx.branch
            ? smallTalk(question)
            : null;

        if (chit) {
          return json({
            answer: chit,
            mode: "general",
          });
        }

        // Resolve short follow-ups such as: "213 syllabus" -> "CSE".
        // The previous user turn is combined with the clarification answer
        // so n8n receives the complete course identifier.
        const effectiveQuestion = buildResolvedAcademicQuery(question, history);

        // Re-rank using the resolved question. This matters after a clarification:
        // for example, "213 syllabus" + "CSE" must be ranked as "213 syllabus CSE",
        // not as the bare clarification reply "CSE".
        const effectiveExpanded = expandQuery(effectiveQuestion, ctx);
        const effectiveRanked = KB.map((c) => ({
          c,
          s:
            score(effectiveExpanded, c) +
            contextBoost(c, ctx),
        })).sort((a, b) => b.s - a.s);
        const effectiveBest = effectiveRanked[0];
        const effectiveNearby = effectiveRanked
          .filter((r) => r.s > 0.08)
          .slice(0, 3);

        // Do not guess when a course/document request is genuinely incomplete.
        // Ask only for the minimum missing information.
        const clarification = shouldAskForAcademicClarification(
          effectiveQuestion,
          ctx,
          effectiveNearby[0]?.s ?? 0,
        );

        if (clarification) {
          return json({
            answer: clarification,
            mode: "rvrjc",
          });
        }

        const rvrjcish =
          looksRvrjcSpecific(effectiveQuestion, ctx) ||
          (effectiveNearby[0]?.s ?? 0) >= 0.2;

        /*
         * RIVA PDF PIPELINE
         *
         * RVRJC document questions are sent to n8n.
         * n8n searches the official PDF database, retrieves
         * the document content, generates the grounded answer,
         * and returns the official PDF URL.
         */
        const pdfResults = rvrjcish
          ? await searchRvrjcPdfs(effectiveQuestion)
          : [];

        const pdfContext = pdfResults
          .slice(0, 8)
          .map(
            (r: {
              Title?: string;
              Category?: string;
              Year?: string;
              Regulation?: string;
              Branch?: string;
              "PDF URL"?: string;
              "Source Page"?: string;
            }) =>
              `# ${r.Title || "RVRJC document"}
Category: ${r.Category || ""}
Year: ${r.Year || ""}
Regulation: ${r.Regulation || ""}
Branch: ${r.Branch || ""}
PDF: ${r["PDF URL"] || ""}
Source page: ${r["Source Page"] || ""}`,
          )
          .join("\n\n");

        const kbContext = effectiveNearby
          .map(
            (r) =>
              `# ${r.c.topic} (source: ${r.c.sourceUrl}${
                r.c.pdfUrl
                  ? `, pdf: ${r.c.pdfUrl}`
                  : ""
              })\n${r.c.answer}`,
          )
          .join("\n\n");

        const context = [
          pdfContext
            ? `VERIFIED PDF SEARCH RESULTS:\n${pdfContext}`
            : "",
          kbContext
            ? `VERIFIED RVRJC KB:\n${kbContext}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        const top = effectiveNearby[0]?.c;
        const topPdf = pdfResults[0];
        const academicDocumentRequest = isAcademicDocQuery(effectiveQuestion);
        const pdfFound = topPdf?.found === true && topPdf?.answerFound === true;
        const pdfExplicitlyNotFound = topPdf?.found === false || topPdf?.answerFound === false;

        // For official academic-document requests, NEVER fall through to the
        // old KB/AI path when n8n did not return a grounded document answer.
        // n8n may return either [] OR [{ found: false }], so both cases matter.
        if (academicDocumentRequest && rvrjcish && !pdfFound) {
          if (pdfExplicitlyNotFound || pdfResults.length === 0) {
            return json({
              answer:
                "I couldn't find a verified official RVRJC document for that request. Please give the department/branch and subject code or name, for example: CSE CS213.",
              mode: "rvrjc",
            });
          }
        }

        /*
         * CRITICAL:
         * If the new n8n workflow has already produced a grounded
         * answer from an official RVRJC document, use that answer
         * directly instead of sending the question through the
         * old Lovable AI compose() path.
         *
         * This prevents the old KB/AI path from overriding the
         * new official-PDF answer.
         */
        if (
          topPdf?.found === true &&
          topPdf?.answerFound === true &&
          typeof topPdf?.answer === "string" &&
          topPdf.answer.trim()
        ) {
          const officialPdf =
            topPdf["PDF URL"] ||
            topPdf.pdfUrl ||
            topPdf["PDF URL "] ||
            "";

          const sourcePage =
            topPdf["Source Page"] || "";

          return json({
            answer: topPdf.answer.trim(),
            sourceLabel: officialPdf
              ? "⬇️ Download Official PDF"
              : "Official RVRJC Source",
            sourceUrl:
              officialPdf || sourcePage,
            pdfUrl:
              officialPdf || undefined,
            mode: "rvrjc",
          });
        }

        /*
         * FALLBACK:
         * If n8n did not produce a grounded answer, retain the
         * existing Lovable AI / local KB behaviour.
         */
        const apiKey =
          process.env["LOVABLE_API_KEY"];

        if (!apiKey) {
          // No AI available: serve the verified chunk directly when confident.
          if (effectiveBest && effectiveBest.s >= THRESHOLD) {
            return json({
              answer: chunkAnswer(effectiveBest.c, ctx),
              sourceLabel: effectiveBest.c.sourceLabel,
              sourceUrl: effectiveBest.c.sourceUrl,
              pdfUrl: effectiveBest.c.pdfUrl,
              mode: "rvrjc",
            });
          }

          return json({
            answer:
              "I couldn't find a verified official RVRJC document with that exact detail, and the AI service isn't configured right now. Ask me about admissions, fees, exams, results, placements, hostel, library or departments and I'll answer from the official pages.",
            mode: "general",
          });
        }

        try {
          const answer = await compose(
            effectiveQuestion,
            apiKey,
            {
              context,
              ctx,
              turns: history,
            },
          );

          if (!answer) {
            if (effectiveBest && effectiveBest.s >= THRESHOLD) {
              return json({
                answer: chunkAnswer(effectiveBest.c, ctx),
                sourceLabel:
                  effectiveBest.c.sourceLabel,
                sourceUrl:
                  effectiveBest.c.sourceUrl,
                pdfUrl: effectiveBest.c.pdfUrl,
                mode: "rvrjc",
              });
            }

            return json({
              answer:
                "I couldn't produce an answer for that. Please try rephrasing your question.",
              mode: "general",
            });
          }

          return json({
            answer,

            ...(rvrjcish &&
            (topPdf || top)
              ? {
                  sourceLabel:
                    topPdf?.["PDF URL"]
                      ? "⬇️ Download Official PDF"
                      : top?.pdfUrl
                        ? "⬇️ Download Official PDF"
                        : top?.sourceLabel,

                  sourceUrl:
                    topPdf?.["PDF URL"] ??
                    top?.pdfUrl ??
                    topPdf?.["Source Page"] ??
                    top?.sourceUrl,

                  pdfUrl:
                    topPdf?.["PDF URL"] ??
                    top?.pdfUrl,
                }
              : {}),

            mode: rvrjcish
              ? "rvrjc"
              : "general",
          });
        } catch (err) {
          const status =
            (err as { status?: number })
              .status ?? 500;

          // A verified chunk beats an error message whenever we have one.
          if (effectiveBest && effectiveBest.s >= THRESHOLD) {
            return json({
              answer: chunkAnswer(effectiveBest.c, ctx),
              sourceLabel:
                effectiveBest.c.sourceLabel,
              sourceUrl:
                effectiveBest.c.sourceUrl,
              pdfUrl: effectiveBest.c.pdfUrl,
              mode: "rvrjc",
            });
          }

          const messageByStatus: Record<
            number,
            string
          > = {
            402: "The AI credits for this assistant are exhausted. The app owner needs to top up Lovable AI credits.",
            403: "AI access is blocked by workspace policy for this assistant.",
            429: "The assistant is rate limited right now. Please try again in a few seconds.",
          };

          console.error(
            "ask endpoint compose failed",
            status,
            err,
          );

          return json(
            {
              error:
                messageByStatus[status] ??
                "The assistant couldn't reach the AI service. Please try again.",
            },
            status >= 400 && status < 600
              ? status
              : 500,
          );
        }
      },
    },
  },
});

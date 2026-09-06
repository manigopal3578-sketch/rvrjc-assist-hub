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
      if (q.includes(kw)) hits += 2.5; // phrase match is strong evidence
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
  if (ctx.year && text.includes(`${ctx.year === 1 ? "i" : ctx.year === 2 ? "ii" : ctx.year === 3 ? "iii" : "iv"} year`))
    b += 0.08;
  if (ctx.program && text.includes(ctx.program.toLowerCase())) b += 0.05;
  return b;
}

const THRESHOLD = 0.34;

function looksRvrjcSpecific(question: string, ctx: StudentContext): boolean {
  const q = question.toLowerCase();
  // The question itself must look college-related; sticky context alone is not enough,
  // otherwise a general question asked after "CSE 2.1" gets an RVRJC source attached.
  const own = parseContext(question);
  return (
    RVRJC_HINTS.some((h) => q.includes(h)) ||
    Boolean(own.branch || own.exam || own.year) ||
    (Boolean(ctx.branch || ctx.exam || ctx.year) && /\b(my|our|college|class)\b/.test(q))
  );
}


type AskResponse = {
  answer: string;
  sourceLabel?: string | undefined;
  sourceUrl?: string | undefined;
  pdfUrl?: string | undefined;
  mode: "rvrjc" | "general";
};

const json = (body: AskResponse | { error: string }, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Friendly small talk handled locally so the bot always chats, even without AI. */
function smallTalk(question: string): string | null {
  const q = question.toLowerCase().replace(/[^a-z\s']/g, " ").trim();
  const has = (...w: string[]) => w.some((x) => q === x || q.startsWith(x + " ") || q.includes(" " + x));
  if (has("hi", "hello", "hey", "namaste", "hii", "good morning", "good evening", "good afternoon"))
    return "Namaste! 🙏 I'm the RVRJC Assistant. Tell me your class (for example “CSE 2.1”) and ask away — mids, syllabus, fees, hostel, results or anything else.";
  if (has("thanks", "thank you", "thankyou", "ty"))
    return "Happy to help! Ask me anything else about RVRJC or any general question.";
  if (has("bye", "goodbye", "see you"))
    return "Bye! Come back any time you need RVRJC info. All the best 👍";
  if (q.includes("who are you") || q.includes("your name") || q.includes("what can you do"))
    return "I'm the RVRJC Assistant. I answer questions about R.V.R. & J.C. College of Engineering from its official pages (admissions, fees, syllabus, exams, hostel, library, placements) and I can also chat and answer general questions.";
  if (q.includes("how are you"))
    return "I'm doing great, thanks for asking! What would you like to know about RVRJC?";
  return null;
}

type Msg = { role: "user" | "assistant"; text: string };

/** Answer conversationally; RVRJC facts come only from the supplied context. */
async function compose(
  question: string,
  apiKey: string,
  opts: { context: string; ctx: StudentContext; turns: Msg[] },
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
    ctxLine ? `\nRESOLVED STUDENT CONTEXT (carried from this conversation): ${ctxLine}${title ? ` — suggested heading: ${title}` : ""}. Treat "my"/"our" as referring to it, and never ask again for details already listed here.` : "",
  ].join("\n");

  const input = [
    ...opts.turns.slice(-6).map((t) => ({
      role: t.role,
      content: [{ type: t.role === "user" ? "input_text" : "output_text", text: t.text }],
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

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
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
      reasoning: { effort: "low", summary: "auto" },
      instructions,
      input,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`Gateway ${res.status}: ${body}`), { status: res.status, body });
  }

  // Read the SSE stream and accumulate the output text deltas.
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && !text) {
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
function chunkAnswer(chunk: KbChunk, ctx: StudentContext): string {
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
          question = typeof body.question === "string" ? body.question.trim() : "";
          if (Array.isArray(body.history)) {
            history = body.history
              .filter(
                (m): m is { role: string; text: string } =>
                  !!m && typeof (m as { text?: unknown }).text === "string",
              )
              .slice(-8)
              .map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                text: String(m.text).slice(0, 1500),
              }));
          }
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        if (!question || question.length > 600) {
          return json({ error: "A question of 1-600 characters is required" }, 400);
        }

        // 1 — understand the student's language, sticky across the conversation.
        const ctx = mergeContext(
          contextFromHistory(history.filter((m) => m.role === "user").map((m) => m.text)),
          parseContext(question),
        );

        // 2 — retrieve with the context-expanded query.
        const expanded = expandQuery(question, ctx);
        const ranked = KB.map((c) => ({ c, s: score(expanded, c) + contextBoost(c, ctx) })).sort(
          (a, b) => b.s - a.s,
        );
        const best = ranked[0];

        // Friendly small talk — always works, no AI needed.
        const chit = !ctx.exam && !ctx.branch ? smallTalk(question) : null;
        if (chit) return json({ answer: chit, mode: "general" });

        const nearby = ranked.filter((r) => r.s > 0.08).slice(0, 3);
        const context = nearby
          .map((r) => `# ${r.c.topic} (source: ${r.c.sourceUrl}${r.c.pdfUrl ? `, pdf: ${r.c.pdfUrl}` : ""})\n${r.c.answer}`)
          .join("\n\n");
        const rvrjcish =
          looksRvrjcSpecific(question, ctx) || (nearby[0]?.s ?? 0) >= 0.2;
        const top = nearby[0]?.c;

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          // No AI available: serve the verified chunk directly when confident.
          if (best && best.s >= THRESHOLD) {
            return json({
              answer: chunkAnswer(best.c, ctx),
              sourceLabel: best.c.sourceLabel,
              sourceUrl: best.c.sourceUrl,
              pdfUrl: best.c.pdfUrl,
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
          const answer = await compose(question, apiKey, { context, ctx, turns: history });
          if (!answer) {
            if (best && best.s >= THRESHOLD) {
              return json({
                answer: chunkAnswer(best.c, ctx),
                sourceLabel: best.c.sourceLabel,
                sourceUrl: best.c.sourceUrl,
                pdfUrl: best.c.pdfUrl,
                mode: "rvrjc",
              });
            }
            return json({
              answer: "I couldn't produce an answer for that. Please try rephrasing your question.",
              mode: "general",
            });
          }
          return json({
            answer,
            ...(rvrjcish && top
              ? {
                  sourceLabel: top.pdfUrl ? "⬇️ Download Official PDF" : top.sourceLabel,
                  sourceUrl: top.pdfUrl ?? top.sourceUrl,
                  pdfUrl: top.pdfUrl,
                }
              : {}),
            mode: rvrjcish ? "rvrjc" : "general",
          });
        } catch (err) {
          const status = (err as { status?: number }).status ?? 500;
          // A verified chunk beats an error message whenever we have one.
          if (best && best.s >= THRESHOLD) {
            return json({
              answer: chunkAnswer(best.c, ctx),
              sourceLabel: best.c.sourceLabel,
              sourceUrl: best.c.sourceUrl,
              pdfUrl: best.c.pdfUrl,
              mode: "rvrjc",
            });
          }
          const messageByStatus: Record<number, string> = {
            402: "The AI credits for this assistant are exhausted. The app owner needs to top up Lovable AI credits.",
            403: "AI access is blocked by workspace policy for this assistant.",
            429: "The assistant is rate limited right now. Please try again in a few seconds.",
          };
          console.error("ask endpoint compose failed", status, err);
          return json(
            {
              error:
                messageByStatus[status] ??
                "The assistant couldn't reach the AI service. Please try again.",
            },
            status >= 400 && status < 600 ? status : 500,
          );
        }
      },
    },
  },
});

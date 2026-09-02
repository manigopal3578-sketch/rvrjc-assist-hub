import { createFileRoute } from "@tanstack/react-router";
import { KB, type KbChunk } from "@/lib/rvrjc-kb";

/**
 * POST /api/public/ask
 * Body:     { question: string }
 * Response: { answer, sourceLabel?, sourceUrl?, mode: "rvrjc" | "general" }
 *
 * Retrieval-then-fallback pipeline:
 *  1. Score the question against the verified RVRJC knowledge base (src/lib/rvrjc-kb.ts).
 *     Each chunk is transcribed from a specific official rvrjcce.ac.in page and carries
 *     that page's DIRECT deep link.
 *  2. If a chunk clears the similarity threshold -> answer STRICTLY from that chunk and
 *     return mode:"rvrjc" with the real sourceUrl. RVRJC-specific facts are never invented.
 *  3. If the question is not about RVRJC (general knowledge, math, definitions) -> answer
 *     with the model's normal knowledge, mode:"general", no sourceUrl.
 *  4. If the question IS RVRJC-specific but nothing clears the threshold -> return the
 *     verified-information-not-found message instead of guessing.
 */

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "of", "for", "to", "in", "on", "at", "and", "or",
  "do", "does", "did", "how", "what", "when", "where", "which", "who", "why", "i", "my",
  "me", "can", "could", "should", "would", "please", "tell", "about", "there", "this",
  "that", "it", "be", "you", "your", "get", "find", "any", "much", "many",
]);

const RVRJC_HINTS = [
  "rvrjc", "rvr", "jc", "college", "campus", "admission", "admissions", "fee", "fees",
  "exam", "exams", "examination", "timetable", "time table", "calendar", "result",
  "results", "placement", "placements", "hostel", "bus", "transport", "department",
  "departments", "branch", "semester", "sem", "bonafide", "certificate", "scholarship",
  "regulation", "library", "btech", "b.tech", "mtech", "mba", "mca", "bba", "eapcet",
  "ecet", "notice", "circular", "principal", "autonomous", "guntur",
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

const THRESHOLD = 0.34;

function looksRvrjcSpecific(question: string): boolean {
  const q = question.toLowerCase();
  return RVRJC_HINTS.some((h) => q.includes(h));
}

type AskResponse = {
  answer: string;
  sourceLabel?: string;
  sourceUrl?: string;
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
    return "Namaste! 🙏 I'm the RVRJC Assistant. Ask me anything — admissions, fees, syllabus, hostel, library, exams and results — or just chat with me.";
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

/** Answer any question conversationally; RVRJC facts come only from the supplied context. */
async function generalAnswer(question: string, apiKey: string, context = ""): Promise<string> {
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
      instructions:
        "You are the RVRJC Assistant for R.V.R. & J.C. College of Engineering (Autonomous), Guntur. " +
        "Be warm, conversational and helpful, and answer ANY kind of question — college questions, " +
        "general knowledge, study help, casual chat — briefly and accurately (at most 150 words). " +
        "For facts about RVRJC you may ONLY use the CONTEXT block below; if the context does not " +
        "contain the answer, say plainly that you don't have that verified RVRJC detail and suggest " +
        "checking rvrjcce.ac.in or the college office. Never invent RVRJC fees, dates, staff or rules.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: context ? `CONTEXT (verified RVRJC pages):\n${context}\n\nQUESTION: ${question}` : question,
            },
          ],
        },
      ],
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

export const Route = createFileRoute("/api/public/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let question = "";
        try {
          const body = (await request.json()) as { question?: unknown };
          question = typeof body.question === "string" ? body.question.trim() : "";
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        if (!question || question.length > 600) {
          return json({ error: "A question of 1-600 characters is required" }, 400);
        }

        // 1 + 2 — verified RVRJC retrieval.
        const ranked = KB.map((c) => ({ c, s: score(question, c) })).sort((a, b) => b.s - a.s);
        const best = ranked[0];

        if (best && best.s >= THRESHOLD) {
          return json({
            answer: best.c.answer,
            sourceLabel: best.c.sourceLabel,
            sourceUrl: best.c.sourceUrl,
            mode: "rvrjc",
          });
        }

        // Friendly small talk — always works, no AI needed.
        const chit = smallTalk(question);
        if (chit) {
          return json({ answer: chit, mode: "general" });
        }

        // 3 + 4 — conversational answer. RVRJC facts are constrained to the top KB chunks.
        const nearby = ranked.filter((r) => r.s > 0.08).slice(0, 3);
        const context = nearby
          .map((r) => `# ${r.c.topic} (${r.c.sourceUrl})\n${r.c.answer}`)
          .join("\n\n");
        const rvrjcish = looksRvrjcSpecific(question) || nearby.length > 0;

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return json(
            {
              answer:
                "General questions need the AI service to be configured. Ask me anything about RVRJC admissions, fees, exams, results, placements, hostel or departments and I'll answer from official sources.",
              mode: "general",
            },
            200,
          );
        }

        try {
          const answer = await generalAnswer(question, apiKey, context);
          return json({
            answer:
              answer ||
              "I couldn't produce an answer for that. Please try rephrasing your question.",
            sourceLabel: nearby[0]?.c.sourceLabel ?? "Official RVRJC website",
            sourceUrl: nearby[0]?.c.sourceUrl ?? "https://rvrjcce.ac.in",
            mode: rvrjcish ? "rvrjc" : "general",
          });


        } catch (err) {
          const status = (err as { status?: number }).status ?? 500;
          const messageByStatus: Record<number, string> = {
            402: "The AI credits for this assistant are exhausted. The app owner needs to top up Lovable AI credits.",
            403: "AI access is blocked by workspace policy for this assistant.",
            429: "The assistant is rate limited right now. Please try again in a few seconds.",
          };
          console.error("ask endpoint general fallback failed", status, err);
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

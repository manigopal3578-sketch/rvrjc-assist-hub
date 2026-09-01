import { createFileRoute } from "@tanstack/react-router";
import { KB, type KbChunk } from "@/lib/rvrjc-kb";

/**
 * POST /api/public/ask
 * Body:     { question: string }
 * Response: { answer, sourceLabel?, sourceUrl?, mode: "rvrjc" | "general" }
 *
 * Retrieval-then-fallback pipeline:
 *  1. Score the question against the verified RVRJC knowledge base (src/lib/rvrjc-kb.ts).
 *     Each chunk is transcribed from a specific official rvrjc.ac.in page and carries
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

/** Answer a non-RVRJC question with the model's general knowledge (streamed, consumed server-side). */
async function generalAnswer(question: string, apiKey: string): Promise<string> {
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
        "You are the RVRJC Assistant. This question is NOT about R.V.R. & J.C. College of Engineering, " +
        "so answer it from your general knowledge, briefly and accurately (at most 120 words). " +
        "Never invent facts about RVRJC, its fees, admissions, exams or staff.",
      input: [{ role: "user", content: [{ type: "input_text", text: question }] }],
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

        // 4 — RVRJC-specific but nothing verified matched.
        if (looksRvrjcSpecific(question)) {
          return json({
            answer:
              "I couldn't find verified RVRJC information on this — you may want to check with the college office directly.",
            sourceLabel: "Official RVRJC website",
            sourceUrl: "https://rvrjc.ac.in/index.php",
            mode: "rvrjc",
          });
        }

        // 3 — general knowledge fallback.
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
          const answer = await generalAnswer(question, apiKey);
          return json({
            answer:
              answer ||
              "I couldn't produce an answer for that. Please try rephrasing your question.",
            mode: "general",
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

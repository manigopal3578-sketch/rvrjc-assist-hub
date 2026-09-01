# How to upload your own RVRJC text chunks into the knowledge base

The assistant answers RVRJC questions **only** from the chunks listed in
`src/lib/rvrjc-kb.ts`. Adding a chunk = "training" the bot on that answer.
No database, no embeddings service, no redeploy scripts — edit one file.

## Step-by-step

1. **Open the official RVRJC page** you want the bot to know
   (e.g. `https://rvrjcce.ac.in/xfeestructure.php`). Copy the exact text.
   Keep the **deep link** of that page — not `https://rvrjcce.ac.in`.
2. **Open `src/lib/rvrjc-kb.ts`** in the editor (or ask the assistant in chat
   to add it for you).
3. **Copy an existing block** in the `KB` array and paste it at the end,
   just before the closing `];`.
4. **Fill in the 6 fields:**

   ```ts
   {
     id: "anti-ragging",                       // unique, kebab-case
     topic: "Anti-Ragging",                    // short label shown in the UI
     keywords: ["ragging", "anti ragging", "committee", "complaint"],
     answer:
       "Paste the verified text from the official page here.\n" +
       "Use \\n for line breaks and • for bullets.",
     sourceLabel: "Official Anti-Ragging page",
     sourceUrl: "https://rvrjcce.ac.in/xantiragging.php",   // DEEP link
   },
   ```

5. **Keywords are the retrieval index.** Add every word or phrase a student
   might type (singular + plural, abbreviations, "how much", branch names).
   Multi-word phrases score higher than single words.
6. **Optional — surface it as a tappable question.** Add an entry to the `FAQ`
   array at the bottom of the same file *and* to `COMMON_QUESTIONS` in
   `public/rvrjc-assistant.html` so it appears on the Home/FAQ tabs:

   ```ts
   { question: "How do I report ragging?", chunkId: "anti-ragging" },
   ```

7. **Save.** The preview rebuilds automatically — no restart needed.
8. **Test it.** Type the question in the chat widget, or from a terminal:

   ```bash
   curl -X POST http://localhost:8080/api/public/ask \
     -H 'Content-Type: application/json' \
     -d '{"question":"How do I report ragging?"}'
   ```

   You should get your `answer` back with `mode: "rvrjc"` and your `sourceUrl`.

## Rules that keep answers trustworthy

- **Never write a fact that is not on an official RVRJC page.** If a chunk has
  no source page, don't add it.
- One topic per chunk. Split long pages (fees vs. fee payment) into separate
  chunks so the right one wins retrieval.
- Put dates and amounts in the answer text exactly as printed, and add the
  academic year ("2026-27") so it is obvious when it goes stale.
- Re-check chunks every semester; update the answer text and bump the date note
  in the file header.
- If a question matches nothing, the bot says it has no verified information
  instead of guessing — that's the intended behaviour. Fix it by adding a chunk,
  not by loosening the threshold in `src/routes/api/public/ask.ts`.

## Bulk update tip

To replace many chunks at once, paste the new text into chat and ask:
"Add these as KB chunks with these source links." The assistant will write them
into `src/lib/rvrjc-kb.ts` in the correct shape.

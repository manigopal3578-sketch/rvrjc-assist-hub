# RVRJC Helper

Build a responsive prototype website (mobile-first, works on desktop too) for

"RVRJC Assistant" — a demo landing page for an Engineering Day hackathon.

No build tools — plain HTML/CSS/JS, single page app with client-side routing

so the chat widget persists across page/section changes.



=== TOP DISCLAIMER BAR ===

Full-width navy blue (#0d2a5c) bar, centered text, white:

- Small flask/beaker icon + "RVRJC Assistant – Prototype Website"

- Line 2 (smaller, lighter): "(For Demonstration Only)"

- Line 3 (small, muted white): "This is a prototype built for Engineering Day

  Presentation. Not an official website."



=== HEADER ===

White background, bottom border.

- Left: circular college crest logo (img src="LOGO_URL", placeholder ok),

  next to it stacked text: "R.V.R. & J.C." (bold navy, larger) /

  "COLLEGE OF ENGINEERING" (bold navy, smaller) / "(AUTONOMOUS)" (orange, small)

- Right: hamburger menu icon (opens a slide-out nav on mobile)



=== HERO ===

Full-width photo of the college building (img src="COLLEGE_PHOTO_URL",

placeholder allowed), ~240px tall, object-fit cover, no overlay text needed.



=== SECONDARY NAV (icon tabs, horizontal, scrollable on mobile) ===

Home (house icon, active/underlined navy) | Academics (cap icon) |

Examinations (calendar icon) | Admissions (people icon) |

Departments (building icon) | More (••• icon)

Clicking a tab switches the visible page section via client-side routing —

DO NOT reload the page, since the chat widget below must persist.



=== QUICK ACTIONS GRID (on Home) ===

Section title "Quick actions" (bold, left-aligned).

2-column grid (stacks to 1 column under 480px) of 8 cards, each:

white bg, light border, rounded corners, icon in a pale blue circle,

bold title, gray description line below:

1. Academic Calendar — "View academic schedules and important dates."

2. Admission Process — "Understand admissions and official links."

3. Exam Time Table — "Find examination schedules and notices."

4. Departments — "Explore departments and academic programmes."

5. Results — "Check published examination results."

6. Placements — "Placement cell and career support."

7. Fees — "Fee information and official payment page."

8. Notices — "Latest official notices and circulars."

Each card is clickable and sends its title as a preset question to the

chat widget below (scroll to it and auto-fill + send).



=== RASA CHAT WIDGET (INLINE CARD, always visible below quick actions

    on every page/section — this is the persistent part) ===

Card with rounded corners, subtle shadow.

Header: navy blue bar, shield+plus icon, "RVRJC Assistant" bold white text,

right-aligned green dot + "Online" text.

Body (white bg):

- "Namaste! 🙏" (bold)

- "I'm your RVRJC Assistant."

- Gray subtext: "Ask me anything about admissions, academics, examinations,

  placements, departments, facilities and more. Every answer is linked to

  an official RVRJC source — and I can also help with general questions."

- Label "QUICK ACTIONS" (small, gray, letter-spaced)

- 2-column grid of 8 pill/outline buttons (same 8 topics as above, each with

  a small icon): clicking sends that as a preset question

- Chat message log area (initially empty, appears once messages exist):

  user messages right-aligned navy bubbles, bot messages left-aligned gray

  bubbles, bot bubbles can include an optional "Open Official Page →" link

  button if the response includes a sourceUrl

- Typing indicator (3 bouncing dots) while waiting on a response

- Bottom: rounded input field "Type your question..." + mic icon (visual

  only, no real voice logic needed) + circular navy send button (paper

  plane icon)

- Footer caption, centered, small gray: "Powered by RASA AI Assistant ·

  Official RVRJC website"



This whole widget must be ONE reusable component mounted once in the page

shell (not re-created per section) so switching tabs above never resets

the conversation or loses scroll position.



=== COMMON STUDENT QUESTIONS (below the widget, on Home) ===

Section title "Common student questions" (bold).

List of rows, each: white bg, border, "?" icon in a circle, question text,

chevron-right icon on the far right, clickable (sends the question to the

widget). Seed with: "Where can I find the academic calendar?",

"How do I pay 2nd year fees?", "When is the next exam timetable released?",

"How do I apply for a bonafide certificate?"



=== BACKEND BEHAVIOR (describe as comments near the fetch call) ===

On send, POST { question } to const API_URL = "https://YOUR_BACKEND/ask".

Expected response: { answer, sourceLabel?, sourceUrl?, mode: "rvrjc" | "general" }.

Backend logic to implement server-side (note this in a comment block, not

in the frontend JS):

  1. Embed the question, search the RVRJC knowledge base (Supabase/pgvector).

  2. If a chunk matches above a similarity threshold → answer from that

     chunk only, attach mode:"rvrjc" and the real sourceUrl. Never invent

     an RVRJC-specific fact that isn't in a retrieved chunk.

  3. If nothing matches well (question isn't about RVRJC — e.g. general

     knowledge, math, definitions, "who is the PM of India") → fall back

     to the LLM's normal knowledge, answer normally, attach mode:"general"

     and omit sourceUrl.

  4. If mode is "rvrjc" but still no chunk clears the threshold, answer:

     "I couldn't find verified RVRJC information on this — you may want

     to check with the college office directly."



Output as one HTML file with inline <style> and <script>, using

placeholder image URLs where noted, ready to paste into Lovable/Base44.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rvrjc-assist-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/009f49be-91a7-4a51-bf92-045b8be20bde).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

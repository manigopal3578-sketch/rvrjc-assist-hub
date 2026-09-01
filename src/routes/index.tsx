import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RVRJC Assistant – Prototype Website" },
      {
        name: "description",
        content:
          "Prototype RVRJC Assistant landing page with a persistent AI chat widget for admissions, academics, examinations and placements queries.",
      },
      { property: "og:title", content: "RVRJC Assistant – Prototype Website" },
      {
        property: "og:description",
        content:
          "Engineering Day demo: a mobile-first RVRJC landing page with a persistent RASA-style assistant widget.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/rvrjc-assistant.html"
      title="RVRJC Assistant prototype"
      style={{ border: 0, width: "100%", height: "100vh", display: "block" }}
    />
  );
}

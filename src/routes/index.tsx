import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RIVA Assistant – R.V.R. & J.C. College of Engineering" },
      {
        name: "description",
        content:
          "RIVA Assistant for R.V.R. & J.C. College of Engineering admissions, academics, examinations and placements queries.",
      },
      { property: "og:title", content: "RIVA Assistant – R.V.R. & J.C. College of Engineering" },
      {
        property: "og:description",
        content: "A mobile-first RVRJC landing page with the persistent RIVA Assistant.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/rvrjc-assistant.html"
      title="RIVA Assistant"
      style={{ border: 0, width: "100%", height: "100vh", display: "block" }}
    />
  );
}

export default function HomePage() {
  return (
    <main style={{ minHeight: "100svh", background: "#0e0e10" }}>
      <iframe
        title="Canary homepage"
        src="/canary-homepage.html"
        style={{
          display: "block",
          width: "100%",
          height: "100svh",
          border: 0,
          background: "#0e0e10",
        }}
      />
    </main>
  );
}

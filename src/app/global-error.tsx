"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, backgroundColor: "#F8FAFB" }}>
        <div style={{ textAlign: "center", maxWidth: 360, padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Please try refreshing the page.</p>
          <button
            onClick={() => reset()}
            style={{ padding: "10px 24px", borderRadius: 12, backgroundColor: "#7C3AED", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

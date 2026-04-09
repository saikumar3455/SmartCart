import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Something went wrong.",
    };
  }

  componentDidCatch(error, info) {
    console.error("APP ERROR:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "#f8fafc",
            color: "#111827",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "720px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h1 style={{ marginTop: 0, marginBottom: "12px" }}>App crashed</h1>
            <p style={{ marginTop: 0, marginBottom: "16px", opacity: 0.8 }}>
              A runtime error occurred. The message below will help us pinpoint it.
            </p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                padding: "16px",
                borderRadius: "12px",
                background: "#111827",
                color: "#f9fafb",
                overflow: "auto",
              }}
            >
              {this.state.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

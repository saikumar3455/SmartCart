import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toasts } = useApp();

  const getIcon = (type) => {
    if (type === "error") return "!";
    if (type === "info") return "i";
    return "✓";
  };

  return (
    <div className="toast">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type || ""}`}>
          <span className="toast-icon">{getIcon(t.type)}</span>
          <div className="toast-copy">
            <p className="toast-title">
              {t.type === "error" ? "Something went wrong" : t.type === "info" ? "Heads up" : "Done"}
            </p>
            <p className="toast-message">{t.msg}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

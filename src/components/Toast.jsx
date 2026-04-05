import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toasts } = useApp();
  return (
    <div className="toast">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type || ""}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
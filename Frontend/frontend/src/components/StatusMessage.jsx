export default function StatusMessage({ type = "info", children }) {
  if (!children) return null;

  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-teal-200 bg-teal-50 text-teal-800",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles[type]}`}>
      {children}
    </div>
  );
}

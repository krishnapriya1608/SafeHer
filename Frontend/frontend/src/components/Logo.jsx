export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white">
        S
      </div>
      <div>
        <p className="text-base font-black leading-none text-slate-950">SafeCircle</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Safety Network
        </p>
      </div>
    </div>
  );
}

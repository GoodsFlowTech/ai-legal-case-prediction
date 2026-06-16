import { Scale, ShieldAlert } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-rose-950/10 bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-inner">
            <Scale className="h-6 w-6" id="scales-icon" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-sans" id="app-title">
              न्याय <span className="text-amber-400">NYAYA AI</span>
            </h1>
            <p className="text-xs text-slate-300 font-mono tracking-wide">
              Indian Court Case Prediction & Legal Analyzer • BNS & IPC Enabled
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0 font-mono text-xs">
          <div className="flex items-center space-x-1 rounded bg-slate-800 px-3 py-1 text-amber-400 border border-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Legal Engine v2.0 (BNS 2023)</span>
          </div>
          <div className="flex items-center space-x-2 rounded bg-red-950/50 border border-red-800/30 px-3 py-1 text-red-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Advisory Model Only</span>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Search, Gavel, Scale, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";

interface OffenseRecord {
  ipcSection: string;
  bnsSection: string;
  offense: string;
  category: "Criminal" | "Civil" | "Special";
  bailability: "Bailable" | "Non-bailable" | "Varies";
  cognizability: "Cognizable" | "Non-cognizable" | "Varies";
  penalty: string;
}

const REGISTERED_OFFENSES: OffenseRecord[] = [
  {
    ipcSection: "Section 302",
    bnsSection: "Section 103(1)",
    offense: "Murder (Punishment for murder)",
    category: "Criminal",
    bailability: "Non-bailable",
    cognizability: "Cognizable",
    penalty: "Death penalty or Imprisonment for Life, and liable to fine",
  },
  {
    ipcSection: "Section 307",
    bnsSection: "Section 109",
    offense: "Attempt to Murder",
    category: "Criminal",
    bailability: "Non-bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 10 years and fine; if hurt caused, life imprisonment",
  },
  {
    ipcSection: "Section 420",
    bnsSection: "Section 318(4)",
    offense: "Cheating (Cheating and dishonestly inducing delivery of property)",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 7 years, and liable to fine",
  },
  {
    ipcSection: "Section 379",
    bnsSection: "Section 303(2)",
    offense: "Theft",
    category: "Criminal",
    bailability: "Non-bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 3 years, or with fine, or with both",
  },
  {
    ipcSection: "Section 323",
    bnsSection: "Section 115(2)",
    offense: "Voluntarily causing hurt (Simple assault/hurt)",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Non-cognizable",
    penalty: "Imprisonment up to 1 year, or fine up to ₹10,000, or with both",
  },
  {
    ipcSection: "Section 325",
    bnsSection: "Section 117(2)",
    offense: "Voluntarily causing grievous hurt",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 7 years, and liable to fine",
  },
  {
    ipcSection: "Section 468",
    bnsSection: "Section 336(3)",
    offense: "Forgery for purpose of cheating",
    category: "Criminal",
    bailability: "Non-bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 7 years, and liable to fine",
  },
  {
    ipcSection: "Section 406",
    bnsSection: "Section 316",
    offense: "Criminal Breach of Trust",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 3 years, or with fine, or with both",
  },
  {
    ipcSection: "Section 498A",
    bnsSection: "Section 85",
    offense: "Husband or relative of husband of a woman subjecting her to cruelty",
    category: "Criminal",
    bailability: "Non-bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 3 years, and liable to fine",
  },
  {
    ipcSection: "Section 504",
    bnsSection: "Section 352",
    offense: "Intentional insult with intent to provoke breach of peace",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Non-cognizable",
    penalty: "Imprisonment up to 2 years, or with fine, or with both",
  },
  {
    ipcSection: "Section 506",
    bnsSection: "Section 351",
    offense: "Criminal Intimidation",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Non-cognizable",
    penalty: "Imprisonment up to 2 years, or with fine, or with both; if death threat, up to 7 years",
  },
  {
    ipcSection: "Section 304A",
    bnsSection: "Section 106(1)",
    offense: "Causing death by negligence (Rash or negligent acts / accident)",
    category: "Criminal",
    bailability: "Bailable",
    cognizability: "Cognizable",
    penalty: "Imprisonment up to 5 years, and liable to fine",
  },
];

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOffenses = REGISTERED_OFFENSES.filter((offense) => {
    const term = searchTerm.toLowerCase();
    return (
      offense.offense.toLowerCase().includes(term) ||
      offense.ipcSection.toLowerCase().includes(term) ||
      offense.bnsSection.toLowerCase().includes(term) ||
      offense.penalty.toLowerCase().includes(term)
    );
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <Gavel className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900 font-sans">
            IPC 1860 → BNS 2023 Cross-Reference Lookup
          </h2>
        </div>
        <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-800">
          Act Changes Active (July 1, 2024)
        </span>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-slate-500 font-sans">
        Browse or search critical Indian Penal Code (IPC) sections mapped directly to their newly updated targets in the Bharatiya Nyaya Sanhita (BNS, 2023). This helps align case details with active statutes.
      </p>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by crime (e.g., cheating, murder, hurt) or Section (e.g., 302, 420)..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="section-search"
        />
      </div>

      {/* Database list */}
      <div className="max-h-[380px] overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-100 scrollbar-thin">
        {filteredOffenses.length > 0 ? (
          filteredOffenses.map((item, index) => (
            <div key={index} className="p-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-sans text-sm font-semibold text-slate-800 leading-snug">
                  {item.offense}
                </span>
                <span className="inline-flex w-max rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                  {item.category}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px]">
                <div className="text-slate-500">
                  Old: <strong className="text-slate-700">{item.ipcSection}</strong>
                </div>
                <div className="text-slate-500">
                  New Code: <strong className="text-amber-700">{item.bnsSection}</strong>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400">•</span>
                  <span className={item.bailability === "Bailable" ? "text-emerald-700" : "text-rose-700"}>
                    {item.bailability}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{item.cognizability}</span>
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-500 font-sans leading-relaxed">
                <span className="font-medium text-slate-700">Statutory punishment:</span> {item.penalty}
              </p>
            </div>
          ))
        ) : (
          <div className="py-8 text-center font-sans text-xs text-slate-400">
            No matching central penal mappings detected for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}

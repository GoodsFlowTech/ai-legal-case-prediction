import React, { useState } from "react";
import { 
  Building2, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Scale, 
  Gavel, 
  AlertCircle,
  BookOpen,
  Briefcase,
  Layers,
  FileBadge,
  AlertTriangle,
  FlameKindling,
  Loader
} from "lucide-react";

interface SectionItem {
  section: string;
  title: string;
  punishment: string;
}

interface SpecialistResponse {
  case_type?: string;
  subcategory?: string;
  applicable_act?: string;
  sections?: SectionItem[];
  ipc_reference?: string;
  bns_reference?: string;
  bail_available?: string;
  verdict_chance?: string;
  one_line_advice?: string;
  error?: string;
}

const CRIMINAL_SUGGESTIONS = [
  "Is physical assault with a weapon a bailable offence under BNS?",
  "Penalty for a minor credit card cyber fraud under IT Act Section 66?",
  "What is the statutory punishment for burglary under BNS Section 303?"
];

const CIVIL_SUGGESTIONS = [
  "What is the procedure for Recovery of Money under CPC Section 9 due to unpaid bills?",
  "How long is the notice period before filing a Cheque Bounce case under Section 138?",
  "Can a landlord evict a tenant immediately for non-payment of rent?"
];

export default function SpecialistQA() {
  const [activeTab, setActiveTab] = useState<"criminal" | "civil">("criminal");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpecialistResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    setErrorText(null);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setErrorText(null);

    try {
      const response = await fetch("/api/specialist-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          mode: activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error("Temporary routing delay. Please click ask specialist again.");
      }

      const data: SpecialistResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Communication failed. Please ensure GEMINI_API_KEY is defined in secrets.");
    } finally {
      setLoading(false);
    }
  };

  const currentSuggestions = activeTab === "criminal" ? CRIMINAL_SUGGESTIONS : CIVIL_SUGGESTIONS;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="specialist-qa-desk">
      {/* Tab Switch Headers */}
      <div className="bg-slate-900 border-b border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-extrabold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-time Interactive Q&A</span>
          </div>
          <h3 className="text-sm font-extrabold text-white mt-1 font-sans">
            Specialist Indian Law AI Consultation Desk
          </h3>
        </div>

        {/* Action Toggle Tabs */}
        <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("criminal");
              setQuery("");
              setResult(null);
              setErrorText(null);
            }}
            id="tab-select-criminal-spec"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold font-sans rounded-md transition ${
              activeTab === "criminal"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gavel className="h-3.5 w-3.5 text-rose-300" />
            <span>Criminal Assistant</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab("civil");
              setQuery("");
              setResult(null);
              setErrorText(null);
            }}
            id="tab-select-civil-spec"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold font-sans rounded-md transition ${
              activeTab === "civil"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-emerald-300" />
            <span>Civil Assistant</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Dynamic Mode Explanatory Card */}
        <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
          activeTab === "criminal" 
            ? "bg-rose-50/50 border-rose-100 text-rose-950" 
            : "bg-emerald-50/50 border-emerald-100 text-emerald-950"
        }`}>
          {activeTab === "criminal" ? (
            <Gavel className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <Scale className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
          )}
          <div>
            <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider">
              {activeTab === "criminal" ? "Criminal Jurisdictions Desk" : "Civil & Commercial Jurisdictions Desk"}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-sans">
              {activeTab === "criminal" 
                ? "This expert handles offenses regarding Murder (BNS 101), Theft (BNS 303), Rape, Cybercrime, domestic cruelty, and forgery. Ask any section rule directly."
                : "This expert handles property partitions, commercial contracts, landlords conflicts, cheque bounce (NI 138), and employee redundancy disputes."
              }
            </p>
          </div>
        </div>

        {/* Input Form Box */}
        <form onSubmit={handleQuerySubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="specialist-query-text-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              placeholder={
                activeTab === "criminal"
                  ? "Describe a criminal case or ask about sections (e.g., 'What is the punishment under BNS 318 for cheating?')..."
                  : "Describe a civil conflict or ask about statutes (e.g., 'How can I stop illegal constructions under CPC Order 39?')..."
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pr-20 pl-4 text-xs sm:text-sm placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              id="submit-specialist-query-btn"
              className={`absolute top-1/2 right-2 -translate-y-1/2 px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider font-mono transition flex items-center space-x-1.5 ${
                !query.trim() || loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : activeTab === "criminal"
                    ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              }`}
            >
              <span>{loading ? "Asking" : "Consult"}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Quick-select chip suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
              Suggested Legal Questions:
            </span>
            {currentSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`text-[10px] px-3 py-1.5 rounded-lg border text-left transition select-none cursor-pointer font-sans leading-tight ${
                  activeTab === "criminal"
                    ? "bg-rose-50/20 border-rose-100 text-rose-800 hover:bg-rose-50"
                    : "bg-emerald-50/20 border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {/* Global Local Error alerts */}
        {errorText && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 leading-relaxed font-sans flex items-start space-x-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold">Service Warning:</span> {errorText}
              <p className="mt-1 text-[10px] text-slate-500 font-mono">
                Kindly verify that your backend has process.env.GEMINI_API_KEY.
              </p>
            </div>
          </div>
        )}

        {/* Load indicators */}
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader className="h-7 w-7 text-indigo-600 animate-spin" />
            <p className="mt-3 text-xs font-extrabold text-slate-800 font-sans">
              Jurisdictional Legal Agent Active
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs font-serif italic">
              "Analyzing statutory bounds and fetching section specifics..."
            </p>
          </div>
        )}

        {/* Dynamic Interactive Response View */}
        {result && (
          <div className="border border-slate-100 rounded-xl overflow-hidden animate-fade-in">
            {/* If there is a jurisdiction error returned by the specialist as JSON payload */}
            {result.error ? (
              <div className="bg-amber-50 border border-amber-200/80 p-5 font-sans">
                <div className="flex items-start space-x-3 text-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-xs uppercase font-mono tracking-wider text-amber-800">
                      Jurisdictional Mismatch Warning
                    </h5>
                    <p className="text-xs font-semibold leading-relaxed mt-1 text-amber-900 select-all">
                      {result.error}
                    </p>
                    <p className="text-[10px] text-amber-600/80 mt-2">
                      Please use the tab switcher at the top right to change to the correct legal assistant for your query.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Success response */
              <div className="bg-slate-50/40 p-5 sm:p-6 space-y-5">
                {/* Result header badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                      result.case_type === "Criminal" 
                        ? "bg-rose-100 text-rose-800" 
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {result.case_type || activeTab.toUpperCase()} LAW ASSISTANT
                    </span>
                    {result.subcategory && result.subcategory !== "N/A" && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans">
                        {result.subcategory}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Focused Case Analysis response
                  </span>
                </div>

                {/* Primary applicable Act */}
                {result.applicable_act && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide block">
                      Governing Statute
                    </span>
                    <span className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold font-mono text-white ${
                      result.case_type === "Criminal" || activeTab === "criminal" ? "bg-rose-950" : "bg-emerald-950"
                    }`}>
                      <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span>{result.applicable_act}</span>
                    </span>
                  </div>
                )}

                {/* Grid of Sections and corresponding cross-references */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Applied Sections & Punishments */}
                  {result.sections && result.sections.length > 0 && (
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide block">
                        Relevant Sections & Penalties (Max 2-3)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.sections.map((sec, i) => (
                          <div key={i} className="bg-white border border-slate-100 rounded-lg p-3.5 shadow-2xs space-y-1.5 border-l-4 border-indigo-500">
                            <span className="font-mono text-xs font-extrabold text-indigo-950 block">
                              {sec.section}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 font-sans block leading-tight">
                              {sec.title}
                            </span>
                            {sec.punishment && (
                              <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed border-t border-slate-50 pt-1 mt-1">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">Penalty / Consequence</span>
                                {sec.punishment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cross-reference codes (BNS / IPC) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide block">
                      Chronological References
                    </span>
                    <div className="bg-white border border-slate-100 rounded-lg p-3.5 space-y-2.5 shadow-2xs text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">Old Code:</span>
                        <span className="font-bold text-slate-700">{result.ipc_reference || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">New Code (BNS 2023):</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">
                          {result.bns_reference || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bail and Verdict evaluation */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide block">
                      Case Analysis & Indicators
                    </span>
                    <div className="bg-white border border-slate-100 rounded-lg p-3.5 space-y-2.5 shadow-2xs text-xs">
                      {(result.case_type === "Criminal" || activeTab === "criminal") && result.bail_available && (
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2 font-mono">
                          <span className="text-slate-400">Bail Available:</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            result.bail_available === "Yes" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {result.bail_available}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">Verdict Outlook:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          result.verdict_chance === "Strong Case" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : result.verdict_chance === "Moderate Case"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {result.verdict_chance || "Moderate Case"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* One line advice */}
                {result.one_line_advice && (
                  <div className="space-y-1 bg-indigo-50/45 border border-indigo-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-900 font-mono uppercase tracking-wide block flex items-center">
                      <Sparkles className="h-3 w-3 text-indigo-600 mr-1.5 animate-pulse" />
                      Statutory Direction & Advice
                    </span>
                    <p className="text-xs text-indigo-950 font-sans font-semibold leading-relaxed">
                      "{result.one_line_advice}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Specialist Disclaimer */}
      <div className="bg-slate-100/65 px-6 py-4.5 border-t border-slate-150 text-[10px] text-slate-400 font-sans leading-relaxed text-center italic">
        <strong>Important Disclaimer:</strong> This Q&A assistant is configured as an interactive AI exploration tool to reference statutory sections (IPC, BNS, CrPC, CPC) and does not constitute official legal advice. Always corroborate details with a registered Advocate of the High Court.
      </div>
    </div>
  );
}

import { History, Calendar, Trash2, ArrowRight, BookOpen, AlertTriangle } from "lucide-react";
import { PredictionReport } from "../types";

export interface HistoryRecord {
  id: string;
  timestamp: string;
  caseDescription: string;
  report: PredictionReport;
  selectedEvidence?: string[];
  caseCategory?: string;
  subcategory?: string;
  questionnaireAnswers?: Record<string, any>;
}

interface HistoryListProps {
  records: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  currentActiveId: string | null;
}

export default function HistoryList({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  currentActiveId,
}: HistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
          <History className="h-5 w-5 text-amber-600" />
          <h3 className="text-sm font-semibold text-slate-800 font-sans">
            Your Local Analysis History
          </h3>
        </div>
        <div className="text-center py-6">
          <History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-sans">
            No previous case predictions saved in this browser.
          </p>
          <p className="text-[10px] text-slate-400 font-sans mt-1">
            Successful legal analyses will be stored here automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-amber-600" />
          <h3 className="text-sm font-semibold text-slate-800 font-sans">
            Your Local Analysis History ({records.length})
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-mono text-rose-600 hover:underline hover:text-rose-700 bg-none focus:outline-none flex items-center space-x-1"
          id="clear-all-history-btn"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="space-y-3.5 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
        {records.map((record) => {
          const isSelected = currentActiveId === record.id;
          const caseType = record.report.caseClassification.caseType;
          const isCriminal = caseType.includes("CRIMINAL");
          const isCivil = caseType.includes("CIVIL");

          // Determine category color tag
          const badgeClass = isCriminal
            ? "bg-rose-50 text-rose-700 border border-rose-200/40"
            : isCivil
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/40"
            : "bg-indigo-50 text-indigo-700 border border-indigo-200/40";

          // Get primary charge or abbreviated description
          const primaryLabel = record.report.caseSummary.primaryCharge || "Indian Law Analysis";
          const snippetText = record.caseDescription.length > 80
            ? record.caseDescription.slice(0, 80) + "..."
            : record.caseDescription;

          return (
            <div
              key={record.id}
              className={`group flex items-start justify-between rounded-lg border p-3 transition-colors ${
                isSelected
                  ? "border-amber-500 bg-amber-50/30 ring-1 ring-amber-500"
                  : "border-slate-100 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/10"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectRecord(record)}
                className="flex-grow text-left focus:outline-none"
                id={`history-item-${record.id}`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase ${badgeClass}`}>
                    {caseType.replace(" CASE", "")}
                  </span>
                  {record.subcategory && (
                    <span className="rounded bg-amber-50 text-amber-800 border border-amber-200/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                      {record.subcategory}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400 flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {record.timestamp}
                  </span>
                </div>

                <h4 className="mt-1.5 text-xs font-bold text-slate-800 leading-tight">
                  {primaryLabel}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug font-sans line-clamp-2">
                  "{snippetText}"
                </p>

                <div className="mt-2 text-[10px] font-semibold text-amber-700 font-sans inline-flex items-center group-hover:underline">
                  <span>Revisit Prediction</span>
                  <ArrowRight className="ml-1 h-2.5 w-2.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onDeleteRecord(record.id)}
                className="ml-2 text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition focus:outline-none shrink-0"
                title="Delete from local history"
                id={`delete-history-${record.id}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[10px] leading-relaxed text-slate-400 font-sans border-t border-slate-100 pt-3">
        📝 All reports are retained within browser's local sandbox memory. Clearing browser cookies or cache will destroy this history.
      </div>
    </div>
  );
}

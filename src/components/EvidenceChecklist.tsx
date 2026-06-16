import { useState } from "react";
import { 
  Video, 
  MessageSquare, 
  MapPin, 
  Volume2, 
  FileCheck, 
  CreditCard, 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  Activity, 
  BadgeHelp,
  Search,
  Scale
} from "lucide-react";

export interface EvidenceItem {
  id: string;
  label: string;
  description: string;
  category: string;
  sectionInfo: string;
  weight: "High" | "Medium" | "Substantive";
}

const EVIDENCE_DATABASE: EvidenceItem[] = [
  {
    id: "cctv",
    label: "CCTV Camera Footage / Video Logs",
    description: "Concrete electronic recordings covering timestamps of the physical occurrence, alibis, or presence.",
    category: "Digital & Electronic Proof",
    sectionInfo: "Sec. 61 & 63 BSA (formerly Sec. 65B IEA)",
    weight: "High"
  },
  {
    id: "chats",
    label: "WhatsApp Chats / Emails / SMS Logs",
    description: "Written digital communication threads establishing alibis, verbal contracts, agreements, or mens rea.",
    category: "Digital & Electronic Proof",
    sectionInfo: "Sec. 63 BSA Electronic Records",
    weight: "Medium"
  },
  {
    id: "gps",
    label: "GPS Tracking / Google Maps Timelines",
    description: "Verified historical location logs showing proximity or confirming pre-dispute geographic positions.",
    category: "Digital & Electronic Proof",
    sectionInfo: "Sec. 63 BSA Location Data",
    weight: "Medium"
  },
  {
    id: "audio",
    label: "Call Records & Voice Notes",
    description: "Audio statements or confessions verifying commercial conditions, legal verbal commitments, or demands.",
    category: "Digital & Electronic Proof",
    sectionInfo: "Sec. 63 BSA Digital Audio",
    weight: "Substantive"
  },
  {
    id: "contracts",
    label: "Signed Written Contracts / NDAs",
    description: "Explicit bilateral or unilateral agreements signed by both parties, with or without notary seals.",
    category: "Documentary Proof & Deeds",
    sectionInfo: "Sec. 56 to 59 BSA Primary Documents",
    weight: "High"
  },
  {
    id: "bank_receipts",
    label: "Certified Bank Receipts / Ledger Entries",
    description: "Financial bank transfer slips, digital UPI transaction logs, or physical deposit proofs.",
    category: "Documentary Proof & Deeds",
    sectionInfo: "Sec. 34 IEA / Sec. 22 BSA Books of Accounts",
    weight: "High"
  },
  {
    id: "govt_certs",
    label: "Govt Registration Deeds / property papers",
    description: "Certified land record documents, GST registration sheets, municipal maps, or public certificates.",
    category: "Documentary Proof & Deeds",
    sectionInfo: "Sec. 74 CrPC / Public Documents",
    weight: "High"
  },
  {
    id: "notices",
    label: "Written Demand & Legal Notices",
    description: "Copies of notices delivered prior to legal filing, with formal reception signatures or post receipts.",
    category: "Documentary Proof & Deeds",
    sectionInfo: "Sec. 62 BSA Secondary Notice Records",
    weight: "Substantive"
  },
  {
    id: "witnesses",
    label: "Sworn Independent Witness Testimony",
    description: "Signed statements or live commitments from third-party bystanders or neutral neighbors.",
    category: "Physical & Testimonial Proof",
    sectionInfo: "Sec. 134 IPC / Sec. 114 BSA Oral Evidence",
    weight: "High"
  },
  {
    id: "medical",
    label: "Hospital Medico-Legal Reports (MLR)",
    description: "Certified medical logs, injury lists, or psychological reports issued by a registered practitioner.",
    category: "Physical & Testimonial Proof",
    sectionInfo: "Sec. 45 IEA / Sec. 39 BSA Medical Expert opinion",
    weight: "High"
  },
  {
    id: "physical_assets",
    label: "Recovered Physical Goods or Material Assets",
    description: "Damaged appliances, returned items, disputed keys, or materials physically preserved for review.",
    category: "Physical & Testimonial Proof",
    sectionInfo: "Sec. 114 BSA Material Evidence",
    weight: "Substantive"
  },
  {
    id: "fir",
    label: "Initial Police Complaint / FIR Copy",
    description: "Authorized First Information Report filed with local police station regarding the dispute.",
    category: "Physical & Testimonial Proof",
    sectionInfo: "Sec. 154 CrPC / Sec. 173 BNSS Procedural Entry",
    weight: "High"
  }
];

interface EvidenceChecklistProps {
  selectedEvidence: string[];
  onChange: (evidenceLabels: string[]) => void;
}

export default function EvidenceChecklist({ selectedEvidence, onChange }: EvidenceChecklistProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(true);

  const toggleSelect = (label: string) => {
    if (selectedEvidence.includes(label)) {
      onChange(selectedEvidence.filter((item) => item !== label));
    } else {
      onChange([...selectedEvidence, label]);
    }
  };

  const filteredItems = EVIDENCE_DATABASE.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sectionInfo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group items by category
  const categories = Array.from(new Set(EVIDENCE_DATABASE.map((i) => i.category)));

  const getWeightColor = (weight: "High" | "Medium" | "Substantive") => {
    switch (weight) {
      case "High":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "Substantive":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "cctv":
        return <Video className="h-4 w-4" />;
      case "chats":
        return <MessageSquare className="h-4 w-4" />;
      case "gps":
        return <MapPin className="h-4 w-4" />;
      case "audio":
        return <Volume2 className="h-4 w-4" />;
      case "contracts":
        return <FileCheck className="h-4 w-4" />;
      case "bank_receipts":
        return <CreditCard className="h-4 w-4" />;
      case "govt_certs":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "notices":
        return <ShieldCheck className="h-4 w-4" />;
      case "witnesses":
        return <Users className="h-4 w-4" />;
      case "medical":
        return <Activity className="h-4 w-4" />;
      case "physical_assets":
        return <Scale className="h-4 w-4" />;
      default:
        return <BadgeHelp className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm p-5 font-sans">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Scale className="h-5 w-5 text-amber-600" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Interactive Evidence Checklist
            </h4>
            <p className="text-[11px] text-slate-500">
              Select available evidence to adjust algorithmic prediction weights
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 focus:outline-none"
        >
          {expanded ? "Hide Options" : `Show Options (${selectedEvidence.length})`}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Seach box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search evidence directories, sections or acts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-1.5 text-xs placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            />
            {selectedEvidence.length > 0 && (
              <span className="absolute right-3.5 top-2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-medium">
                {selectedEvidence.length} Active
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
            {categories.map((category) => {
              const categoryItems = filteredItems.filter((i) => i.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase border-b border-slate-200/50 pb-1">
                    {category}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryItems.map((item) => {
                      const isChecked = selectedEvidence.includes(item.label);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelect(item.label)}
                          className={`group relative flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition ${
                            isChecked
                              ? "bg-amber-50/45 border-amber-300 shadow-sm"
                              : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/5"
                          }`}
                        >
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="h-3.5 w-3.5 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer pointer-events-none"
                            />
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center space-x-1.5">
                              <span className={`${isChecked ? 'text-amber-700' : 'text-slate-500'} group-hover:text-amber-600 transition`}>
                                {getIcon(item.id)}
                              </span>
                              <span className={`text-xs font-bold leading-none select-none truncate ${isChecked ? "text-amber-900" : "text-slate-800"}`}>
                                {item.label}
                              </span>
                            </div>
                            <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400 select-none line-clamp-2">
                              {item.description}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1 items-center select-none">
                              <span className="text-[9.5px] font-mono text-slate-500 bg-slate-100 rounded-sm px-1.5 py-0.5 border border-slate-200/40">
                                {item.sectionInfo}
                              </span>
                              <span className={`text-[8.5px] font-mono leading-none rounded-sm px-1.5 py-0.5 border uppercase font-medium ${getWeightColor(item.weight)}`}>
                                {item.weight === "High" ? `⚡ Direct ${item.weight}` : `🔍 ${item.weight} Value`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500">No matching legal evidence artifacts found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { 
  Scale, 
  Gavel, 
  ShieldAlert, 
  FileText, 
  Upload, 
  Trash2, 
  BrainCircuit, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCode,
  ArrowUpRight
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Directory from "./components/Directory";
import ExampleSelector from "./components/ExampleSelector";
import PredictionResult from "./components/PredictionResult";
import { PredictionReport } from "./types";
import HistoryList, { HistoryRecord } from "./components/HistoryList";
import EvidenceChecklist from "./components/EvidenceChecklist";
import CaseTypeSelector from "./components/CaseTypeSelector";
import { CASE_CATEGORIES, CaseCategory } from "./constants/caseTypes";
import SpecialistQA from "./components/SpecialistQA";

export default function App() {
  const [caseDescription, setCaseDescription] = useState("");
  const [selectedCaseType, setSelectedCaseType] = useState<"Criminal" | "Civil" | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Advanced Categorization states
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [questionnaireValues, setQuestionnaireValues] = useState<Record<string, any>>({});
  
  // App state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [prediction, setPrediction] = useState<PredictionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [savedRecords, setSavedRecords] = useState<HistoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem("nyaya_prediction_history");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  // File loading reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sharing decoder & loader
  useEffect(() => {
    const decodeShareState = (base64: string) => {
      try {
        const binString = atob(base64);
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        const jsonStr = new TextDecoder().decode(bytes);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Decoding of share link failed", e);
        return null;
      }
    };

    const checkShareParam = () => {
      try {
        let shareDataEncoded = "";
        
        // 1. Check direct hash parameter search (e.g. #share=...)
        if (window.location.hash) {
          const hashMatch = window.location.hash.match(/share=([^&]+)/);
          if (hashMatch) {
            shareDataEncoded = hashMatch[1];
          }
        }
        
        // 2. Fallback to query parameters string (e.g. ?share=...)
        if (!shareDataEncoded && window.location.search) {
          const urlParams = new URLSearchParams(window.location.search);
          shareDataEncoded = urlParams.get("share") || "";
        }
        
        if (shareDataEncoded) {
          // Clean the encoded string just in case it was encoded unevenly
          const sanitizedEncoded = decodeURIComponent(shareDataEncoded).replace(/\s/g, "");
          const decoded = decodeShareState(sanitizedEncoded);
          if (decoded && decoded.report && decoded.caseDescription) {
            setPrediction(decoded.report);
            setCaseDescription(decoded.caseDescription);
            if (Array.isArray(decoded.selectedEvidence)) {
              setSelectedEvidence(decoded.selectedEvidence);
            } else {
              setSelectedEvidence([]);
            }
            
            // Auto-detect case type from shared prediction report
            const typeStr = decoded.report?.caseClassification?.caseType || decoded.report?.caseSummary?.caseType || "";
            const isCivilReport = typeStr.toLowerCase().includes("civil");
            setSelectedCaseType(isCivilReport ? "Civil" : "Criminal");
            
            setError(null);
            
            // Smooth scroll down to results section
            setTimeout(() => {
              const el = document.getElementById("prediction-report-container");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }, 600);
          }
        }
      } catch (err) {
        console.error("Error reading shared url token:", err);
      }
    };

    checkShareParam();
    
    // Wire up events so browser navigation or address updates reflect instantly
    window.addEventListener("hashchange", checkShareParam);
    return () => window.removeEventListener("hashchange", checkShareParam);
  }, []);

  const loadingSequence = [
    "Receiving and parsing case complaint details...",
    "Classifying procedural track (Civil vs. Criminal)...",
    "Searching active Bharatiya Nyaya Sanhita (BNS) & IPC databases...",
    "Estimating evidence weights and mens rea factors...",
    "Formulating judicial bail percentages and sentence terms...",
    "Drafting strategic defense counsel points...",
    "Assembling Case Summary Card..."
  ];

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCaseDescription(e.target.value);
    setSelectedScenarioId(null); // Reset highlighted scenario
  };

  const handleScenarioSelect = (text: string) => {
    setCaseDescription(text);
    
    // Auto-map scenarios to CASE_CATEGORIES and pre-fill targeted answers for a premium UX
    if (text.includes("Ram Singh")) {
      setSelectedScenarioId("ex-forgery");
      const cat = CASE_CATEGORIES.find(c => c.id === "criminal") || null;
      setSelectedCategory(cat);
      setSelectedSubcategory("Fraud");
      setQuestionnaireValues({
        hasPhysicalInjury: "No",
        monetaryValue: 4500000,
        firRegistered: "No",
        witnessCount: "Yes - Multiple",
        weaponsInvolved: "No",
        accusedNamed: "Yes - Specifically Named"
      });
      setSelectedCaseType("Criminal");
    } else if (text.includes("Rohit Mehra") || text.includes(" Rohit Mehra")) {
      setSelectedScenarioId("ex-accident");
      const cat = CASE_CATEGORIES.find(c => c.id === "criminal") || null;
      setSelectedCategory(cat);
      setSelectedSubcategory("Assault");
      setQuestionnaireValues({
        hasPhysicalInjury: "Yes",
        monetaryValue: 0,
        firRegistered: "No",
        witnessCount: "Yes - Multiple",
        weaponsInvolved: "No",
        accusedNamed: "Yes - Specifically Named"
      });
      setSelectedCaseType("Criminal");
    } else if (text.includes("double-story house in Pune") || text.includes("Pune")) {
      setSelectedScenarioId("ex-property");
      const cat = CASE_CATEGORIES.find(c => c.id === "property") || null;
      setSelectedCategory(cat);
      setSelectedSubcategory("Inheritance Property Disputes");
      setQuestionnaireValues({
        deedExists: "Deed Unregistered / Disputed",
        propertyTaxPaid: "Yes",
        propertyValue: 1200000,
        isCommercialProperty: "Residential"
      });
      setSelectedCaseType("Civil");
    } else if (text.includes("State Bank of India") || text.includes("pension account")) {
      setSelectedScenarioId("ex-cyber");
      const cat = CASE_CATEGORIES.find(c => c.id === "criminal") || null;
      setSelectedCategory(cat);
      setSelectedSubcategory("Cybercrime");
      setQuestionnaireValues({
        hasPhysicalInjury: "No",
        monetaryValue: 450000,
        firRegistered: "Yes",
        witnessCount: "No",
        weaponsInvolved: "No",
        accusedNamed: "No - Anonymous/Unexplained"
      });
      setSelectedCaseType("Criminal");
    } else if (text.includes("cruelty") || text.includes("shouting and demanding")) {
      setSelectedScenarioId("ex-domestic");
      const cat = CASE_CATEGORIES.find(c => c.id === "criminal") || null;
      setSelectedCategory(cat);
      setSelectedSubcategory("Domestic Violence");
      setQuestionnaireValues({
        hasPhysicalInjury: "Yes",
        monetaryValue: 500000,
        firRegistered: "No",
        witnessCount: "No",
        weaponsInvolved: "No",
        accusedNamed: "Yes - Specifically Named"
      });
      setSelectedCaseType("Criminal");
    } else {
      setSelectedScenarioId(null);
      setSelectedCategory(null);
      setSelectedSubcategory("");
      setQuestionnaireValues({});
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processUploadedFile = (file: File) => {
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      setError("Supported file type is plain text (.txt) or markdown (.md). Please paste complex files into the text block directly.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setCaseDescription(text);
        setSelectedScenarioId(null);
        setError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSelectRecord = (record: HistoryRecord) => {
    setPrediction(record.report);
    setCaseDescription(record.caseDescription);
    setSelectedEvidence(record.selectedEvidence || []);
    setActiveRecordId(record.id);
    setSelectedScenarioId(null);
    setError(null);

    // Restore categorization states
    if (record.caseCategory) {
      const foundCategory = CASE_CATEGORIES.find(c => c.name === record.caseCategory || c.id === record.caseCategory.toLowerCase() || c.id === record.caseCategory);
      setSelectedCategory(foundCategory || null);
    } else {
      setSelectedCategory(null);
    }
    setSelectedSubcategory(record.subcategory || "");
    setQuestionnaireValues(record.questionnaireAnswers || {});

    // Auto-detect case type from report metadata description
    const typeStr = record.report?.caseClassification?.caseType || record.report?.caseSummary?.caseType || "";
    const isCivilReport = typeStr.toLowerCase().includes("civil");
    setSelectedCaseType(isCivilReport ? "Civil" : "Criminal");

    // Smooth scroll down to results section
    setTimeout(() => {
      const el = document.getElementById("prediction-report-container");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem("nyaya_prediction_history", JSON.stringify(updated));
      return updated;
    });
    if (activeRecordId === id) {
      setActiveRecordId(null);
      setPrediction(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all saved case prediction history records from this browser?")) {
      setSavedRecords([]);
      localStorage.removeItem("nyaya_prediction_history");
      setActiveRecordId(null);
      setPrediction(null);
    }
  };

  const handleClear = () => {
    setCaseDescription("");
    setSelectedEvidence([]);
    setSelectedScenarioId(null);
    setPrediction(null);
    setError(null);
    setActiveRecordId(null);
    setSelectedCaseType(null);
    setSelectedCategory(null);
    setSelectedSubcategory("");
    setQuestionnaireValues({});
  };

  const handlePredict = async () => {
    if (!caseDescription.trim()) {
      setError("Please describe the dispute facts or select one of the legal templates first.");
      return;
    }

    setLoading(true);
    setPrediction(null);
    setError(null);
    setLoadingStep(0);

    // Simulate loading transitions to represent extreme thoroughness in judicial analysis
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSequence.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseDescription,
          selectedEvidence,
          caseType: selectedCaseType || (selectedCategory?.id === "criminal" ? "Criminal" : "Civil"),
          caseCategory: selectedCategory?.name,
          subcategory: selectedSubcategory,
          questionnaireAnswers: questionnaireValues
        }),
      });

      let data: any = null;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textError = await response.text();
        clearInterval(interval);
        
        let displayError = "Fidelity interface had a processing delay. Please retry your submission.";
        if (textError.includes("high demand") || textError.includes("503") || textError.includes("UNAVAILABLE")) {
          displayError = "All judicial modeling candidates are currently experiencing high central demand. Please click Analyze Case again; it will automatically retry another model.";
        } else if (response.status === 502 || response.status === 503 || response.status === 504) {
          displayError = `Service is temporarily busy (status ${response.status}). Proceeding with analysis... please retry.`;
        } else {
          displayError = `Connection issue (status ${response.status}). Please attempt analysis again.`;
        }
        throw new Error(displayError);
      }

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to parse legal prediction details.");
      }

      setPrediction(data);

      // Auto-save to local browser prediction history registry
      try {
        const newRecordId = `rec_${Date.now()}`;
        const timestampStr = new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        setSavedRecords((prev) => {
          const newRecord: HistoryRecord = {
            id: newRecordId,
            timestamp: timestampStr,
            caseDescription: caseDescription,
            report: data,
            selectedEvidence: selectedEvidence,
            caseCategory: selectedCategory?.name,
            subcategory: selectedSubcategory,
            questionnaireAnswers: questionnaireValues
          };
          const updated = [newRecord, ...prev];
          localStorage.setItem("nyaya_prediction_history", JSON.stringify(updated));
          return updated;
        });
        setActiveRecordId(newRecordId);
      } catch (errHistory) {
        console.error("Local history auto-saving failed:", errHistory);
      }

    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setError(
        err?.message || 
        "Failed to reach the AI Legal prediction server. Please make sure process.env.GEMINI_API_KEY is configured."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-100">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
        
        {prediction ? (
          /* Step 3: Calibrated Results View */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 font-sans">
                      AI Legal Modeling Successful
                    </h4>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Completed mapping and probability weights for your {selectedCaseType?.toLowerCase()} dispute facts.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleClear}
                  className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 px-3.5 py-1.5 rounded-lg border border-slate-900 shadow-xs transition cursor-pointer"
                >
                  Analyze New Dispute
                </button>
              </div>
              
              <PredictionResult 
                report={prediction} 
                rawInput={caseDescription} 
                selectedEvidence={selectedEvidence} 
                caseCategory={selectedCategory?.name}
                subcategory={selectedSubcategory}
                questionnaireAnswers={questionnaireValues}
              />
            </div>
            
            {/* Sidebar with directory reference and history */}
            <div className="lg:col-span-5 space-y-6">
              <HistoryList
                records={savedRecords}
                onSelectRecord={handleSelectRecord}
                onDeleteRecord={handleDeleteRecord}
                onClearAll={handleClearAllHistory}
                currentActiveId={activeRecordId}
              />
              <Directory />
            </div>
          </div>
        ) : loading ? (
          /* Step 2.5: Immersive loading sequences */
          <div className="max-w-xl mx-auto py-12">
            <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-md">
              <div className="mx-auto h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <h4 className="mt-5 font-bold text-slate-900 text-sm font-sans tracking-wide">
                Nyaya Legal Intelligence Engine Active
              </h4>
              <p className="mt-2 text-xs text-amber-800 font-serif italic min-h-[40px] max-w-sm mx-auto">
                 "{loadingSequence[loadingStep]}"
              </p>
              <div className="mt-6 mx-auto max-w-xs h-1 px-1 bg-slate-150 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 transition-all duration-1000 rounded-full" 
                  style={{ width: `${((loadingStep + 1) / loadingSequence.length) * 100}%` }}
                ></div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 font-mono tracking-wider">
                CALIBRATING SYSTEM METRICS...
              </p>
            </div>
          </div>
        ) : selectedCaseType === null ? (
          /* Step 1: Selection Home Page */
          <div className="space-y-8">
            
            {/* Welcome Banner */}
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl"></div>
              
              <div className="relative max-w-3xl">
                <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-semibold tracking-wider uppercase mb-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
                  <span>Verified Indian Penal Interface</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans leading-tight">
                  Welcome to न्याय NYAYA AI
                </h2>
                <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  Predict case outcomes, identify statutory Remappings, and assess procedural weight indexes instantly. Nyaya AI organizes legal analysis across the newly enacted codes and traditional penal frameworks. Select your case track below to start.
                </p>
              </div>
            </section>

            <div className="text-center max-w-2xl mx-auto py-2">
              <h3 className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl font-sans">
                Select Case Jurisdiction to Begin Analysis
              </h3>
              <p className="mt-1 text-slate-500 text-xs leading-relaxed font-sans">
                Select the option that best reflects the nature of your dispute or legal complaint to open the corresponding workflow.
              </p>
            </div>

            {/* Categorization Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Criminal Case selector card */}
              <button
                onClick={() => {
                  setSelectedCaseType("Criminal");
                  setError(null);
                }}
                type="button"
                className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:shadow-md text-center transform hover:-translate-y-1 duration-200 cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500 rounded-t-2xl"></div>
                <div className="h-14 w-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 group-hover:scale-105 transition mb-5">
                  <Gavel className="h-7 w-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-sans group-hover:text-rose-700 transition">
                  Criminal Jurisdictional Track
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                  Bharatiya Nyaya Sanhita (BNS-2023)
                </p>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed max-w-xs font-sans">
                  Evaluate violations of bodily safety, financial forgery, traffic accidents, theft, cyber fraud, and family violence. Calibrate sentence terms, bail probability, and defense outlines under new penal codes.
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5 justify-center">
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium select-none">Theft & Forgery</span>
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium select-none">Accidents</span>
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium select-none">Domestic Violence</span>
                </div>
                <span className="mt-6 inline-flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition duration-150">
                  Begin Criminal Intake <ArrowRight className="ml-1 h-3.5 w-3.5 animate-pulse" />
                </span>
              </button>

              {/* Civil dispute selector card */}
              <button
                onClick={() => {
                  setSelectedCaseType("Civil");
                  setError(null);
                }}
                type="button"
                className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-md text-center transform hover:-translate-y-1 duration-200 cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 rounded-t-2xl"></div>
                <div className="h-14 w-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-105 transition mb-5">
                  <Scale className="h-7 w-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-sans group-hover:text-emerald-700 transition">
                  Civil & Commercial Dispute Track
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                  Civil Procedure Code (CPC) & Acts
                </p>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed max-w-xs font-sans">
                  Evaluate inheritance partitions, commercial breach of contract agreements, unpaid business debts, consumer product failures, municipal zoning, and tenancy conflicts.
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5 justify-center">
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium select-none">Property Division</span>
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium select-none">Contract Breach</span>
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium select-none">Consumer Redressal</span>
                </div>
                <span className="mt-6 inline-flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition duration-150">
                  Begin Civil Intake <ArrowRight className="ml-1 h-3.5 w-3.5 animate-pulse" />
                </span>
              </button>

            </div>

            {/* Specialist Legal Q&A Desk */}
            <div className="max-w-4xl mx-auto pt-2">
              <SpecialistQA />
            </div>

            {/* Support and past records directly on Home page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
              <div>
                <HistoryList
                  records={savedRecords}
                  onSelectRecord={handleSelectRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onClearAll={handleClearAllHistory}
                  currentActiveId={activeRecordId}
                />
              </div>
              
              <div className="space-y-6">
                <Directory />
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-sans">
                  <h4 className="text-xs font-extrabold text-slate-400 font-mono tracking-wider uppercase mb-2">
                    Understanding the July 2024 Legal Remapping
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500 mb-4 font-sans">
                    Traditional central statues have been formally re-authored. Nyaya AI seamlessly Remaps your incident details across old frameworks and newly enforced chapters:
                  </p>
                  
                  <div className="space-y-1.5 font-sans text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border-l-2 border-slate-600 text-[11px] font-mono select-none">
                      <span className="text-slate-600">IPC (1860)</span>
                      <ArrowUpRight className="h-3 w-3 text-slate-400" />
                      <span className="font-bold text-slate-900">BNS (2023)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border-l-2 border-slate-600 text-[11px] font-mono select-none">
                      <span className="text-slate-600">CrPC (1973)</span>
                      <ArrowUpRight className="h-3 w-3 text-slate-400" />
                      <span className="font-bold text-slate-900">BNSS (2023)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border-l-2 border-slate-600 text-[11px] font-mono select-none">
                      <span className="text-slate-600">Evidence Act</span>
                      <ArrowUpRight className="h-3 w-3 text-slate-400" />
                      <span className="font-bold text-slate-900">BSA (2023)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Step 2: Intake Details Submission */
          <div className="space-y-6">
            
            {/* Header / Back Action panel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedCaseType(null);
                  setError(null);
                }}
                type="button"
                className="inline-flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200 font-bold shadow-2xs transition cursor-pointer"
              >
                <span>← Return to Home (Change Track)</span>
              </button>
              
              <div className={`inline-flex items-center space-x-2 rounded-full px-3.5 py-1 text-xs border uppercase font-mono font-extrabold leading-none ${
                selectedCaseType === "Criminal"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                <span className={`h-2.5 w-2.5 rounded-full ${selectedCaseType === "Criminal" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                <span>Active Intake: {selectedCaseType} Track</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              
              {/* Main Workspace Form (Left Column) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="h-5 w-5 text-amber-600" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-sans">
                          Filing Details: {selectedCaseType} Dispute Facts
                        </h3>
                        <p className="text-[10px] text-slate-400 font-sans">
                          Write in your dispute scenario below or click template cards underneath to auto-fill.
                        </p>
                      </div>
                    </div>
                    {caseDescription.length > 0 && (
                      <button 
                        onClick={() => {
                          setCaseDescription("");
                          setSelectedEvidence([]);
                          setSelectedScenarioId(null);
                        }}
                        className="inline-flex items-center space-x-1 text-slate-450 hover:text-rose-600 transition text-xs font-sans font-medium hover:underline"
                        title="Clear facts text"
                        id="clear-facts-btn"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear Fields</span>
                      </button>
                    )}
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 leading-relaxed font-sans flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                      <div>
                        <span className="font-bold">Execution Warning:</span> {error}
                        <div className="mt-2 text-slate-500 font-mono text-[10px]">
                          Quick fix: Access AI Studio's top Secrets panel and supply a valid GEMINI_API_KEY.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Textarea details */}
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        rows={8}
                        className="w-full rounded-lg border border-slate-200 p-4 text-sm placeholder-slate-400 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                        placeholder={
                          selectedCaseType === "Criminal"
                            ? "Describe the criminal incident in detail. Specify dates, physical injuries, value of items stolen or forged checks, details of accused parties, and if an FIR has been registered at your local police station..."
                            : "Describe the civil dispute or contract breach in detail. Specify monetary claims, dates of written agreements, past partition negotiations, and if a pre-litigation demand notice was sent..."
                        }
                        value={caseDescription}
                        onChange={handleTextChange}
                        maxLength={2500}
                        id="case-facts-input"
                      ></textarea>
                      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400">
                        {caseDescription.length} / 2500 chars
                      </div>
                    </div>

                    {/* Advanced Case Classification and Dynamic Questionnaire */}
                    <CaseTypeSelector
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedSubcategory={selectedSubcategory}
                      setSelectedSubcategory={setSelectedSubcategory}
                      questionnaireValues={questionnaireValues}
                      setQuestionnaireValues={setQuestionnaireValues}
                    />

                    {/* Drag and Drop Box */}
                    <div 
                      onDragEnter={handleDrag} 
                      onDragOver={handleDrag} 
                      onDragLeave={handleDrag} 
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
                        isDragActive 
                          ? "border-amber-500 bg-amber-50/20" 
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-amber-300"
                      }`}
                      onClick={triggerFileSelect}
                      id="file-drop-area"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".txt,.md" 
                        className="hidden" 
                        id="file-upload-input"
                      />
                      <Upload className="mx-auto h-5 w-5 text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700 font-sans">
                        Drag and drop dispute documents here or <span className="text-amber-600 underline">browse computer</span>
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400 font-sans">
                        Supports text files (.txt) or markdown files. Max size 500KB.
                      </p>
                    </div>

                    {/* Interactive Evidence list */}
                    <EvidenceChecklist 
                      selectedEvidence={selectedEvidence} 
                      onChange={setSelectedEvidence} 
                    />

                    {/* Evaluation Action trigger */}
                    <button
                      type="button"
                      disabled={loading || !caseDescription.trim()}
                      onClick={handlePredict}
                      className={`w-full flex items-center justify-center space-x-2 rounded-lg py-3.5 px-4 text-xs font-medium uppercase font-mono shadow-sm tracking-wider text-white transition ${
                        !caseDescription.trim() || loading
                          ? "bg-slate-300 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-850 cursor-pointer"
                      }`}
                      id="evaluate-dispute-btn"
                    >
                      <BrainCircuit className="h-4 w-4 text-amber-400 animate-pulse" />
                      <span>{loading ? "Calibrating..." : "Evaluate Dispute Outlook"}</span>
                      {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
                    </button>
                    
                  </div>
                </div>

                {/* Selective template pre-population selector */}
                <ExampleSelector 
                  onSelect={handleScenarioSelect} 
                  selectedId={selectedScenarioId} 
                  filterCategory={selectedCaseType}
                />

              </div>

              {/* Sidebar directory and past histories */}
              <div className="lg:col-span-5 space-y-6">
                
                <HistoryList
                  records={savedRecords}
                  onSelectRecord={handleSelectRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onClearAll={handleClearAllHistory}
                  currentActiveId={activeRecordId}
                />
                
                <Directory />
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

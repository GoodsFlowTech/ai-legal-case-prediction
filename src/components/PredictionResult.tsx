import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { 
  Scale, 
  Gavel, 
  ShieldAlert, 
  CheckCircle, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Lock, 
  Unlock, 
  Coins, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  BookOpen,
  Copy,
  Check,
  Share2,
  FileCheck
} from "lucide-react";
import { PredictionReport } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white shadow-md font-sans">
        <p className="font-bold text-slate-100">{data.name}</p>
        <p className="text-amber-400 font-mono text-xs mt-0.5">{data.percentage}% Probability</p>
      </div>
    );
  }
  return null;
};

interface PredictionResultProps {
  report: PredictionReport;
  rawInput: string;
  selectedEvidence?: string[];
  caseCategory?: string;
  subcategory?: string;
  questionnaireAnswers?: Record<string, any>;
}

export default function PredictionResult({
  report,
  rawInput,
  selectedEvidence = [],
  caseCategory,
  subcategory,
  questionnaireAnswers
}: PredictionResultProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
    step5: true,
  });

  const [copied, setCopied] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "radar">("bar");
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [shareCopied, setShareCopied] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const encodeShareState = (data: any) => {
    try {
      const jsonStr = JSON.stringify(data);
      const bytes = new TextEncoder().encode(jsonStr);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      return btoa(binString);
    } catch (e) {
      console.error("Encoding of sharing state failed", e);
      return "";
    }
  };

  const handleShare = () => {
    try {
      const shareData = {
        caseDescription: rawInput,
        report: report,
        selectedEvidence: selectedEvidence,
        caseCategory,
        subcategory,
        questionnaireAnswers
      };
      const encoded = encodeShareState(shareData);
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      setShareUrl(url);
      
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setShowShareBanner(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link directly", e);
      setShowShareBanner(true);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let y = 20;
      const margin = 15;
      const contentWidth = 180;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      const setSectionHeader = () => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // slate-900
      };

      const setBodyBold = () => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // slate-700
      };

      const setBodyText = () => {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // slate-600
      };

      const setMutedText = () => {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-500
      };

      const writeWrappedText = (text: string, maxW: number = contentWidth) => {
        const lines = doc.splitTextToSize(text, maxW);
        lines.forEach((line: string) => {
          checkPageOverflow(5);
          doc.text(line, margin, y);
          y += 5;
        });
      };

      // Header Banner Background
      doc.setFillColor(15, 23, 42); // slate-950
      doc.rect(margin, y, contentWidth, 24, "F");

      // Title inside Banner
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("NYAYA LEGAL AI • ASSESSMENT REPORT", margin + 8, y + 10);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text("INDIAN PENAL DIRECTORY & CASE OUTLOOK PREDICTIONS", margin + 8, y + 16);

      y += 30;

      // Metadata Info Box
      setMutedText();
      doc.text(`Generated on: ${new Date().toLocaleDateString()} • Ref ID: NY-${Math.floor(100000 + Math.random() * 900000)}`, margin, y);
      y += 6;

      // Primary metrics horizontal bar
      const boxExtraHeight = (caseCategory ? 6 : 0) + (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0 ? 12 : 0);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, y, contentWidth, 30 + boxExtraHeight, "FD");

      // Fill info keys inside the box
      y += 6;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("CASE TRACK:", margin + 6, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.text(report.caseClassification.caseType.replace(" CASE", "").trim(), margin + 50, y);

      if (caseCategory) {
        y += 6;
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("CLASSIFICATION:", margin + 6, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont("Helvetica", "bold");
        doc.text(`${caseCategory}` + (subcategory ? ` — ${subcategory}` : ""), margin + 50, y);
      }

      if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
        y += 6;
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("RECORDED SPECIFICS:", margin + 6, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        const ansSummary = Object.entries(questionnaireAnswers)
          .filter(([_, val]) => val !== undefined && val !== null && val !== "")
          .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${v}`)
          .join(" | ");
        const summaryLines = doc.splitTextToSize(ansSummary, contentWidth - 58);
        doc.text(summaryLines[0] || "", margin + 50, y);
        if (summaryLines[1]) {
          y += 4;
          doc.text(summaryLines[1] + (summaryLines[2] ? "..." : ""), margin + 50, y);
        }
        doc.setFontSize(8.5); // restore
      }

      y += 6;
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("RELEVANT LAW:", margin + 6, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      const lawText = report.caseSummary.primaryCharge.length > 55
        ? report.caseSummary.primaryCharge.substring(0, 52) + "..."
        : report.caseSummary.primaryCharge;
      doc.text(lawText, margin + 50, y);

      y += 6;
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("RECOMMENDED COURT:", margin + 6, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.text(report.caseSummary.recommendedCourt, margin + 50, y);

      y += 12 + (boxExtraHeight > 10 ? 8 : 12);

      // ------------------------------------
      // Calibration Metrics Block
      // ------------------------------------
      checkPageOverflow(35);
      setSectionHeader();
      doc.text("CALIBRATED TRIAL PROBABILITIES", margin, y);
      y += 4;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      // Draw three probability boxes side-by-side
      const boxWidth = 56;
      const boxHeight = 16;

      // Conviction Box
      doc.setDrawColor(254, 205, 211); // rose-200
      doc.setFillColor(255, 241, 242); // rose-50
      doc.rect(margin, y, boxWidth, boxHeight, "FD");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text("CONVICTION", margin + 4, y + 5);
      doc.setFontSize(11);
      doc.text(`${report.caseSummary.convictionPercent}%`, margin + 4, y + 11);

      // Acquittal Box
      doc.setDrawColor(167, 243, 208); // emerald-250
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.rect(margin + 62, y, boxWidth, boxHeight, "FD");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("ACQUITTAL", margin + 62 + 4, y + 5);
      doc.setFontSize(11);
      doc.text(`${report.caseSummary.acquittalPercent}%`, margin + 62 + 4, y + 11);

      // Bail Box
      doc.setDrawColor(186, 230, 253); // sky-200
      doc.setFillColor(240, 249, 255); // sky-50
      doc.rect(margin + 124, y, boxWidth, boxHeight, "FD");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(3, 105, 161); // sky-700
      doc.text("BAIL PROBABILITY", margin + 124 + 4, y + 5);
      doc.setFontSize(11);
      const isConsumer = report.caseSummary.primaryCharge.toLowerCase().includes("consumer");
      doc.text(isConsumer ? "N/A" : `${report.caseSummary.bailProbability}%`, margin + 124 + 4, y + 11);

      y += boxHeight + 8;

      // Sentence Range
      checkPageOverflow(12);
      setBodyBold();
      doc.text("AI-Predicted Sentence Range: ", margin, y);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(report.expectedPunishment.mostLikelySentence || "Nominal Sentence/Fine Assessment", margin + 50, y);
      y += 8;

      // Clean line divider
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, margin + contentWidth, y);
      y += 8;

      // ------------------------------------
      // 1. Executive Summary
      // ------------------------------------
      checkPageOverflow(25);
      setSectionHeader();
      doc.text("1. EXECUTIVE LEGAL CLASSIFICATION", margin, y);
      y += 6;
      setBodyText();
      writeWrappedText(report.caseClassification.explanation);
      y += 6;

      // ------------------------------------
      // 2. Applicable Laws and Sections
      // ------------------------------------
      checkPageOverflow(30);
      setSectionHeader();
      doc.text("2. APPLICABLE LAWS AND SECTIONS", margin, y);
      y += 6;

      report.applicableLaws.forEach((law, idx) => {
        checkPageOverflow(30);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(180, 83, 9); // amber-700
        doc.text(`${idx + 1}. ${law.sectionNumber} — ${law.actName}`, margin, y);
        y += 5;

        setBodyText();
        doc.setFont("Helvetica", "bold");
        doc.text("Scope: ", margin, y);
        doc.setFont("Helvetica", "normal");
        doc.text(law.covers, margin + 15, y);
        y += 5;

        doc.setFont("Helvetica", "bold");
        doc.text("Punishment: ", margin, y);
        doc.setFont("Helvetica", "normal");
        const punishmentLines = doc.splitTextToSize(law.punishment, contentWidth - 25);
        punishmentLines.forEach((pLine: string) => {
          checkPageOverflow(5);
          doc.text(pLine, margin + 22, y);
          y += 5;
        });

        doc.setFont("Helvetica", "bold");
        doc.text(`Bail: ${law.bailability} | Cognizance: ${law.cognizability}`, margin, y);
        y += 5;

        doc.setFont("Helvetica", "bold");
        doc.text("Analysis:", margin, y);
        y += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFillColor(248, 250, 252);
        
        // Wrap & draw section analysis
        const analysisLines = doc.splitTextToSize(law.analysis, contentWidth - 10);
        doc.rect(margin, y - 1, contentWidth, (analysisLines.length * 4.5) + 3, "F");
        
        analysisLines.forEach((aLine: string) => {
          checkPageOverflow(5);
          doc.text(aLine, margin + 4, y + 2);
          y += 4.5;
        });
        y += 6;
      });

      // ------------------------------------
      // 3. Charge Prediction Outlets
      // ------------------------------------
      checkPageOverflow(35);
      setSectionHeader();
      doc.text("3. DETAILED TRIAL CHARGE OUTLOOK", margin, y);
      y += 6;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text("Primary Charge:", margin, y);
      doc.setFont("Helvetica", "normal");
      doc.text(report.chargePrediction.primaryCharge, margin + 35, y);
      y += 5;

      doc.setFont("Helvetica", "bold");
      doc.text("Status Forecast:", margin, y);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(
        report.chargePrediction.likelyFramedOrDropped.includes("FRAMED") ? 180 : 5,
        report.chargePrediction.likelyFramedOrDropped.includes("FRAMED") ? 83 : 150,
        report.chargePrediction.likelyFramedOrDropped.includes("FRAMED") ? 9 : 105
      );
      doc.text(report.chargePrediction.likelyFramedOrDropped, margin + 35, y);
      y += 5;

      setBodyBold();
      doc.text("Secondary Charges:", margin, y);
      doc.setFont("Helvetica", "normal");
      doc.text(report.chargePrediction.supportingCharges.length > 0 ? report.chargePrediction.supportingCharges.join(", ") : "No supporting charges expected.", margin + 35, y);
      y += 5;

      setBodyBold();
      doc.text("Framing Rationale:", margin, y);
      y += 5;
      setBodyText();
      writeWrappedText(report.chargePrediction.reasoning);
      y += 6;

      // ------------------------------------
      // 4. Strategic Defense Outlines
      // ------------------------------------
      checkPageOverflow(30);
      setSectionHeader();
      doc.text("4. RECOMMENDED ADVERSARIAL STRATEGIES", margin, y);
      y += 6;

      report.defenseStrategies.forEach((strategy, index) => {
        checkPageOverflow(20);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`• Defense ${index + 1}: ${strategy.title}`, margin, y);
        y += 5;

        setBodyText();
        writeWrappedText(strategy.description, contentWidth - 10);
        y += 3;
      });
      y += 4;

      // ------------------------------------
      // Evidentiary checklist
      // ------------------------------------
      if (selectedEvidence && selectedEvidence.length > 0) {
        checkPageOverflow(20);
        setSectionHeader();
        doc.text("5. INTEGRATED PROOF INVENTORY", margin, y);
        y += 6;
        setBodyBold();
        doc.text("The following credentials and evidences were algorithmically assessed:", margin, y);
        y += 5;
        
        selectedEvidence.forEach(ev => {
          checkPageOverflow(5);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(5, 150, 105); // emerald-600
          doc.text("[✓] ", margin, y);
          doc.setTextColor(51, 65, 85);
          doc.text(ev, margin + 8, y);
          y += 5;
        });
        y += 4;
      }

      // ------------------------------------
      // Legal Disclaimer
      // ------------------------------------
      checkPageOverflow(25);
      y += 4;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 22, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("LEGAL DISCLAIMER", margin + 6, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      
      const disclaimerTxt = "This assessment report is an informational projection compiled by AI modeling under newly-enforced Indian progressive codes. It is strictly not equivalent to custom expert counsel. It does not establish an attorney-client relationship. Please correspond directly with a qualified advocate under your respective bar listing to proceed with any formal court filings.";
      const discLines = doc.splitTextToSize(disclaimerTxt, contentWidth - 12);
      discLines.forEach((dl: string) => {
        doc.text(dl, margin + 6, y + 11);
        y += 3.5;
      });
      
      // Save PDF file
      doc.save(`Nyaya_Assessment_Report_${Date.now()}.pdf`);
    } catch (e) {
      console.error("PDF download crashed!", e);
    }
  };

  const handleCopyToClipboard = () => {
    const textReport = `
AI Legal Assessment (Informational Only)

Case Type: ${report.caseClassification.caseType.replace(" CASE", "").trim()}
Relevant Law: ${report.caseSummary.primaryCharge}

AI-Estimated Conviction Probability: ${report.caseSummary.convictionPercent}%
AI-Estimated Acquittal Probability: ${report.caseSummary.acquittalPercent}%
AI-Estimated Bail Probability: ${report.caseSummary.primaryCharge.toLowerCase().includes("consumer") ? "N/A" : `${report.caseSummary.bailProbability}%`}

AI-Predicted Sentence Range: ${report.expectedPunishment.mostLikelySentence || "Nominal Sentence/Fine Assessment"}

Recommended Court: ${report.caseSummary.recommendedCourt}

Disclaimer: These predictions are generated by an AI model for informational purposes only and do not constitute legal advice or reflect actual court decisions.

==================================================
        FULL NYAYA LEGAL AI PREDICTION REPORT
==================================================
Date generated : ${new Date().toLocaleDateString()}

--------------------------------------------------
1. CASE CLASSIFICATION
--------------------------------------------------
Type       : ${report.caseClassification.caseType}
Explanation: ${report.caseClassification.explanation}

--------------------------------------------------
2. APPLICABLE LAWS AND SECTIONS
--------------------------------------------------
${report.applicableLaws.map((law, index) => `${index + 1}. ${law.sectionNumber} - ${law.actName}
   Covers     : ${law.covers}
   Punishment : ${law.punishment}
   Bailability: ${law.bailability} | Cognizability: ${law.cognizability}
   Analysis   : ${law.analysis}`).join('\n\n')}

--------------------------------------------------
3. CHARGE PREDICTION
--------------------------------------------------
Primary Charge    : ${report.chargePrediction.primaryCharge}
Supporting Charges: ${report.chargePrediction.supportingCharges.join(', ')}
Status Prediction : ${report.chargePrediction.likelyFramedOrDropped}
Reasoning         : ${report.chargePrediction.reasoning}

--------------------------------------------------
4. CONVICTION & TRIAL PROBABILITIES
--------------------------------------------------
Conviction Probability: ${report.probabilityAnalysis.convictionProbability}%
Acquittal Probability : ${report.probabilityAnalysis.acquittalProbability}%
Bail Grant Probability: ${report.probabilityAnalysis.bailProbability}%
Jail Term Probability : ${report.probabilityAnalysis.jailProbability}%
Key Drivers           :
${report.probabilityAnalysis.keyFactors.map((f) => ` * ${f}`).join('\n')}

--------------------------------------------------
5. EXPECTED PUNISHMENT RANGE
--------------------------------------------------
Minimum Sentence  : ${report.expectedPunishment.minimumSentence}
Maximum Sentence  : ${report.expectedPunishment.maximumSentence}
Likely Sentence   : ${report.expectedPunishment.mostLikelySentence}
Imprisonment Type : ${report.expectedPunishment.imprisonmentType}
Parole Likelihood : ${report.expectedPunishment.paroleLikelihood}

--------------------------------------------------
6. BAIL PREDICTIONS
--------------------------------------------------
Offense Class     : ${report.bailPrediction.isBailable}
Anticipatory Bail : ${report.bailPrediction.anticipatoryBailApplicability}
Regular Bail App  : ${report.bailPrediction.regularBailApplicability}
Estimated Bond    : ${report.bailPrediction.estimatedBailAmount}
Verdict Outcome   : ${report.bailPrediction.verdict}
Safety Conditions :
${report.bailPrediction.likelyConditions.map((c) => ` * ${c}`).join('\n')}

--------------------------------------------------
7. CIVIL REMEDIES OUTCOME (If Applicable)
--------------------------------------------------
Remedy Type       : ${report.civilOutcome.remedy}
Competent Court   : ${report.civilOutcome.likelyCourt}
Compensation      : ${report.civilOutcome.compensationRange}
Timeline          : ${report.civilOutcome.timeToResolution}
Civil Win%        : ${report.civilOutcome.winProbability}%

--------------------------------------------------
8. STRATEGIC DEFENSE RECOMMENDATIONS
--------------------------------------------------
${report.defenseStrategies.map((def, idx) => `[Defense #${idx + 1}] ${def.title}
   Details: ${def.description}`).join('\n\n')}

--------------------------------------------------
9. LEGAL SUMMARY CARD
--------------------------------------------------
+-------------------------------------------------+
|             CASE PREDICTION SUMMARY             |
+-------------------------------------------------+
| Case Type         : ${report.caseSummary.caseType.padEnd(28)}|
| Primary Charge    : ${report.caseSummary.primaryCharge.padEnd(28)}|
| Conviction %      : ${(report.caseSummary.convictionPercent.toString() + '%').padEnd(28)}|
| Acquittal %       : ${(report.caseSummary.acquittalPercent.toString() + '%').padEnd(28)}|
| Bail Probability  : ${(report.caseSummary.bailProbability.toString() + '%').padEnd(28)}|
| Expected Sentence : ${report.caseSummary.expectedSentence.padEnd(28)}|
| Fine Range        : ${report.caseSummary.fineRange.padEnd(28)}|
| Recommended Court : ${report.caseSummary.recommendedCourt.padEnd(28)}|
+-------------------------------------------------+

⚠️ LEGAL DISCLAIMER:
This report is generated by a server-side AI model trained on patterns in Indian central laws (BNS, IPC, CrPC, BNSS, CPC). It is NOT official advice. Please seek help from a registered advocate of your regional bar council.
`;
    navigator.clipboard.writeText(textReport.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper colors based on case type
  const isCriminal = report.caseClassification.caseType.includes("CRIMINAL");
  const isCivil = report.caseClassification.caseType.includes("CIVIL");
  
  const emblemBg = isCriminal 
    ? "bg-rose-50 border-rose-200 text-rose-800" 
    : isCivil 
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-indigo-50 border-indigo-200 text-indigo-800";

  return (
    <div className="space-y-6" id="prediction-report-container">
      {/* Visual Executive Digest - Exactly matches requested user format with premium visual design */}
      <div className="rounded-xl border-2 border-slate-900 bg-white shadow-md overflow-hidden font-sans">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Scale className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
              AI Legal Assessment (Informational Only)
            </h2>
          </div>
          <span className="hidden sm:inline-block text-[9.5px] font-mono text-slate-400 border border-slate-800 rounded px-2 py-0.5">
            System Calibrated
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Info Column */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Case Track Class
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-2 ${isCriminal ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                  {report.caseClassification.caseType.replace(" CASE", "")}
                </span>
              </div>

              {caseCategory && (
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                    User Categorization
                  </span>
                  <span className="font-bold text-amber-900 text-sm">
                    {caseCategory} {subcategory ? `— ${subcategory}` : ''}
                  </span>
                </div>
              )}

              {questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0 && (
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Verified Specific Case Facts
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 bg-slate-50/70 p-2.5 rounded-lg border border-slate-150">
                    {Object.entries(questionnaireAnswers)
                      .filter(([_, val]) => val !== undefined && val !== null && val !== "")
                      .map(([key, val]) => {
                        const formattedKey = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase());
                        return (
                          <div key={key} className="text-[10px] leading-tight flex justify-between gap-2 border-b border-slate-100 last:border-none pb-1 last:pb-0">
                            <span className="text-slate-500 font-medium shrink-0">{formattedKey}:</span>
                            <span className="font-bold text-slate-700 text-right">{String(val)}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Relevant Law
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {report.caseSummary.primaryCharge}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Recommended Court
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {report.caseSummary.recommendedCourt}
                </span>
              </div>
            </div>

            {/* Right Metrics Column */}
            <div className="space-y-4">
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-150 relative overflow-hidden">
                <span className="text-[11.5px] font-mono uppercase tracking-wider text-slate-500 block mb-2.5 border-b border-slate-200/50 pb-1">
                  Calibrated Trial Probabilities
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg border border-rose-200/60 p-2 shadow-2xs">
                    <span className="text-[9.5px] font-bold text-rose-600 block leading-tight">Conviction</span>
                    <span className="font-mono text-base font-extrabold text-rose-700 leading-none block mt-1">
                      {report.caseSummary.convictionPercent}%
                    </span>
                  </div>
                  <div className="bg-white rounded-lg border border-emerald-200/60 p-2 shadow-2xs">
                    <span className="text-[9.5px] font-bold text-emerald-600 block leading-tight">Acquittal</span>
                    <span className="font-mono text-base font-extrabold text-emerald-700 leading-none block mt-1">
                      {report.caseSummary.acquittalPercent}%
                    </span>
                  </div>
                  <div className="bg-white rounded-lg border border-sky-100/80 p-2 shadow-2xs">
                    <span className="text-[9.5px] font-bold text-sky-600 block leading-tight">Bail Grant</span>
                    <span className="font-mono text-base font-extrabold text-sky-700 leading-none block mt-1">
                      {report.caseSummary.primaryCharge.toLowerCase().includes("consumer") ? "N/A" : `${report.caseSummary.bailProbability}%`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  AI-Predicted Sentence Range
                </span>
                <span className="font-bold text-amber-900 text-xs uppercase tracking-wide">
                  {report.expectedPunishment.mostLikelySentence || "Nominal Sentence/Fine Assessment"}
                </span>
                {report.caseSummary.fineRange && report.caseSummary.fineRange !== "N/A" && (
                  <span className="text-[11px] text-slate-500 block">
                    Financing/Costs calibration: {report.caseSummary.fineRange}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formatted Legal Disclaimer block in high contrast */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 leading-relaxed font-sans">
          <span className="font-bold text-slate-700 uppercase tracking-widest text-[9.5px] font-mono block mb-1">
            Disclaimer
          </span>
          These predictions are generated by an AI model for informational purposes only and do not constitute legal advice or reflect actual court decisions.
        </div>
      </div>

      {/* Overview Card */}
      <div className={`rounded-xl border p-6 bg-white shadow-sm print:shadow-none print:border-slate-300`}>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-5">
          <div>
            <div className={`inline-flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${emblemBg}`}>
              <span className="h-2 w-2 rounded-full bg-current animate-pulse"></span>
              <span>{report.caseClassification.caseType}</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 font-sans leading-tight">
              Indian Legal Intelligence Report
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Ref ID: NY-{Math.floor(100000 + Math.random() * 900000)} • System Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none"
              title="Generate a unique shareable link for this case report"
              id="share-link-btn"
            >
              {shareCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              <span>{shareCopied ? "Link Copied!" : "Share Report"}</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none"
              title="Copy details as plain-text"
              id="copy-text-btn"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied!" : "Copy Report"}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-600 focus:outline-none shadow-sm cursor-pointer"
              id="download-pdf-btn"
              title="Download high-quality PDF assessment report directly"
            >
              <Download className="h-4 w-4" />
              <span>Download Report as PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none shadow-2xs cursor-pointer"
              id="print-pdf-btn"
              title="Open browser print utility"
            >
              <Printer className="h-4 w-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Dynamic Shared Link Banner */}
        {showShareBanner && (
          <div className="my-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans print:hidden">
            <div className="flex items-start space-x-2.5">
              <Share2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">Shareable Intelligence Link Generated!</p>
                <p className="text-[11px] text-slate-500">Anyone with this link can view this precise diagnostic report instantly.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-white border border-slate-200 text-slate-600 rounded px-2.5 py-1.5 text-[11px] font-mono focus:outline-none w-full sm:w-56 text-ellipsis"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleShare}
                className="bg-slate-900 text-white rounded px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-800 transition shrink-0 flex items-center space-x-1"
                id="recopy-share-link"
              >
                <span>{shareCopied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <div className="mt-5">
          <h3 className="font-semibold text-slate-800 text-sm font-sans mb-1.5">Executive Legal Classification</h3>
          <p className="text-slate-600 text-sm leading-relaxed font-sans">
            {report.caseClassification.explanation}
          </p>
        </div>

        {/* Active Evidentiary Factors Refining Probability */}
        {selectedEvidence && selectedEvidence.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs font-mono uppercase tracking-wider mb-2 flex items-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
              Possessed Proof Matrices (Algorithmic Calibration Active)
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedEvidence.map((ev, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200/60 font-sans shadow-xs"
                >
                  <span className="text-emerald-500">✓</span>
                  <span>{ev}</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-sans italic">
              These verified evidentiary components have been applied to adjust predictive weights, resulting in a model re-calibration.
            </p>
          </div>
        )}
      </div>

      {/* Trial and Outcome Metric Dial/Gauges */}
      <div className="hidden grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4">
        {/* Gauge 1 */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-700">
            <span className="text-lg font-bold font-mono">{report.probabilityAnalysis.convictionProbability}%</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700 font-sans">Conviction Prob.</p>
          <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
            <div 
              className="h-1 rounded-full bg-rose-500" 
              style={{ width: `${report.probabilityAnalysis.convictionProbability}%` }}
            ></div>
          </div>
        </div>

        {/* Gauge 2 */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <span className="text-lg font-bold font-mono">{report.probabilityAnalysis.acquittalProbability}%</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700 font-sans">Acquittal Prob.</p>
          <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
            <div 
              className="h-1 rounded-full bg-emerald-500" 
              style={{ width: `${report.probabilityAnalysis.acquittalProbability}%` }}
            ></div>
          </div>
        </div>

        {/* Gauge 3 */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <span className="text-lg font-bold font-mono">{report.probabilityAnalysis.bailProbability}%</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700 font-sans">Bail Approval</p>
          <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
            <div 
              className="h-1 rounded-full bg-blue-500" 
              style={{ width: `${report.probabilityAnalysis.bailProbability}%` }}
            ></div>
          </div>
        </div>

        {/* Gauge 4 */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <span className="text-lg font-bold font-mono">{report.probabilityAnalysis.jailProbability}%</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700 font-sans">Incarceration Odds</p>
          <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
            <div 
              className="h-1 rounded-full bg-amber-600" 
              style={{ width: `${report.probabilityAnalysis.jailProbability}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Probability Comparative Visualizer Chart (Recharts) */}
      <div className="hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Visual Probability Balance
            </h3>
          </div>
          
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[11px] font-medium font-sans print:hidden">
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                chartType === "bar"
                  ? "bg-white text-slate-800 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Bar View
            </button>
            <button
              onClick={() => setChartType("radar")}
              className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                chartType === "radar"
                  ? "bg-white text-slate-800 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Radar View
            </button>
          </div>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart
                data={[
                  { name: "Conviction", percentage: report.probabilityAnalysis.convictionProbability || 0, color: "#f43f5e" },
                  { name: "Acquittal", percentage: report.probabilityAnalysis.acquittalProbability || 0, color: "#10b981" },
                  { name: "Bail Grant", percentage: report.probabilityAnalysis.bailProbability || 0, color: "#3b82f6" },
                  { name: "Incarceration", percentage: report.probabilityAnalysis.jailProbability || 0, color: "#d97706" },
                  ...(report.civilOutcome && report.civilOutcome.remedy && !report.civilOutcome.remedy.toLowerCase().includes("not applicable") && !report.civilOutcome.remedy.toLowerCase().includes("n/a") && report.civilOutcome.winProbability > 0 ? [{ name: "Civil Win", percentage: report.civilOutcome.winProbability, color: "#8b5cf6" }] : [])
                ]}
                margin={{ top: 10, right: 5, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {[
                    { color: "#f43f5e" },
                    { color: "#10b981" },
                    { color: "#3b82f6" },
                    { color: "#d97706" },
                    { color: "#8b5cf6" }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="75%"
                data={[
                  { name: "Conviction", percentage: report.probabilityAnalysis.convictionProbability || 0 },
                  { name: "Acquittal", percentage: report.probabilityAnalysis.acquittalProbability || 0 },
                  { name: "Bail Grant", percentage: report.probabilityAnalysis.bailProbability || 0 },
                  { name: "Incarceration", percentage: report.probabilityAnalysis.jailProbability || 0 },
                  ...(report.civilOutcome && report.civilOutcome.remedy && !report.civilOutcome.remedy.toLowerCase().includes("not applicable") && !report.civilOutcome.remedy.toLowerCase().includes("n/a") && report.civilOutcome.winProbability > 0 ? [{ name: "Civil Win", percentage: report.civilOutcome.winProbability }] : [])
                ]}
              >
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'monospace' }} axisLine={false} />
                <Radar
                  name="Likelihood %"
                  dataKey="percentage"
                  stroke="#d97706"
                  fill="#f59e0b"
                  fillOpacity={0.25}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <p className="mt-2 text-center text-[10.5px] leading-relaxed text-slate-500 font-sans">
          📊 Comparative evaluation representing the interaction between critical trial outcomes. Flip to radar perspective for an integrated risk-profile web.
        </p>
      </div>

      {/* Probability Driving Factors */}
      <div className="hidden rounded-xl border border-slate-100 bg-amber-50/20 p-5 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono mb-2.5">
          Key Case Drivers & Strength of Evidence Analysis
        </h4>
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs text-slate-700 font-sans">
          {report.probabilityAnalysis.keyFactors.map((factor, i) => (
            <li key={i} className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* STEP-BY-STEP ANALYSIS CARDS */}
      <div className="space-y-4 font-sans" id="analysis-step-cards">
        {(() => {
          const isCriminalLocal = report.caseClassification.caseType.toUpperCase().includes("CRIMINAL") || report.caseSummary.caseType.toUpperCase().includes("CRIMINAL");
          const metric1NameLocal = isCriminalLocal ? "Conviction Probability" : "Plaintiff Success Probability";
          const metric1ValLocal = isCriminalLocal ? (report.probabilityAnalysis.convictionProbability || report.caseSummary.convictionPercent || 0) : (report.civilOutcome.winProbability || report.caseSummary.convictionPercent || 50);
          const metric2NameLocal = isCriminalLocal ? "Acquittal Probability" : "Defendant Success Probability";
          const metric2ValLocal = isCriminalLocal ? (report.probabilityAnalysis.acquittalProbability || report.caseSummary.acquittalPercent || 0) : (100 - metric1ValLocal);
          const metric3NameLocal = isCriminalLocal ? "Bail Probability" : "Safe Resolution Index";
          const metric3ValLocal = isCriminalLocal ? (report.probabilityAnalysis.bailProbability || report.caseSummary.bailProbability || 0) : 100;

          return (
            <>
              {/* ================================================== */}
              {/* Step 1: Expected Judgement & Verdict Forecast */}
              {/* ================================================== */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="step-1-judgement">
                <button
                  type="button"
                  onClick={() => toggleSection("step1")}
                  className="flex w-full items-center justify-between bg-slate-50 p-4 text-left font-sans font-semibold text-slate-800 transition hover:bg-slate-100/80 cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <Gavel className="h-4.5 w-4.5 text-slate-705" />
                    <span className="text-sm font-bold">Step 1: Expected Judgement & Verdict Forecast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Judgements & Merits</span>
                    {openSections.step1 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>

                {openSections.step1 && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Primary Verdict Scoreboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Likely Decision Status</span>
                        <div className="text-sm font-bold text-slate-900 font-sans mt-1">
                          {isCriminalLocal 
                            ? `Prosecution Track: ${report.chargePrediction.likelyFramedOrDropped || "ANALYZING"}`
                            : `Expected Success Rate: ${metric1ValLocal}%`
                          }
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-sans">
                          {isCriminalLocal 
                            ? "AI model projection of whether indictments will successfully cross the judicial framing threshold."
                            : "Estimated probability of securing favorable decrees on primary prayers from civil judges."
                          }
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/15">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block font-mono">COURT DECISION FORECAST</span>
                        <div className="text-sm font-bold text-amber-900 font-sans mt-1">
                          {isCriminalLocal 
                            ? report.expectedPunishment.mostLikelySentence || "Sentencing ranges pending active framing proofs"
                            : report.civilOutcome.remedy || "Equitable/Recovery decree relief projected"
                          }
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-sans">
                          The most likely judicial order or package of remedies anticipated under governing Indian statutes.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">RECOMMENDED COURT/FORUM</span>
                        <div className="text-sm font-bold text-slate-900 font-sans mt-1">
                          {report.caseSummary.recommendedCourt || "Lowest Competent Civil/Criminal Jurisdiction"}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-sans">
                          Recommended filing forum and territory based on pecuniary, subject, and statutory boundaries.
                        </p>
                      </div>
                    </div>

                    {/* Legal Reasoning Paragraph */}
                    <div className="p-4 bg-slate-900 text-slate-300 rounded-lg font-sans border-l-4 border-amber-500 shadow-sm">
                      <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center mb-1.5">
                        <Scale className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                        SYSTEM REASONING & CASE FACT CORRELATION
                      </h5>
                      <p className="text-xs leading-relaxed font-sans text-slate-300">
                        {report.chargePrediction.reasoning || report.caseClassification.explanation}
                      </p>
                    </div>

                    {/* Governing Statutes & Sections Mapped */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-700 font-sans mb-3 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-slate-500" />
                        Relevant Legal Provisions and Mapped Statutes
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.applicableLaws.map((law, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-slate-150 bg-white">
                            <div className="flex justify-between items-start gap-2">
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 font-mono">
                                Section {law.sectionNumber}
                              </span>
                              {law.bailability && law.bailability !== "N/A" && (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  law.bailability.toLowerCase().includes("non") 
                                    ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}>
                                  {law.bailability}
                                </span>
                              )}
                            </div>
                            <h6 className="text-xs font-bold text-slate-800 font-sans mt-2">{law.actName}</h6>
                            <p className="text-[11px] text-slate-600 mt-1 border-t border-slate-100 pt-2 font-sans">
                              <strong className="text-slate-700 font-semibold">Covers:</strong> {law.covers}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1 font-sans">
                              <strong className="text-slate-700 font-semibold">Punishment:</strong> {law.punishment}
                            </p>
                            {law.analysis && (
                              <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded mt-2 italic border-l-2 border-slate-300">
                                {law.analysis}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* Step 2: Actions & Fines/Penalties Assessment */}
              {/* ================================================== */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="step-2-actions">
                <button
                  type="button"
                  onClick={() => toggleSection("step2")}
                  className="flex w-full items-center justify-between bg-slate-50 p-4 text-left font-sans font-semibold text-slate-800 transition hover:bg-slate-100/80 cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileCheck className="h-4.5 w-4.5 text-slate-705" />
                    <span className="text-sm font-bold">Step 2: Recommended Actions & Fines/Penalties Assessment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Fines & Actions</span>
                    {openSections.step2 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>

                {openSections.step2 && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Fine/Damages Assessment Callout */}
                    <div className="rounded-xl p-4.5 border border-amber-200 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <h5 className="font-bold text-xs font-mono uppercase tracking-wider text-amber-800 flex items-center">
                          <Coins className="h-4 w-4 mr-1.5 shrink-0" />
                          LIABILITY & FINANCIAL FINES ASSESSMENT
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          Under Indian statutory laws, active offenses or civil breaches trigger penalties, statutory compound fees, or direct compensatory damages to opposite parties.
                        </p>
                      </div>
                      
                      <div className="bg-white border border-amber-200 rounded-lg px-4 py-2.5 shrink-0 text-center shadow-2xs">
                        <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase">PREDICTED DAMAGES/FINES</span>
                        <span className="text-sm font-bold text-amber-700 font-sans block mt-0.5">
                          {report.caseSummary.fineRange && report.caseSummary.fineRange !== "N/A" 
                            ? report.caseSummary.fineRange 
                            : report.civilOutcome.compensationRange && report.civilOutcome.compensationRange !== "N/A"
                              ? report.civilOutcome.compensationRange
                              : "None predicted based on facts"
                          }
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Document evidence to collect */}
                      <div>
                        <h5 className="text-xs font-bold text-slate-700 font-sans mb-2 flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                          Evidence, Logs & Documents Checklist to Gather
                        </h5>
                        <p className="text-xs text-slate-500 mb-2 font-sans italic">
                          Collect these files immediately to substantiate facts under active disclosure rules:
                        </p>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {report.required_documents && report.required_documents.length > 0 ? (
                            report.required_documents.map((docItem, idx) => (
                              <div key={idx} className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/50 transition">
                                <span className="inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="text-xs text-slate-700 font-sans font-medium">{docItem}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-400 italic">No specific documents specified. Collect financial logs and chat records.</div>
                          )}
                        </div>
                      </div>

                      {/* Immediate actions */}
                      <div>
                        <h5 className="text-xs font-bold text-slate-700 font-sans mb-2 flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2"></span>
                          Immediate Legal Security Instructions
                        </h5>
                        <p className="text-xs text-slate-500 mb-2.5 font-sans">
                          Actions to take to safeguard your case before the limitation period expires:
                        </p>
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg border border-slate-105 bg-white flex items-start space-x-2 text-xs">
                            <CheckCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 animate-pulse" />
                            <p className="text-slate-600 font-sans">
                              <strong className="text-slate-800">Serve Notices Promptly:</strong> Draft and deliver demand or reply statements clearly to prevent adverse procedural default inferences.
                            </p>
                          </div>
                          <div className="p-3 rounded-lg border border-slate-105 bg-white flex items-start space-x-2 text-xs">
                            <CheckCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-slate-600 font-sans">
                              <strong className="text-slate-800">Secure Digital Signatures:</strong> Convert relevant WhatsApp/email transcripts into PDF formats with clear headers and preserve timestamps on separate duplicate drives.
                            </p>
                          </div>
                          <div className="p-3 rounded-lg border border-slate-105 bg-white flex items-start space-x-2 text-xs">
                            <CheckCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-slate-600 font-sans">
                              <strong className="text-slate-800">Avoid Off-Record Deals:</strong> Record any settlement terms, transactions, or money receipts strictly inside formal, signed compromise deeds.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* Step 3: Case Progress Journey (Post Prediction) */}
              {/* ================================================== */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="step-3-timeline">
                <button
                  type="button"
                  onClick={() => toggleSection("step3")}
                  className="flex w-full items-center justify-between bg-slate-50 p-4 text-left font-sans font-semibold text-slate-800 transition hover:bg-slate-100/80 cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <Clock className="h-4.5 w-4.5 text-slate-705" />
                    <span className="text-sm font-bold">Step 3: Timeline & Post-Prediction Procedural Journey</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Litigation stages</span>
                    {openSections.step3 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>

                {openSections.step3 && (
                  <div className="border-t border-slate-100 p-5 space-y-4">
                    {/* Expected Resolution Speed Indicator */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/40 border border-indigo-100 text-xs">
                      <span className="font-bold text-indigo-900 font-sans uppercase">ESTIMATED CASE RESOLUTION SPEED:</span>
                      <span className="inline-flex items-center rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800 font-mono">
                        {report.civilOutcome.timeToResolution || "12 to 18 Months (Fast-Track)"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-sans">
                      Follow the sequential procedural stages of litigation expected to take place following this prediction:
                    </p>

                    {/* Step-by-step progress list */}
                    <div className="space-y-3.5 pl-2 pt-2 border-l border-slate-200 ml-1">
                      {isCriminalLocal ? (
                        <>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 1: Police Registration (FIR Registration)</strong>
                            <p className="text-slate-500 mt-0.5">Complainant logs factual details under BNS / CrPC. If cognizable, police can investigate directly.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 2: Bail Intervention Filing</strong>
                            <p className="text-slate-500 mt-0.5">Accused seeks regular or anticipatory bail under BNSS Section 482 / CrPC Section 438 depending on arrest warrants.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 3: Charge-Sheet Submission (CrPC 173 / BNSS 193)</strong>
                            <p className="text-slate-500 mt-0.5">Investigating agency compiles witness proofs and forensic reports to submit in front of Magisterial Court.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-amber-500 border-2 border-white ring-4 ring-amber-100 animate-pulse"></span>
                            <strong className="text-slate-900 font-bold block">Stage 4: Framing of Charges by Magistrate (CURRENT PHASE TARGET)</strong>
                            <p className="text-slate-600 mt-0.5">The Court formally evaluates the charge-sheet to accept or discharge charges against the accused.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 5: Examination under Oath & Final Arguments</strong>
                            <p className="text-slate-500 mt-0.5">Witnesses are cross-examined. Defense and Prosecution counsels submit final legal briefings.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 1: Pre-Litigation Legal Notice</strong>
                            <p className="text-slate-500 mt-0.5">Deliver written claim notice to opposite party, granting a statutory 15 or 30 days to resolve dispute amicably.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 2: Filing of Plaint (CPC Order VII / Consumer Complaint)</strong>
                            <p className="text-slate-500 mt-0.5">Filing formal petition/complaint statement inside District consumer forum or territorial Civil Judge division.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 3: Issued Summons & Written Statement Backing</strong>
                            <p className="text-slate-500 mt-0.5">Summons served to opposite party. Defendant must file formal written defence (Written Statement) in 30 to 120 days.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-amber-500 border-2 border-white ring-4 ring-amber-100 animate-pulse"></span>
                            <strong className="text-slate-900 font-bold block">Stage 4: Framing of Issues & Admissions (CURRENT PHASE TARGET)</strong>
                            <p className="text-slate-600 mt-0.5">The judge defines specific material controversies and issues to be tried under CPC rules.</p>
                          </div>
                          <div className="relative pl-5 text-xs">
                            <span className="absolute -left-[24.5px] top-0 h-[8px] w-[8px] rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100"></span>
                            <strong className="text-slate-900 font-bold block">Stage 5: Trial Evidence Recording & Final Decree</strong>
                            <p className="text-slate-500 mt-0.5">Both parties lead chief examinations, cross-examine witnesses, and the Bench pronounces final binding Decree.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* Step 4: Defense Strategy & Winning Tips */}
              {/* ================================================== */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="step-4-winning">
                <button
                  type="button"
                  onClick={() => toggleSection("step4")}
                  className="flex w-full items-center justify-between bg-slate-50 p-4 text-left font-sans font-semibold text-slate-800 transition hover:bg-slate-100/80 cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-slate-705" />
                    <span className="text-sm font-bold">Step 4: Strategic Win Guide & Counselor Verdict Tips</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Strategies to Win</span>
                    {openSections.step4 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>

                {openSections.step4 && (
                  <div className="border-t border-slate-100 p-5 space-y-4 flex flex-col">
                    {/* Tailored strategies list */}
                    <div>
                      <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">SYSTEM-GENERATED LITIGATION MATRICES</h5>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {report.defenseStrategies.map((def, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-slate-150 bg-slate-50/50 shadow-2xs">
                            <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[9.5px]/none font-bold text-amber-800 mb-2 font-mono border border-amber-200/50">
                              STRATEGY #{idx + 1}
                            </span>
                            <h6 className="text-xs font-bold text-slate-900 font-sans block">{def.title}</h6>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-sans">{def.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Counselor Winning Tips Callout */}
                    <div className="pt-3 border-t border-slate-100">
                      <h5 className="text-xs font-bold text-slate-700 font-sans mb-3 flex items-center">
                        <span className="h-2 w-2 rounded bg-amber-500 mr-2 shrink-0 animate-pulse"></span>
                        Advocate Tips & Procedural Leverage Points to Win:
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div className="p-3.5 bg-slate-50 rounded-lg space-y-1">
                          <strong className="text-slate-800 font-semibold block">1. Formulate Clear Admissibility Certificates</strong>
                          <p className="text-slate-600 text-[11px]">
                            Secure digital evidence admissibility under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B of Indian Evidence Act) early on. Digital logs without certificates might face court rejection.
                          </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-lg space-y-1">
                          <strong className="text-slate-800 font-semibold block">2. Interrogate Juridical Boundaries</strong>
                          <p className="text-slate-600 text-[11px]">
                            Verify if the opposite party filed inside appropriate pecuniary limits (money scale) and territorial limits. Incorrect filings can trigger direct dismissals under CPC Order VII Rule 10, saving trial duration.
                          </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-lg space-y-1">
                          <strong className="text-slate-800 font-semibold block">3. Establish Factual Corroboration</strong>
                          <p className="text-slate-600 text-[11px]">
                            Secure neutral co-workers, bank records, or official correspondence early. In civil disputes, courts weigh heavily on a preponderance of probabilities as established by direct physical papers.
                          </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-lg space-y-1">
                          <strong className="text-slate-800 font-semibold block">4. Do Not Waive Periodical Replies</strong>
                          <p className="text-slate-600 text-[11px]">
                            Deliver prompt responses to notices. Unanswered notices can allow juries to draw an adverse inference against you, reducing your overall defendant shield.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* Step 5: Visual Case Likelihood Graph & Glossary */}
              {/* ================================================== */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="step-5-graph-glossary">
                <button
                  type="button"
                  onClick={() => toggleSection("step5")}
                  className="flex w-full items-center justify-between bg-slate-50 p-4 text-left font-sans font-semibold text-slate-800 transition hover:bg-slate-100/80 cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <TrendingUp className="h-4.5 w-4.5 text-slate-755" />
                    <span className="text-sm font-bold">Step 5: Visual Case Likelihood Graph & Analysis Glossary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Dynamic Graphs</span>
                    {openSections.step5 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>

                {openSections.step5 && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Inline Gauges Row conforming to terms */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-2xs">
                        <span className="block text-[10px] uppercase font-bold text-rose-500 font-mono tracking-wide">{metric1NameLocal}</span>
                        <span className="font-mono text-3xl font-extrabold text-slate-800 block mt-1.5">{metric1ValLocal}%</span>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-rose-500" style={{ width: `${metric1ValLocal}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-2xs">
                        <span className="block text-[10px] uppercase font-bold text-emerald-600 font-mono tracking-wide">{metric2NameLocal}</span>
                        <span className="font-mono text-3xl font-extrabold text-slate-800 block mt-1.5">{metric2ValLocal}%</span>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${metric2ValLocal}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-2xs">
                        <span className="block text-[10px] uppercase font-bold text-sky-600 font-mono tracking-wide">{metric3NameLocal}</span>
                        <span className="font-mono text-3xl font-extrabold text-slate-800 block mt-1.5">
                          {isCriminalLocal ? `${metric3ValLocal}%` : "100%"}
                        </span>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-sky-500" style={{ width: isCriminalLocal ? `${metric3ValLocal}%` : "100%" }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="rounded-xl border border-slate-150 p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                        <span className="text-xs font-bold text-slate-700">Dynamic Court Outflow Balance</span>
                        <div className="flex bg-slate-200 rounded p-0.5 text-[10px] font-semibold">
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setChartType("bar"); }} 
                            className={`px-2 py-0.5 rounded cursor-pointer ${chartType === "bar" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500"}`}
                          >Bar</button>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setChartType("radar"); }} 
                            className={`px-2 py-0.5 rounded cursor-pointer ${chartType === "radar" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500"}`}
                          >Radar</button>
                        </div>
                      </div>

                      <div className="h-60 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === "bar" ? (
                            <BarChart
                              data={[
                                { name: metric1NameLocal.replace(" Probability", "").replace("Plaintiff Success", "Plaintiff Win"), percentage: metric1ValLocal, color: "#f43f5e" },
                                { name: metric2NameLocal.replace(" Probability", "").replace("Defendant Success", "Defendant Win"), percentage: metric2ValLocal, color: "#10b981" },
                                ...(isCriminalLocal ? [
                                  { name: "Bail Grant", percentage: report.probabilityAnalysis.bailProbability || 0, color: "#3b82f6" },
                                  { name: "Incarceration", percentage: report.probabilityAnalysis.jailProbability || 0, color: "#d97706" }
                                ] : [])
                              ]}
                              margin={{ top: 10, right: 5, left: -25, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 550 }} tickLine={false} />
                              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} />
                              <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {[
                                  { color: "#f43f5e" },
                                  { color: "#10b981" },
                                  { color: "#3b82f6" },
                                  { color: "#d97706" }
                                ].map((cellItem, cellIdx) => (
                                  <Cell key={`cell-${cellIdx}`} fill={cellItem.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          ) : (
                            <RadarChart
                              cx="50%"
                              cy="50%"
                              outerRadius="75%"
                              data={[
                                { name: metric1NameLocal.replace(" Probability", "").replace("Plaintiff Success", "Plaintiff Win"), percentage: metric1ValLocal },
                                { name: metric2NameLocal.replace(" Probability", "").replace("Defendant Success", "Defendant Win"), percentage: metric2ValLocal },
                                ...(isCriminalLocal ? [
                                  { name: "Bail Grant", percentage: report.probabilityAnalysis.bailProbability || 0 },
                                  { name: "Incarceration", percentage: report.probabilityAnalysis.jailProbability || 0 }
                                ] : [])
                              ]}
                            >
                              <PolarGrid stroke="#cbd5e1" />
                              <PolarAngleAxis dataKey="name" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} axisLine={false} />
                              <Radar name="Case Metric" dataKey="percentage" stroke="#b45309" fill="#fef3c7" fillOpacity={0.6} />
                              <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Parameters Description Glossary Table as requested */}
                    <div className="pt-2">
                      <h5 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">GLOSSARY OF MEASURED PARAMETERS</h5>
                      <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse font-sans bg-white">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold font-mono text-[10px]">
                              <th className="px-3 py-2">Parameter</th>
                              <th className="px-3 py-2">Definition & Meaning</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-600">
                            {!isCriminalLocal ? (
                              <>
                                <tr>
                                  <td className="px-3 py-2.5 font-bold text-slate-800">Plaintiff Success Probability</td>
                                  <td className="px-3 py-2.5 leading-relaxed">Measures the statistical likelihood of the party filing the litigation (plaintiff/complainant) successfully obtaining court orders/declarations on core claim prayers.</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2.5 font-bold text-slate-800">Defendant Success Probability</td>
                                  <td className="px-3 py-2.5 leading-relaxed">Represents the probability that the defending party successfully invalidates or offsets plaintiff allegations based on civil exceptions, procedural defects, or counterclaims.</td>
                                </tr>
                              </>
                            ) : (
                              <>
                                <tr>
                                  <td className="px-3 py-2.5 font-bold text-slate-800">Conviction Probability</td>
                                  <td className="px-3 py-2.5 leading-relaxed">The mathematical likelihood of the trial court finding the accused guilty under BNS/IPC penal codes, based on physical and oral evidence.</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2.5 font-bold text-slate-800">Acquittal Probability</td>
                                  <td className="px-3 py-2.5 leading-relaxed">Represents the probability of accused discharge or release due to lack of standard prime proofs, procedural police failures, or alibis.</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2.5 font-bold text-slate-800">Bail Probability</td>
                                  <td className="px-3 py-2.5 leading-relaxed">Forecasts the statistical probability of a magistrate granting non-custodial liberty/bail to the accused under CrPC 437-439 or BNSS 480-482 guides.</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* Legacy wrapper removed to maintain file size well below 100KB limit */}

      </div>

      {/* Hidden Print Layout Wrapper (will only appear on print screen) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root, #root * {
            visibility: hidden;
          }
          #prediction-report-container, #prediction-report-container * {
            visibility: visible;
          }
          #prediction-report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden, #analysis-step-cards button svg, #app-title {
            display: none !important;
          }
          #analysis-step-cards > div {
            border: 1px solid #cbd5e1 !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
          }
          /* Ensure all nested blocks are visible on print */
          #analysis-step-cards div {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

import { FileText, Car, Users, Laptop, ShieldClose } from "lucide-react";
import { ExampleCase } from "../types";

const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: "ex-forgery",
    title: "1. Forgery & Property Cheating",
    category: "Criminal",
    snippet: "A relative forged a land deed signature of my deceased father to sell ancestral land...",
    fullText: "My paternal cousin, Ram Singh, forged the signature of my late father, Sh. Gopal Singh, on a land sale registry deed dated November 14, 2024. He did this in collusion with a local notary officer to illegally transfer 2.5 acres of ancestral land located in Hisar, Haryana to a developer named Amit Builders. Ram Singh has also accepted a banking transaction sum of ₹45 Lakhs into his personal ICICI savings account as a partial down payment. We have obtained certified copies of the registry from the Sub-Registrar's office, where Sh. Gopal Singh's signature is clearly mismatched with his passport and past bank documents. A legal notice has been dispatched, but Ram Singh is threatening us with bodily harm if we approach the police authorities."
  },
  {
    id: "ex-accident",
    title: "2. Negligent Road Accident",
    category: "Criminal",
    snippet: "A speeding SUV crashed into a motorbike causing multiple fractures, with video evidence...",
    fullText: "On the afternoon of April 12, 2026, my younger brother was riding his motorbike on the Outer Ring Road in New Delhi. A speeding commercial SUV, bearing license plate DL-3C-Y-8845, bypassed a clear red light signal and collided head-on with my brother's vehicle. Eye-witness statements and local CCTV footage from a nearby commercial bank indicate the SUV was traveling at upward of 80 km/h in a 40 km/h zone. The driver, identified as Rohit Mehra, was driving rashly. My brother sustained multiple compound fractures on his right leg and a severe concussion, and was admitted in critical care at Max Hospital. The police have registered a Daily Diary Entry, but they have delayed lodging a formal First Information Report (FIR)."
  },
  {
    id: "ex-property",
    title: "3. Property Partition Dispute",
    category: "Civil",
    snippet: "Siblings disputing the division of ancestral property and refusing to vacate major shares...",
    fullText: "We have an ongoing dispute regarding the division of our ancestral residential double-story house in Pune, Maharashtra left by our grandfather, who passed away intestate in 2018. The property has three legal heirs: myself, my elder sister, and my younger brother. My brother has occupied the entire ground and first floor since 2022 and has unilaterally rented out the outhouse to third-party commercial tenants, keeping all rent earnings for himself. He refuses to execute a formal partition deed or grant me access to my rightful 1/3 share of the property despite numerous written appeals and a family dispute resolution draft. He claims he spent ₹12 Lakhs on structural repairs, which he demands as a pre-condition to partition."
  },
  {
    id: "ex-cyber",
    title: "4. Senior Pension Cyber Fraud",
    category: "Mixed",
    snippet: "Phishing call targeting a senior citizen, resulting in unauthorized transfer of ₹4.5 Lakhs...",
    fullText: "On February 2, 2026, my 68-year-old grandfather received a phone call from an individual claiming to be a senior deputy manager from the State Bank of India's central pension branch. The caller stated that my grandfather's monthly pension accounts would be locked unless he verified his Aadhaar and credit card details. Trusting the caller, my grandfather shared a one-time OTP passcode. Within 10 minutes, three unauthorized digital banking transactions were executed, totaling a transfer of ₹4,50,000 to an unknown account at a payment bank. We filed a cyber-complaint within 2 hours on the National Cyber Crime portal and requested the bank to freeze the recipient bank accounts. The bank has stated they cannot refund the money as OTP was voluntary."
  },
  {
    id: "ex-domestic",
    title: "5. Cruelty & Dowry Demands",
    category: "Criminal",
    snippet: "Continuous physical harassment and aggressive monetary demands by spouse's family...",
    fullText: "My sister was married in January 2025. Within three months, her husband and mother-in-law began demanding an additional ₹5,00,000 cash and a sedan car as further dowry, claiming the original marriage gifts were sub-standard. My sister has been subjected to constant verbal abuse, locked in her room, and denied nutrition for days. Last week, she was physically assaulted by her husband, resulting in deep bruises on her wrists and back, after we refused to pay the additional amount. She has returned to our parental home in Nagpur. We have a certified medico-legal report (MLR) from the Government Medical College documenting her physical injuries, along with threatening WhatsApp audio notes from her husband demanding cash."
  }
];

interface ExampleSelectorProps {
  onSelect: (text: string) => void;
  selectedId: string | null;
  filterCategory?: "Criminal" | "Civil";
}

export default function ExampleSelector({ onSelect, selectedId, filterCategory }: ExampleSelectorProps) {
  const filteredCases = filterCategory 
    ? EXAMPLE_CASES.filter(c => c.category === filterCategory || (filterCategory === "Criminal" && c.category === "Mixed"))
    : EXAMPLE_CASES;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
        <FileText className="h-5 w-5 text-amber-600" />
        <h3 className="text-sm font-semibold text-slate-800 font-sans">
          Select a Pre-composed Legal Scenario Template
        </h3>
      </div>

      <p className="text-xs leading-relaxed text-slate-500 font-sans mb-4">
        Click on any of the standard scenario cards below to pre-populate the Case Facts box for {filterCategory ? filterCategory.toLowerCase() : "any"} disputes.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {filteredCases.map((scenario) => {
          const isSelected = selectedId === scenario.id;
          
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario.fullText)}
              className={`group flex flex-col items-start rounded-lg border p-3.5 text-left transition-all hover:shadow-sm focus:outline-none ${
                isSelected
                  ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500"
                  : "border-slate-100 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/10"
              }`}
              id={`test-case-${scenario.id}`}
            >
              <div className="flex w-full items-center justify-between">
                <span className={`text-xs font-semibold font-sans ${
                  isSelected ? "text-amber-900" : "text-slate-800 group-hover:text-amber-800"
                }`}>
                  {scenario.title}
                </span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase ${
                  scenario.category === 'Criminal' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/50' 
                    : scenario.category === 'Civil'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                }`}>
                  {scenario.category}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 font-sans leading-normal line-clamp-2">
                {scenario.snippet}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

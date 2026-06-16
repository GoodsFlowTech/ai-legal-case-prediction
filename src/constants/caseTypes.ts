export interface QuestionnaireField {
  id: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: string[];
}

export interface CaseCategory {
  id: string;
  name: string;
  subcategories: string[];
  fields: QuestionnaireField[];
}

export const CASE_CATEGORIES: CaseCategory[] = [
  {
    id: "criminal",
    name: "Criminal Cases",
    subcategories: [
      "Murder",
      "Assault",
      "Theft",
      "Fraud",
      "Cybercrime",
      "Drug Offenses",
      "Domestic Violence"
    ],
    fields: [
      {
        id: "hasPhysicalInjury",
        label: "Was physical injury sustained?",
        type: "select",
        options: ["Yes", "No"]
      },
      {
        id: "monetaryValue",
        label: "Approximate monetary value involved / stolen (in ₹)",
        type: "number",
        placeholder: "Example: 50000"
      },
      {
        id: "firRegistered",
        label: "Has a formal First Information Report (FIR) been registered?",
        type: "select",
        options: ["Yes", "No", "Direct Private Complaint under BNSS/CrPC"]
      },
      {
        id: "witnessCount",
        label: "Are there eye-witnesses ready to testify?",
        type: "select",
        options: ["Yes - Multiple", "Yes - Single Witness", "No", "Undecided"]
      },
      {
        id: "weaponsInvolved",
        label: "Were deadly weapons or force utilized?",
        type: "select",
        options: ["Yes", "No"]
      },
      {
        id: "accusedNamed",
        label: "Are the accused parties identified and named in the compliant?",
        type: "select",
        options: ["Yes - Specifically Named", "No - Anonymous/Unexplained", "Partial Identification"]
      }
    ]
  },
  {
    id: "civil",
    name: "Civil Cases",
    subcategories: [
      "Contract Disputes",
      "Money Recovery",
      "Business Disputes",
      "Defamation",
      "Negligence Claims"
    ],
    fields: [
      {
        id: "writtenAgreementExists",
        label: "Do you possess a written contract or physical agreement?",
        type: "select",
        options: ["Yes", "No", "Oral Agreement / Course of Conduct"]
      },
      {
        id: "disputedAmount",
        label: "Total monetary claim / unpaid amount (in ₹)",
        type: "number",
        placeholder: "Example: 200000"
      },
      {
        id: "legalNoticeServed",
        label: "Was a formal pre-litigation Legal Notice served already?",
        type: "select",
        options: ["Yes", "No"]
      },
      {
        id: "mediationAttempted",
        label: "Has any dispute mediation or commercial compromise been attempted?",
        type: "select",
        options: ["Yes - Formal Commercial Mediation", "Yes - Informal Family Settlement", "No"]
      }
    ]
  },
  {
    id: "family",
    name: "Family Cases",
    subcategories: [
      "Divorce",
      "Child Custody",
      "Child Support",
      "Adoption",
      "Maintenance / Alimony"
    ],
    fields: [
      {
        id: "marriageRegistered",
        label: "Is the marriage formally registered?",
        type: "select",
        options: ["Yes", "No", "N/A (Property / Child Suit Only)"]
      },
      {
        id: "childrenCount",
        label: "Number of minor children involved in the custody debate",
        type: "number",
        placeholder: "Example: 2"
      },
      {
        id: "disputeNature",
        label: "Filing nature or level of mutual agreement",
        type: "select",
        options: ["Mutual Consent", "Contested", "Unilateral Separation"]
      },
      {
        id: "monthlySpouseIncome",
        label: "Approximate monthly income of spouse (in ₹)",
        type: "number",
        placeholder: "Example: 45000"
      }
    ]
  },
  {
    id: "property",
    name: "Property Cases",
    subcategories: [
      "Land Ownership Disputes",
      "Boundary Disputes",
      "Inheritance Property Disputes",
      "Tenant-Landlord Disputes"
    ],
    fields: [
      {
        id: "deedExists",
        label: "Do you hold a registered Sale Deed, Settlement Deed, or Lease Deed?",
        type: "select",
        options: ["Yes", "No", "Deed Unregistered / Disputed"]
      },
      {
        id: "propertyTaxPaid",
        label: "Are property taxes and municipal mutation certificates up-to-date?",
        type: "select",
        options: ["Yes", "No", "N/A"]
      },
      {
        id: "propertyValue",
        label: "Estimated market value of the disputed property (in ₹)",
        type: "number",
        placeholder: "Example: 7500000"
      },
      {
        id: "isCommercialProperty",
        label: "Is the property categorized as Commercial or Residential?",
        type: "select",
        options: ["Residential", "Commercial", "Agricultural Land"]
      }
    ]
  },
  {
    id: "employment",
    name: "Employment / Labor Cases",
    subcategories: [
      "Wrongful Termination",
      "Salary Disputes",
      "Workplace Harassment",
      "Employee Benefits Claims"
    ],
    fields: [
      {
        id: "employmentAgreement",
        label: "Do you have a written appointment or employment contract?",
        type: "select",
        options: ["Yes - Signed Copy", "No - Only Appointment Letter", "No - Informal Wage Worker"]
      },
      {
        id: "unpaidAmount",
        label: "Unpaid wages, gratuity, or severance being claimed (in ₹)",
        type: "number",
        placeholder: "Example: 150000"
      },
      {
        id: "employmentState",
        label: "Current status of employment",
        type: "select",
        options: ["Currently Active", "Terminated from Service", "Voluntarily Resigned", "Suspended"]
      },
      {
        id: "hrComplaintFiled",
        label: "Was a formal grievance raised with HR or the Labor Commissioner?",
        type: "select",
        options: ["Yes - Filed Response", "No"]
      }
    ]
  },
  {
    id: "consumer",
    name: "Consumer Protection Cases",
    subcategories: [
      "Defective Products",
      "Service Deficiency",
      "Insurance Claim Disputes",
      "E-commerce Disputes"
    ],
    fields: [
      {
        id: "hasPurchaseInvoice",
        label: "Do you possess an invoice/retail receipt with paid taxation details (GST)?",
        type: "select",
        options: ["Yes", "No"]
      },
      {
        id: "disputedValue",
        label: "Cost of the product or service in question (in ₹)",
        type: "number",
        placeholder: "Example: 45000"
      },
      {
        id: "complaintRaisedWithBrand",
        label: "Was an official complain ticket registered with corporate support or National Consumer Helpline?",
        type: "select",
        options: ["Yes", "No"]
      },
      {
        id: "insuranceClaimSubmitted",
        label: "Was any corresponding insurance claim officially submitted and rejected?",
        type: "select",
        options: ["Yes - Formally Rejected", "Yes - Pending Response", "No / Not Applicable"]
      }
    ]
  },
  {
    id: "corporate",
    name: "Corporate / Commercial Cases",
    subcategories: [
      "Partnership Disputes",
      "Shareholder Disputes",
      "Contract Breaches",
      "Commercial Recovery Claims"
    ],
    fields: [
      {
        id: "partnershipAgreement",
        label: "Do you have a registered Partnership Deed, LLC, or incorporation papers?",
        type: "select",
        options: ["Yes - Registered company", "Yes - Unregistered Partnership", "No", "N/A"]
      },
      {
        id: "disputeValuation",
        label: "Total commercial valuation of dispute in compliance with Commercial Courts Act (in ₹)",
        type: "number",
        placeholder: "Example: 1000000"
      },
      {
        id: "mediationConducted",
        label: "In accordance with Section 12A of Commercial Courts Act, was pre-institution mediation pursued?",
        type: "select",
        options: ["Yes - Mediation Completed", "No - Exempt / Urgently applying for ad-interim relief"]
      },
      {
        id: "arbitrationClause",
        label: "Is there an Arbitration / Alternative dispute resolution clause in the master contracts?",
        type: "select",
        options: ["Yes", "No", "Unsure"]
      }
    ]
  },
  {
    id: "tax",
    name: "Tax Cases",
    subcategories: [
      "Income Tax Disputes",
      "GST / VAT Disputes",
      "Tax Penalties"
    ],
    fields: [
      {
        id: "assessmentYear",
        label: "Concerned Assessment Year (e.g., AY 2025-26)",
        type: "text",
        placeholder: "Example: AY 2025-26"
      },
      {
        id: "disputedAmount",
        label: "Disputed additional tax demand or proposed penalty amount (in ₹)",
        type: "number",
        placeholder: "Example: 350000"
      },
      {
        id: "itDepartmentNotice",
        label: "Has a formal Show Cause Notice or Assessment Order been received?",
        type: "select",
        options: ["Yes - Received notice", "No - Voluntary appeal filed against error"]
      },
      {
        id: "replyFiled",
        label: "Have you submitted a formal reply on the e-filing portal?",
        type: "select",
        options: ["Yes", "No"]
      }
    ]
  },
  {
    id: "ip",
    name: "Intellectual Property Cases",
    subcategories: [
      "Copyright Infringement",
      "Trademark Disputes",
      "Patent Disputes"
    ],
    fields: [
      {
        id: "registrationCertificate",
        label: "Do you hold an approved trademark, copyright, or patent registration receipt?",
        type: "select",
        options: ["Yes - Approved Certificate", "No - Only Pending Application", "No - Seeking remedies on Unregistered/Passing-off rights"]
      },
      {
        id: "registrationNo",
        label: "Official registration / application number (if applicable)",
        type: "text",
        placeholder: "Example: TM-9874526"
      },
      {
        id: "allegedInfringementStart",
        label: "How long has the unauthorized trademark/copyright utilization been ongoing?",
        type: "text",
        placeholder: "Example: Since Oct 2025"
      },
      {
        id: "claimedDamages",
        label: "Proposed valuation of damages or rendition of profits (in ₹)",
        type: "number",
        placeholder: "Example: 500000"
      }
    ]
  },
  {
    id: "constitutional",
    name: "Constitutional / Administrative Cases",
    subcategories: [
      "Fundamental Rights Cases",
      "Government Action Challenges",
      "Public Interest Litigation"
    ],
    fields: [
      {
        id: "authorityChallenged",
        label: "Name of the Government Body, Municipal Corporation, or Ministry being challenged",
        type: "text",
        placeholder: "Example: Municipal Corporation of Delhi"
      },
      {
        id: "articleViolated",
        label: "Which Fundamental Right or constitutional provision is primarily violated?",
        type: "select",
        options: [
          "Article 14 - Right to Equality & Arbitrariness",
          "Article 19 - Freedoms (Speech, Association, Business)",
          "Article 21 - Right to Life, Liberty, and Fair Trial",
          "Article 300A - General deprivation of property",
          "Procedural Natural Justice Violation only"
        ]
      },
      {
        id: "representationServed",
        label: "Was a formal petition or administrative representation served to the department prior to filing?",
        type: "select",
        options: ["Yes", "No"]
      }
    ]
  }
];

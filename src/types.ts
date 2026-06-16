export interface CaseClassification {
  caseType: 'CRIMINAL CASE' | 'CIVIL CASE' | 'MIXED CASE';
  explanation: string;
}

export interface ApplicableLaw {
  sectionNumber: string;
  actName: string;
  covers: string;
  punishment: string;
  bailability: string;
  cognizability: string;
  analysis: string;
}

export interface ChargePrediction {
  primaryCharge: string;
  supportingCharges: string[];
  likelyFramedOrDropped: 'LIKELY FRAMED' | 'LIKELY DROPPED';
  reasoning: string;
}

export interface ProbabilityAnalysis {
  convictionProbability: number; // 0 - 100
  acquittalProbability: number; // 0 - 100
  bailProbability: number; // 0 - 100
  jailProbability: number; // 0 - 100
  keyFactors: string[];
}

export interface ExpectedPunishment {
  minimumSentence: string;
  maximumSentence: string;
  mostLikelySentence: string;
  imprisonmentType: string;
  paroleLikelihood: string;
}

export interface BailPrediction {
  isBailable: string;
  anticipatoryBailApplicability: string;
  regularBailApplicability: string;
  estimatedBailAmount: string;
  likelyConditions: string[];
  verdict: 'LIKELY GRANTED' | 'LIKELY DENIED' | 'UNCERTAIN';
}

export interface CivilOutcome {
  remedy: string;
  likelyCourt: string;
  compensationRange: string;
  timeToResolution: string;
  winProbability: number; // 0 - 100
}

export interface DefenseStrategy {
  title: string;
  description: string;
}

export interface CaseSummary {
  caseType: string;
  primaryCharge: string;
  convictionPercent: number;
  acquittalPercent: number;
  bailProbability: number;
  expectedSentence: string;
  fineRange: string;
  recommendedCourt: string;
  confidenceScore: number;
}

export interface PredictionReport {
  caseClassification: CaseClassification;
  applicableLaws: ApplicableLaw[];
  chargePrediction: ChargePrediction;
  probabilityAnalysis: ProbabilityAnalysis;
  expectedPunishment: ExpectedPunishment;
  bailPrediction: BailPrediction;
  civilOutcome: CivilOutcome;
  defenseStrategies: DefenseStrategy[];
  caseSummary: CaseSummary;
  required_documents?: string[];
}

export interface ExampleCase {
  id: string;
  title: string;
  category: 'Criminal' | 'Civil' | 'Mixed';
  snippet: string;
  fullText: string;
}

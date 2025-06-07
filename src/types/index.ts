export interface User {
  id: string;
  email: string;
  subscription: SubscriptionTier;
  freeRunsRemaining: number;
  totalRuns: number;
}

export type SubscriptionTier = 'free' | 'payAsYouGo' | 'unlimited';

export interface ProcessingJob {
  id: string;
  userId: string;
  fileName: string;
  fileType: FileType;
  status: JobStatus;
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  results?: ProcessingResults;
}

export type FileType = 'LAS' | 'CSV' | 'EXCEL';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProcessingResults {
  originalStats: DataStats;
  cleanedStats: DataStats;
  qualityScore: number;
  corrections: CorrectionSummary[];
}

export interface DataStats {
  pointCount: number;
  nullCount: number;
  duplicateCount: number;
  outlierCount: number;
  depthRange: [number, number];
  curves: CurveStats[];
}

export interface CurveStats {
  name: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
}

export interface CorrectionSummary {
  type: CorrectionType;
  count: number;
  description: string;
}

export type CorrectionType = 
  | 'outlierRemoval'
  | 'gapFilling'
  | 'duplicateRemoval'
  | 'depthCorrection'
  | 'spikeSmoothing';

export interface WellLogData {
  depth: number[];
  curves: {
    [name: string]: number[];
  };
  metadata: {
    well: string;
    field: string;
    company: string;
    date: string;
    [key: string]: string;
  };
}

export interface ProcessingOptions {
  outlierDetection: {
    enabled: boolean;
    threshold: number;
    method: 'zscore' | 'iqr' | 'mad';
  };
  gapFilling: {
    enabled: boolean;
    method: 'linear' | 'cubic' | 'nearest';
    maxGapSize: number;
  };
  spikeDetection: {
    enabled: boolean;
    sensitivity: number;
    windowSize: number;
  };
  smoothing: {
    enabled: boolean;
    method: 'moving' | 'gaussian' | 'savitzky';
    windowSize: number;
  };
  depthAlignment: {
    enabled: boolean;
    reference: string;
    tolerance: number;
  };
}

export interface ChartOptions {
  showGrid: boolean;
  showLegend: boolean;
  darkMode: boolean;
  curveColors: { [name: string]: string };
  depthRange: [number | null, number | null];
  scale: 'linear' | 'log';
}

// LAS File specific types
export interface LasFile {
  filename: string;
  content: string;
  version: string;
  wellInfo: WellInfo;
  curveInfo: CurveInfo[];
  data: LogData[];
}

export interface WellInfo {
  WELL: string;
  STRT: number;
  STOP: number;
  STEP: number;
  NULL: number;
  COMP: string;
  FLD: string;
  LOC: string;
  SRVC: string;
  DATE: string;
  [key: string]: string | number;
}

export interface CurveInfo {
  name: string;
  unit: string;
  description: string;
}

export interface LogData {
  depth: number;
  values: { [curveName: string]: number };
}

// Processing types
export interface AlgorithmSettings {
  name: string;
  enabled: boolean;
  parameters: { [key: string]: number | boolean | string };
}

export interface ProcessingSettings {
  name: string;
  algorithms: AlgorithmSettings[];
}

export interface VisualizationOptions {
  scale: 'linear' | 'log';
  gridLines: boolean;
  showCurveNames: boolean;
  depth: {
    min: number | null;
    max: number | null;
    scale: 'linear' | 'log';
  };
  tracks: TrackOptions[];
}

export interface TrackOptions {
  id: string;
  title: string;
  curves: string[];
  visible: boolean;
}

export interface ProcessedResult {
  originalData: LasFile;
  processedData: LasFile;
  settings: ProcessingSettings;
  timestamp: string;
}
import { LasFile, LogData, CurveInfo, AlgorithmSettings, ProcessingSettings, VisualizationOptions, TrackOptions } from '../types';
import { processCurve } from './algorithms';

/**
 * Get min and max values for a specific curve across all data
 */
export const getCurveMinMax = (
  data: LogData[],
  curveName: string
): { min: number; max: number } => {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  
  for (const row of data) {
    if (row.values[curveName] !== undefined && row.values[curveName] !== null) {
      min = Math.min(min, row.values[curveName]);
      max = Math.max(max, row.values[curveName]);
    }
  }
  
  // Handle case where no valid values found
  if (min === Number.MAX_VALUE) {
    min = 0;
    max = 1;
  }
  
  return { min, max };
};

/**
 * Get min and max depth values
 */
export const getDepthRange = (data: LogData[]): { min: number; max: number } => {
  if (!data.length) return { min: 0, max: 0 };
  
  const min = data[0].depth;
  const max = data[data.length - 1].depth;
  
  return { min, max };
};

/**
 * Extract single curve data as array
 */
export const extractCurveData = (data: LogData[], curveName: string): number[] => {
  return data.map(row => row.values[curveName] || 0);
};

/**
 * Process a LAS file with the given settings
 */
export const processLasFile = (
  lasFile: LasFile,
  settings: ProcessingSettings
): LasFile => {
  // Create a deep copy of the original LAS file
  const processedLasFile: LasFile = JSON.parse(JSON.stringify(lasFile));
  
  // Process each curve except depth
  for (let i = 1; i < lasFile.curveInfo.length; i++) {
    const curveName = lasFile.curveInfo[i].name;
    const curveData = extractCurveData(lasFile.data, curveName);
    
    // Apply processing algorithms
    const processedCurveData = processCurve(curveData, settings.algorithms);
    
    // Update the processed data
    for (let j = 0; j < lasFile.data.length; j++) {
      processedLasFile.data[j].values[curveName] = processedCurveData[j];
    }
  }
  
  return processedLasFile;
};

/**
 * Format a number to a readable string with units
 */
export const formatWithUnit = (value: number, unit: string): string => {
  if (Math.abs(value) < 0.01) {
    return value.toExponential(2) + ' ' + unit;
  }
  return value.toFixed(3) + ' ' + unit;
};

/**
 * Generate a default processing settings object
 */
export const getDefaultProcessingSettings = (): ProcessingSettings => {
  return {
    name: 'Default Settings',
    algorithms: [
      {
        name: 'medianFilter',
        enabled: false,
        parameters: {
          windowSize: 5,
        },
      },
      {
        name: 'movingAverage',
        enabled: false,
        parameters: {
          windowSize: 5,
          preserveEdges: true,
        },
      },
      {
        name: 'lowPassFilter',
        enabled: false,
        parameters: {
          cutoffFrequency: 0.1,
        },
      },
      {
        name: 'despike',
        enabled: true,
        parameters: {
          threshold: 3.0,
          windowSize: 11,
        },
      },
      {
        name: 'adaptiveFilter',
        enabled: false,
        parameters: {
          sensitivity: 0.5,
          windowSize: 11,
        },
      },
      {
        name: 'waveletDenoising',
        enabled: false,
        parameters: {
          threshold: 0.1,
          level: 3,
        },
      },
    ],
  };
};

/**
 * Generate default visualization options
 */
export const getDefaultVisualizationOptions = (curves: CurveInfo[]): VisualizationOptions => {
  // Create a track for each curve except depth (first curve)
  const tracks: TrackOptions[] = curves.slice(1).map((curve, index) => ({
    id: `track-${index}`,
    title: curve.name,
    curves: [curve.name],
    visible: true,
  }));
  
  return {
    scale: 'linear',
    gridLines: true,
    showCurveNames: true,
    depth: {
      min: null,
      max: null,
      scale: 'linear',
    },
    tracks,
  };
};

/**
 * Create a timestamp string for file naming
 */
export const getTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace(/[-:.]/g, '').substring(0, 15);
};

/**
 * Generate a sample LAS file for testing
 */
export const generateSampleLasFile = (): string => {
  return `~VERSION INFORMATION
VERS.   2.0   : CWLS LOG ASCII STANDARD - VERSION 2.0
WRAP.   NO    : ONE LINE PER DEPTH STEP

~WELL INFORMATION
STRT.M     1670.0000        : START DEPTH
STOP.M     1660.0000        : STOP DEPTH
STEP.M       -0.1250        : STEP
NULL.      -999.25         : NULL VALUE
COMP.     COMPANY         : COMPANY
WELL.     WELL-01         : WELL
FLD.      FIELD           : FIELD
LOC.      LOCATION        : LOCATION
SRVC.     SERVICE COMPANY : SERVICE COMPANY
DATE.     2023-01-01      : LOG DATE

~CURVE INFORMATION
DEPT.M     : DEPTH
GR.GAPI    : GAMMA RAY
RHOB.G/C3  : BULK DENSITY
NPHI.V/V   : NEUTRON POROSITY
RT.OHMM    : RESISTIVITY

~PARAMETER INFORMATION

~OTHER INFORMATION
Sample LAS file generated for testing.

~A  DEPTH     GR          RHOB        NPHI        RT
1670.0000    75.0000     2.6500      0.3500      10.0000
1669.8750    76.2000     2.6450      0.3520      10.5000
1669.7500    77.1000     2.6400      0.3540      11.0000
1669.6250    75.5000     2.6350      0.3560      11.5000
1669.5000    74.8000     2.6300      0.3580      12.0000
1669.3750    73.2000     2.6250      0.3600      12.5000
1669.2500    72.5000     2.6200      0.3620      13.0000
1669.1250    71.8000     2.6150      0.3640      13.5000
1669.0000    75.0000     2.6100      0.3660      14.0000
1668.8750    82.0000     2.6050      0.3680      14.5000
1668.7500    85.0000     2.6000      0.3700      15.0000
1668.6250    87.0000     2.5950      0.3720      15.5000
1668.5000    88.0000     2.5900      0.3700      16.0000
1668.3750    90.0000     2.5850      0.3680      16.5000
1668.2500    92.0000     2.5800      0.3660      17.0000
1668.1250    94.0000     2.5750      0.3640      17.5000
1668.0000    95.0000     2.5700      0.3620      18.0000
1667.8750    94.0000     2.5650      0.3600      17.0000
1667.7500    92.0000     2.5600      0.3580      16.0000
1667.6250    90.0000     2.5550      0.3560      15.0000
1667.5000    85.0000     2.5500      0.3540      14.0000
1667.3750    80.0000     2.5550      0.3520      13.0000
1667.2500    75.0000     2.5600      0.3500      12.0000
1667.1250    70.0000     2.5650      0.3480      11.0000
1667.0000    68.0000     2.5700      0.3460      10.0000
1666.8750    67.0000     2.5750      0.3440       9.5000
1666.7500    66.0000     2.5800      0.3420       9.0000
1666.6250    65.0000     2.5850      0.3400       8.5000
1666.5000    64.0000     2.5900      0.3380       8.0000
1666.3750    63.0000     2.5950      0.3360       7.5000
1666.2500    62.0000     2.6000      0.3340       7.0000
1666.1250    61.0000     2.6050      0.3320       6.5000
1666.0000    60.0000     2.6100      0.3300       6.0000
1665.8750    62.0000     2.6150      0.3280       6.5000
1665.7500    64.0000     2.6200      0.3260       7.0000
1665.6250    65.0000     2.6250      0.3240       7.5000
1665.5000    66.0000     2.6300      0.3220       8.0000
1665.3750    68.0000     2.6350      0.3200       8.5000
1665.2500    70.0000     2.6400      0.3220       9.0000
1665.1250    72.0000     2.6450      0.3240       9.5000
1665.0000    75.0000     2.6500      0.3260      10.0000
1664.8750    76.0000     2.6450      0.3280      10.5000
1664.7500    77.0000     2.6400      0.3300      11.0000
1664.6250    78.0000     2.6350      0.3320      11.5000
1664.5000    79.0000     2.6300      0.3340      12.0000
1664.3750    80.0000     2.6250      0.3360      12.5000
1664.2500    81.0000     2.6200      0.3380      13.0000
1664.1250    82.0000     2.6150      0.3400      13.5000
1664.0000    83.0000     2.6100      0.3420      14.0000
1663.8750    84.0000     2.6050      0.3440      13.5000
1663.7500    85.0000     2.6000      0.3460      13.0000
1663.6250    86.0000     2.5950      0.3480      12.5000
1663.5000    87.0000     2.5900      0.3500      12.0000
1663.3750    88.0000     2.5850      0.3520      11.5000
1663.2500    89.0000     2.5800      0.3540      11.0000
1663.1250    90.0000     2.5750      0.3560      10.5000
1663.0000    91.0000     2.5700      0.3580      10.0000
1662.8750    90.0000     2.5650      0.3600       9.5000
1662.7500    89.0000     2.5600      0.3620       9.0000
1662.6250    88.0000     2.5550      0.3640       8.5000
1662.5000    87.0000     2.5500      0.3660       8.0000
1662.3750    86.0000     2.5550      0.3680       7.5000
1662.2500    85.0000     2.5600      0.3700       7.0000
1662.1250    84.0000     2.5650      0.3680       6.5000
1662.0000    83.0000     2.5700      0.3660       6.0000
1661.8750    82.0000     2.5750      0.3640       6.5000
1661.7500    81.0000     2.5800      0.3620       7.0000
1661.6250    80.0000     2.5850      0.3600       7.5000
1661.5000    79.0000     2.5900      0.3580       8.0000
1661.3750    78.0000     2.5950      0.3560       8.5000
1661.2500    77.0000     2.6000      0.3540       9.0000
1661.1250    76.0000     2.6050      0.3520       9.5000
1661.0000    75.0000     2.6100      0.3500      10.0000
1660.8750    74.0000     2.6150      0.3480      10.5000
1660.7500    73.0000     2.6200      0.3460      11.0000
1660.6250    72.0000     2.6250      0.3440      11.5000
1660.5000    71.0000     2.6300      0.3420      12.0000
1660.2500    70.0000     2.6350      0.3400      12.5000
1660.1250    70.5000     2.6400      0.3380      13.0000
1660.0000    71.0000     2.6450      0.3360      13.5000`;
};
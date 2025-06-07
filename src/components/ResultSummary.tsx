import React from 'react';
import { CheckCircle, BarChart4 } from 'lucide-react';
import { useAppStore } from '../store';

const ResultSummary: React.FC = () => {
  const { 
    files, 
    currentFileIndex, 
    processedResults 
  } = useAppStore();
  
  const hasFile = files.length > 0 && currentFileIndex >= 0;
  const currentFile = hasFile ? files[currentFileIndex] : null;
  
  // Find processed result for the current file
  const processedResult = currentFile
    ? processedResults.find(result => result.originalData.filename === currentFile.filename)
    : null;
  
  if (!hasFile || !processedResult) {
    return null;
  }
  
  // Calculate some basic statistics
  const calculateStats = () => {
    const stats: { [curveName: string]: { before: any, after: any } } = {};
    
    // Get curves (excluding depth)
    const curveNames = currentFile.curveInfo.slice(1).map(curve => curve.name);
    
    for (const curveName of curveNames) {
      // Get original and processed data for this curve
      const originalValues = processedResult.originalData.data.map(d => d.values[curveName]);
      const processedValues = processedResult.processedData.data.map(d => d.values[curveName]);
      
      // Calculate statistics
      const beforeMean = calculateMean(originalValues);
      const afterMean = calculateMean(processedValues);
      
      const beforeStd = calculateStandardDeviation(originalValues, beforeMean);
      const afterStd = calculateStandardDeviation(processedValues, afterMean);
      
      const noiseReduction = (1 - afterStd / beforeStd) * 100;
      
      stats[curveName] = {
        before: {
          mean: beforeMean,
          std: beforeStd,
        },
        after: {
          mean: afterMean,
          std: afterStd,
          noiseReduction: noiseReduction,
        },
      };
    }
    
    return stats;
  };
  
  const calculateMean = (values: number[]): number => {
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };
  
  const calculateStandardDeviation = (values: number[], mean: number): number => {
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
    return Math.sqrt(variance);
  };
  
  const stats = calculateStats();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-success-500" />
          <h3 className="text-neutral-700 font-medium">Processing Results</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4 bg-success-50 p-3 rounded-md border border-success-200">
          <CheckCircle className="h-6 w-6 text-success-500 mr-3" />
          <div>
            <p className="font-medium text-success-700">Processing Complete</p>
            <p className="text-sm text-success-600">
              Data successfully processed using {processedResult.settings.algorithms.filter(a => a.enabled).length} algorithms
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <BarChart4 className="h-4 w-4 mr-1 text-primary-600" />
              Statistics Summary
            </h4>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Curve</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Mean (Before)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Mean (After)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Std Dev (Before)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Std Dev (After)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Noise Reduction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {Object.entries(stats).map(([curveName, stat]) => (
                    <tr key={curveName}>
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-neutral-900">{curveName}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-neutral-700">{stat.before.mean.toFixed(3)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-neutral-700">{stat.after.mean.toFixed(3)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-neutral-700">{stat.before.std.toFixed(3)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-neutral-700">{stat.after.std.toFixed(3)}</td>
                      <td className={`px-3 py-2 whitespace-nowrap text-right font-medium ${
                        stat.after.noiseReduction > 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {stat.after.noiseReduction.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-2">Applied Algorithms</h4>
            <ul className="space-y-1 pl-5 list-disc text-sm">
              {processedResult.settings.algorithms
                .filter(alg => alg.enabled)
                .map(alg => (
                  <li key={alg.name}>
                    <span className="font-medium">{getAlgorithmDisplayName(alg.name)}</span>
                    <span className="text-neutral-500">
                      {' - '}
                      {Object.entries(alg.parameters)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const getAlgorithmDisplayName = (name: string): string => {
  switch (name) {
    case 'medianFilter': return 'Median Filter';
    case 'movingAverage': return 'Moving Average';
    case 'lowPassFilter': return 'Low Pass Filter';
    case 'despike': return 'Despike';
    case 'waveletDenoising': return 'Wavelet Denoising';
    case 'adaptiveFilter': return 'Adaptive Filter';
    default: return name;
  }
};

export default ResultSummary;
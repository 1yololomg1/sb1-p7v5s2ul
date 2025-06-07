import React, { useState } from 'react';
import { Sliders, Play, Save, RotateCcw, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { AlgorithmSettings } from '../types';
import AlgorithmExplanation from './AlgorithmExplanation';

const ProcessingControls: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { 
    processingSettings, 
    updateAlgorithmSetting,
    processCurrentFile,
    resetProcessingSettings,
    isProcessing,
    files,
    currentFileIndex,
    saveSettings,
  } = useAppStore();
  
  const hasFile = files.length > 0 && currentFileIndex >= 0;
  
  const handleProcessFile = async () => {
    setError(null);
    try {
      await processCurrentFile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    }
  };
  
  const handleToggleAlgorithm = (index: number) => {
    updateAlgorithmSetting(index, !processingSettings.algorithms[index].enabled, undefined);
  };
  
  const handleParameterChange = (
    algorithmIndex: number,
    paramName: string,
    value: string | number | boolean
  ) => {
    const parsedValue = typeof value === 'string' && !isNaN(Number(value))
      ? Number(value)
      : value;
      
    updateAlgorithmSetting(
      algorithmIndex,
      undefined,
      { [paramName]: parsedValue }
    );
  };
  
  const handleSaveSettings = () => {
    saveSettings();
    alert('Settings saved successfully! These will be used as defaults for future processing.');
  };
  
  const handleResetSettings = () => {
    if (window.confirm('Reset all settings to default values?')) {
      resetProcessingSettings();
      alert('Settings have been reset to default values.');
    }
  };
  
  const renderParameterInput = (
    algorithm: AlgorithmSettings,
    algorithmIndex: number,
    paramName: string,
    value: any
  ) => {
    if (typeof value === 'boolean') {
      return (
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleParameterChange(
              algorithmIndex,
              paramName,
              e.target.checked
            )}
            className="rounded text-accent-600 focus:ring-accent-500"
            disabled={!algorithm.enabled}
          />
          <span>{getParameterDisplayName(paramName)}</span>
          <span className="text-xs text-neutral-500">
            {getParameterDescription(paramName)}
          </span>
        </label>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between text-xs">
            <label htmlFor={`${algorithm.name}-${paramName}`}>
              {getParameterDisplayName(paramName)}
            </label>
            <span>{value}</span>
          </div>
          <input
            id={`${algorithm.name}-${paramName}`}
            type="range"
            min={getMinValue(paramName)}
            max={getMaxValue(paramName)}
            step={getStepValue(paramName)}
            value={value}
            onChange={(e) => handleParameterChange(
              algorithmIndex,
              paramName,
              parseFloat(e.target.value)
            )}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            disabled={!algorithm.enabled}
          />
          <span className="text-xs text-neutral-500">
            {getParameterDescription(paramName)}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${algorithm.name}-${paramName}`} className="text-xs">
          {getParameterDisplayName(paramName)}
        </label>
        <input
          id={`${algorithm.name}-${paramName}`}
          type="text"
          value={value}
          onChange={(e) => handleParameterChange(
            algorithmIndex,
            paramName,
            e.target.value
          )}
          className="border border-neutral-300 rounded px-2 py-1 text-sm"
          disabled={!algorithm.enabled}
        />
        <span className="text-xs text-neutral-500">
          {getParameterDescription(paramName)}
        </span>
      </div>
    );
  };
  
  const getMinValue = (paramName: string): number => {
    switch (paramName) {
      case 'windowSize': return 3;
      case 'threshold': return 1;
      case 'cutoffFrequency': return 0.01;
      case 'sensitivity': return 0;
      case 'level': return 1;
      default: return 0;
    }
  };
  
  const getMaxValue = (paramName: string): number => {
    switch (paramName) {
      case 'windowSize': return 21;
      case 'threshold': return 10;
      case 'cutoffFrequency': return 0.5;
      case 'sensitivity': return 1;
      case 'level': return 5;
      default: return 100;
    }
  };
  
  const getStepValue = (paramName: string): number => {
    switch (paramName) {
      case 'windowSize': return 2;
      case 'threshold': return 0.1;
      case 'cutoffFrequency': return 0.01;
      case 'sensitivity': return 0.05;
      case 'level': return 1;
      default: return 1;
    }
  };
  
  const getParameterDisplayName = (paramName: string): string => {
    switch (paramName) {
      case 'windowSize': return 'Window Size';
      case 'threshold': return 'Threshold';
      case 'cutoffFrequency': return 'Cutoff Frequency';
      case 'sensitivity': return 'Sensitivity';
      case 'level': return 'Decomposition Level';
      case 'preserveEdges': return 'Preserve Edges';
      default: return paramName;
    }
  };
  
  const getParameterDescription = (paramName: string): string => {
    switch (paramName) {
      case 'windowSize': return 'Number of points to consider (larger = smoother)';
      case 'threshold': return 'Sensitivity to noise (higher = more aggressive)';
      case 'cutoffFrequency': return 'Frequency cutoff (lower = smoother)';
      case 'sensitivity': return 'Adaptive filter sensitivity (higher = more cleaning)';
      case 'level': return 'Wavelet decomposition levels';
      case 'preserveEdges': return 'Maintain sharp transitions in the data';
      default: return '';
    }
  };
  
  const getAlgorithmDescription = (name: string): string => {
    switch (name) {
      case 'medianFilter': 
        return 'Removes spikes while preserving edges';
      case 'movingAverage': 
        return 'Smooths data using local averaging';
      case 'lowPassFilter': 
        return 'Removes high-frequency noise';
      case 'despike': 
        return 'Identifies and removes anomalous points';
      case 'waveletDenoising': 
        return 'Multi-scale noise removal';
      case 'adaptiveFilter': 
        return 'Adjusts cleaning based on local properties';
      default: 
        return '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-primary-600" />
            <h3 className="text-neutral-700 font-medium">Processing Controls</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 text-neutral-500 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
              onClick={handleResetSettings}
              disabled={!hasFile}
              title="Reset to default settings"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {!hasFile ? (
            <div className="text-center py-6 text-neutral-500">
              <p>Upload a file to configure processing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-md flex items-start space-x-2 text-error-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              {processingSettings.algorithms.map((algorithm, index) => (
                <div 
                  key={algorithm.name}
                  className={`p-3 rounded-md border ${
                    algorithm.enabled 
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-neutral-200 bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={algorithm.enabled}
                        onChange={() => handleToggleAlgorithm(index)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium">
                        {getAlgorithmDisplayName(algorithm.name)}
                      </span>
                    </label>
                    <span className="text-xs text-neutral-500">
                      {getAlgorithmDescription(algorithm.name)}
                    </span>
                  </div>
                  
                  {algorithm.enabled && (
                    <div className="mt-3 space-y-3 pl-6">
                      {Object.entries(algorithm.parameters).map(([paramName, value]) => (
                        <div key={`${algorithm.name}-${paramName}`}>
                          {renderParameterInput(algorithm, index, paramName, value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 flex space-x-3">
                <button
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleProcessFile}
                  disabled={isProcessing || !hasFile}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Process File</span>
                    </>
                  )}
                </button>
                
                <button
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveSettings}
                  disabled={!hasFile}
                >
                  <Save className="h-5 w-5" />
                  <span className="hidden sm:inline">Save Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AlgorithmExplanation />
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

export default ProcessingControls;
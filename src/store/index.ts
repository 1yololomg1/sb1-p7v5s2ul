import { create } from 'zustand';
import { getDefaultProcessingSettings, getDefaultVisualizationOptions } from '../utils/helpers';
import { LasFile, ProcessingSettings, VisualizationOptions, ProcessedResult } from '../types';
import { processCurve } from '../utils/algorithms';

interface AppState {
  files: LasFile[];
  currentFileIndex: number;
  processingSettings: ProcessingSettings;
  visualizationOptions: VisualizationOptions;
  processedResults: ProcessedResult[];
  isProcessing: boolean;
  selectedCurves: string[];
  
  // Actions
  addFile: (file: LasFile) => void;
  removeFile: (index: number) => void;
  setCurrentFileIndex: (index: number) => void;
  updateProcessingSettings: (settings: Partial<ProcessingSettings>) => void;
  updateAlgorithmSetting: (
    algorithmIndex: number, 
    enabled: boolean | undefined, 
    parameters: { [key: string]: any } | undefined
  ) => void;
  updateVisualizationOptions: (options: Partial<VisualizationOptions>) => void;
  processCurrentFile: () => Promise<void>;
  setSelectedCurves: (curves: string[]) => void;
  resetProcessingSettings: () => void;
  saveSettings: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  files: [],
  currentFileIndex: -1,
  processingSettings: getDefaultProcessingSettings(),
  visualizationOptions: getDefaultVisualizationOptions([]),
  processedResults: [],
  isProcessing: false,
  selectedCurves: [],
  
  addFile: (file: LasFile) => {
    set((state) => {
      const newFiles = [...state.files, file];
      const newIndex = newFiles.length - 1;
      
      const newVisualizationOptions = getDefaultVisualizationOptions(file.curveInfo);
      
      return {
        files: newFiles,
        currentFileIndex: newIndex,
        visualizationOptions: newVisualizationOptions,
        selectedCurves: file.curveInfo.slice(1).map(curve => curve.name),
      };
    });
  },
  
  removeFile: (index: number) => {
    set((state) => {
      const newFiles = [...state.files];
      newFiles.splice(index, 1);
      
      let newCurrentIndex = state.currentFileIndex;
      if (newFiles.length === 0) {
        newCurrentIndex = -1;
      } else if (index === state.currentFileIndex) {
        newCurrentIndex = Math.max(0, index - 1);
      } else if (index < state.currentFileIndex) {
        newCurrentIndex--;
      }
      
      const newProcessedResults = state.processedResults.filter(
        result => result.originalData.filename !== state.files[index].filename
      );
      
      return {
        files: newFiles,
        currentFileIndex: newCurrentIndex,
        processedResults: newProcessedResults,
      };
    });
  },
  
  setCurrentFileIndex: (index: number) => {
    set((state) => {
      if (index < 0 || index >= state.files.length) {
        return state;
      }
      
      const file = state.files[index];
      const newVisualizationOptions = getDefaultVisualizationOptions(file.curveInfo);
      
      return {
        currentFileIndex: index,
        visualizationOptions: newVisualizationOptions,
        selectedCurves: file.curveInfo.slice(1).map(curve => curve.name),
      };
    });
  },
  
  updateProcessingSettings: (settings: Partial<ProcessingSettings>) => {
    set((state) => ({
      processingSettings: {
        ...state.processingSettings,
        ...settings,
      },
    }));
  },
  
  updateAlgorithmSetting: (
    algorithmIndex: number, 
    enabled: boolean | undefined, 
    parameters: { [key: string]: any } | undefined
  ) => {
    set((state) => {
      const newAlgorithms = [...state.processingSettings.algorithms];
      const algorithm = { ...newAlgorithms[algorithmIndex] };
      
      if (enabled !== undefined) {
        algorithm.enabled = enabled;
      }
      
      if (parameters) {
        algorithm.parameters = {
          ...algorithm.parameters,
          ...parameters,
        };
      }
      
      newAlgorithms[algorithmIndex] = algorithm;
      
      return {
        processingSettings: {
          ...state.processingSettings,
          algorithms: newAlgorithms,
        },
      };
    });
  },
  
  updateVisualizationOptions: (options: Partial<VisualizationOptions>) => {
    set((state) => ({
      visualizationOptions: {
        ...state.visualizationOptions,
        ...options,
      },
    }));
  },
  
  processCurrentFile: async () => {
    const { files, currentFileIndex, processingSettings } = get();
    
    if (currentFileIndex < 0 || currentFileIndex >= files.length) {
      throw new Error('No file selected');
    }
    
    set({ isProcessing: true });
    
    try {
      const originalFile = files[currentFileIndex];
      const processedFile = { ...originalFile };
      
      // Process each curve except depth
      for (let i = 1; i < originalFile.curveInfo.length; i++) {
        const curveName = originalFile.curveInfo[i].name;
        const curveData = originalFile.data.map(row => row.values[curveName] || 0);
        
        // Process the curve using local algorithms
        const processedCurveData = processCurve(curveData, processingSettings.algorithms);
        
        // Update the processed data
        for (let j = 0; j < originalFile.data.length; j++) {
          processedFile.data[j].values[curveName] = processedCurveData[j];
        }
      }
      
      const newResult: ProcessedResult = {
        originalData: originalFile,
        processedData: processedFile,
        settings: JSON.parse(JSON.stringify(processingSettings)),
        timestamp: new Date().toISOString(),
      };
      
      set((state) => {
        const newResults = [...state.processedResults];
        const existingIndex = newResults.findIndex(
          result => result.originalData.filename === originalFile.filename
        );
        
        if (existingIndex >= 0) {
          newResults[existingIndex] = newResult;
        } else {
          newResults.push(newResult);
        }
        
        return {
          processedResults: newResults,
          isProcessing: false,
        };
      });
    } catch (error) {
      console.error('Processing error:', error);
      set({ isProcessing: false });
      throw error;
    }
  },
  
  setSelectedCurves: (curves: string[]) => {
    set({ selectedCurves: curves });
  },
  
  resetProcessingSettings: () => {
    set({ processingSettings: getDefaultProcessingSettings() });
  },
  
  saveSettings: () => {
    const { processingSettings } = get();
    localStorage.setItem('processingSettings', JSON.stringify(processingSettings));
  },
  
  resetAll: () => {
    set({
      files: [],
      currentFileIndex: -1,
      processingSettings: getDefaultProcessingSettings(),
      visualizationOptions: getDefaultVisualizationOptions([]),
      processedResults: [],
      isProcessing: false,
      selectedCurves: [],
    });
    localStorage.removeItem('processingSettings');
  },
}));
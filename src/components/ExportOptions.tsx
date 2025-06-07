import React, { useState } from 'react';
import { Download, FileDown, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store';
import { exportToLas } from '../utils/lasParser';
import { saveAs } from 'file-saver';
import { getTimestamp } from '../utils/helpers';

const ExportOptions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    files, 
    currentFileIndex, 
    processedResults 
  } = useAppStore();
  
  const hasFile = files.length > 0 && currentFileIndex >= 0;
  const currentFile = hasFile ? files[currentFileIndex] : null;
  const processedResult = currentFile
    ? processedResults.find(result => result.originalData.filename === currentFile.filename)
    : null;
  
  const handleExportProcessed = () => {
    if (!processedResult) return;
    
    const lasContent = exportToLas(processedResult.processedData);
    const blob = new Blob([lasContent], { type: 'text/plain;charset=utf-8' });
    
    const originalName = processedResult.originalData.filename;
    const baseName = originalName.endsWith('.las') 
      ? originalName.slice(0, -4) 
      : originalName;
    
    const timestamp = getTimestamp();
    const fileName = `${baseName}_cleaned_${timestamp}.las`;
    
    saveAs(blob, fileName);
  };
  
  const handleExportOriginal = () => {
    if (!currentFile) return;
    
    const lasContent = exportToLas(currentFile);
    const blob = new Blob([lasContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, currentFile.filename);
  };
  
  const handleCopyToClipboard = () => {
    if (!processedResult) return;
    
    const lasContent = exportToLas(processedResult.processedData);
    navigator.clipboard.writeText(lasContent)
      .then(() => {
        alert('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  };
  
  if (!hasFile) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-neutral-100 border-b border-neutral-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <Download className="h-5 w-5 text-primary-600" />
          <h3 className="text-neutral-700 font-medium">Export Options</h3>
        </div>
        
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-neutral-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-3">
          <button
            className="w-full flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExportProcessed}
            disabled={!processedResult}
          >
            <FileDown className="h-5 w-5" />
            <span>Export Processed LAS File</span>
          </button>
          
          <button
            className="w-full flex items-center space-x-2 px-4 py-2 bg-neutral-200 text-neutral-800 rounded-md hover:bg-neutral-300 transition-colors"
            onClick={handleExportOriginal}
          >
            <FileDown className="h-5 w-5" />
            <span>Export Original LAS File</span>
          </button>
          
          <button
            className="w-full flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCopyToClipboard}
            disabled={!processedResult}
          >
            <Copy className="h-5 w-5" />
            <span>Copy to Clipboard</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;
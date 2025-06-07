import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store';

const MetadataViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { files, currentFileIndex } = useAppStore();
  
  const hasFile = files.length > 0 && currentFileIndex >= 0;
  const currentFile = hasFile ? files[currentFileIndex] : null;
  
  if (!currentFile) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-neutral-100 border-b border-neutral-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-primary-600" />
          <h3 className="text-neutral-700 font-medium">Well Information</h3>
        </div>
        
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-neutral-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Well Details</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Well Name</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.WELL}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Company</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.COMP || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Field</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.FLD || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Location</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.LOC || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Service Co.</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.SRVC || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Date</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.DATE || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Log Information</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Start Depth</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.STRT}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Stop Depth</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.STOP}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Step</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.STEP}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Null Value</td>
                    <td className="py-1 font-medium">{currentFile.wellInfo.NULL}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Curves</td>
                    <td className="py-1 font-medium">{currentFile.curveInfo.length}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 text-neutral-500">Data Points</td>
                    <td className="py-1 font-medium">{currentFile.data.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">Curve Information</h4>
            <div className="max-h-40 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Unit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentFile.curveInfo.map((curve, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                      <td className="px-3 py-2 font-medium">{curve.name}</td>
                      <td className="px-3 py-2">{curve.unit}</td>
                      <td className="px-3 py-2">{curve.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataViewer;
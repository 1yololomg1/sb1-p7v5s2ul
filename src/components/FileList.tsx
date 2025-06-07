import React from 'react';
import { File, Trash2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';

const FileList: React.FC = () => {
  const { 
    files, 
    currentFileIndex, 
    processedResults,
    setCurrentFileIndex, 
    removeFile 
  } = useAppStore();
  
  if (!files.length) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
        <h3 className="text-neutral-700 font-medium">Files</h3>
      </div>
      
      <ul className="divide-y divide-neutral-200">
        {files.map((file, index) => {
          const isProcessed = processedResults.some(
            result => result.originalData.filename === file.filename
          );
          
          return (
            <li 
              key={`${file.filename}-${index}`}
              className={`relative ${
                index === currentFileIndex 
                  ? 'bg-primary-50' 
                  : 'hover:bg-neutral-50'
              }`}
            >
              <div
                className="w-full text-left px-4 py-3 flex items-center space-x-3 cursor-pointer"
                onClick={() => setCurrentFileIndex(index)}
              >
                <File className={`h-5 w-5 ${
                  index === currentFileIndex ? 'text-primary-600' : 'text-neutral-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {file.wellInfo.WELL} • {file.data.length} depth points
                  </p>
                </div>
                
                {isProcessed && (
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                )}
                
                <button
                  className="ml-2 p-1 text-neutral-400 hover:text-error-500 rounded-full hover:bg-error-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FileList;
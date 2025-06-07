import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { parseLasFile } from '../utils/lasParser';
import { generateSampleLasFile } from '../utils/helpers';
import { useAppStore } from '../store';

const FileUpload: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addFile = useAppStore(state => state.addFile);
  
  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setIsLoading(true);
    
    try {
      for (const file of acceptedFiles) {
        if (!file.name.toLowerCase().endsWith('.las')) {
          setError('Only LAS files are supported');
          continue;
        }
        
        const content = await file.text();
        
        // Try to parse the file
        try {
          const lasFile = parseLasFile(file.name, content);
          addFile(lasFile);
        } catch (err) {
          setError(`Failed to parse ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      setError('Error reading file');
    } finally {
      setIsLoading(false);
    }
  }, [addFile]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'text/plain': ['.las'],
      'application/octet-stream': ['.las'],
    },
    maxFiles: 1,
  });
  
  const loadSampleFile = () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const content = generateSampleLasFile();
      const lasFile = parseLasFile('sample.las', content);
      addFile(lasFile);
    } catch (err) {
      setError(`Failed to load sample file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive 
            ? 'border-accent-600 bg-accent-50' 
            : 'border-neutral-300 hover:border-primary-500 hover:bg-primary-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <Upload 
            className={`h-12 w-12 mb-4 ${
              isDragActive ? 'text-accent-600' : 'text-neutral-400'
            }`} 
          />
          
          {isLoading ? (
            <p className="text-lg font-medium">Processing file...</p>
          ) : (
            <>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the LAS file here' : 'Drag & drop a LAS file here'}
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                or click to select a file
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <button
          onClick={loadSampleFile}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <File className="h-5 w-5" />
          <span>Load Sample File</span>
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-md flex items-start space-x-2 text-error-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
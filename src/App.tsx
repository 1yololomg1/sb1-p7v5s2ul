import React from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import ProcessingControls from './components/ProcessingControls';
import WellLogVisualization from './components/WellLogVisualization';
import ExportOptions from './components/ExportOptions';
import MetadataViewer from './components/MetadataViewer';
import ResultSummary from './components/ResultSummary';
import { useAppStore } from './store';

function App() {
  const { files } = useAppStore();
  const hasFiles = files.length > 0;
  
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {!hasFiles ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Well Log Cleaner</h2>
              <p className="text-neutral-600 mb-6">
                Upload .las files to clean and denoise well log data while preserving important 
                geological features and maintaining relative rock properties.
              </p>
              
              <FileUpload />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <FileList />
              <ProcessingControls />
              <ExportOptions />
            </div>
            
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="h-[600px]">
                <WellLogVisualization />
              </div>
              
              <ResultSummary />
            </div>
            
            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <MetadataViewer />
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-neutral-800 text-neutral-400 py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Well Log Cleaner v0.1.0 | &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
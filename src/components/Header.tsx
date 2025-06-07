import React, { useState } from 'react';
import { Workflow, BarChart4, Settings, HelpCircle, X } from 'lucide-react';
import { useAppStore } from '../store';

const Header: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { resetAll } = useAppStore();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset everything? This action cannot be undone.')) {
      resetAll();
    }
  };

  return (
    <>
      <header className="bg-primary-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Workflow className="h-8 w-8" />
            <h1 className="text-xl font-bold">Well Log Cleaner</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <button className="flex items-center space-x-1 hover:text-primary-100 transition-colors">
                <BarChart4 className="h-5 w-5" />
                <span>Visualize</span>
              </button>
              
              <button 
                className="flex items-center space-x-1 hover:text-primary-100 transition-colors"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              
              <button className="flex items-center space-x-1 hover:text-primary-100 transition-colors">
                <HelpCircle className="h-5 w-5" />
                <span>Help</span>
              </button>
            </div>
            
            <div className="md:hidden">
              <button className="p-1 rounded-md hover:bg-primary-700 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-neutral-800">Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-neutral-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-4">Application Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-primary-600" />
                      <span>Enable dark mode</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-primary-600" />
                      <span>Auto-save changes</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-4">Data Management</h3>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-error-600 text-white rounded hover:bg-error-700 transition-colors"
                >
                  Reset All Data
                </button>
                <p className="mt-2 text-sm text-neutral-500">
                  This will clear all loaded files and reset all settings to their defaults.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                      <span>Enable secure processing</span>
                    </label>
                    <p className="mt-1 text-sm text-neutral-500 ml-6">
                      Process data server-side for enhanced security
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                      <span>Data encryption</span>
                    </label>
                    <p className="mt-1 text-sm text-neutral-500 ml-6">
                      Encrypt all data during transmission
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings
                  setShowSettings(false);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
// Enhanced Topbar.jsx with Save + 3D functionality

import React from 'react';
import tripo3DService from '../services/tripo3DService';

const Topbar = ({
  setShowSidebar,
  onSave,
  isSaving,
  savingWith3D,
  save3DProgress,
  onSaveWith3D // New prop for 3D generation
}) => {

  // Handle regular save
  const handleSave = () => {
    if (onSave) {
      onSave(false); // Save without 3D
    }
  };

  const testTripo3D = async () => {
    try {
      console.log('🧪 Testing Tripo3D connection...');

      // Show loading state
      const button = document.querySelector('#test-tripo-btn');
      if (button) {
        button.textContent = 'Testing...';
        button.disabled = true;
      }

      // Test the connection
      const result = await tripo3DService.testConnection();

      console.log('✅ Connection test successful:', result);
      alert(`✅ Tripo3D Connected!\n\nBalance: ${result.balance?.balance || 'Unknown'}\nMessage: ${result.message}`);

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      alert(`❌ Connection Failed:\n\n${error.message}`);
    } finally {
      // Reset button
      const button = document.querySelector('#test-tripo-btn');
      if (button) {
        button.textContent = 'Test Tripo 3D';
        button.disabled = false;
      }
    }
  };

  // Handle save with 3D generation
  const handleSaveWith3D = () => {
    if (onSaveWith3D) {
      onSaveWith3D(true); // Save with 3D
    } else if (onSave) {
      onSave(true); // Fallback to onSave with 3D flag
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1720px] mx-auto">

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">

            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749337982/Customizer_w0ruf6.png" alt="" />

            <button
              onClick={() => setShowSidebar(prev => !prev)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>


        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-3">

          {/* Regular Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSaving && !savingWith3D
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              }`}
            title="Save design to local storage"
          >
            {isSaving && !savingWith3D ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save</span>
              </>
            )}
          </button>

          {/* Save + 3D Generate Button */}
          <button
            onClick={handleSaveWith3D}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${savingWith3D
                ? 'bg-purple-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            title="Save design and generate 3D model"
          >
            {savingWith3D ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Creating 3D...</span>
              </>
            ) : (
              <>
                <span className="text-lg">🚀</span>
                <span>Save + 3D</span>
              </>
            )}
          </button>

         <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749338383/Buttons_klifkp.png" alt="" />
        </div>
      </div>

      {/* Progress Bar for 3D Generation */}
      {savingWith3D && save3DProgress && (
        <div className="bg-purple-50 border-t border-purple-200 px-6 py-2">
          <div className="flex items-center justify-between max-w-[1720px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-purple-700">
                {save3DProgress}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-xs ml-4">
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: save3DProgress.includes('ready') || save3DProgress.includes('🎉') ? '100%' :
                      save3DProgress.includes('Converting') || save3DProgress.includes('Creating') ? '70%' :
                        save3DProgress.includes('Generating') || save3DProgress.includes('Starting') ? '40%' :
                          save3DProgress.includes('Uploading') || save3DProgress.includes('cloud') ? '20%' : '10%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
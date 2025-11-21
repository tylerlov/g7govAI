
import React from 'react';

interface HeaderProps {
  onHomeClick?: () => void;
  onEditClauses?: () => void;
  isEditing?: boolean;
  onPlaybooksClick?: () => void;
  isPlaybooks?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onEditClauses, isEditing, onPlaybooksClick, isPlaybooks }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo Area */}
          <button 
            onClick={onHomeClick}
            disabled={!onHomeClick}
            className="flex items-center focus:outline-none disabled:cursor-default text-left"
            aria-label="Return to home screen"
          >
            <h1 className="text-[18px] font-semibold text-primary tracking-tight font-sans">
              G7 GovAI: Negotiation Accelerator
            </h1>
          </button>

          {/* Navigation Area */}
          <nav className="flex items-center gap-4">
            {onPlaybooksClick && (
              <button 
                onClick={onPlaybooksClick}
                className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-3 py-1 ${isPlaybooks ? 'text-primary bg-red-50' : 'text-gray-800 hover:text-primary'}`}
              >
                {isPlaybooks ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Upload</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Playbooks</span>
                  </>
                )}
              </button>
            )}

            {onEditClauses && (
              <button 
                onClick={onEditClauses}
                className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-2 ${isEditing ? 'text-primary bg-red-50' : 'text-gray-400 hover:text-primary hover:bg-gray-50'}`}
                aria-label={isEditing ? "Back to Upload" : "Configuration"}
              >
                {isEditing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="pr-1">Back to Upload</span>
                  </>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[14px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

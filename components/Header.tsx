
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
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-wide">
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
                className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-3 py-1 ${isEditing ? 'text-primary bg-red-50' : 'text-gray-800 hover:text-primary'}`}
              >
                {isEditing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Upload</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span>Configuration</span>
                  </>
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

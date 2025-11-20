
import React, { useState } from 'react';
import { ScorecardData, Score } from '../types';

interface ScorecardProps {
  data: ScorecardData;
  onPlaySummary: () => void;
  onStopSummary: () => void;
  ttsState: 'idle' | 'generating' | 'playing';
}

const getHeatmapStyles = (score: Score) => {
  switch (score) {
    case Score.GREEN:
      return {
        container: 'bg-white border-emerald-200 hover:border-emerald-400',
        text: 'text-gray-900',
        subText: 'text-emerald-700',
        label: 'Low Risk',
        icon: (
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      };
    case Score.YELLOW:
      return {
        container: 'bg-white border-amber-200 hover:border-amber-400',
        text: 'text-gray-900',
        subText: 'text-amber-700',
        label: 'Medium Risk',
        icon: (
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      };
    case Score.RED:
      return {
        container: 'bg-white border-red-200 hover:border-primary',
        text: 'text-gray-900',
        subText: 'text-primary',
        label: 'High Risk',
        icon: (
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      };
  }
};

const Scorecard: React.FC<ScorecardProps> = ({ data, onPlaySummary, onStopSummary, ttsState }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (topic: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  return (
    <div className="bg-box-gray rounded-sm p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary">Risk Assessment</h3>
          <button
            onClick={ttsState === 'playing' ? onStopSummary : onPlaySummary}
            disabled={ttsState === 'generating'}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                ttsState === 'playing' 
                ? 'bg-red-100 text-primary hover:bg-red-200' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            {ttsState === 'generating' ? (
                <>
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Audio...</span>
                </>
            ) : ttsState === 'playing' ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    <span>Stop Audio</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Listen to Summary</span>
                </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          {data.map((item) => {
            const styles = getHeatmapStyles(item.score);
            const isExpanded = !!expandedItems[item.topic];

            return (
              <div 
                key={`summary-${item.topic}`}
                className={`rounded-sm border bg-white transition-all duration-200 ${styles.container} ${isExpanded ? 'ring-1 ring-gray-300 shadow-md' : ''}`}
              >
                <button 
                    onClick={() => toggleItem(item.topic)}
                    className="w-full p-6 flex justify-between items-center text-left focus:outline-none"
                    aria-expanded={isExpanded}
                >
                    <div className="flex-1 pr-4">
                        <h4 className={`text-lg font-bold ${styles.text} mb-1`}>{item.topic}</h4>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold uppercase tracking-wider ${styles.subText}`}>{styles.label}</span>
                            {item.sectionReference && item.sectionReference !== 'N/A' && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {item.sectionReference}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {styles.icon}
                        <svg 
                            className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {isExpanded && (
                    <div className="px-6 pb-10 pt-2 border-t border-gray-100 animate-fade-in">
                         <div className="space-y-6 mt-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Summary</h4>
                                <p className="text-gray-700 leading-relaxed">{item.summary}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Plain Language Explanation</h4>
                                <p className="text-gray-700 leading-relaxed">{item.plainLanguageExplanation}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Contract Clause
                                        {item.sectionReference && item.sectionReference !== 'N/A' && (
                                                <span className="font-normal normal-case ml-2 text-gray-400">({item.sectionReference})</span>
                                        )}
                                    </h4>
                                    <div className="p-6 bg-gray-50 rounded-sm border border-gray-200 italic text-sm text-gray-600 h-full">
                                        {item.contractClause || "No specific clause found."}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Standard Model Clause</h4>
                                    <div className="p-6 bg-gray-50 rounded-sm border border-gray-200 text-sm text-gray-600 h-full">
                                        {item.modelClause}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
  );
};

export default Scorecard;

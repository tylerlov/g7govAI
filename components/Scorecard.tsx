
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
        container: 'bg-white border border-gray-200 border-l-[6px] border-l-emerald-500',
        text: 'text-gray-900',
        subText: 'text-emerald-700',
        label: 'Low Risk',
        icon: (
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center" aria-hidden="true">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      };
    case Score.YELLOW:
      return {
        container: 'bg-white border border-gray-200 border-l-[6px] border-l-amber-400',
        text: 'text-gray-900',
        subText: 'text-amber-700',
        label: 'Medium Risk',
        icon: (
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center" aria-hidden="true">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      };
    case Score.RED:
      return {
        container: 'bg-white border border-gray-200 border-l-[6px] border-l-red-600',
        text: 'text-gray-900',
        subText: 'text-primary',
        label: 'High Risk',
        icon: (
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      };
  }
};

const Scorecard: React.FC<ScorecardProps> = ({ data, onPlaySummary, onStopSummary, ttsState }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [copiedTopic, setCopiedTopic] = useState<string | null>(null);

  const toggleItem = (topic: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const allExpanded = data.length > 0 && data.every(item => expandedItems[item.topic]);

  const toggleAll = () => {
    if (allExpanded) {
        setExpandedItems({});
    } else {
        const newExpanded: Record<string, boolean> = {};
        data.forEach(item => {
            newExpanded[item.topic] = true;
        });
        setExpandedItems(newExpanded);
    }
  };

  const handleCopy = (text: string, topic: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedTopic(topic);
        setTimeout(() => setCopiedTopic(null), 2000);
    });
  };

  const redCount = data.filter(item => item.score === Score.RED).length;
  const yellowCount = data.filter(item => item.score === Score.YELLOW).length;
  const greenCount = data.filter(item => item.score === Score.GREEN).length;

  return (
    <div className="bg-box-gray rounded-sm p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-primary">Contract Scorecard</h3>
          <button
            onClick={ttsState === 'playing' ? onStopSummary : onPlaySummary}
            disabled={ttsState === 'generating'}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-colors ${
                ttsState === 'playing' 
                ? 'bg-red-100 text-primary hover:bg-red-200' 
                : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:opacity-50'
            }`}
            aria-label={ttsState === 'playing' ? "Stop audio summary" : "Listen to audio summary"}
          >
            {ttsState === 'generating' ? (
                <>
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Audio...</span>
                </>
            ) : ttsState === 'playing' ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    <span>Stop Audio</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Listen to Summary</span>
                </>
            )}
          </button>
        </div>

        <p className="text-lg text-gray-800 mb-6">
            This section compares the language in the uploaded contract against the requirements set out in your selected playbook.
        </p>

        {/* Summary Visualization */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-gray-300" role="status" aria-label="Risk Summary">
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-red-300 shadow-sm">
                     <div className="w-3 h-3 rounded-full bg-red-600" aria-hidden="true"></div>
                     <span className="font-bold text-gray-900">{redCount} High Risk</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-amber-300 shadow-sm">
                     <div className="w-3 h-3 rounded-full bg-amber-500" aria-hidden="true"></div>
                     <span className="font-bold text-gray-900">{yellowCount} Medium Risk</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-emerald-300 shadow-sm">
                     <div className="w-3 h-3 rounded-full bg-emerald-500" aria-hidden="true"></div>
                     <span className="font-bold text-gray-900">{greenCount} Low Risk</span>
                </div>
            </div>
            <button 
                onClick={toggleAll} 
                className="text-base text-gray-600 hover:text-gray-900 hover:underline transition-colors whitespace-nowrap"
            >
                {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
        </div>
        
        <div className="flex flex-col gap-3">
          {data.map((item) => {
            const styles = getHeatmapStyles(item.score);
            const isExpanded = !!expandedItems[item.topic];

            return (
              <div 
                key={`summary-${item.topic}`}
                className={`rounded-sm transition-all duration-200 ${styles.container} ${isExpanded ? 'shadow-lg ring-1 ring-gray-200' : ''}`}
              >
                <button 
                    onClick={() => toggleItem(item.topic)}
                    className="w-full p-6 text-left focus:outline-none"
                    aria-expanded={isExpanded}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <h4 className={`text-lg font-bold ${styles.text} mb-1`}>{item.topic}</h4>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold uppercase tracking-wider ${styles.subText}`}>{styles.label}</span>
                                {item.sectionReference && item.sectionReference !== 'N/A' && (
                                    <>
                                        <span className="text-gray-300" aria-hidden="true">|</span>
                                        <span className="text-base text-gray-500 font-medium">
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
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Plain Language Explanation visible in collapsed state */}
                    <div className="mt-3 text-base text-gray-800 leading-relaxed font-medium">
                        {item.plainLanguageExplanation}
                    </div>
                </button>

                {isExpanded && (
                    <div className="px-6 pb-10 pt-2 border-t border-gray-100 animate-fade-in">
                         <div className="space-y-6 mt-6">
                            <div>
                                <h4 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-2">Reasoning</h4>
                                <p className="text-gray-900 leading-relaxed">{item.summary}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <h4 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-2">
                                        Contract Clause
                                        {item.sectionReference && item.sectionReference !== 'N/A' && (
                                                <span className="font-normal normal-case ml-2 text-gray-500">({item.sectionReference})</span>
                                        )}
                                    </h4>
                                    <div className="p-6 bg-gray-50 rounded-sm border border-gray-200 text-sm text-gray-800 h-full">
                                        {item.contractClause || "No specific clause found."}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-2">Suggested Revision</h4>
                                    <div className="relative h-full">
                                        <div className="p-6 bg-gray-50 rounded-sm border border-gray-200 text-sm text-gray-800 h-full font-sans leading-relaxed">
                                             {/* Render HTML Diff if available, otherwise fallback to standard revision */}
                                            <div 
                                                className="diff-content"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: item.suggestedRevisionHtml || item.suggestedRevision 
                                                }} 
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleCopy(item.suggestedRevision, item.topic)}
                                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-200 transition-colors"
                                            title="Copy suggested revision"
                                        >
                                            {copiedTopic === item.topic ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                            )}
                                        </button>
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

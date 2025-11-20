
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, ScorecardData } from './types';
import { INITIAL_MODEL_CLAUSES } from './constants';
import { analyzeContract, generateAddendum, generateScorecardSummarySpeech } from './services/geminiService';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ModelClausesEditor from './components/ModelClausesEditor';
import ProgressBar from './components/ProgressBar';
import Scorecard from './components/Scorecard';
import Playbooks from './components/Playbooks';

type TtsState = 'idle' | 'generating' | 'playing';

// Helper function to decode base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [activeTab, setActiveTab] = useState<'upload' | 'config' | 'playbooks'>('upload');
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [modelClauses, setModelClauses] = useState<Record<string, string>>(INITIAL_MODEL_CLAUSES);
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [addendumText, setAddendumText] = useState<string | null>(null);
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const activeSourceNode = useRef<AudioBufferSourceNode | null>(null);
  const step2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize AudioContext on client-side mount.
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
  }, []);
  
  // Focus management for modal
  useEffect(() => {
      if (showPreview) {
          setTimeout(() => modalRef.current?.focus(), 50);
      }
  }, [showPreview]);

  // Auto-scroll to Step 2 when analyzing
  useEffect(() => {
      if (appState === 'analyzing' && step2Ref.current) {
          step2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }, [appState]);

  // Keyboard shortcut for theme toggle (Red/White)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.code === 'KeyR') {
        document.body.classList.toggle('theme-red');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMessage('Please select a file first.');
      setAppState('error');
      return;
    }
    setAppState('analyzing');
    setErrorMessage('');
    setProgress(0);
    
    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 95) {
                return 95;
            }
            return prev + 1;
        });
    }, 150);

    try {
      setProgressText('Analyzing contract against model clauses...');
      const results = await analyzeContract(file, modelClauses);
      
      setProgressText('Generating addendum...');
      const addendum = await generateAddendum(file, results, modelClauses);
      
      clearInterval(progressInterval);
      setProgress(100);
      setProgressText('Analysis complete');
      
      setTimeout(() => {
        setScorecardData(results);
        setAddendumText(addendum);
        setAppState('results');
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis or addendum generation failed:', error);
      setErrorMessage('Failed to process the contract. The file might be corrupted or in an unsupported format. Please try again.');
      setAppState('error');
    }
  };

  const handleGenerateAddendum = () => {
    if (!addendumText) return;
    
    // Escape HTML characters
    const safeText = addendumText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Format text for Word HTML compatibility
    // Split into paragraphs based on double newlines
    const paragraphs = safeText.split(/\n\n+/);
    
    const formattedContent = paragraphs.map(para => {
        if (!para.trim()) return '';
        // Inside paragraphs, preserve single line breaks as <br/>
        const lines = para.split(/\n/);
        const processedLines = lines.map(line => {
             const trimmed = line.trim();
             // Simple heuristic for bold headings: All caps or standard numbering (e.g. "1. DEFINITIONS")
             const isHeading = trimmed.length > 0 && trimmed.length < 100 && (
                 trimmed === trimmed.toUpperCase() || 
                 /^\d+(\.\d+)*\.?\s+[A-Z]/.test(trimmed)
             );
             
             return isHeading ? `<strong>${line}</strong>` : line;
        }).join('<br/>');
        
        return `<p>${processedLines}</p>`;
    }).join('');

    // Use proper HTML structure with Word-specific XML namespaces and CSS
    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
        <meta charset="utf-8">
        <title>AI Services Addendum</title>
        <!--[if gte mso 9]>
        <xml>
        <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
            body { 
                font-family: 'Times New Roman', serif; 
                font-size: 12pt; 
                line-height: 1.5; 
                color: #000000;
                margin: 1.0in;
            }
            p {
                margin: 0 0 12pt 0;
                text-align: justify;
            }
            strong {
                font-weight: bold;
            }
        </style>
        </head>
        <body>
            ${formattedContent}
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI_Addendum.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handlePreviewAddendum = () => {
    if (!addendumText) return;
    setShowPreview(true);
  };
  
  const handlePlaySummary = async () => {
    if (!scorecardData || !audioContext || ttsState !== 'idle') return;

    setTtsState('generating');
    try {
      const audioB64 = await generateScorecardSummarySpeech(scorecardData);
      const audioBuffer = await decodeAudioData(
        decode(audioB64),
        audioContext,
        24000, 
        1,
      );
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      activeSourceNode.current = source;

      source.onended = () => {
        setTtsState('idle');
        activeSourceNode.current = null;
      };

      source.start();
      setTtsState('playing');

    } catch (error) {
      console.error("Failed to generate or play speech summary", error);
      setErrorMessage("Failed to generate the audio summary. Please try again.");
      setTtsState('idle');
    }
  };

  const handleStopSummary = () => {
    if (activeSourceNode.current) {
        try {
            activeSourceNode.current.stop();
        } catch (e) {
        }
        activeSourceNode.current = null;
    }
    setTtsState('idle');
  };

  const handleReset = () => {
    setFile(null);
    setFileName('');
    setScorecardData(null);
    setErrorMessage('');
    setAddendumText(null);
    setShowPreview(false);
    setActiveTab('upload');
    setTtsState('idle');
    setProgress(0);
    setProgressText('');
    setAppState('idle');
    handleStopSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isUiDisabled = appState === 'analyzing';

  const renderPreviewModal = () => {
    if (!showPreview) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
            aria-modal="true" 
            role="dialog"
            aria-labelledby="preview-title"
            tabIndex={-1}
            ref={modalRef}
            onKeyDown={(e) => {
                if (e.key === 'Escape') setShowPreview(false);
            }}
        >
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[90vh] flex flex-col border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h3 id="preview-title" className="text-2xl font-bold text-primary">Addendum Preview</h3>
                    <button
                        onClick={() => setShowPreview(false)}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Close preview"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-8 overflow-y-auto flex-grow bg-white" tabIndex={0}>
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-800">
                        {addendumText}
                    </pre>
                </div>
                <div className="p-6 border-t border-gray-200 text-right flex-shrink-0 bg-gray-50">
                    <button
                        onClick={() => setShowPreview(false)}
                        className="px-8 py-2 border border-gray-800 text-base font-medium rounded-full text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

  return (
    <div className="min-h-screen font-sans bg-white">
      <Header 
        onHomeClick={isUiDisabled ? undefined : handleReset}
        onEditClauses={appState === 'idle' ? () => setActiveTab(prev => prev === 'config' ? 'upload' : 'config') : undefined}
        isEditing={activeTab === 'config'}
        onPlaybooksClick={appState === 'idle' ? () => setActiveTab(prev => prev === 'playbooks' ? 'upload' : 'playbooks') : undefined}
        isPlaybooks={activeTab === 'playbooks'}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
            
            {activeTab === 'playbooks' ? (
                <Playbooks />
            ) : activeTab === 'config' ? (
                <div className="animate-fade-in">
                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-semibold text-primary mb-4">
                            Configuration
                        </h2>
                        <p className="text-lg text-text-primary mb-6">
                            Customize the model clauses used for contract analysis.
                        </p>
                    </div>
                    <div className="bg-box-gray p-8 sm:p-12 rounded-sm mb-8 border border-gray-200 transition-all">
                        <ModelClausesEditor clauses={modelClauses} setClauses={setModelClauses} disabled={isUiDisabled} />
                    </div>
                </div>
            ) : (
                <>
                    {/* Step 1: Upload */}
                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-semibold text-primary mb-4">
                            Step 1: Upload your Contract
                        </h2>
                    </div>

                    <div className="bg-box-gray p-8 sm:p-12 rounded-sm mb-8 border border-gray-200 transition-all">
                        <div className="max-w-3xl">
                            <p className="text-lg text-text-primary mb-6">
                                Before getting started, ensure you have your contract file ready in PDF or Word format. 
                                This tool will analyze the document against our standard model clauses.
                            </p>
                            
                            <div className="mt-8">
                                <FileUpload onFileSelect={handleFileSelect} disabled={isUiDisabled} />
                            </div>

                            {fileName && (
                                <div className="mt-4 flex items-center text-primary font-medium">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Selected: {fileName}
                                </div>
                            )}
                            
                            <div className="mt-8">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!file || isUiDisabled}
                                    className="px-10 py-3 border border-gray-900 text-lg font-medium rounded-full text-gray-900 bg-transparent hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {appState === 'results' ? 'Re-analyze' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="step-divider"></div>

                    {/* Step 2: Scorecard */}
                    <div ref={step2Ref}>
                        <h2 className={`text-3xl sm:text-4xl font-semibold mb-8 transition-colors duration-300 ${
                            appState === 'idle' ? 'text-gray-300' : 'text-primary'
                        }`}>
                            Step 2: Review Risk Scorecard
                        </h2>

                        {(appState === 'analyzing' || appState === 'results' || appState === 'error') && (
                            <div className="animate-fade-in">
                                {appState === 'analyzing' && (
                                    <div className="bg-box-gray rounded-sm p-12 border border-gray-200">
                                        <ProgressBar progress={progress} text={progressText} />
                                    </div>
                                )}

                                {appState === 'error' && (
                                    <div className="text-center p-8 bg-red-50 rounded-sm border border-red-200">
                                        <h3 className="text-xl font-bold text-red-800">An Error Occurred</h3>
                                        <p className="mt-2 text-red-700">{errorMessage}</p>
                                        <button
                                            onClick={handleReset}
                                            className="mt-6 px-8 py-2 border border-red-800 text-base font-medium rounded-full text-red-800 bg-transparent hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                        Try Again
                                        </button>
                                    </div>
                                )}

                                {appState === 'results' && scorecardData && (
                                    <Scorecard 
                                        data={scorecardData}
                                        onPlaySummary={handlePlaySummary}
                                        onStopSummary={handleStopSummary}
                                        ttsState={ttsState}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="step-divider"></div>

                    {/* Step 3: Addendum */}
                    <div>
                        <h2 className={`text-3xl sm:text-4xl font-semibold mb-8 transition-colors duration-300 ${
                            appState === 'results' ? 'text-primary' : 'text-gray-300'
                        }`}>
                            Step 3: Generate Addendum
                        </h2>

                        {appState === 'results' && (
                            <div className="bg-box-gray p-8 sm:p-12 rounded-sm border border-gray-200 animate-fade-in">
                                <h3 className="text-2xl font-bold text-primary mb-4">Drafting Complete</h3>
                                <p className="text-text-secondary mb-8 text-lg">
                                    Based on the deviations found in the risk scorecard, we have generated a remedial addendum to align the contract with your model clauses.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                                    <button
                                        onClick={handleGenerateAddendum}
                                        disabled={!addendumText}
                                        className="w-full sm:w-auto px-8 py-3 border border-gray-800 text-base font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                                    >
                                        Download as .doc
                                    </button>
                                    <button
                                        onClick={handlePreviewAddendum}
                                        disabled={!addendumText}
                                        className="w-full sm:w-auto px-8 py-3 border border-gray-800 text-base font-medium rounded-full text-gray-900 bg-transparent hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                                    >
                                        Preview Addendum
                                    </button>
                                </div>

                                <div className="border-t border-gray-300 pt-8">
                                    <button
                                        onClick={handleReset}
                                        className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-600 bg-white hover:border-gray-400 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    >
                                        Start New Analysis
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

        </div>
      </main>
      {renderPreviewModal()}
    </div>
  );
};

export default App;

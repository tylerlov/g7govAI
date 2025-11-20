import React from 'react';

interface ProgressBarProps {
  progress: number;
  text: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 w-full max-w-xl mx-auto">
      <p className="text-xl font-medium text-primary">{text}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Analysis progress"
        >
        </div>
      </div>
       <p className="text-sm font-medium text-gray-500">{progress}% Complete</p>
    </div>
  );
};

export default ProgressBar;
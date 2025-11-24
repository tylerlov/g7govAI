
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
  variant?: 'primary' | 'secondary';
  selectedFile?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled, variant = 'primary', selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect, disabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const isSecondary = variant === 'secondary';
  const isSelected = !!selectedFile;

  // Unified border colors for both variants (gray-300 default, gray-400 hover)
  // Unified background color (bg-white) for both variants, unless selected
  const dragDropClasses = isDragging
    ? 'border-primary bg-white'
    : isSelected
      ? 'border-primary bg-gray-50' 
      : 'border-gray-300 bg-white hover:border-gray-400';
        
  // Unified border width (border-2) for both variants
  const containerClasses = isSecondary
    ? `p-6 border-2`
    : `p-10 border-2`;

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full ${containerClasses} border-dashed rounded-sm cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${dragDropClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={isSecondary ? "context-upload" : "file-upload"}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        disabled={disabled}
        aria-label={isSecondary ? "Upload context file" : "Upload contract file"}
      />
      
      {isSelected ? (
        <div className="text-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto text-primary h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={`mt-2 font-bold text-gray-900 ${isSecondary ? 'text-base' : 'text-xl mt-4'}`}>
            {selectedFile?.name}
          </p>
          <p className="mt-2 text-base text-gray-700">Click to replace</p>
        </div>
      ) : (
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto text-gray-400 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={`mt-2 font-medium text-gray-900 ${isSecondary ? 'text-base' : 'text-xl mt-4'}`}>
            Click to Upload PDF or Word Document
          </p>
          {!isSecondary && <p className="mt-2 text-base text-gray-600">(or drag and drop here)</p>}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

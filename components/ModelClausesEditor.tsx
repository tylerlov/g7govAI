import React, { useState } from 'react';

interface ModelClausesEditorProps {
  clauses: Record<string, string>;
  setClauses: (clauses: Record<string, string>) => void;
  disabled: boolean;
}

const ModelClausesEditor: React.FC<ModelClausesEditorProps> = ({ clauses, setClauses, disabled }) => {
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseText, setNewClauseText] = useState('');

  const handleClauseChange = (topic: string, value: string) => {
    setClauses({
      ...clauses,
      [topic]: value,
    });
  };

  const handleRemoveClause = (topic: string) => {
    const newClauses = { ...clauses };
    delete newClauses[topic];
    setClauses(newClauses);
  };

  const handleAddClause = () => {
    if (newClauseTitle && newClauseText && !clauses[newClauseTitle]) {
      setClauses({
        ...clauses,
        [newClauseTitle.trim()]: newClauseText,
      });
      setNewClauseTitle('');
      setNewClauseText('');
    }
  };
  
  const handleScrollToAddClause = () => {
    document.getElementById('add-clause-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Configurable Model Clauses</h2>
        <button
            onClick={handleScrollToAddClause}
            disabled={disabled}
            className="px-6 py-2 border border-gray-800 text-sm font-medium rounded-full text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
        >
            Add New Clause
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(clauses).map(([topic, clause]) => (
          <div key={topic} className="bg-white p-6 rounded-sm border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor={`clause-${topic}`} className="block text-lg font-medium text-gray-900">{topic}</label>
              <button
                onClick={() => handleRemoveClause(topic)}
                disabled={disabled}
                className="p-2 rounded-full text-red-800 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={`Remove ${topic} clause`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <textarea
              id={`clause-${topic}`}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-sm shadow-sm focus:ring-primary focus:border-primary bg-white text-gray-800 disabled:opacity-50"
              value={clause}
              onChange={(e) => handleClauseChange(topic, e.target.value)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
      <div id="add-clause-section" className="mt-10 pt-8 border-t border-gray-300 scroll-mt-24">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Clause</h3>
        <div className="space-y-4 bg-white p-6 rounded-sm border border-gray-200">
          <div>
            <label htmlFor="new-clause-title" className="block text-sm font-medium text-gray-700 mb-1">Clause Title</label>
            <input
              id="new-clause-title"
              type="text"
              placeholder="e.g., Service Availability"
              className="w-full p-3 border border-gray-300 rounded-sm shadow-sm focus:ring-primary focus:border-primary"
              value={newClauseTitle}
              onChange={(e) => setNewClauseTitle(e.target.value)}
              disabled={disabled}
            />
             {clauses[newClauseTitle.trim()] && <p className="text-primary text-xs mt-1">A clause with this title already exists.</p>}
          </div>
          <div>
            <label htmlFor="new-clause-text" className="block text-sm font-medium text-gray-700 mb-1">Clause Text</label>
            <textarea
              id="new-clause-text"
              rows={4}
              placeholder="Enter the model clause text..."
              className="w-full p-3 border border-gray-300 rounded-sm shadow-sm focus:ring-primary focus:border-primary"
              value={newClauseText}
              onChange={(e) => setNewClauseText(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="text-right">
            <button
              onClick={handleAddClause}
              disabled={disabled || !newClauseTitle.trim() || !newClauseText || !!clauses[newClauseTitle.trim()]}
              className="px-8 py-2 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Add Clause
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelClausesEditor;
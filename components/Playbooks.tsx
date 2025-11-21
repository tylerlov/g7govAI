
import React, { useState, useRef } from 'react';

// Types
interface Playbook {
  id: number;
  name: string;
  description: string;
  sharedWith: string;
}

// Initial Data matching the screenshot
const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 1,
    name: 'Bank of Canada - AI Procurement Playbook (Custom Development, Tier 2)',
    description: 'Use for Tier 2 contracts (< $150,000) with for custom-developed AI software',
    sharedWith: 'BoC Federal'
  },
  {
    id: 2,
    name: 'Finance Procurement Guidelines for AI - Professional Services',
    description: 'Generally applicable to all contracts for professional services',
    sharedWith: 'Finance Ottawa'
  },
  {
    id: 3,
    name: 'Procurement Standard Clause - SaaS Services',
    description: 'General Federal government guidelines for procurement of AI SaaS services',
    sharedWith: 'All'
  },
   {
    id: 4,
    name: '[Playbook Name]',
    description: '[Description of when to use this playbook]',
    sharedWith: '[Group]'
  }
];

const SHARED_OPTIONS = ['BoC Federal', 'Finance Ottawa', 'All', 'Legal Team', '[Group]'];

const Playbooks: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // New Playbook Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newShared, setNewShared] = useState('BoC Federal');
  const [newFile, setNewFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!newName) return; // Basic validation
    const newPlaybook: Playbook = {
        id: Date.now(),
        name: newName,
        description: newDesc || 'No description provided',
        sharedWith: newShared
    };
    setPlaybooks([...playbooks, newPlaybook]);
    closeModal();
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewShared('BoC Federal');
      setNewFile(null);
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setNewFile(e.target.files[0]);
      }
  }

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newPlaybooks = [...playbooks];
    const draggedItem = newPlaybooks[draggedIndex];

    // Remove from old index
    newPlaybooks.splice(draggedIndex, 1);
    // Insert at new index
    newPlaybooks.splice(index, 0, draggedItem);

    setPlaybooks(newPlaybooks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-[36px] text-primary font-serif">Playbooks</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 border border-gray-800 text-base font-medium rounded-full text-gray-900 bg-transparent hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm"
        >
            + Add Playbook
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-3 px-1">
          <div className="col-span-8 font-extrabold text-gray-900 text-sm uppercase tracking-wide">Playbook Name</div>
          <div className="col-span-4 font-extrabold text-gray-900 text-sm uppercase tracking-wide text-right">Shared with</div>
      </div>

      <div className="space-y-4">
        {playbooks.map((pb, index) => (
            <div 
                key={pb.id} 
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`border border-gray-300 rounded-lg p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm cursor-move transition-all duration-200 ${
                    draggedIndex === index ? 'opacity-50 bg-gray-50 scale-[1.01] border-gray-400' : 'opacity-100 hover:border-gray-400'
                }`}
            >
                <div className="flex-1 pr-4 pointer-events-none">
                    <h3 className="font-bold text-primary text-lg leading-tight mb-1">{pb.name}</h3>
                    <p className="text-gray-900 text-sm font-medium leading-snug">{pb.description}</p>
                </div>
                <div className="w-full md:w-auto min-w-[180px]">
                    <div className="relative">
                         <select 
                            value={pb.sharedWith}
                            onChange={(e) => {
                                const updated = playbooks.map(p => p.id === pb.id ? {...p, sharedWith: e.target.value} : p);
                                setPlaybooks(updated);
                            }}
                            className="w-full appearance-none bg-white border-2 border-gray-300 text-gray-900 py-2 px-4 pr-10 rounded-md leading-tight focus:outline-none focus:border-gray-900 font-bold text-sm truncate cursor-pointer"
                            // Stop propagation to prevent dragging when interacting with select
                            onMouseDown={(e) => e.stopPropagation()}
                         >
                            {SHARED_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                         </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-900">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                         </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if(e.target === e.currentTarget) closeModal(); }}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 border-2 border-gray-300 relative animate-fade-in">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Add Playbook</h3>
                <p className="text-gray-900 font-bold text-sm mb-6">This tool accepts playbooks in Word or PDF format.</p>
                
                <div className="space-y-5">
                    {/* Name */}
                    <div>
                         <input 
                            type="text" 
                            placeholder="Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full border-2 border-gray-300 bg-white rounded-md p-3 text-gray-900 placeholder-gray-500 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 italic"
                         />
                    </div>

                     {/* File Select */}
                    <div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                        />
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                            >
                                Choose File
                            </button>
                            <span className={`text-sm truncate ${newFile ? 'text-gray-900 font-medium' : 'text-gray-500 italic'}`}>
                                {newFile ? newFile.name : 'No file chosen'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                        <textarea 
                            placeholder="Description"
                            rows={4}
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full border-2 border-gray-300 bg-white rounded-md p-3 text-gray-900 placeholder-gray-500 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 italic resize-none"
                        />
                    </div>

                    {/* Shared With */}
                    <div>
                         <label className="block text-gray-900 font-extrabold text-sm mb-1">Shared with</label>
                         <div className="relative w-1/2">
                            <select 
                                value={newShared}
                                onChange={(e) => setNewShared(e.target.value)}
                                className="w-full appearance-none bg-white border-2 border-gray-300 text-gray-900 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:border-gray-900 font-medium text-sm"
                            >
                                {SHARED_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-8 pt-2">
                         <button 
                            onClick={handleSave}
                            className="px-12 py-3 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-800 transition-colors shadow-sm text-sm"
                        >
                            Save
                        </button>
                    </div>
                </div>
                 <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Playbooks;

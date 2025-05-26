import React, { useEffect, useRef } from "react";
import { MdClose, MdStar, MdBookmark, MdPlayArrow, MdVolumeUp } from "react-icons/md";
import { FaRegLightbulb } from "react-icons/fa";
import useClickOutside from "../hooks/useClickOutside";
import "../utils/quranLearningStyles.css"; // Import custom styles

const MemorizationTechniqueDialog = ({ open, setOpen, onApply }) => {
  const dialogRef = useClickOutside(() => setOpen(false), open);
  
  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  // Handle keydown events for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  const techniques = [
    {
      id: 1,
      title: "Chunking Method",
      description: "Break verses into smaller, manageable chunks. Master each chunk before moving on to the next one.",
      steps: [
        "Read the full verse 5 times",
        "Divide the verse into 2-3 chunks",
        "Memorize the first chunk (5-10 repetitions)",
        "Memorize the second chunk (5-10 repetitions)",
        "Combine chunks and repeat 10 times"
      ]
    },
    {
      id: 2,
      title: "Repetition Method",
      description: "Repetition is the key to transferring information from short-term to long-term memory.",
      steps: [
        "Read the verse with translation",
        "Repeat the verse 10 times while looking",
        "Close your eyes and recite 5 times",
        "Check for errors and repeat process",
        "Move to next verse only after mastery"
      ]
    },
    {
      id: 3,
      title: "Write and Recite",
      description: "Writing engages different parts of the brain, enhancing memory retention.",
      steps: [
        "Read the verse aloud 3 times",
        "Write the verse in Arabic",
        "Recite what you've written",
        "Repeat until you can write from memory",
        "Recite without looking at your writing"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        ref={dialogRef}
        className="relative w-full max-w-2xl bg-theme-card-bg rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
        aria-modal="true"
        role="dialog"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-theme-border p-4">
          <h2 id="dialog-title" className="text-xl font-bold text-theme-text-primary flex items-center">
            <FaRegLightbulb className="text-yellow-500 mr-2" />
            Memorization Techniques
          </h2>
          <button 
            onClick={() => setOpen(false)}
            className="text-theme-text-secondary hover:text-theme-text-primary"
            aria-label="Close dialog"
          >
            <MdClose size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          <p className="text-theme-text-secondary mb-6">
            Choose a memorization technique that works best for you. Different techniques suit different learning styles.
          </p>
          
          <div className="space-y-8">
            {techniques.map(technique => (
              <div key={technique.id} className="border border-theme-border rounded-lg overflow-hidden">
                <div className="bg-theme-primary-accent bg-opacity-10 p-4">
                  <h3 className="text-lg font-semibold text-theme-text-primary flex items-center">
                    {technique.title}
                    {technique.id === 2 && (
                      <span className="ml-2 text-sm text-white bg-theme-primary-accent px-2 py-0.5 rounded-full flex items-center">
                        <MdStar size={14} className="mr-1" /> Recommended
                      </span>
                    )}
                  </h3>
                  <p className="text-theme-text-secondary mt-1">{technique.description}</p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-theme-text-primary mb-2">Steps to follow:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-theme-text-secondary">
                    {technique.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => {
                        onApply(technique);
                        setOpen(false);
                      }}
                      className="bg-theme-primary-accent text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Apply This Technique
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-theme-border p-4 flex justify-between">
          <button 
            onClick={() => setOpen(false)}
            className="px-4 py-2 border border-theme-border rounded-lg text-theme-text-primary text-sm font-medium"
          >
            Close
          </button>
          <button 
            onClick={() => window.open("https://example.com/memorization-guide", "_blank")}
            className="flex items-center text-theme-primary-accent hover:underline text-sm"
          >
            <MdBookmark className="mr-1" size={16} />
            Save Guide for Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemorizationTechniqueDialog;

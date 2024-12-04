import React, { useState } from 'react';
import { HelpCircle, Sparkles, X, AlertCircle, Search, FileCheck } from 'lucide-react';
import { TableDefinition } from '../types/schema';

interface AIAssistantProps {
  table: TableDefinition;
}

export function AIAssistant({ table }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulate AI suggestions based on table structure
  function generateSuggestions() {
    const tableSuggestions = [
      {
        icon: <Search className="h-4 w-4 text-blue-600" />,
        text: `Filter ${table.displayName} by status to focus on active records`
      },
      {
        icon: <FileCheck className="h-4 w-4 text-blue-600" />,
        text: `Export ${table.displayName} data to analyze trends`
      },
      {
        icon: <AlertCircle className="h-4 w-4 text-blue-600" />,
        text: `Review recent changes in the audit log`
      }
    ];
    setSuggestions(tableSuggestions);
  }

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          generateSuggestions();
        }}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="AI Assistant"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium">AI Suggestions</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                {suggestion.icon}
                <p className="text-sm text-gray-600">{suggestion.text}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                AI suggestions are updated based on your current context
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
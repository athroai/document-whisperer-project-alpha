
import React, { useState } from 'react';
import { Citation } from '@/types/citations';
import CitedMessageDisplay from '@/components/citations/CitedMessageDisplay';

const CitationDemo: React.FC = () => {
  const [message] = useState({
    content: "The mitochondria is the powerhouse of the cell [1]. This is a fundamental concept in biology [2]. In eukaryotic cells, mitochondria perform various biochemical processes [3].",
    citations: [
      {
        id: "src_001",
        label: "[1]",
        filename: "biology_notes.pdf",
        page: 12,
        highlight: "Mitochondria produce energy by breaking down nutrients through cellular respiration.",
        timestamp: new Date().toISOString()
      },
      {
        id: "src_002",
        label: "[2]",
        filename: "cell_biology_textbook.pdf",
        page: 45,
        section: "Chapter 3: Cell Organelles",
        highlight: "Understanding the function of organelles is critical to understanding cell biology.",
        timestamp: new Date().toISOString()
      },
      {
        id: "src_003",
        label: "[3]",
        filename: "advanced_biochemistry.docx",
        section: "Metabolic Pathways",
        highlight: "The biochemical processes in mitochondria include the citric acid cycle, electron transport chain, and oxidative phosphorylation.",
        timestamp: new Date().toISOString()
      }
    ]
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Citation System Demo</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Example AI Response with Citations</h2>
        <div className="prose max-w-none">
          <CitedMessageDisplay message={message} />
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">How Citations Work</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Citations appear as numbered references like <span className="text-blue-500">[1]</span> in the text</li>
          <li>Hover over a citation to see a quick preview of the source</li>
          <li>Click on a citation to view more details or the full document</li>
          <li>The references panel shows all sources used in the response</li>
        </ul>
      </div>
    </div>
  );
};

export default CitationDemo;

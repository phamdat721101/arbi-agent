"use client";

import { useState } from "react";

interface Tab {
  label: string;
  code: string;
  language: string;
}

interface CodeSnippetProps {
  tabs: Tab[];
}

export default function CodeSnippet({ tabs }: CodeSnippetProps) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(tabs[active].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#21262D] px-2">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActive(i)}
              className={`px-4 py-2 text-xs transition-colors ${
                i === active
                  ? "text-[#E6EDF3] border-b-2 border-[#12AAFF]"
                  : "text-[#8B949E] hover:text-[#E6EDF3]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="text-xs text-[#8B949E] hover:text-[#E6EDF3] px-3 py-1 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-[#E6EDF3] overflow-x-auto whitespace-pre">
        {tabs[active].code}
      </pre>
    </div>
  );
}

"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";

export default function CodeBlock({ code, language }: { code: string, language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            {/* Window Bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#252526] border-b border-[#333]">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Terminal size={12} />
                    <span className="uppercase">{language}</span>
                </div>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            
            {/* Code Content */}
            <div className="text-sm font-mono overflow-x-auto custom-scrollbar relative">
                <SyntaxHighlighter 
                    language={language === 'tsx' ? 'typescript' : language} 
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                    showLineNumbers={true}
                    wrapLines={true}
                >
                    {code}
                </SyntaxHighlighter>
                
                {/* Overlay Gradient (Optional: for long code) */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none opacity-50" />
            </div>
        </div>
    );
}
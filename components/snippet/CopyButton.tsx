"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
        onClick={handleCopy} 
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
    >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        {copied ? "Copied!" : "Copy Code"}
    </button>
  );
}
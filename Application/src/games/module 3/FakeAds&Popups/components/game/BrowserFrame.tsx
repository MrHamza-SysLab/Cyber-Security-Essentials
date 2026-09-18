import React from 'react';
import { Lock, RotateCcw, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface BrowserFrameProps {
  url: string;
  children: React.ReactNode;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({ url, children }) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-2xl border border-slate-200 rounded-lg m-4">
      {/* Browser Header */}
      <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-4">
        <div className="flex gap-1.5 ml-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <RotateCcw className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex-1 max-w-2xl bg-white border border-slate-300 rounded-md py-1 px-3 flex items-center gap-2 shadow-sm">
          <Lock className="w-3 h-3 text-green-600" />
          <span className="text-xs text-slate-600 truncate">https://{url}</span>
        </div>

        <div className="flex items-center gap-4 mr-2">
          <div className="w-6 h-6 rounded-full bg-slate-300" />
          <X className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 overflow-auto relative bg-slate-50">
        {children}
      </div>
    </div>
  );
};

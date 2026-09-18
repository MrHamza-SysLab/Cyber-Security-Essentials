import React from 'react';
import type { GameElement, Level } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Download, Play, AlertCircle, X } from 'lucide-react';

interface LevelRendererProps {
  level: Level;
  onElementClick: (element: GameElement) => void;
}

export const LevelRenderer: React.FC<LevelRendererProps> = ({ level, onElementClick }) => {
  const renderElement = (element: GameElement) => {
    switch (element.style) {
      case 'download-btn':
        return (
          <button
            key={element.id}
            onClick={() => onElementClick(element)}
            className={`
              flex items-center gap-2 px-8 py-4 font-bold rounded shadow-lg transition-transform hover:scale-105 active:scale-95
              ${element.type === 'fake' 
                ? 'bg-green-500 text-white text-xl uppercase tracking-tighter' 
                : 'bg-slate-200 text-slate-800 border border-slate-300'}
            `}
          >
            <Download className="w-6 h-6" />
            {element.label}
          </button>
        );
      case 'banner':
        return (
          <div
            key={element.id}
            onClick={() => onElementClick(element)}
            className="w-full bg-yellow-100 border-2 border-yellow-400 p-4 flex items-center justify-between cursor-pointer hover:bg-yellow-200 transition-colors"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
              <div>
                <p className="font-bold text-red-600 uppercase text-sm">System Warning</p>
                <p className="text-slate-800">{element.label}</p>
              </div>
            </div>
            <Button size="sm" variant="destructive">FIX NOW</Button>
          </div>
        );
      case 'popup':
        return (
          <div
            key={element.id}
            className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden pointer-events-auto"
          >
            <div className="bg-slate-800 text-white p-2 flex justify-between items-center">
              <span className="text-xs font-bold">System Notification</span>
              <X className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100" />
            </div>
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-slate-800 font-medium mb-6">{element.label}</p>
              <Button 
                onClick={() => onElementClick(element)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                OK
              </Button>
            </div>
          </div>
        );
      case 'button':
        return (
          <Button
            key={element.id}
            onClick={() => onElementClick(element)}
            variant={element.type === 'real' ? 'default' : 'secondary'}
            className={`
              ${element.id === 'real-play' ? 'w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700' : 'px-6 py-2'}
            `}
          >
            {element.id === 'real-play' ? <Play className="w-10 h-10 fill-white" /> : element.label}
          </Button>
        );
      case 'link':
        return (
          <a
            key={element.id}
            href="#"
            onClick={(e) => { e.preventDefault(); onElementClick(element); }}
            className="text-blue-600 underline hover:text-blue-800 text-sm"
          >
            {element.label}
          </a>
        );
      default:
        return null;
    }
  };

  const renderSoftwareLayout = () => (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-start gap-8 mb-12">
        <div className="w-32 h-32 bg-slate-200 rounded-xl flex items-center justify-center border border-slate-300">
          <Play className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">VideoEditor Pro v2.4.1</h1>
          <p className="text-slate-600 mb-4">The most powerful free video editor for Windows and Mac. Professional features, zero cost.</p>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Size: 42.5 MB</span>
            <span>Downloads: 1.2M+</span>
            <span>Rating: ★★★★☆</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center bg-white p-12 rounded-2xl border border-slate-200 shadow-sm">
        {level.elements.filter(e => e.style === 'download-btn').map(renderElement)}
      </div>

      <div className="mt-12 space-y-6">
        {level.elements.filter(e => e.style === 'banner').map(renderElement)}
        <div className="p-6 border-t border-slate-200">
          <h3 className="font-bold mb-4">Other Download Options:</h3>
          <div className="flex flex-wrap gap-4">
            {level.elements.filter(e => e.style === 'link').map(renderElement)}
          </div>
        </div>
      </div>
      {level.elements.filter(e => e.style === 'popup').map((e, i) => (
        <div key={e.id} style={{ transform: `translate(${i * 20}px, ${i * 20}px)` }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px]">
          {renderElement(e)}
        </div>
      ))}
    </div>
  );

  const renderStreamingLayout = () => (
    <div className="bg-slate-900 min-h-full text-white">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <span className="text-red-600 font-black text-2xl italic">FLIX-FREE</span>
        <div className="flex gap-4 text-sm opacity-60">
          <span>Movies</span>
          <span>TV Shows</span>
          <span>Trending</span>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        <div className="aspect-video bg-black rounded-lg border border-white/20 flex items-center justify-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {level.elements.filter(e => e.id === 'real-play').map(renderElement)}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-4">
              <div className="w-8 h-1 bg-white/30 rounded-full" />
              <div className="w-8 h-1 bg-white/30 rounded-full" />
            </div>
            <span className="text-xs font-mono">00:00 / 02:14:00</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Blockbuster Movie (2024)</h2>
            <p className="text-slate-400">Action, Adventure | 134 min | English</p>
            <div className="flex gap-4">
              {level.elements.filter(e => e.id === 'fake-play').map(renderElement)}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase font-bold text-slate-500">Sponsored</p>
            {level.elements.filter(e => e.style === 'banner').map(renderElement)}
          </div>
        </div>
      </div>
      {level.elements.filter(e => e.style === 'popup').map((e, i) => (
        <div key={e.id} style={{ transform: `translate(${i * 20}px, ${i * 20}px)` }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px]">
          {renderElement(e)}
        </div>
      ))}
    </div>
  );

  const renderTechSupportLayout = () => (
    <div className="bg-blue-600 min-h-full flex items-center justify-center p-8">
      <div className="bg-white rounded shadow-2xl max-w-2xl w-full p-12 text-center relative">
        <div className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 cursor-pointer">
          <X className="w-6 h-6" />
        </div>
        <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-slate-900 mb-4">CRITICAL SYSTEM ERROR</h1>
        <p className="text-xl text-red-600 font-bold mb-8">Windows Defender has detected a Trojan Virus on your device!</p>
        
        <div className="bg-slate-100 p-6 rounded-lg mb-8 text-left font-mono text-sm border border-slate-200">
          <p className="text-red-500 mb-2">Error Code: 0x8004210B</p>
          <p>Location: C:\Windows\System32\drivers\etc\hosts</p>
          <p>Threat: Trojan.Win32.Generic</p>
        </div>

        <div className="flex flex-col gap-4">
          {level.elements.filter(e => e.id === 'fake-scan').map(renderElement)}
          {level.elements.filter(e => e.id === 'real-close').map(renderElement)}
        </div>

        {level.elements.filter(e => e.style === 'popup').map((e, i) => (
          <div key={e.id} style={{ transform: `translate(${i * 20}px, ${i * 20}px)` }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px]">
            {renderElement(e)}
          </div>
        ))}
      </div>
    </div>
  );

  switch (level.id) {
    case 'software-download':
      return renderSoftwareLayout();
    case 'streaming-site':
      return renderStreamingLayout();
    case 'tech-support':
      return renderTechSupportLayout();
    case 'social-phishing':
      return (
        <div className="bg-[#f0f2f5] min-h-full font-sans">
          <div className="bg-[#1877f2] p-3 flex justify-between items-center shadow-md">
            <span className="text-white font-bold text-2xl">facebook</span>
          </div>
          <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-center">Security Check</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-sm text-red-700">We detected an unusual login attempt from Moscow, Russia.</p>
            </div>
            <p className="text-slate-600 text-sm mb-8">To protect your account, please verify your identity by logging in again below.</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="h-10 bg-slate-100 rounded border border-slate-200 w-full" />
                <div className="h-10 bg-slate-100 rounded border border-slate-200 w-full" />
              </div>
              {level.elements.filter(e => e.id === 'fake-login').map(renderElement)}
              <div className="text-center">
                {level.elements.filter(e => e.id === 'real-exit').map(renderElement)}
              </div>
            </div>
          </div>
          <div className="max-w-md mx-auto mt-8">
            {level.elements.filter(e => e.style === 'banner').map(renderElement)}
          </div>
          {level.elements.filter(e => e.style === 'popup').map((e, i) => (
            <div key={e.id} style={{ transform: `translate(${i * 20}px, ${i * 20}px)` }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px]">
              {renderElement(e)}
            </div>
          ))}
        </div>
      );
    case 'ecommerce-scam':
      return (
        <div className="bg-white min-h-full font-sans">
          <div className="bg-slate-900 p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full" />
            <span className="text-white font-bold text-xl">Global Rewards</span>
          </div>
          <div className="p-8 text-center">
            <div className="inline-block p-2 bg-orange-100 text-orange-700 rounded-full px-4 text-sm font-bold mb-4 animate-bounce">
              LUCKY VISITOR #882
            </div>
            <h1 className="text-4xl font-black mb-8 tracking-tight">YOU HAVE WON!</h1>
            
            <div className="relative max-w-sm mx-auto mb-12">
              <div className="aspect-square bg-slate-100 rounded-full border-8 border-orange-500 flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-4 grid-rows-4 w-full h-full opacity-20">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="border border-slate-400" />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <div className="w-16 h-24 bg-slate-800 rounded-lg relative">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-600 rounded-full" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {level.elements.filter(e => e.id === 'fake-claim').map(renderElement)}
              {level.elements.filter(e => e.id === 'real-terms').map(renderElement)}
            </div>
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-200">
            {level.elements.filter(e => e.style === 'banner').map(renderElement)}
          </div>
          {level.elements.filter(e => e.style === 'popup').map((e, i) => (
            <div key={e.id} style={{ transform: `translate(${i * 20}px, ${i * 20}px)` }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px]">
              {renderElement(e)}
            </div>
          ))}
        </div>
      );
    case 'crypto-scam':
      return (
        <div className="bg-[#0b0e11] min-h-full text-white font-sans">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full" />
              <span className="font-bold text-xl">WalletSync Pro</span>
            </div>
            <div className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">
              SECURE CONNECTION
            </div>
          </div>
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Synchronize Your Wallet</h1>
            <p className="text-slate-400 mb-12">To prevent account suspension and ensure fund safety, please synchronize your wallet with our secure node.</p>
            
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                {level.elements.filter(e => e.id === 'fake-connect').map(renderElement)}
              </div>
              <div className="p-4">
                {level.elements.filter(e => e.id === 'real-abort').map(renderElement)}
              </div>
            </div>

            <div className="mt-12">
              {level.elements.filter(e => e.style === 'banner').map(renderElement)}
            </div>
          </div>
          {level.elements.filter(e => e.style === 'popup').map((e, i) => (
            <div key={e.id} style={{ transform: `translate(${i * 20}px, ${i * 20}px)` }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                {renderElement(e)}
              </div>
            </div>
          ))}
        </div>
      );
    case 'popup-hell':
      return (
        <div className="bg-slate-100 min-h-full flex items-center justify-center p-8 relative overflow-hidden">
          <div className="text-center z-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-8 tracking-tighter">SYSTEM SCAN IN PROGRESS...</h1>
            <div className="w-64 h-64 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-12" />
            {level.elements.filter(e => e.id === 'real-exit-browser').map(renderElement)}
          </div>
          
          {/* Aggressive Popups */}
          {level.elements.filter(e => e.style === 'popup').map((e, i) => (
            <div 
              key={e.id} 
              className="fixed z-50 flex items-center justify-center pointer-events-none"
              style={{ 
                top: `${20 + (i * 15)}%`, 
                left: `${20 + (i * 10)}%`,
                width: '100%',
                height: '100%',
                position: 'fixed',
                transform: `translate(${(i - 1) * 40}px, ${(i - 1) * 40}px)`
              }}
            >
              <div className="pointer-events-auto">
                {renderElement(e)}
              </div>
            </div>
          ))}

          {/* Background noise */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i} 
                className="absolute text-[10px] font-mono whitespace-nowrap"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              >
                WARNING: THREAT DETECTED 0x000{i}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <div>Level not found</div>;
  }
};

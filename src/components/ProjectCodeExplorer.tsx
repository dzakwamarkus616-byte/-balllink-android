import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Code2,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';

interface ProjectCodeExplorerProps {
  onOpenFile?: (file: AndroidFile) => void;
}

export const ProjectCodeExplorer: React.FC<ProjectCodeExplorerProps> = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = ANDROID_PROJECT_FILES.filter(file => {
    const matchesSearch =
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageBadgeColor = (lang: string) => {
    switch (lang) {
      case 'kotlin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'xml':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'yaml':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[720px]">
      {/* Sidebar: File Tree & Categories */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Android Project Tree
              </span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {ANDROID_PROJECT_FILES.length} files
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search files or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1">
            {['all', 'core', 'manifest', 'layout', 'resources', 'gradle'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-md capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between group transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  <div className="truncate text-left">
                    <div className="font-mono text-[11px] font-medium truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500 truncate font-sans">{file.path}</div>
                  </div>
                </div>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border shrink-0 font-mono ml-2 ${getLanguageBadgeColor(file.language)}`}>
                  {file.language}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick project info at bottom of sidebar */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[10px]">com.balllink.app</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">SDK 34 (Android 14)</span>
        </div>
      </div>

      {/* Main Content: Selected File Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/90">
        {/* File Header Bar */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-100 truncate">
                  {selectedFile.path}
                </span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-mono ${getLanguageBadgeColor(selectedFile.language)}`}>
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xl">
                {selectedFile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin bg-slate-950">
          <pre className="table w-full">
            <code>
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-900/50">
                  <span className="table-cell select-none text-right pr-4 text-slate-600 text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono text-[12px] text-slate-200">
                    {line}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Code2,
  FileCode,
  Terminal,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  Settings,
  ShieldCheck,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { FootballIconSvg } from './components/FootballIconSvg';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ProjectCodeExplorer } from './components/ProjectCodeExplorer';
import { ApkBuildGuide } from './components/ApkBuildGuide';
import { RequirementsChecklist } from './components/RequirementsChecklist';
import { generateAndDownloadProjectZip } from './utils/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide' | 'checklist'>('simulator');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Optional customizer values
  const [appName, setAppName] = useState('BallLink');
  const [packageName, setPackageName] = useState('com.balllink.app');
  const [appUrl, setAppUrl] = useState('https://ball-link.web.app');
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await generateAndDownloadProjectZip({
        appName,
        packageName,
        url: appUrl,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (error) {
      console.error('Failed to export zip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('simulator')}>
              <FootballIconSvg size={38} />
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  Ball<span className="text-[#16a34a]">Link</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Native Android App
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Football Talent Connect • Kotlin WebView & APK Builder
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowConfigModal(true)}
              title="Configure Package Name & App URL"
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Configure</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 bg-[#16a34a] hover:bg-emerald-600 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Packaging ZIP...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Downloaded Project!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Project (.ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 py-2 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Live Device Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'code'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Android Studio Code Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>APK Build Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'checklist'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Requirements (10/10)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with Overview */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-slate-900 to-[#0f172a] border border-slate-800 p-6 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-950/20 to-transparent pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#16a34a]/20 text-[#22c55e] border border-[#16a34a]/40">
                  Ready to Build
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Package: <span className="text-slate-200">{packageName}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Target: <span className="text-emerald-400 underline">{appUrl}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Complete Native Android Studio Project for BallLink
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Full-featured Kotlin Android app with WebView, native splash screen (<span className="text-[#16a34a] font-semibold">#16a34a</span> on <span className="font-semibold text-slate-300">#0f172a</span>), file upload support, hardware back-stack navigation, and progress bar.
              </p>
            </div>

            <div className="flex flex-row lg:flex-col items-center sm:items-end gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#16a34a] hover:bg-emerald-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Project (.ZIP)</span>
              </button>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Includes Gradle 8.7, Kotlin 2.0 & CI/CD workflow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Phone Simulator Left / Center */}
            <div className="lg:col-span-5 flex justify-center">
              <PhoneSimulator />
            </div>

            {/* Simulator Details & Feature Breakdown Right */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Android Shell Features</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test and inspect the native Android capabilities built into the project:
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Native Splash Screen</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Displays football vector icon with brand text "BallLink" in <code className="text-emerald-400">#16a34a</code> over <code className="text-slate-300">#0f172a</code> with a smooth fade animation.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>File Upload Chooser</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      <code className="text-slate-300">WebChromeClient.onShowFileChooser</code> with camera capture intent and storage permissions for player CVs, media & profile photos.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Top Green Progress Bar</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Horizontal progress indicator in <code className="text-emerald-400">#16a34a</code> showing page load status in real-time, matching Android UX guidelines.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>WebView History Back Navigation</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      <code className="text-slate-300">OnBackPressedDispatcher</code> intercepts hardware and gesture back buttons to navigate web history before closing the app.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400">
                    Want to inspect the raw Kotlin or XML files?
                  </div>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Project Code</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Requirements summary widget */}
              <RequirementsChecklist />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            <ProjectCodeExplorer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-4">
            <ApkBuildGuide />
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <RequirementsChecklist />
          </div>
        )}
      </main>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Configure Android App Settings</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Application Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Android Package Name (Application ID)</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Web URL</label>
                <input
                  type="text"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0f172a] py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FootballIconSvg size={20} />
            <span className="font-semibold text-slate-300">BallLink</span>
            <span>— Football Talent Connect Android Application</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Package: com.balllink.app</span>
            <span>•</span>
            <span>Kotlin 2.0</span>
            <span>•</span>
            <span>SDK 34</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

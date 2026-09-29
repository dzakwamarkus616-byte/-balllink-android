import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  ArrowLeft,
  Upload,
  Wifi,
  WifiOff,
  Sparkles,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  FileText,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { FootballIconSvg } from './FootballIconSvg';

interface PhoneSimulatorProps {
  onSelectFile?: (filePath: string) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ onSelectFile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showFileChooserModal, setShowFileChooserModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('10:24');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initial splash animation
  useEffect(() => {
    // Update simulated clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    // Initial splash screen dismiss after 2.2s like Android app
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const triggerReload = () => {
    setIsLoading(true);
    setProgress(15);
    setIsOffline(false);

    const step1 = setTimeout(() => setProgress(55), 300);
    const step2 = setTimeout(() => setProgress(88), 700);
    const step3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        showToast('WebView reloaded: https://ball-link.web.app');
      }, 300);
    }, 1100);

    if (iframeRef.current) {
      try {
        iframeRef.current.src = 'https://ball-link.web.app';
      } catch (e) {
        // cross-origin reload
      }
    }

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const triggerSplashDemo = () => {
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
      showToast('Splash completed: smooth fade into WebView');
    }, 2200);
  };

  const handleBackPress = () => {
    showToast('MainActivity.kt: webView.canGoBack() executed');
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        // cross-origin security
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Simulator Control Toolbar */}
      <div className="w-full max-w-md mb-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-2 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Android 14 (API 34) Simulator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerSplashDemo}
            title="Test native splash screen"
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-md transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Splash</span>
          </button>
          <button
            onClick={() => setShowFileChooserModal(true)}
            title="Test native file upload chooser"
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>File Picker</span>
          </button>
          <button
            onClick={() => setIsOffline(!isOffline)}
            title="Toggle network online/offline error test"
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 ${
              isOffline
                ? 'bg-rose-950/70 border-rose-700 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Offline' : 'Online'}</span>
          </button>
          <button
            onClick={triggerReload}
            title="Reload WebView"
            className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Realistic Android Phone Device Shell */}
      <div className="relative w-[360px] h-[720px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-slate-700/50 shadow-emerald-950/20 overflow-hidden flex flex-col select-none">
        {/* Device Earpiece speaker & punch hole front camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700"></div>
          </div>
        </div>

        {/* Android Native Status Bar */}
        <div className="w-full h-8 bg-[#0f172a] text-slate-300 text-xs px-5 pt-1.5 flex items-center justify-between z-40 shrink-0 font-medium">
          <span className="text-[11px] font-semibold tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2 text-[10px]">
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="font-semibold text-[10px] text-slate-300">5G</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">98%</span>
              <div className="w-4 h-2.5 border border-slate-400 rounded-sm p-[1px] flex items-center">
                <div className="h-full bg-emerald-500 rounded-[1px] w-[90%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Progress Bar (Requirement 8: Green Loading Bar while site loads) */}
        <div className="relative w-full h-[3px] bg-[#1e293b] z-40 overflow-hidden">
          {(isLoading || progress > 0) && (
            <div
              className="h-full bg-[#16a34a] transition-all duration-300 ease-out shadow-[0_0_8px_#16a34a]"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>

        {/* Screen Viewport (Simulating Native Fullscreen WebView) */}
        <div className="relative flex-1 w-full bg-[#0f172a] overflow-hidden flex flex-col">
          {/* Native Splash Screen Overlay (Requirement 5) */}
          {showSplash && (
            <div
              className={`absolute inset-0 bg-[#0f172a] z-30 flex flex-col items-center justify-center p-6 text-center transition-opacity duration-500 ${
                showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="animate-bounce">
                <FootballIconSvg size={104} />
              </div>
              <h1 className="mt-5 text-3xl font-extrabold text-[#16a34a] tracking-wide font-sans">
                BallLink
              </h1>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Football Talent Connect
              </p>

              <div className="absolute bottom-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-medium">Loading talent network...</span>
              </div>
            </div>
          )}

          {/* Network Offline / Error State (Demonstrating errorLayout in activity_main.xml) */}
          {isOffline ? (
            <div className="flex-1 w-full bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 border border-slate-700">
                <WifiOff className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">No Internet Connection</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[240px]">
                Please check your network settings and tap retry to reconnect to BallLink.
              </p>
              <button
                onClick={triggerReload}
                className="mt-6 px-6 py-2.5 bg-[#16a34a] hover:bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2 active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            /* Live WebView */
            <div className="relative flex-1 w-full h-full bg-[#0f172a]">
              <iframe
                ref={iframeRef}
                src="https://ball-link.web.app"
                title="BallLink Native WebView Preview"
                className="w-full h-full border-0 bg-[#0f172a]"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />

              {/* In-app floating helper badge */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-lg p-2 text-[10px] text-slate-400 flex items-center justify-between z-10 pointer-events-none">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Live WebView: https://ball-link.web.app
                </span>
                <span className="text-[9px] text-slate-500">PWA Fullscreen</span>
              </div>
            </div>
          )}

          {/* Toast Notification Simulation */}
          {toastMessage && (
            <div className="absolute bottom-12 left-4 right-4 bg-slate-900/95 border border-slate-700 text-emerald-400 text-xs px-3 py-2 rounded-lg text-center shadow-xl z-50 animate-fade-in flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
          )}

          {/* Native File Upload Chooser Dialog Simulation (WebChromeClient.onShowFileChooser) */}
          {showFileChooserModal && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end justify-center p-3 animate-fade-in">
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Select File / Media</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">onShowFileChooser()</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Choose how to attach your football highlight video, player profile photo, or scout document:
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowFileChooserModal(false);
                      showToast('Camera capture selected (FileProvider URI created)');
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center gap-1.5 text-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium">Camera</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowFileChooserModal(false);
                      showToast('Photo Gallery selected (READ_MEDIA_IMAGES)');
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center gap-1.5 text-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium">Gallery</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowFileChooserModal(false);
                      showToast('Document picked: CV / Scouting Report');
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center gap-1.5 text-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium">Documents</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowFileChooserModal(false);
                    showToast('filePathCallback.onReceiveValue(null) canceled cleanly');
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Android 3-Button Navigation Bar (Requirement 6: Back button goes back in WebView) */}
        <div className="w-full h-11 bg-[#0f172a] flex items-center justify-around px-8 shrink-0 z-40 border-t border-slate-800/40">
          {/* Back Triangle */}
          <button
            onClick={handleBackPress}
            title="Native Back Button (WebView.goBack)"
            className="p-2 text-slate-400 hover:text-emerald-400 active:scale-90 transition-all rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Home Circle */}
          <button
            onClick={() => {
              triggerReload();
              showToast('Returned to BallLink Home');
            }}
            title="Home Button"
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-all rounded-lg"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 hover:border-white"></div>
          </button>

          {/* Recents Square */}
          <button
            onClick={() => {
              showToast('App Task: com.balllink.app');
            }}
            title="Recent Apps Button"
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-all rounded-lg"
          >
            <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-[2px] hover:border-white"></div>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span>Target:</span>
        <a
          href="https://ball-link.web.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
        >
          https://ball-link.web.app <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

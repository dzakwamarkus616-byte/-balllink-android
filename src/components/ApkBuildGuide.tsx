import React, { useState } from 'react';
import {
  Terminal,
  FolderGit2,
  KeyRound,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  Laptop,
  CloudLightning,
  Sparkles
} from 'lucide-react';

export const ApkBuildGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'cli' | 'github' | 'signing'>('studio');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/60 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>How to Build & Export BallLink APK</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your preferred method to compile the APK from this project:
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Android Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'cli'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal CLI</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'github'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span>Cloud (GitHub Actions)</span>
            </button>
            <button
              onClick={() => setActiveTab('signing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'signing'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign APK / Play Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                  1
                </div>
                <h4 className="text-sm font-semibold text-white">Download & Extract</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Click the <strong className="text-emerald-400">"Download Android Studio Project (.ZIP)"</strong> button above and extract the files to your computer.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                  2
                </div>
                <h4 className="text-sm font-semibold text-white">Open in Android Studio</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Launch Android Studio, select <strong className="text-slate-200">File &gt; Open</strong>, and select the extracted folder. Let Gradle sync for 30–60 seconds.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                  3
                </div>
                <h4 className="text-sm font-semibold text-white">Build & Run</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Click <strong className="text-slate-200">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. Click <strong className="text-emerald-400">locate</strong> to grab your installable APK!
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 font-semibold block mb-0.5">Compatible with all modern Android Studio versions:</strong>
                Supports Ladybug (2024.2+), Koala, Jellyfish, Iguana, and Hedgehog with JDK 17. The project includes full Android Gradle Plugin 8.5.2 and Kotlin 2.0.0.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cli' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              You can compile the APK directly from your terminal or command prompt without opening Android Studio:
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>macOS / Linux:</span>
                  <button
                    onClick={() => copyToClipboard('chmod +x gradlew\n./gradlew assembleDebug', 'mac-cli')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedKey === 'mac-cli' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'mac-cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
{`chmod +x gradlew
./gradlew assembleDebug`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>Windows (Command Prompt / PowerShell):</span>
                  <button
                    onClick={() => copyToClipboard('gradlew.bat assembleDebug', 'win-cli')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedKey === 'win-cli' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'win-cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
{`gradlew.bat assembleDebug`}
                </pre>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-100">APK Output Destination:</span>
                <div className="font-mono text-emerald-400 text-[11px]">
                  app/build/outputs/apk/debug/app-debug.apk
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can transfer this APK directly to your phone via USB cable or Google Drive and tap it to install immediately!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'github' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-xs text-slate-300">
              <CloudLightning className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-300 font-semibold block mb-1">
                  Don't have Android Studio installed? Use Cloud Compilation!
                </strong>
                The included file <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> will automatically build the APK for you in GitHub's cloud for free every time you push code.
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
              <li className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="font-semibold text-white">Create a GitHub repository</span> and push this project:
                <div className="mt-2 flex items-center justify-between font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400">
                  <span>git init && git add . && git commit -m "BallLink Android App"</span>
                  <button
                    onClick={() => copyToClipboard('git init && git add . && git commit -m "BallLink Android App"', 'git-cmd')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'git-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </li>
              <li className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="font-semibold text-white">Open the "Actions" tab</span> on your GitHub repo.
              </li>
              <li className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="font-semibold text-white">Download the APK artifact</span>: Once the workflow completes (~90s), click on the run and download <strong className="text-emerald-400">BallLink-Debug-APK</strong> or <strong className="text-emerald-400">BallLink-Release-APK</strong>!
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'signing' && (
          <div className="space-y-4 text-xs text-slate-300">
            <p>
              To release BallLink on the <strong>Google Play Store</strong>, you must sign the APK with a cryptographic release key:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-slate-400">
                <span>1. Generate release keystore using keytool:</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'keytool -genkey -v -keystore balllink-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias balllink',
                      'keytool-cmd'
                    )
                  }
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedKey === 'keytool-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'keytool-cmd' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-emerald-400 overflow-x-auto text-[11px]">
{`keytool -genkey -v -keystore balllink-release-key.jks \\
  -keyalg RSA -keysize 2048 -validity 10000 -alias balllink`}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-200">2. Generate Google Play App Bundle (AAB):</span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-emerald-400 overflow-x-auto text-[11px]">
{`./gradlew bundleRelease`}
              </pre>
              <p className="text-[11px] text-slate-400">
                Output bundle: <code className="text-slate-200">app/build/outputs/bundle/release/app-release.aab</code> (ready to drag-and-drop into Google Play Console).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

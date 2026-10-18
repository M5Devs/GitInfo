export function renderAppsHTML(): string {
  return `
    <div class="flex flex-col gap-8 max-w-full">
      <!-- Hero Header -->
      <div class="text-center space-y-3 max-w-2xl mx-auto pt-2">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
          <span>🚀 Cross-Platform Distribution Hub</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          GitInfo Everywhere You Work
        </h1>
        <p class="text-xs sm:text-base text-slate-400 leading-relaxed">
          Inspect repository metrics directly in your terminal, mobile shell, or native desktop GUI.
        </p>
      </div>

      <!-- SECTION A: TERMINAL CLI -->
      <section class="bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-xl max-w-full">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            💻
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-white">Section A: Terminal CLI & Mobile Shell</h2>
            <p class="text-xs text-slate-400">Run instant repo analysis from command line or Termux on Android.</p>
          </div>
        </div>

        <!-- NPX Quick Run -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-indigo-300 uppercase font-mono tracking-wider">Zero Install (npx)</span>
            <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Node.js 18+</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-emerald-400">
            <code id="cli-npx-cmd" class="select-all break-all whitespace-pre-wrap">npx @m5dev/gitinfo &lt;owner/repo&gt;</code>
            <button id="copy-npx-cmd-btn" type="button" class="shrink-0 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
              <span>Copy NPX</span>
              <span>📋</span>
            </button>
          </div>
        </div>

        <!-- Android Termux Quickstart Guide -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-amber-300 uppercase font-mono tracking-wider">Android (Termux) Quickstart Guide</span>
            <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">Mobile Terminal</span>
          </div>
          <p class="text-xs text-slate-300">
            Analyze repositories on the go directly on your mobile device using Termux:
          </p>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-amber-300">
            <code id="cli-termux-cmd" class="select-all break-all whitespace-pre-wrap">pkg install nodejs && npx @m5dev/gitinfo &lt;owner/repo&gt;</code>
            <button id="copy-termux-cmd-btn" type="button" class="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
              <span>Copy Termux</span>
              <span>📋</span>
            </button>
          </div>
        </div>

        <!-- Standalone Binary / Global Install -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-sky-300 uppercase font-mono tracking-wider">Global Standalone Binary Option</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-sky-300">
            <code id="cli-global-cmd" class="select-all break-all whitespace-pre-wrap">npm install -g @m5dev/gitinfo && gitinfo &lt;owner/repo&gt;</code>
            <button id="copy-global-cmd-btn" type="button" class="shrink-0 px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
              <span>Copy Global</span>
              <span>📋</span>
            </button>
          </div>
        </div>
      </section>

      <!-- SECTION B: DESKTOP GUI APP (TAURI) -->
      <section class="bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-xl max-w-full">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-xl shrink-0">
            🖥️
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-white">Section B: Desktop GUI Edition (Tauri)</h2>
            <p class="text-xs sm:text-sm font-semibold text-fuchsia-300 mt-0.5">
              Ultra-lightweight (~4 MB) with near-zero RAM usage — No Chromium bloat!
            </p>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          The native desktop edition packages GitInfo's full repo inspection dashboard into a blazing-fast, secure desktop binary powered by Rust and Tauri v2.
        </p>

        <!-- OS Download Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <!-- Windows -->
          <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-indigo-500/40 transition-colors">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">🪟</span>
                <h3 class="text-sm font-bold text-white">Windows</h3>
              </div>
              <p class="text-[11px] text-slate-400">Includes installer (<code class="text-indigo-300 font-mono">.msi</code>) and standalone (<code class="text-indigo-300 font-mono">.exe</code>).</p>
            </div>
            <a
              href="https://github.com/M5Devs/GitInfo/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Download Windows</span>
              <span>⚡</span>
            </a>
          </div>

          <!-- Linux -->
          <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-emerald-500/40 transition-colors">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">🐧</span>
                <h3 class="text-sm font-bold text-white">Linux</h3>
              </div>
              <p class="text-[11px] text-slate-400">Includes portable (<code class="text-emerald-300 font-mono">.AppImage</code>) and Debian (<code class="text-emerald-300 font-mono">.deb</code>).</p>
            </div>
            <a
              href="https://github.com/M5Devs/GitInfo/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Download Linux</span>
              <span>⚡</span>
            </a>
          </div>

          <!-- macOS -->
          <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-purple-500/40 transition-colors">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">🍎</span>
                <h3 class="text-sm font-bold text-white">macOS</h3>
              </div>
              <p class="text-[11px] text-slate-400">Universal Apple Silicon & Intel bundle (<code class="text-purple-300 font-mono">.dmg</code>).</p>
            </div>
            <a
              href="https://github.com/M5Devs/GitInfo/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Download macOS</span>
              <span>⚡</span>
            </a>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>All release artifacts are automatically built via GitHub Actions CI/CD.</span>
          <a href="https://github.com/M5Devs/GitInfo/releases/latest" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
            <span>All GitHub Releases</span>
            <span>↗</span>
          </a>
        </div>
      </section>
    </div>
  `;
}

export function initAppsEvents(container: HTMLElement, showToastFn?: (msg: string) => void): void {
  const copyNpxBtn = container.querySelector('#copy-npx-cmd-btn');
  const copyTermuxBtn = container.querySelector('#copy-termux-cmd-btn');
  const copyGlobalBtn = container.querySelector('#copy-global-cmd-btn');

  const notify = showToastFn || ((msg: string) => alert(msg));

  copyNpxBtn?.addEventListener('click', () => {
    const cmd = container.querySelector('#cli-npx-cmd')?.textContent || '';
    if (navigator.clipboard && cmd) {
      navigator.clipboard.writeText(cmd).then(() => notify('NPX command copied to clipboard! 📋'));
    }
  });

  copyTermuxBtn?.addEventListener('click', () => {
    const cmd = container.querySelector('#cli-termux-cmd')?.textContent || '';
    if (navigator.clipboard && cmd) {
      navigator.clipboard.writeText(cmd).then(() => notify('Termux command copied to clipboard! 📋'));
    }
  });

  copyGlobalBtn?.addEventListener('click', () => {
    const cmd = container.querySelector('#cli-global-cmd')?.textContent || '';
    if (navigator.clipboard && cmd) {
      navigator.clipboard.writeText(cmd).then(() => notify('Global install command copied to clipboard! 📋'));
    }
  });
}

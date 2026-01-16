/**
 * UI CONTROLLER (js/ui.js)
 * Manages DOM manipulation, Find in Chat, Sidebar Toggling, and PDF Export.
 */
const UI = {
    init() {
        this.setupDefaults();
        this.renderAll();
        this.attachEventListeners();
        this.applySidebarState();
        lucide.createIcons();
    },

    setupDefaults() {
        if (!localStorage.baseUrl) localStorage.baseUrl = Config.DEFAULT_BASE_URL;
        if (!localStorage.systemPrompt) localStorage.systemPrompt = Config.DEFAULT_SYSTEM;
        localStorage.models = JSON.stringify(Config.TARGET_MODELS);

        if (state.theme === "dark") document.documentElement.classList.add("dark");

        const modelSelect = document.getElementById("modelSelect");
        if (modelSelect) {
            modelSelect.innerHTML = "";
            Config.TARGET_MODELS.forEach(m => {
                const o = document.createElement("option");
                o.value = m; o.textContent = m;
                modelSelect.appendChild(o);
            });
        }
    },

    applySidebarState() {
        const sidebar = document.getElementById("sidebar");
        const icon = document.getElementById("collapseIcon");
        const isCollapsed = localStorage.sidebarCollapsed === "true";

        if (isCollapsed) {
            sidebar.classList.add("sidebar-collapsed");
            if (icon) icon.style.transform = "rotate(180deg)";
        }
    },

    renderAll() {
        this.updateLanguageUI();
        this.renderChat();
        this.updateBalance();
    },

    updateLanguageUI() {
        const t = Config.TRANSLATIONS[state.lang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (t[key]) el.textContent = t[key];
        });
        document.getElementById("messageInput").placeholder = t.placeholder;
        document.getElementById("langLabel").textContent = t.toggleLabel;

        // Refresh the balance text to update the "Credits" / "ක්‍රෙඩිට්" label
        this.updateBalance();

        document.title = state.lang === 'si' ? "AlokaHub | සිංහල" : "AlokaHub | Pro";
    },

    renderChat() {
        const chatEl = document.getElementById("chat");
        if (state.messages.length === 0) {
            chatEl.innerHTML = `
            <div class="h-full flex items-center justify-center">
                <div class="welcome-container flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <i data-lucide="zap" class="w-12 h-12 mb-6 text-brand-500 opacity-80"></i>
                    <span class="welcome-text text-2xl uppercase tracking-[0.2em] text-center" data-i18n="welcome">
                        ${Config.TRANSLATIONS[state.lang].welcome}
                    </span>
                </div>
            </div>`;
        } else {
            chatEl.innerHTML = state.messages.map(m => this.createMessageBubble(m)).join('');
        }

        if (state.isTyping) {
            chatEl.innerHTML += `
            <div class="flex justify-start">
                <div class="bg-slate-100 dark:bg-slate-700 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm">
                    <div class="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot"></div>
                    <div class="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot [animation-delay:0.2s]"></div>
                    <div class="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot [animation-delay:0.4s]"></div>
                </div>
            </div>`;
        }
        chatEl.scrollTop = chatEl.scrollHeight;
        lucide.createIcons();
    },

    createMessageBubble(m) {
        const isUser = m.role === "user";
        const bubbleClasses = isUser
            ? 'bg-brand-500 text-white rounded-2xl rounded-tr-none shadow-md'
            : 'bg-white dark:bg-slate-700 pro-text-main rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-600 shadow-sm';

        return `<div class="flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="max-w-[85%] md:max-w-[75%] px-6 py-4 ${bubbleClasses}">
                <div class="prose dark:prose-invert text-[15px] leading-relaxed max-w-none font-sans">
                    ${marked.parse(m.content)}
                </div>
            </div>
        </div>`;
    },

    async updateBalance() {
        const { apiKey, baseUrl } = localStorage;
        if (!apiKey || !baseUrl) return;
        try {
            const cleanBase = baseUrl.replace(/\/v1$/, '').replace(/\/$/, '');
            const res = await fetch(`${cleanBase}/key/info`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                const info = data.info || {};
                const credits = Math.round((Math.max(0, (parseFloat(info.max_budget) || 0) - (parseFloat(info.spend) || 0))) * 1000);

                const display = document.getElementById("balanceDisplay");
                const amountLabel = document.getElementById("creditAmount");

                // Use the current state.lang to get the correct suffix dynamically
                const creditSuffix = Config.TRANSLATIONS[state.lang].credits;
                amountLabel.textContent = `${credits.toLocaleString()} ${creditSuffix}`;

                display.classList.remove("hidden");
            }
        } catch (e) { console.warn("Balance check failed"); }
    },

    renderUploads() {
        const container = document.getElementById("filePreviewContainer");
        container.innerHTML = state.attachedFiles.map((file, index) => `
            <div class="file-preview-item animate-in fade-in zoom-in duration-200">
                <i data-lucide="${file.type === 'image' ? 'image' : 'file-text'}" class="w-3 h-3"></i>
                <span class="truncate max-w-[100px]">${file.name}</span>
                <button onclick="UI.removeFile(${index})" class="remove-file-btn">
                    <i data-lucide="x" class="w-3 h-3"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    },

    removeFile(index) {
        state.attachedFiles.splice(index, 1);
        this.renderUploads();
    },

    openSettings() {
        document.getElementById("settingsModal").classList.replace("hidden", "flex");
        document.getElementById("baseUrl").value = localStorage.baseUrl;
        document.getElementById("apiKey").value = localStorage.apiKey || "";
        document.getElementById("systemPrompt").value = localStorage.systemPrompt;
    },

    closeSettings() {
        document.getElementById("settingsModal").classList.replace("flex", "hidden");
    },

    toggleMobileSidebar() {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("hidden");
        if (!sidebar.classList.contains("hidden")) {
            sidebar.classList.add("flex");
        }
    },

    handleSearch() {
        const query = document.getElementById("searchInput").value.toLowerCase();
        this.clearHighlights();
        if (!query || query.length < 2) {
            document.getElementById("searchCount").textContent = "0/0";
            return;
        }
        const chatBody = document.getElementById("chat");
        const walker = document.createTreeWalker(chatBody, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        let matches = 0;
        nodes.forEach(node => {
            const text = node.nodeValue;
            if (text.toLowerCase().includes(query)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(new RegExp(`(${query})`, 'gi'), '<mark class="search-highlight">$1</mark>');
                node.parentNode.replaceChild(span, node);
                matches++;
            }
        });
        document.getElementById("searchCount").textContent = `${matches}/${matches}`;
    },

    clearHighlights() {
        document.querySelectorAll('mark.search-highlight').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceWith(document.createTextNode(parent.textContent));
        });
    },

    async exportToPDF() {
        const chatArea = document.getElementById("chat");
        const btn = document.getElementById("exportPDF");
        btn.disabled = true;

        const tempDiv = chatArea.cloneNode(true);
        tempDiv.style.height = 'auto';
        tempDiv.style.overflow = 'visible';
        tempDiv.style.width = chatArea.offsetWidth + 'px';
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f8fafc'
            });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`AlokaHub-${Date.now()}.pdf`);
        } catch (e) {
            alert("Export failed.");
        } finally {
            document.body.removeChild(tempDiv);
            btn.disabled = false;
        }
    },

    attachEventListeners() {
        const toggleBtn = document.getElementById("toggleSidebar");
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const sidebar = document.getElementById("sidebar");
                const icon = document.getElementById("collapseIcon");
                sidebar.classList.toggle("sidebar-collapsed");
                const isNowCollapsed = sidebar.classList.contains("sidebar-collapsed");
                localStorage.sidebarCollapsed = isNowCollapsed.toString();
                if (icon) icon.style.transform = isNowCollapsed ? "rotate(180deg)" : "rotate(0deg)";
            };
        }

        document.getElementById("openSearch").onclick = () => {
            document.getElementById("searchBar").classList.remove("hidden");
            document.getElementById("searchInput").focus();
        };
        document.getElementById("closeSearch").onclick = () => {
            document.getElementById("searchBar").classList.add("hidden");
            this.clearHighlights();
        };
        document.getElementById("searchInput").oninput = () => this.handleSearch();

        document.getElementById("exportPDF").onclick = () => this.exportToPDF();

        document.getElementById("toggleTheme").onclick = () => {
            document.documentElement.classList.toggle("dark");
            state.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
            localStorage.theme = state.theme;
        };

        document.getElementById("langToggle").onclick = () => {
            state.lang = state.lang === "en" ? "si" : "en";
            localStorage.lang = state.lang;
            this.updateLanguageUI();
        };

        document.getElementById("openSettingsTop").onclick = () => this.openSettings();
        document.getElementById("saveSettingsBtn").onclick = () => {
            localStorage.baseUrl = document.getElementById("baseUrl").value;
            localStorage.apiKey = document.getElementById("apiKey").value;
            localStorage.systemPrompt = document.getElementById("systemPrompt").value;
            this.closeSettings();
            this.updateBalance();
        };

        document.getElementById("uploadBtn").onclick = () => document.getElementById("fileInput").click();
        document.getElementById("fileInput").onchange = async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                const processed = await Parser.processFile(file);
                state.attachedFiles.push(processed);
            }
            this.renderUploads();
            e.target.value = '';
        };

        document.getElementById("sendBtn").onclick = () => API.sendMessage();
        document.getElementById("messageInput").onkeydown = (e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); API.sendMessage(); }
        };
        document.getElementById("messageInput").oninput = function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        };

        document.getElementById("clearChat").onclick = () => {
            if (confirm("Clear History?")) {
                state.messages = [];
                localStorage.chat = "[]";
                this.renderChat();
            }
        };

        document.getElementById("toggleApiKey").onclick = () => {
            const k = document.getElementById("apiKey");
            k.type = k.type === "password" ? "text" : "password";
            document.getElementById("eyeIcon").setAttribute("data-lucide", k.type === "password" ? "eye" : "eye-off");
            lucide.createIcons();
        };
    }
};
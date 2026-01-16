/**
 * CONFIGURATION (js/config.js)
 * Central storage for default settings, models, and translations.
 */
const Config = {
    // Default model list based on user preference
    TARGET_MODELS: [
        "gemini-3-flash", 
        "gpt-5-mini", 
        "claude-4.5-haiku", 
        "deepseek-v3.2"
    ],

    // Default connection settings
    DEFAULT_BASE_URL: "https://ai.alokahub.com/",
    DEFAULT_SYSTEM: "You are a helpful AI assistant. Respond using markdown.",

    // Internationalization Strings
    TRANSLATIONS: {
        en: {
            appName: "AlokaHub",
            search: "Find in Chat",
            export: "Export to PDF",
            exportPdf: "Export PDF",
            clearChat: "Clear History",
            theme: "Appearance",
            settings: "Settings",
            globalSettings: "Global Settings",
            baseUrl: "Base URL",
            apiKey: "API Key",
            systemInst: "System Instruction",
            saveConfig: "Save Configuration",
            placeholder: "Type something amazing...",
            toggleLabel: "සිංහල",
            balance: "Balance",
            credits: "Credits",
            welcome: "Ready to assist"
        },
        si: {
            appName: "AlokaHub",
            search: "චැට් එකෙහි සොයන්න",
            export: "PDF ලෙස බාගන්න",
            exportPdf: "PDF ලබාගන්න",
            clearChat: "ඉතිහාසය මකන්න",
            theme: "තේමාව",
            settings: "සැකසුම්",
            globalSettings: "ප්‍රධාන සැකසුම්",
            baseUrl: "මූලික URL ලිපිනය",
            apiKey: "API යතුර",
            systemInst: "පද්ධති උපදෙස් (System Prompt)",
            saveConfig: "සුරකින්න",
            placeholder: "මෙහි ටයිප් කරන්න...",
            toggleLabel: "English",
            balance: "ඉතිරිය",
            credits: "ක්‍රෙඩිට්",
            welcome: "ඔබට සහය වීමට සූදානම්"
        }
    }
};

/**
 * GLOBAL STATE (shared across modules)
 */
const state = {
    lang: localStorage.lang || "en",
    theme: localStorage.theme || "light",
    messages: JSON.parse(localStorage.chat || "[]"),
    isTyping: false,
    attachedFiles: [] // To hold base64 images/docs
};
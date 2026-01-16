/**
 * APP ENTRY POINT (js/app.js)
 * Orchestrates the initialization sequence of all modules.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize the UI (this sets up defaults, listeners, and translations)
    UI.init();

    // 2. Perform an initial balance check if credentials exist
    if (localStorage.apiKey && localStorage.baseUrl) {
        UI.updateBalance();
    }

    // 3. Log System Readiness
    console.log(`%c AlokaHub Pro %c System Ready %c`,
        'background:#6366f1; color:#fff; padding:2px 5px; border-radius:3px 0 0 3px;',
        'background:#475569; color:#fff; padding:2px 5px; border-radius:0 3px 3px 0;',
        'background:transparent'
    );
});

/**
 * Global Error Handler
 * Catch-all for unhandled promise rejections (useful for API failures)
 */
window.onunhandledrejection = (event) => {
    console.error("Unhandled Rejection:", event.reason);
    // Notify the UI and stop typing indicators on error
    if (typeof state !== 'undefined') {
        state.isTyping = false;
        UI.renderChat();
    }
};
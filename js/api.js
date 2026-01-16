/**
 * API CONTROLLER (js/api.js)
 * Enhanced to handle Multimodal inputs (Images) for Gemini and GPT models.
 */
const API = {
    async sendMessage() {
        const input = document.getElementById("messageInput");
        const model = document.getElementById("modelSelect").value;
        const text = input.value.trim();
        
        if ((!text && state.attachedFiles.length === 0) || state.isTyping) return;

        // 1. Prepare Message Payload
        // We separate text-based documents from image-based attachments
        const images = state.attachedFiles.filter(f => f.type === 'image');
        const docs = state.attachedFiles.filter(f => f.type === 'text');

        let combinedText = text;
        if (docs.length > 0) {
            const context = docs.map(f => `[File: ${f.name}]\n${f.data}`).join('\n\n');
            combinedText = `${context}\n\nUser Message: ${text}`;
        }

        // 2. Build Multimodal Content Array
        // Standard format: [{ type: "text", text: "..." }, { type: "image_url", image_url: { url: "data:..." } }]
        let contentArray = [];
        
        // Add text content
        if (combinedText) {
            contentArray.push({ type: "text", text: combinedText });
        }

        // Add image content
        images.forEach(img => {
            contentArray.push({
                type: "image_url",
                image_url: { url: img.data } // img.data contains the Base64 string from Parser
            });
        });

        // 3. Update UI State
        state.messages.push({ role: "user", content: text });
        input.value = "";
        input.style.height = 'auto';
        state.isTyping = true;
        
        // Clear attachments and re-render preview
        const currentAttachments = [...state.attachedFiles];
        state.attachedFiles = [];
        UI.renderUploads();
        UI.renderChat();

        try {
            let chatUrl = localStorage.baseUrl.replace(/\/$/, '');
            if (!chatUrl.endsWith('/v1')) chatUrl += '/v1';
            
            const response = await fetch(`${chatUrl}/chat/completions`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${localStorage.apiKey}` 
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: localStorage.systemPrompt },
                        ...this.getFormattedHistory(), 
                        { role: "user", content: contentArray } // Sending as array for multimodal support
                    ],
                    max_tokens: 4096
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || "API connection failed");
            
            state.messages.push({ role: "assistant", content: data.choices[0].message.content });

        } catch (err) {
            console.error("API Error:", err);
            state.messages.push({ 
                role: "assistant", 
                content: `**Error:** ${err.message}` 
            });
        } finally {
            state.isTyping = false;
            localStorage.chat = JSON.stringify(state.messages);
            UI.renderChat();
            setTimeout(() => UI.updateBalance(), 1000);
        }
    },

    /**
     * Formats history to ensure we don't send previous Base64 images 
     * in every request (to save bandwidth/tokens), or keeps them if needed.
     */
    getFormattedHistory() {
        // For now, we return history as is. 
        // In a production app, you might want to truncate long histories.
        return state.messages.slice(0, -1);
    }
};
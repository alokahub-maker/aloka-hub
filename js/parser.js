/**
 * FILE PARSER (js/parser.js)
 * Handles extraction of content from Images, PDFs, and Word Documents.
 */
const Parser = {
    /**
     * Main entry point to process a file based on its type
     */
    async processFile(file) {
        const fileType = file.type;
        const fileName = file.name;

        try {
            if (fileType.startsWith('image/')) {
                return {
                    name: fileName,
                    type: 'image',
                    data: await this.toBase64(file)
                };
            } 
            else if (fileType === 'application/pdf') {
                return {
                    name: fileName,
                    type: 'text',
                    data: await this.parsePDF(file)
                };
            } 
            else if (fileName.endsWith('.docx')) {
                return {
                    name: fileName,
                    type: 'text',
                    data: await this.parseDocx(file)
                };
            } 
            else {
                // Default to plain text for .txt, .md, .js, etc.
                return {
                    name: fileName,
                    type: 'text',
                    data: await file.text()
                };
            }
        } catch (error) {
            console.error(`Error parsing ${fileName}:`, error);
            throw new Error(`Could not read ${fileName}. It might be corrupted or protected.`);
        }
    },

    /**
     * Converts an image file to a Base64 string for Vision APIs
     */
    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    /**
     * Extracts text from PDF using PDF.js
     */
    async parsePDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        // Initialize PDF.js worker (required for browser usage)
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        return fullText.trim();
    },

    /**
     * Extracts text from .docx using Mammoth.js
     */
    async parseDocx(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value; // The raw text from the document
    }
};
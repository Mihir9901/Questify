import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import officeParser from 'officeparser';

/**
 * Extracts raw text from a PDF buffer
 */
export const extractTextFromPDF = async (buffer) => {
    let parser;
    try {
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text;
    } catch (error) {
        throw new Error('Failed to parse PDF: ' + (error.message || error));
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
};

/**
 * Extracts raw text from a Word document (.docx) buffer
 */
export const extractTextFromWord = async (buffer) => {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        throw new Error('Failed to parse DOCX: ' + (error.message || error));
    }
};

/**
 * Extracts raw text from a PowerPoint document (.pptx) buffer
 */
export const extractTextFromPPT = async (buffer) => {
    try {
        const result = await officeParser.parseOfficeAsync(buffer);
        return result;
    } catch (error) {
        throw new Error('Failed to parse PPTX: ' + (error.message || error));
    }
};

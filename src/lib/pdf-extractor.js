import { PDFDocument } from 'pdf-lib';

export async function extractTextFromPDF(filePath) {
  try {
    // Solution légère pour PDF textuels
    const response = await fetch(filePath);
    const buffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer);
    
    let fullText = '';
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const text = await page.getTextContent();
      fullText += text.items.map(item => item.str).join(' ');
    }

    return fullText;
  } catch (error) {
    // Fallback pour PDF complexes
    const { extract } = await import('pdf-parse');
    const data = await extract(fs.readFileSync(filePath));
    return data.text;
  }
}
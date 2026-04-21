import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a professional PDF report from a set of DOM elements
 * @param {Object} options Configuration for the report
 */
export const generatePDFReport = async ({ 
  elementIds, 
  title = "Regional Analytics Report", 
  fileName = "Eduzone_Report.pdf" 
}) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helper: Header drawing
  const drawHeader = (pageNumber) => {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'bold');
    pdf.text("EDUZONE | Zonal Education Office Hatton", margin, 10);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(title, margin, 14);
    
    // Header Line
    pdf.setDrawColor(230, 230, 230);
    pdf.line(margin, 16, pageWidth - margin, 16);
  };

  // Helper: Footer drawing
  const drawFooter = (pageNumber, totalPages) => {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const date = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${date}`, margin, pageHeight - 8);
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
    
    pdf.setDrawColor(240, 240, 240);
    pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  };

  let currentY = 25;

  // Add Main Title
  pdf.setFontSize(22);
  pdf.setTextColor(30, 58, 138); // Blue-900 equivalent
  pdf.setFont('helvetica', 'bold');
  pdf.text(title.toUpperCase(), margin, currentY);
  currentY += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text("Performance Metrics and Regional Educational Oversight Summary", margin, currentY);
  currentY += 15;

  for (let i = 0; i < elementIds.length; i++) {
    const id = elementIds[i];
    const element = document.getElementById(id);
    
    if (!element) {
      console.warn(`Element with ID ${id} not found.`);
      continue;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on current page, if not add new page
      if (currentY + imgHeight > pageHeight - margin - 15) {
        pdf.addPage();
        currentY = 25; // Reset Y for new page
      }

      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;

    } catch (error) {
      console.error(`Error capturing element ${id}:`, error);
    }
  }

  // Draw Header/Footer on all pages
  const totalPages = pdf.internal.getNumberOfPages();
  for (let j = 1; j <= totalPages; j++) {
    pdf.setPage(j);
    drawHeader(j);
    drawFooter(j, totalPages);
  }

  pdf.save(fileName);
};

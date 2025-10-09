const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportService {
  async generateOperationsReport(operations, filters, logoPath = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add logo if available
        if (logoPath && fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 100 });
          doc.moveDown(3);
        } else {
          doc.moveDown(1);
        }

        // Title
        doc.fontSize(20).font('Helvetica-Bold')
          .text('Net Operations Report', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
          .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

        // Filters section
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold').text('Report Filters:');
        doc.fontSize(10).font('Helvetica');
        
        if (filters.operator && filters.operator !== 'all') {
          doc.text(`Operator: ${filters.operatorCallsign}`);
        } else {
          doc.text('Operator: All Operators');
        }
        
        if (filters.startDate && filters.endDate) {
          doc.text(`Date Range: ${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`);
        } else if (filters.startDate) {
          doc.text(`Date: ${new Date(filters.startDate).toLocaleDateString()}`);
        }

        // Summary statistics
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold').text('Summary Statistics:');
        doc.fontSize(10).font('Helvetica');
        
        const totalCheckIns = operations.reduce((sum, op) => sum + op.checkIns.length, 0);
        const activeOps = operations.filter(op => op.status === 'active').length;
        const completedOps = operations.filter(op => op.status === 'completed').length;
        const scheduledOps = operations.filter(op => op.status === 'scheduled').length;
        
        doc.text(`Total Operations: ${operations.length}`);
        doc.text(`Active: ${activeOps} | Completed: ${completedOps} | Scheduled: ${scheduledOps}`);
        doc.text(`Total Check-ins: ${totalCheckIns}`);
        doc.text(`Average Check-ins per Operation: ${operations.length > 0 ? (totalCheckIns / operations.length).toFixed(1) : 0}`);

        // Operations list
        doc.moveDown(1.5);
        doc.fontSize(14).font('Helvetica-Bold').text('Operations Details:');
        doc.moveDown(0.5);

        operations.forEach((op, index) => {
          // Check if we need a new page
          if (doc.y > 650) {
            doc.addPage();
          }

          doc.fontSize(11).font('Helvetica-Bold')
            .text(`${index + 1}. ${op.netName}`, { continued: true })
            .font('Helvetica')
            .text(` - ${op.status.toUpperCase()}`, { align: 'left' });

          doc.fontSize(9).font('Helvetica');
          doc.text(`   Operator: ${op.operatorCallsign}`);
          doc.text(`   Start: ${new Date(op.startTime).toLocaleString()}`);
          if (op.endTime) {
            doc.text(`   End: ${new Date(op.endTime).toLocaleString()}`);
          }
          if (op.frequency) {
            doc.text(`   Frequency: ${op.frequency}`);
          }
          doc.text(`   Check-ins: ${op.checkIns.length}`);

          // List check-ins if any
          if (op.checkIns.length > 0) {
            doc.fontSize(8).font('Helvetica-Bold');
            doc.text(`   Check-in List:`, { underline: true });
            doc.font('Helvetica');
            
            op.checkIns.forEach((checkIn, idx) => {
              const checkInText = `     ${idx + 1}. ${checkIn.callsign} - ${checkIn.name}`;
              const details = [];
              if (checkIn.license_class) details.push(checkIn.license_class);
              if (checkIn.location) details.push(checkIn.location);
              
              doc.text(checkInText + (details.length > 0 ? ` (${details.join(', ')})` : ''));
              doc.text(`        Time: ${new Date(checkIn.timestamp).toLocaleTimeString()}`);
              if (checkIn.notes) {
                doc.text(`        Notes: ${checkIn.notes}`);
              }
            });
          }

          doc.moveDown(0.5);
        });

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).font('Helvetica')
            .text(
              `Page ${i + 1} of ${pageCount}`,
              50,
              doc.page.height - 50,
              { align: 'center' }
            );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();


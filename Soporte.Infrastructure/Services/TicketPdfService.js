const PDFDocument = require('pdfkit');

function renderTicketPdf(doc, { ticket, comments = [], productName = 'N/A' }) {
  doc.fontSize(18).text('Reporte de Ticket - Micro-Soporte L1/L2', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10).fillColor('#555').text(`Generado: ${new Date().toISOString()}`);
  doc.moveDown();

  doc.fillColor('#000').fontSize(14).text(ticket.subject, { underline: true });
  doc.moveDown(0.5);

  const fields = [
    ['ID', ticket.ticketId],
    ['Producto', productName],
    ['Estado', ticket.status],
    ['Nivel', `L${ticket.currentLevel}`],
    ['Tipo', ticket.type],
    ['Impacto', ticket.impact],
    ['Creado', ticket.createdAt],
    ['Actualizado', ticket.updatedAt],
  ];

  doc.fontSize(11);
  fields.forEach(([label, value]) => {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(String(value));
  });

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(12).text('Descripción');
  doc.font('Helvetica').fontSize(11).text(ticket.description);

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(12).text(`Comentarios (${comments.length})`);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10);

  if (comments.length === 0) {
    doc.fillColor('#777').text('Sin comentarios.');
  } else {
    comments.forEach((c) => {
      doc.fillColor('#000').font('Helvetica-Bold').text(`${c.authorName} (${c.authorRole}) - ${c.createdAt}`);
      doc.font('Helvetica').text(c.content);
      doc.moveDown(0.4);
    });
  }
}

class TicketPdfService {
  constructor() {
    console.info('[TicketPdfService] Initialized (pdfkit).');
  }

  async generateTicketPdf({ ticket, comments = [], productName = 'N/A' }) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      renderTicketPdf(doc, { ticket, comments, productName });

      doc.end();
    });
  }

  async generateTicketListPdf({ tickets = [], title = 'Reporte de Tickets' }) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#555').text(`Generado: ${new Date().toISOString()}`);
      doc.fillColor('#000').text(`Total de tickets: ${tickets.length}`);
      doc.moveDown();

      tickets.forEach((t, i) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${i + 1}. ${t.subject}`);
        doc.font('Helvetica').fontSize(10).text(`   ID: ${t.ticketId} | Estado: ${t.status} | Nivel: L${t.currentLevel}`);
        doc.moveDown(0.3);
      });

      doc.end();
    });
  }
}

module.exports = { TicketPdfService };

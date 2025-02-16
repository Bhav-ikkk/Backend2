import fs from 'fs';
import PDFDocument from 'pdfkit';

function generateTicket(event, user) {
  const doc = new PDFDocument();
  const ticketPath = `/path/to/ticket/${user.id}-${event.id}.pdf`;

  doc.pipe(fs.createWriteStream(ticketPath));
  doc.fontSize(25).text(`Ticket for ${event.name}`, 100, 100);
  doc.fontSize(15).text(`User: ${user.name}`, 100, 150);
  doc.fontSize(15).text(`Event: ${event.name}`, 100, 180);
  doc.fontSize(15).text(`Date: ${event.date}`, 100, 210);
  doc.fontSize(15).text(`Quantity: ${user.quantity}`, 100, 240);

  doc.end();

  return ticketPath;
}

export { generateTicket }; // Ensure this export is present

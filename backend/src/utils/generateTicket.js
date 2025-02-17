import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

function generateTicket(event, user) {
  // Define the path where the ticket will be saved
  const ticketDirectory = path.resolve('./tickets');
  
  // Ensure the directory exists (create it if it doesn't)
  if (!fs.existsSync(ticketDirectory)) {
    fs.mkdirSync(ticketDirectory);
  }

  const ticketPath = `${ticketDirectory}/${user.id}-${event.id}.pdf`;

  // Create a new PDF document
  const doc = new PDFDocument();

  // Pipe the document to the file
  doc.pipe(fs.createWriteStream(ticketPath));

  // Add text to the PDF
  doc.fontSize(25).text(`Ticket for ${event.name}`, 100, 100);
  doc.fontSize(15).text(`User: ${user.name}`, 100, 150);
  doc.fontSize(15).text(`Event: ${event.name}`, 100, 180);
  doc.fontSize(15).text(`Date: ${event.date}`, 100, 210);
  doc.frontsize(15).text(`Price: ${event.price}`, 100, 250);

  // Finalize the document and save the file
  doc.end();

  return ticketPath; // Return the file path of the generated ticket
}

export { generateTicket }; // Ensure this export is present

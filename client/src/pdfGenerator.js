const fs = require('node:fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';

class PDFReportGenerator {
  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
  }

  async generateReport() {
    try {
      console.log('📊 Fetching images from server...');
      const images = await this.fetchImages();

      if (!images || images.length === 0) {
        console.log('❌ No images found in the database');
        return;
      }

      console.log(`📄 Generating PDF report for ${images.length} images...`);

      const reportsDir = path.join(__dirname, '..', 'image_reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `image_reconstruction_report_${timestamp}.pdf`;
      const filepath = path.join(reportsDir, filename);

      const stream = fs.createWriteStream(filepath);
      this.doc.pipe(stream);

      this.generateHeader();
      this.generateTableOfContents(images);
      this.generateImageSections(images);

      this.doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log(`✅ PDF report generated successfully: ${filepath}`);
          resolve(filepath);
        });
        stream.on('error', reject);
      });

    } catch (error) {
      console.error('❌ Error generating PDF report:', error.message);
      throw error;
    }
  }

  async fetchImages() {
    try {
      const response = await axios.get(`${SERVER_URL}/images?include_files=true`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching images:', error.message);
      throw error;
    }
  }

  generateHeader() {
    this.doc.fontSize(24)
      .font('Helvetica-Bold')
      .text('Image Reconstruction Report', {
        align: 'center'
      });

    this.doc.moveDown(0.5);

    this.doc.fontSize(12)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'center'
      });

    this.doc.moveDown(2);
  }

  generateTableOfContents(images) {
    this.doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('Table of Contents', {
        underline: true
      });

    this.doc.moveDown(0.5);

    images.forEach((image, index) => {
      this.doc.fontSize(10)
        .font('Helvetica')
        .text(`${index + 1}. ${image.user?.name || 'Unknown'} - ${image.algorithm.toUpperCase()} (${image.model})`);
    });

    this.doc.moveDown(2);
  }

  generateImageSections(images) {
    images.forEach((image, index) => {
      this.generateImageSection(image, index + 1);

      if (index < images.length - 1) {
        this.doc.addPage();
      }
    });
  }

  generateImageSection(image, sectionNumber) {
    this.doc.fontSize(16)
      .font('Helvetica-Bold')
      .text(`${sectionNumber}. Image: ${image.user?.name || 'Unknown'}`, {
        underline: true
      });

    this.doc.moveDown(0.5);

    this.doc.fontSize(10)
      .font('Helvetica');

    const details = [
      `User: ${image.user?.name || 'Unknown'}`,
      `Algorithm: ${image.algorithm.toUpperCase()}`,
      `Model: ${image.model}`,
      `Size: ${image.size}`,
      `Iterations: ${image.iterations || 'N/A'}`,
      `Initial Date: ${image.initial_date || 'N/A'}`,
      `Final Date: ${image.final_date || 'N/A'}`
    ];

    if (image.initial_date && image.final_date) {
      const initialDate = new Date(image.initial_date);
      const finalDate = new Date(image.final_date);
      const duration = finalDate - initialDate;
      const seconds = Math.floor(duration / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      details.push(`Reconstruction Time: ${minutes}m ${remainingSeconds}s`);
    } else {
      details.push('Reconstruction Time: N/A');
    }

    details.forEach(detail => {
      this.doc.text(detail);
    });

    this.doc.moveDown(1);

    if (image.image_file && image.image_file.data) {
      try {
        const imageBuffer = Buffer.from(image.image_file.data, 'base64');

        const pageWidth = this.doc.page.width - 100;
        const pageHeight = this.doc.page.height - 400;

        this.doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('Reconstructed Image:', {
            underline: true
          });

        this.doc.moveDown(0.5);

        const imageWidth = Math.min(300, pageWidth);
        const imageHeight = (imageWidth * 0.75);

        const x = (this.doc.page.width - imageWidth) / 2;
        const y = this.doc.y;

        this.doc.image(imageBuffer, x, y, {
          width: imageWidth,
          height: imageHeight
        });

        this.doc.moveDown(2);

      } catch (error) {
        console.error(`❌ Error adding image for ${image.image_identifier}:`, error.message);
        this.doc.text('Image could not be displayed');
      }
    } else {
      this.doc.text('Image file not available');
    }
  }
}

module.exports = PDFReportGenerator; 

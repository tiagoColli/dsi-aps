try {
  require('dotenv').config();
} catch (error) {
}

const PDFReportGenerator = require('./pdfGenerator');

async function main() {
  try {
    console.log('🚀 Starting PDF report generation...');

    const generator = new PDFReportGenerator();
    const reportPath = await generator.generateReport();

    if (reportPath) {
      console.log(`📋 Report generated successfully at: ${reportPath}`);
      process.exit(0);
    } else {
      console.log('❌ No report was generated');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to generate report:', error.message);
    process.exit(1);
  }
}

main(); 

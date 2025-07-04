const axios = require('axios');
const ServerPDFReportGenerator = require('./serverPdfGenerator');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';

async function generateServerUsageReport(minutes = 2) {
  try {
    const response = await axios.get(`${SERVER_URL}/server-logs?minutes=${minutes}`);
    const data = response.data;

    if (data.logs.length === 0) {
      console.log('No server logs found for the specified time period');
      return;
    }

    const cpuValues = data.logs.map(log => log.cpu_percent);
    const ramValues = data.logs.map(log => log.ram_mb);

    const avgCpu = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
    const maxCpu = Math.max(...cpuValues);
    const minCpu = Math.min(...cpuValues);

    const avgRam = ramValues.reduce((a, b) => a + b, 0) / ramValues.length;
    const maxRam = Math.max(...ramValues);
    const minRam = Math.min(...ramValues);

    const pdfGenerator = new ServerPDFReportGenerator();
    const pdfPath = await pdfGenerator.generateReport(minutes);

    console.log(`PDF report saved to: ${pdfPath}`);

    return {
      period: data.period,
      total_entries: data.total_entries,
      cpu: { average: avgCpu, maximum: maxCpu, minimum: minCpu },
      ram: { average: avgRam, maximum: maxRam, minimum: minRam },
      pdf_path: pdfPath
    };

  } catch (error) {
    console.error('Error generating server usage report:', error.message);
  }
}

const minutes = process.argv[2] ? parseInt(process.argv[2]) : 2;

generateServerUsageReport(minutes); 

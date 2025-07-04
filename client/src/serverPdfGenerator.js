const fs = require('node:fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';

class ServerPDFReportGenerator {
  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
  }

  async generateReport(minutes = 2) {
    try {
      const serverData = await this.fetchServerLogs(minutes);

      if (!serverData || !serverData.logs || serverData.logs.length === 0) {
        console.log('No server logs found for the specified time period');
        return;
      }

      const reportsDir = path.join(__dirname, '..', 'server_reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `server_usage_report_${timestamp}.pdf`;
      const filepath = path.join(reportsDir, filename);

      const stream = fs.createWriteStream(filepath);
      this.doc.pipe(stream);

      this.generateHeader();
      this.generateSummary(serverData);
      this.generateDetailedLogs(serverData.logs);
      this.generateCharts(serverData.logs);

      this.doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          resolve(filepath);
        });
        stream.on('error', reject);
      });

    } catch (error) {
      console.error('Error generating server PDF report:', error.message);
      throw error;
    }
  }

  async fetchServerLogs(minutes) {
    try {
      const response = await axios.get(`${SERVER_URL}/server-logs?minutes=${minutes}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching server logs:', error.message);
      throw error;
    }
  }

  generateHeader() {
    this.doc.fontSize(24)
      .font('Helvetica-Bold')
      .text('Server Usage Report', {
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

  generateSummary(serverData) {
    const cpuValues = serverData.logs.map(log => log.cpu_percent);
    const ramValues = serverData.logs.map(log => log.ram_mb);

    const avgCpu = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
    const maxCpu = Math.max(...cpuValues);
    const minCpu = Math.min(...cpuValues);

    const avgRam = ramValues.reduce((a, b) => a + b, 0) / ramValues.length;
    const maxRam = Math.max(...ramValues);
    const minRam = Math.min(...ramValues);

    this.doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('Executive Summary', {
        underline: true
      });

    this.doc.moveDown(0.5);

    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Monitoring Period:');

    this.doc.fontSize(10)
      .font('Helvetica')
      .text(`Start: ${serverData.period.start_time}`)
      .text(`End: ${serverData.period.end_time}`)
      .text(`Duration: ${serverData.period.minutes} minutes`)
      .text(`Total Entries: ${serverData.total_entries}`);

    this.doc.moveDown(1);

    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('CPU Usage Summary:');

    this.doc.fontSize(10)
      .font('Helvetica')
      .text(`Average: ${avgCpu.toFixed(2)}%`)
      .text(`Maximum: ${maxCpu.toFixed(2)}%`)
      .text(`Minimum: ${minCpu.toFixed(2)}%`);

    this.doc.moveDown(1);

    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('RAM Usage Summary:');

    this.doc.fontSize(10)
      .font('Helvetica')
      .text(`Average: ${avgRam.toFixed(2)} MB`)
      .text(`Maximum: ${maxRam.toFixed(2)} MB`)
      .text(`Minimum: ${minRam.toFixed(2)} MB`);

    this.doc.moveDown(2);
  }

  generateDetailedLogs(logs) {
    this.doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('Detailed Log Entries', {
        underline: true
      });

    this.doc.moveDown(0.5);

    const tableTop = this.doc.y;
    const colWidth = 120;
    const rowHeight = 20;

    this.doc.fontSize(10)
      .font('Helvetica-Bold')
      .text('Timestamp', 50, tableTop)
      .text('CPU (%)', 50 + colWidth, tableTop)
      .text('RAM (MB)', 50 + colWidth * 2, tableTop);

    this.doc.moveDown(0.5);

    this.doc.fontSize(9)
      .font('Helvetica');

    logs.forEach((log, index) => {
      const y = tableTop + 30 + (index * rowHeight);

      if (y > this.doc.page.height - 100) {
        this.doc.addPage();
        this.doc.y = 50;
      }

      this.doc.text(log.timestamp, 50, this.doc.y)
        .text(log.cpu_percent.toFixed(2), 50 + colWidth, this.doc.y)
        .text(log.ram_mb.toFixed(2), 50 + colWidth * 2, this.doc.y);

      this.doc.moveDown(0.5);
    });

    this.doc.moveDown(2);
  }

  generateCharts(logs) {
    this.doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('Usage Charts', {
        underline: true
      });

    this.doc.moveDown(1);

    this.generateUsageChart(logs, 'CPU Usage (%)', 'cpu_percent', 0, 100);

    this.doc.moveDown(1);

    this.generateUsageChart(logs, 'RAM Usage (MB)', 'ram_mb', 0, Math.max(...logs.map(l => l.ram_mb)) * 1.1);
  }

  generateUsageChart(logs, title, dataKey, minValue, maxValue) {
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text(title);

    this.doc.moveDown(0.5);

    const chartWidth = 400;
    const chartHeight = 150;
    const barWidth = chartWidth / logs.length;
    const maxBarHeight = chartHeight - 20;

    this.doc.rect(50, this.doc.y, chartWidth, chartHeight)
      .stroke();

    logs.forEach((log, index) => {
      const value = log[dataKey];
      const normalizedHeight = ((value - minValue) / (maxValue - minValue)) * maxBarHeight;
      const x = 50 + (index * barWidth);
      const y = this.doc.y + chartHeight - normalizedHeight;

      this.doc.rect(x, y, barWidth - 1, normalizedHeight)
        .fill('#4A90E2');

      if (index % 5 === 0) {
        this.doc.fontSize(8)
          .font('Helvetica')
          .text(value.toFixed(1), x, y - 15, {
            width: barWidth,
            align: 'center'
          });
      }
    });

    this.doc.moveDown(2);
  }
}

module.exports = ServerPDFReportGenerator; 

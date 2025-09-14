import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface HazardReport {
  _id: string;
  type: string;
  location: { latitude: number; longitude: number; address: string };
  date: string;
}

const Analytics: React.FC = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await fetch('http://localhost:5000/api/hazards');
      const data = await res.json();
      setReports(data);
    };
    fetchReports();
  }, []);

  const types = Array.from(new Set(reports.map((r) => r.type)));
  const hazardsByType = types.map((t) => reports.filter((r) => r.type === t).length);

  const deepColors = [
    '#0b3d91', '#8b0000', '#006400', '#ff8c00', '#4b0082', '#8b4513', '#2f4f4f',
  ];

  const barData = {
    labels: types,
    datasets: [
      {
        label: 'Hazards by Type',
        data: hazardsByType,
        backgroundColor: deepColors.slice(0, types.length),
      },
    ],
  };

  const pieData = {
    labels: types,
    datasets: [
      {
        label: 'Hazards Distribution',
        data: hazardsByType,
        backgroundColor: deepColors.slice(0, types.length),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // -------------------- PDF Download --------------------
  const downloadPDF = async () => {
    const element = document.getElementById('analytics-section');
    if (!element) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 10;
    if (imgHeight < pageHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let y = position;
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
        if (heightLeft > 0) pdf.addPage();
        y = 20 - heightLeft;
      }
    }

    pdf.save(`hazard_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <>
      <Sidebar />
      <Topbar />
      <div className="dashboard-content">
        <h2>Analytics</h2>

        <button className="download-btn" onClick={downloadPDF}>📄 Download PDF</button>

        <div id="analytics-section">
          <div className="chart-container">
            <h3>Hazards by Type (Bar Chart)</h3>
            <Bar data={barData} />
          </div>
          <div className="chart-container" style={{height:'900px', width:'900px'}}>
            <h3>Hazards Distribution (Pie Chart)</h3>
            <Pie data={pieData} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-content {
          padding: 20px;
        }
        .chart-container {
          margin-bottom: 30px;
        }
        .download-btn {
          padding: 8px 12px;
          margin-bottom: 15px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .download-btn:hover {
          background-color: #1d4ed8;
        }
      `}</style>
    </>
  );
};

export default Analytics;

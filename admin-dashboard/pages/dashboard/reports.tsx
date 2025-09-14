import React, { useEffect, useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Media {
  fileType: string;   // "image" | "video" | "audio" | "doc"
  fileUrl: string;
  originalName: string;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface HazardReport {
  _id: string;
  name?: string;       // ✅ added
  phone?: string;      // ✅ added
  type: string;
  description: string;
  location: Location | string | null;
  createdAt: string;
  media?: Media[];
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & sorting state
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Lightbox state
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/hazards');
        const data = await res.json();
        setReports(data);
        setFilteredReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let temp = [...reports];

    if (filterType) temp = temp.filter(r => r.type === filterType);
    if (filterLocation) {
      temp = temp.filter(r => {
        if (!r.location) return false;
        return typeof r.location === 'string'
          ? r.location.includes(filterLocation)
          : r.location.address?.includes(filterLocation);
      });
    }
    if (filterStartDate) temp = temp.filter(r => new Date(r.createdAt) >= new Date(filterStartDate));
    if (filterEndDate) temp = temp.filter(r => new Date(r.createdAt) <= new Date(filterEndDate));

    if (sortBy === 'newest') temp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') temp.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === 'type') temp.sort((a, b) => (a.type || '').localeCompare(b.type || ''));

    setFilteredReports(temp);
  }, [reports, filterType, filterLocation, filterStartDate, filterEndDate, sortBy]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  const formatLocation = (location: Location | string | null) => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    return `${location.address} (${location.latitude}, ${location.longitude})`;
  };

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setPhotoIndex(index);
    setIsOpen(true);
  };

  // -------------------- PDF Download --------------------
  const downloadPDF = async () => {
    const table = document.getElementById('reports-table');
    if (!table) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(table, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 10;
    if (imgHeight < pageHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    } else {
      // Multiple pages
      let heightLeft = imgHeight;
      let y = position;
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
        if (heightLeft > 0) pdf.addPage();
        y = 10 - heightLeft;
      }
    }

    pdf.save(`hazard_reports_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const uniqueTypes = Array.from(new Set(reports.map(r => r.type))).filter(Boolean);
  const uniqueLocations = Array.from(
    new Set(
      reports.map(r => {
        if (!r.location) return null;
        return typeof r.location === 'string' ? r.location : r.location.address;
      })
    )
  ).filter(Boolean);

  return (
    <>
      <Sidebar />
      <Topbar />
      <div className="dashboard-content">
        <h2>Hazard Reports</h2>

        {/* Filters */}
        <div className="filters">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {uniqueTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>

          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
            <option value="">All Locations</option>
            {uniqueLocations.map((loc, idx) => (
              <option key={idx} value={loc || ''}>{loc || 'Unknown'}</option>
            ))}
          </select>

          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="type">Type</option>
          </select>
        </div>

        {/* Download PDF */}
        <button className="download-btn" onClick={downloadPDF}>📄 Download PDF</button>

        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <table className="reports-table" id="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>   {/* ✅ new */}
                <th>Phone</th>  {/* ✅ new */}
                <th>Type</th>
                <th>Description</th>
                <th>Location</th>
                <th>Date</th>
                <th>Media</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id}>
                  <td>{report._id}</td>
                  <td>{report.name || "N/A"}</td>   {/* ✅ new */}
                  <td>{report.phone || "N/A"}</td>  {/* ✅ new */}
                  <td>{report.type}</td>
                  <td>{report.description}</td>
                  <td>{formatLocation(report.location)}</td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    {report.media && report.media.length > 0 ? (
                      <div className="media-container">
                        {report.media.map((file, idx) => {
                          const fileUrl = getFileUrl(file.fileUrl);
                          if (file.fileType === 'image') {
                            return (
                              <img
                                key={idx}
                                src={fileUrl}
                                alt={file.originalName}
                                className="media-thumb"
                                onClick={() =>
                                  openLightbox(
                                    report.media!
                                      .filter(m => m.fileType === 'image')
                                      .map(m => getFileUrl(m.fileUrl)),
                                    report.media!.findIndex(m => m.fileUrl === file.fileUrl)
                                  )
                                }
                              />
                            );
                          } else {
                            const icon = file.fileType === 'video' ? '🎥' : file.fileType === 'audio' ? '🎵' : '📄';
                            return (
                              <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="media-link"
                              >
                                {icon} {file.originalName}
                              </a>
                            );
                          }
                        })}
                      </div>
                    ) : 'No media'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lightbox */}
      {isOpen && (
        <Lightbox
          mainSrc={lightboxImages[photoIndex]}
          nextSrc={lightboxImages[(photoIndex + 1) % lightboxImages.length]}
          prevSrc={lightboxImages[(photoIndex + lightboxImages.length - 1) % lightboxImages.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + lightboxImages.length - 1) % lightboxImages.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % lightboxImages.length)
          }
        />
      )}

      <style jsx>{`
        .dashboard-content {
          padding: 20px;
        }
        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        .filters select,
        .filters input {
          padding: 6px 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
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
        .media-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .media-thumb {
          width: 100px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .media-thumb:hover {
          transform: scale(1.05);
        }
        .media-link {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .media-link:hover {
          color: #1d4ed8;
        }
      `}</style>
    </>
  );
};

export default Reports;

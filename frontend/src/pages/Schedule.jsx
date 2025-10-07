import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../components/Navbar';
import { getNetOperations, exportNetOperationPDF, deleteNetOperation } from '../services/api';
import { toast } from 'react-toastify';
import { format, startOfDay, endOfDay } from 'date-fns';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [operations, setOperations] = useState([]);
  const [selectedDateOps, setSelectedDateOps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOperations();
  }, []);

  useEffect(() => {
    filterOperationsByDate(selectedDate);
  }, [selectedDate, operations]);

  const loadOperations = async () => {
    setLoading(true);
    try {
      const data = await getNetOperations();
      setOperations(data);
    } catch (error) {
      toast.error('Error loading operations');
    } finally {
      setLoading(false);
    }
  };

  const filterOperationsByDate = (date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    const filtered = operations.filter(op => {
      const opDate = new Date(op.startTime);
      return opDate >= start && opDate <= end;
    });
    
    setSelectedDateOps(filtered);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleExportPDF = async (operationId) => {
    try {
      const pdfBlob = await exportNetOperationPDF(operationId);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `net-operation-${operationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleDeleteOperation = async (operationId) => {
    if (!window.confirm('Are you sure you want to delete this net operation? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteNetOperation(operationId);
      toast.success('Net operation deleted successfully!');
      // Reload operations to update the list
      loadOperations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete operation');
    }
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasOperation = operations.some(op => {
        const opDate = new Date(op.startTime);
        return opDate.toDateString() === date.toDateString();
      });
      return hasOperation ? 'has-operation' : null;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Schedule</h1>

        <div className="schedule-layout">
          <div className="calendar-section">
            <h2>Select a Date</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={getTileClassName}
            />
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color has-operation"></span>
                <span>Days with operations</span>
              </div>
            </div>
          </div>

          <div className="operations-section">
            <h2>Operations on {format(selectedDate, 'MMMM d, yyyy')}</h2>
            
            {loading ? (
              <p>Loading...</p>
            ) : selectedDateOps.length === 0 ? (
              <p className="no-data">No operations on this date</p>
            ) : (
              <div className="operations-list">
                {selectedDateOps.map((op) => (
                  <div key={op._id} className="operation-detail-card">
                    <div className="operation-header">
                      <div>
                        <h3>{op.netName}</h3>
                        <p className="operation-time">
                          {new Date(op.startTime).toLocaleTimeString()}
                          {op.endTime && ` - ${new Date(op.endTime).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                          onClick={() => handleDeleteOperation(op._id)}
                          className="btn-icon btn-danger"
                          title="Delete operation"
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '1.2em',
                            color: '#dc3545'
                          }}
                        >
                          🗑️
                        </button>
                        <span className={`status-badge ${op.status}`}>{op.status}</span>
                      </div>
                    </div>

                    <div className="operation-info">
                      <p><strong>Net Control:</strong> {op.operatorCallsign}</p>
                      {op.frequency && <p><strong>Frequency:</strong> {op.frequency}</p>}
                      <p><strong>Total Check-ins:</strong> {op.checkIns.length}</p>
                      {op.notes && <p><strong>Notes:</strong> {op.notes}</p>}
                    </div>

                    <div className="checkins-summary">
                      <h4>Check-ins:</h4>
                      {op.checkIns.length === 0 ? (
                        <p>No check-ins</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="mini-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Callsign</th>
                                <th>Name</th>
                                <th>Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {op.checkIns.map((checkIn, index) => (
                                <tr key={checkIn._id}>
                                  <td>{index + 1}</td>
                                  <td>{checkIn.callsign}</td>
                                  <td>{checkIn.name}</td>
                                  <td>{new Date(checkIn.timestamp).toLocaleTimeString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => handleExportPDF(op._id)}
                      className="btn btn-primary"
                    >
                      Export to PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;


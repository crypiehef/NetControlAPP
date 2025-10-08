import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../components/Navbar';
import { getNetOperations, exportNetOperationPDF, deleteNetOperation, scheduleNetOperation, startScheduledNet } from '../services/api';
import { toast } from 'react-toastify';
import { format, startOfDay, endOfDay } from 'date-fns';

const Schedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [operations, setOperations] = useState([]);
  const [selectedDateOps, setSelectedDateOps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    netName: 'York County Amateur Radio Society Net',
    frequency: '',
    notes: '',
    startTime: '',
    recurrence: 'none'
  });

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

  const handleScheduleNet = async (e) => {
    e.preventDefault();
    
    if (!scheduleData.startTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const result = await scheduleNetOperation(scheduleData);
      toast.success(result.message);
      setScheduleData({
        netName: 'York County Amateur Radio Society Net',
        frequency: '',
        notes: '',
        startTime: '',
        recurrence: 'none'
      });
      setShowScheduleForm(false);
      loadOperations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to schedule operation');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNet = async (operationId) => {
    setLoading(true);
    try {
      await startScheduledNet(operationId);
      toast.success('Net operation started!');
      // Navigate to Net Control page
      navigate('/net-control');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start net operation');
      setLoading(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Schedule</h1>
          <button 
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="btn btn-primary"
          >
            {showScheduleForm ? 'Cancel' : '+ Schedule Future Net'}
          </button>
        </div>

        {showScheduleForm && (
          <div className="schedule-form-section" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h2>Schedule Future Net Operation</h2>
            <form onSubmit={handleScheduleNet}>
              <div className="form-group">
                <label htmlFor="netName">Net Name</label>
                <input
                  type="text"
                  id="netName"
                  value={scheduleData.netName}
                  onChange={(e) => setScheduleData({ ...scheduleData, netName: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Date & Time</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <input
                  type="text"
                  id="frequency"
                  value={scheduleData.frequency}
                  onChange={(e) => setScheduleData({ ...scheduleData, frequency: e.target.value })}
                  className="form-control"
                  placeholder="e.g., 146.520 MHz"
                />
              </div>

              <div className="form-group">
                <label htmlFor="recurrence">Repeat For</label>
                <select
                  id="recurrence"
                  value={scheduleData.recurrence}
                  onChange={(e) => setScheduleData({ ...scheduleData, recurrence: e.target.value })}
                  className="form-control"
                >
                  <option value="none">No Repeat (One Time)</option>
                  <option value="daily">Daily (Next 12 days)</option>
                  <option value="weekly">Weekly (Next 12 weeks)</option>
                  <option value="bi-weekly">Bi-Weekly (Next 12 occurrences)</option>
                  <option value="monthly">Monthly (Next 12 months)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  className="form-control"
                  rows="3"
                  placeholder="Optional notes about this scheduled net"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule Net Operation'}
              </button>
            </form>
          </div>
        )}

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

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      {op.status === 'scheduled' && (
                        <button 
                          onClick={() => handleStartNet(op._id)}
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          ▶️ Start Net
                        </button>
                      )}
                      <button 
                        onClick={() => handleExportPDF(op._id)}
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        Export to PDF
                      </button>
                    </div>
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


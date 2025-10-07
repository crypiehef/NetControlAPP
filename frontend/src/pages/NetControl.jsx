import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import CheckInForm from '../components/CheckInForm';
import { 
  createNetOperation, 
  getNetOperations, 
  addCheckIn, 
  completeNetOperation,
  deleteCheckIn 
} from '../services/api';
import { toast } from 'react-toastify';

const NetControl = () => {
  const { user } = useAuth();
  const [activeNet, setActiveNet] = useState(null);
  const [netInfo, setNetInfo] = useState({
    netName: 'York County Amateur Radio Society Net',
    frequency: '',
    notes: ''
  });
  const [showStartForm, setShowStartForm] = useState(true);

  useEffect(() => {
    loadActiveNet();
  }, []);

  const loadActiveNet = async () => {
    try {
      const operations = await getNetOperations({ status: 'active' });
      const userActiveOp = operations.find(
        op => op.operatorId._id === user._id || op.operatorId === user._id
      );
      if (userActiveOp) {
        setActiveNet(userActiveOp);
        setShowStartForm(false);
      }
    } catch (error) {
      console.error('Error loading active net:', error);
    }
  };

  const handleStartNet = async (e) => {
    e.preventDefault();
    try {
      const newNet = await createNetOperation(netInfo);
      setActiveNet(newNet);
      setShowStartForm(false);
      toast.success('Net operation started!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start net');
    }
  };

  const handleAddCheckIn = async (checkInData) => {
    try {
      const updatedNet = await addCheckIn(activeNet._id, checkInData);
      setActiveNet(updatedNet);
      toast.success(`${checkInData.callsign} checked in!`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add check-in');
    }
  };

  const handleDeleteCheckIn = async (checkInId) => {
    if (!window.confirm('Are you sure you want to remove this check-in?')) return;
    
    try {
      const updatedNet = await deleteCheckIn(activeNet._id, checkInId);
      setActiveNet(updatedNet);
      toast.success('Check-in removed');
    } catch (error) {
      toast.error('Failed to remove check-in');
    }
  };

  const handleCompleteNet = async () => {
    if (!window.confirm('Are you sure you want to complete this net operation?')) return;

    try {
      await completeNetOperation(activeNet._id);
      toast.success('Net operation completed!');
      setActiveNet(null);
      setShowStartForm(true);
    } catch (error) {
      toast.error('Failed to complete net');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Net Control Operation</h1>

        {showStartForm ? (
          <div className="start-net-section">
            <h2>Start New Net Operation</h2>
            <form onSubmit={handleStartNet} className="net-start-form">
              <div className="form-group">
                <label htmlFor="netName">Net Name</label>
                <input
                  type="text"
                  id="netName"
                  value={netInfo.netName}
                  onChange={(e) => setNetInfo({ ...netInfo, netName: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <input
                  type="text"
                  id="frequency"
                  value={netInfo.frequency}
                  onChange={(e) => setNetInfo({ ...netInfo, frequency: e.target.value })}
                  className="form-control"
                  placeholder="e.g., 146.520 MHz"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={netInfo.notes}
                  onChange={(e) => setNetInfo({ ...netInfo, notes: e.target.value })}
                  className="form-control"
                  rows="3"
                  placeholder="Optional notes about this net"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Start Net Operation
              </button>
            </form>
          </div>
        ) : (
          <div className="active-net-section">
            <div className="net-info-card">
              <h2>{activeNet?.netName}</h2>
              <div className="net-details">
                <p><strong>Net Control:</strong> {activeNet?.operatorCallsign}</p>
                <p><strong>Started:</strong> {activeNet && new Date(activeNet.startTime).toLocaleString()}</p>
                {activeNet?.frequency && <p><strong>Frequency:</strong> {activeNet.frequency}</p>}
                <p><strong>Check-ins:</strong> {activeNet?.checkIns.length || 0}</p>
              </div>
              <button onClick={handleCompleteNet} className="btn btn-danger">
                Complete Net Operation
              </button>
            </div>

            <div className="checkin-section">
              <h2>Add Check-in</h2>
              <CheckInForm onSubmit={handleAddCheckIn} />
            </div>

            <div className="checkins-list">
              <h2>Check-ins ({activeNet?.checkIns.length || 0})</h2>
              {activeNet?.checkIns.length === 0 ? (
                <p className="no-data">No check-ins yet</p>
              ) : (
                <div className="table-responsive">
                  <table className="checkins-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Callsign</th>
                        <th>Name</th>
                        <th>License Class</th>
                        <th>Location</th>
                        <th>Time</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeNet?.checkIns.map((checkIn, index) => (
                        <tr key={checkIn._id}>
                          <td>{index + 1}</td>
                          <td className="callsign-cell">{checkIn.callsign}</td>
                          <td>{checkIn.name}</td>
                          <td>{checkIn.license_class || '-'}</td>
                          <td>{checkIn.location || '-'}</td>
                          <td>{new Date(checkIn.timestamp).toLocaleTimeString()}</td>
                          <td>{checkIn.notes || '-'}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteCheckIn(checkIn._id)}
                              className="btn btn-small btn-danger"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetControl;


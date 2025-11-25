import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import CheckInForm from '../components/CheckInForm';
import { 
  createNetOperation, 
  getNetOperations, 
  addCheckIn, 
  completeNetOperation,
  deleteCheckIn,
  updateCheckInNotes,
  updateCheckInCommented
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
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [editCheckInNotesText, setEditCheckInNotesText] = useState('');
  const [sortBySuffix, setSortBySuffix] = useState(false);

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

  const handleEditCheckInNotes = (checkIn) => {
    setEditingCheckIn(checkIn._id);
    setEditCheckInNotesText(checkIn.notes || '');
  };

  const handleSaveCheckInNotes = async (checkInId) => {
    try {
      const updatedNet = await updateCheckInNotes(activeNet._id, checkInId, editCheckInNotesText);
      setActiveNet(updatedNet);
      setEditingCheckIn(null);
      setEditCheckInNotesText('');
      toast.success('Check-in notes updated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update check-in notes');
    }
  };

  const handleCancelEditCheckInNotes = () => {
    setEditingCheckIn(null);
    setEditCheckInNotesText('');
  };

  const handleCheckInCommentedChange = async (checkInId, commented) => {
    try {
      const updatedNet = await updateCheckInCommented(activeNet._id, checkInId, commented);
      setActiveNet(updatedNet);
      toast.success(commented ? 'Comment status marked as complete!' : 'Comment status reset');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update comment status');
    }
  };

  // Extract the suffix letter from a callsign (first letter after numbers/prefix)
  // Example: K4HEF -> H, N1AA -> A, W1AW -> A
  const getCallsignSuffix = (callsign) => {
    if (!callsign) return '';
    
    // Find the first letter that appears after any numbers
    // This handles patterns like K4HEF, N1AA, W1AW, VE3ABC, etc.
    const match = callsign.match(/[0-9]+([A-Z])/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    
    // Fallback: if no number found, find first letter after any prefix letters
    // This handles edge cases where callsigns might not follow standard format
    const letterMatch = callsign.match(/^[A-Z0-9]*([A-Z])/);
    if (letterMatch && letterMatch[1]) {
      return letterMatch[1].toUpperCase();
    }
    
    return '';
  };

  // Sort check-ins based on current sort mode
  const getSortedCheckIns = () => {
    if (!activeNet?.checkIns) return [];
    
    const checkIns = [...activeNet.checkIns];
    
    if (sortBySuffix) {
      return checkIns.sort((a, b) => {
        const suffixA = getCallsignSuffix(a.callsign);
        const suffixB = getCallsignSuffix(b.callsign);
        
        if (suffixA < suffixB) return -1;
        if (suffixA > suffixB) return 1;
        
        // If suffix letters are the same, sort by full callsign
        return a.callsign.localeCompare(b.callsign);
      });
    }
    
    // Default: return in original order (by check-in time)
    return checkIns;
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Check-ins ({activeNet?.checkIns.length || 0})</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95em' }}>
                  <input
                    type="checkbox"
                    checked={sortBySuffix}
                    onChange={(e) => setSortBySuffix(e.target.checked)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span>Sort by callsign suffix</span>
                </label>
              </div>
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
                        <th>Comments</th>
                        <th>Commented?</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedCheckIns().map((checkIn, index) => (
                        <tr key={checkIn._id}>
                          <td>{index + 1}</td>
                          <td className="callsign-cell">{checkIn.callsign}</td>
                          <td>{checkIn.name}</td>
                          <td>{checkIn.license_class || '-'}</td>
                          <td>{checkIn.location || '-'}</td>
                          <td>{new Date(checkIn.timestamp).toLocaleTimeString()}</td>
                          <td>
                            {checkIn.stayingForComments ? (
                              <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>✓ Yes</span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>Not staying</span>
                            )}
                          </td>
                          <td>
                            {checkIn.stayingForComments ? (
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={checkIn.commented || false}
                                  onChange={(e) => handleCheckInCommentedChange(checkIn._id, e.target.checked)}
                                  style={{ width: 'auto', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.9em' }}>Done</span>
                              </label>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>-</span>
                            )}
                          </td>
                          <td>
                            {editingCheckIn === checkIn._id ? (
                              <div>
                                <textarea
                                  value={editCheckInNotesText}
                                  onChange={(e) => setEditCheckInNotesText(e.target.value)}
                                  className="form-control"
                                  rows="2"
                                  placeholder="Add notes..."
                                  style={{ minWidth: '200px', marginBottom: '5px' }}
                                />
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button
                                    onClick={() => handleSaveCheckInNotes(checkIn._id)}
                                    className="btn btn-small btn-primary"
                                  >
                                    💾 Save
                                  </button>
                                  <button
                                    onClick={handleCancelEditCheckInNotes}
                                    className="btn btn-small btn-secondary"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              checkIn.notes || '-'
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button
                                onClick={() => handleEditCheckInNotes(checkIn)}
                                className="btn btn-small btn-secondary"
                                title="Edit Notes"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteCheckIn(checkIn._id)}
                                className="btn btn-small btn-danger"
                              >
                                Remove
                              </button>
                            </div>
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


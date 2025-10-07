import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNetOperations } from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentOps, setRecentOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOps: 0,
    totalCheckIns: 0,
    activeOps: 0
  });

  useEffect(() => {
    loadRecentOperations();
  }, []);

  const loadRecentOperations = async () => {
    try {
      const operations = await getNetOperations({ limit: 5 });
      setRecentOps(operations.slice(0, 5));
      
      // Calculate stats
      const totalCheckIns = operations.reduce((sum, op) => sum + op.checkIns.length, 0);
      const activeOps = operations.filter(op => op.status === 'active').length;
      
      setStats({
        totalOps: operations.length,
        totalCheckIns,
        activeOps
      });
    } catch (error) {
      toast.error('Error loading operations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.username}!</h1>
          <p className="callsign-display">Callsign: {user?.callsign}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Operations</h3>
            <p className="stat-number">{stats.totalOps}</p>
          </div>
          <div className="stat-card">
            <h3>Total Check-ins</h3>
            <p className="stat-number">{stats.totalCheckIns}</p>
          </div>
          <div className="stat-card">
            <h3>Active Operations</h3>
            <p className="stat-number">{stats.activeOps}</p>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/net-control')} 
              className="btn btn-primary btn-large"
            >
              Start New Net Operation
            </button>
            <button 
              onClick={() => navigate('/schedule')} 
              className="btn btn-secondary btn-large"
            >
              View Schedule
            </button>
          </div>
        </div>

        <div className="recent-operations">
          <h2>Recent Operations</h2>
          {loading ? (
            <p>Loading...</p>
          ) : recentOps.length === 0 ? (
            <p className="no-data">No operations yet. Start your first net operation!</p>
          ) : (
            <div className="operations-list">
              {recentOps.map((op) => (
                <div key={op._id} className="operation-card">
                  <div className="operation-header">
                    <h3>{op.netName}</h3>
                    <span className={`status-badge ${op.status}`}>{op.status}</span>
                  </div>
                  <div className="operation-details">
                    <p><strong>Operator:</strong> {op.operatorCallsign}</p>
                    <p><strong>Start Time:</strong> {new Date(op.startTime).toLocaleString()}</p>
                    <p><strong>Check-ins:</strong> {op.checkIns.length}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


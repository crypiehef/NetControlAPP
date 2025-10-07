import { useState } from 'react';
import { lookupCallsign } from '../services/api';
import { toast } from 'react-toastify';

const CheckInForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    callsign: '',
    name: '',
    location: '',
    license_class: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCallsignChange = async (e) => {
    const callsign = e.target.value.toUpperCase();
    setFormData({ ...formData, callsign });

    // Auto-lookup after 3 characters
    if (callsign.length >= 3) {
      setLoading(true);
      try {
        const result = await lookupCallsign(callsign);
        if (result && result.name) {
          setFormData(prev => ({ 
            ...prev, 
            name: result.name,
            location: result.location || '',
            license_class: result.license_class || ''
          }));
          toast.success(`Found: ${result.name}${result.license_class ? ' (' + result.license_class + ')' : ''}`);
        }
      } catch (error) {
        // Silently fail - user can manually enter name
        console.log('Callsign lookup failed, manual entry allowed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.callsign || !formData.name) {
      toast.error('Callsign and Name are required');
      return;
    }
    onSubmit(formData);
    setFormData({ callsign: '', name: '', location: '', license_class: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="checkin-form">
      <div className="form-group">
        <label htmlFor="callsign">Callsign *</label>
        <input
          type="text"
          id="callsign"
          value={formData.callsign}
          onChange={handleCallsignChange}
          placeholder="Enter callsign"
          required
          className="form-control"
          disabled={loading}
        />
        {loading && <span className="loading-text">Looking up...</span>}
      </div>

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name (auto-filled from QRZ)"
            required
            className="form-control"
            style={{ flex: 1 }}
          />
          {formData.license_class && (
            <input
              type="text"
              value={formData.license_class}
              onChange={(e) => setFormData({ ...formData, license_class: e.target.value })}
              placeholder="License Class"
              className="form-control"
              style={{ width: '120px' }}
              title="License Class"
            />
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="City, State (auto-filled from QRZ)"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
          className="form-control"
          rows="2"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Add Check-in
      </button>
    </form>
  );
};

export default CheckInForm;


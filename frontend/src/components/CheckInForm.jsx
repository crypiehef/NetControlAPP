import { useState, useEffect, useRef } from 'react';
import { lookupCallsign } from '../services/api';
import { toast } from 'react-toastify';

const CheckInForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    callsign: '',
    name: '',
    location: '',
    license_class: '',
    stayingForComments: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const callsignRef = useRef(null);

  const handleCallsignChange = (e) => {
    const callsign = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, callsign }));
  };

  // Auto-lookup after 3 characters, debounced so typing is never interrupted
  useEffect(() => {
    const callsign = formData.callsign;
    if (callsign.length < 3) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await lookupCallsign(callsign);
        // Ignore stale results if the callsign changed while looking up
        if (!cancelled && result && result.name) {
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
        if (!cancelled) setLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [formData.callsign]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.callsign || !formData.name) {
      toast.error('Callsign and Name are required');
      return;
    }
    onSubmit(formData);
    setFormData({ callsign: '', name: '', location: '', license_class: '', stayingForComments: false, notes: '' });
    callsignRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="checkin-form">
      <div className="form-group">
        <label htmlFor="callsign">Callsign *</label>
        <input
          type="text"
          id="callsign"
          ref={callsignRef}
          value={formData.callsign}
          onChange={handleCallsignChange}
          placeholder="Enter callsign"
          required
          className="form-control"
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.stayingForComments}
            onChange={(e) => setFormData({ ...formData, stayingForComments: e.target.checked })}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          <span>Staying for comments</span>
        </label>
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

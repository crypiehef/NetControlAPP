import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';
import { getSettings, updateSettings, uploadLogo, deleteLogo } from '../services/api';
import { toast } from 'react-toastify';
import { FALLBACK_NET_NAME } from '../utils/netDefaults';

const EMPTY_NET_DEFAULTS = {
  clubName: '',
  netName: '',
  frequency: '',
  netControllerCallsign: '',
  netControllerName: ''
};

const Settings = () => {
  const { theme, toggleTheme, updateLogo } = useTheme();
  const [qrzApiKey, setQrzApiKey] = useState('');
  const [showQrzKey, setShowQrzKey] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [netDefaults, setNetDefaults] = useState(EMPTY_NET_DEFAULTS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setQrzApiKey(settings.qrzApiKey || '');
      setNetDefaults({ ...EMPTY_NET_DEFAULTS, ...settings.netDefaults });
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({ qrzApiKey });
      setShowQrzKey(false);
      toast.success('QRZ API key saved!');
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNetDefaults = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const settings = await updateSettings({ netDefaults });
      setNetDefaults({ ...EMPTY_NET_DEFAULTS, ...settings.netDefaults });
      toast.success('Net defaults saved!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save net defaults');
    } finally {
      setLoading(false);
    }
  };

  const updateNetDefault = (key) => (e) => setNetDefaults({ ...netDefaults, [key]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      toast.error('Please select a logo file');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadLogo(logoFile);
      updateLogo(result.logo);
      toast.success('Logo uploaded successfully!');
      setLogoFile(null);
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm('Are you sure you want to delete the logo?')) return;

    setLoading(true);
    try {
      await deleteLogo();
      setLogoPreview('');
      updateLogo('');
      toast.success('Logo deleted');
    } catch (error) {
      toast.error('Failed to delete logo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Settings</h1>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Choose between light and dark mode</p>
            </div>
            <div className="setting-control">
              <button onClick={toggleTheme} className="btn btn-secondary">
                {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Net Setup</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Net Defaults</h3>
              <p>Pre-fill these values when you start or schedule a new net. They also appear on net reports.</p>
            </div>
            <div className="setting-control">
              <form onSubmit={handleSaveNetDefaults}>
                <div className="form-group">
                  <label htmlFor="defaultClubName">Club Name</label>
                  <input
                    type="text"
                    id="defaultClubName"
                    value={netDefaults.clubName}
                    onChange={updateNetDefault('clubName')}
                    className="form-control"
                    maxLength={100}
                    placeholder="e.g., York County Amateur Radio Society"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="defaultNetName">Default Net Name</label>
                  <input
                    type="text"
                    id="defaultNetName"
                    value={netDefaults.netName}
                    onChange={updateNetDefault('netName')}
                    className="form-control"
                    maxLength={100}
                    placeholder={netDefaults.clubName ? `${netDefaults.clubName} Net` : FALLBACK_NET_NAME}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="defaultFrequency">Default Frequency</label>
                  <input
                    type="text"
                    id="defaultFrequency"
                    value={netDefaults.frequency}
                    onChange={updateNetDefault('frequency')}
                    className="form-control"
                    maxLength={50}
                    placeholder="e.g., 146.520 MHz"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="defaultControllerCallsign">Net Controller Callsign</label>
                  <input
                    type="text"
                    id="defaultControllerCallsign"
                    value={netDefaults.netControllerCallsign}
                    onChange={(e) => setNetDefaults({ ...netDefaults, netControllerCallsign: e.target.value.toUpperCase() })}
                    className="form-control"
                    maxLength={10}
                    placeholder="Defaults to your callsign"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="defaultControllerName">Net Controller Name</label>
                  <input
                    type="text"
                    id="defaultControllerName"
                    value={netDefaults.netControllerName}
                    onChange={updateNetDefault('netControllerName')}
                    className="form-control"
                    maxLength={100}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving...' : 'Save Net Defaults'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Logo</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Upload Custom Logo</h3>
              <p>This logo will appear in the navbar and on PDF exports</p>
            </div>
            <div className="setting-control">
              {logoPreview && (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                  <button 
                    onClick={handleDeleteLogo} 
                    className="btn btn-small btn-danger"
                    disabled={loading}
                  >
                    Delete Logo
                  </button>
                </div>
              )}
              <form onSubmit={handleUploadLogo} className="logo-upload-form">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="file-input"
                />
                <button 
                  type="submit" 
                  disabled={loading || !logoFile}
                  className="btn btn-primary"
                >
                  {loading ? 'Uploading...' : 'Upload Logo'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>QRZ.com Integration</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>QRZ.com API Credentials</h3>
              <p>Enter your QRZ.com XML subscription credentials to enable automatic callsign lookup</p>
              <p className="help-text">
                Format: <strong>username:password</strong> (e.g., K4HEF:mypassword) or just <strong>username</strong> if you're an XML subscriber<br/>
                Get XML subscription from <a href="https://www.qrz.com/XML/current_spec.html" target="_blank" rel="noopener noreferrer">QRZ.com</a>
              </p>
            </div>
            <div className="setting-control">
              <form onSubmit={handleSaveApiKey}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showQrzKey ? 'text' : 'password'}
                    value={qrzApiKey}
                    onChange={(e) => setQrzApiKey(e.target.value)}
                    placeholder="username:password or just username"
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowQrzKey((v) => !v)}
                    aria-label={showQrzKey ? 'Hide credentials' : 'Show credentials'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      lineHeight: '1',
                      fontSize: '18px',
                      opacity: 0.6,
                    }}
                  >
                    {showQrzKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ marginTop: '10px' }}
                >
                  {loading ? 'Saving...' : 'Save Credentials'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';
import { getSettings, updateSettings, uploadLogo, deleteLogo } from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const { theme, toggleTheme, updateLogo } = useTheme();
  const [qrzApiKey, setQrzApiKey] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setQrzApiKey(settings.qrzApiKey || '');
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
      toast.success('QRZ API key saved!');
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

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
                <input
                  type="text"
                  value={qrzApiKey}
                  onChange={(e) => setQrzApiKey(e.target.value)}
                  placeholder="username:password or just username"
                  className="form-control"
                />
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


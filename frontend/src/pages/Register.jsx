import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    callsign: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Load reCAPTCHA script
  useEffect(() => {
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    
    if (!recaptchaSiteKey) {
      console.warn('RECAPTCHA_SITE_KEY not set - reCAPTCHA will be skipped');
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setRecaptchaLoaded(true);
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="recaptcha"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Get reCAPTCHA token
      let recaptchaToken = null;
      const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
      
      if (recaptchaSiteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'register' });
        } catch (recaptchaError) {
          console.error('reCAPTCHA error:', recaptchaError);
          toast.error('reCAPTCHA verification failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      const result = await register(
        formData.username,
        formData.callsign,
        formData.email,
        formData.password,
        recaptchaToken
      );

      if (result.isEnabled) {
        // First user or admin-created user - immediate access
        toast.success('Registration successful!');
        navigate('/');
      } else {
        // Pending approval
        toast.success(result.message || 'Registration successful! Your account is pending admin approval.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Net Control by K4HEF</h1>
        <h2>Register</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="form-control"
              placeholder="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="callsign">Callsign</label>
            <input
              type="text"
              id="callsign"
              value={formData.callsign}
              onChange={(e) => setFormData({ ...formData, callsign: e.target.value.toUpperCase() })}
              required
              className="form-control"
              placeholder="K4HEF"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="form-control"
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength="6"
              className="form-control"
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="form-control"
              placeholder="••••••••"
            />
          </div>

          {/* reCAPTCHA badge */}
          {recaptchaLoaded && import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
            <div className="recaptcha-info" style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)', 
              marginTop: '1rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              This site is protected by reCAPTCHA and the Google 
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}> Privacy Policy</a> and
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}> Terms of Service</a> apply.
            </div>
          )}

          <button type="submit" disabled={loading || !recaptchaLoaded} className="btn btn-primary btn-block">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


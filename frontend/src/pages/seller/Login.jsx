import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('vendedor@returniq.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.success) { setError(res.error); return; }
      login(res.data);
      navigate(res.data.hasStore ? '/seller/returns' : '/seller/onboarding', { replace: true });
    } catch {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-logo">Return<span>IQ</span></div>
          <div className="login-tagline">Smart Returns Platform</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo empresarial</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contrasena</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="err-box">{error}</div>}

          <button className="btn btn-seller" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Acceder al panel'}
          </button>
        </form>

        <div className="login-demo-box">
          Credenciales de demo<br/>
          <strong>vendedor@returniq.com</strong> &nbsp;/&nbsp; <strong>demo1234</strong>
        </div>
      </div>
    </div>
  );
}

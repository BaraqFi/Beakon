import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [forgotMsg, setForgotMsg] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email.trim()) newErrors.email = true;
        if (!password.trim()) newErrors.password = true;

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        setTimeout(() => {
            login();
            navigate('/dashboard');
        }, 1200);
    };

    return (
        <div className="auth-container">
            {/* Left Panel */}
            <div className="left-panel">
                <div className="left-content">
                    <div className="logo-mark">
                        <i className="fas fa-tower-broadcast"></i>
                    </div>
                    <div className="brand-name">Beakon</div>
                    <div className="brand-tagline">Know exactly who clicked your link.</div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                <div className="auth-card">
                    <h1 className="auth-title">Welcome back</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                className="form-input" 
                                placeholder="you@example.com" 
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: false})); }}
                                style={errors.email ? { borderColor: '#DC2626' } : {}}
                            />
                        </div>

                        <div className="form-group last">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                className="form-input" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: false})); }}
                                style={errors.password ? { borderColor: '#DC2626' } : {}}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-continue" 
                            disabled={isLoading}
                            style={isLoading ? { opacity: 0.7 } : {}}
                        >
                            {isLoading ? 'Signing in...' : 'Continue'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <div>
                            Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                        </div>
                        {forgotMsg ? (
                            <div style={{ marginTop: '12px', color: '#6B7280', fontSize: '13px' }}>
                                Password reset coming soon.
                            </div>
                        ) : (
                            <div style={{ marginTop: '12px' }}>
                                <button 
                                    onClick={() => setForgotMsg(true)} 
                                    className="auth-link"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

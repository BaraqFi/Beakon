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

    const handleSubmit = async (e) => {
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
        try {
            await login(email.trim(), password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setErrors({ form: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container login-auth-container">
            <div className="left-panel login-left-panel">
                <div className="login-map-wrapper">
                    <span className="login-map-ring login-map-ring--outer" aria-hidden="true" />
                    <span className="login-map-ring login-map-ring--inner" aria-hidden="true" />
                    <img src="/transparent.PNG" alt="" className="login-left-bg-image" aria-hidden="true" />
                </div>
                <div className="left-content login-left-content">
                    <div className="logo-mark">
                        <img src="/transparentLogo.png" alt="Beakon Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="brand-name">Beakon</div>
                    <div className="brand-tagline">Know exactly who clicked your link.</div>
                </div>
            </div>

            <div className="right-panel login-right-panel">
                <div className="auth-card login-auth-card">
                    <h1 className="auth-title">Welcome back</h1>
                    
                    <form onSubmit={handleSubmit}>
                        {errors.form && (
                            <div className="auth-error">
                                Invalid email or password.
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                className="form-input" 
                                placeholder="you@sxample.com" 
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: false})); }}
                                style={errors.email ? { borderColor: '#ef4444' } : {}}
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
                                style={errors.password ? { borderColor: '#ef4444' } : {}}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-continue" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Continue'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <div className="auth-signup-row">
                            Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                        </div>
                        {forgotMsg ? (
                            <div className="auth-muted">
                                Password reset coming soon.
                            </div>
                        ) : (
                            <div className="auth-forgot-row">
                                <button 
                                    type="button"
                                    onClick={() => setForgotMsg(true)} 
                                    className="auth-link"
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);

    const handleEmailChange = (e) => {
        const val = e.target.value.trim();
        setEmail(val);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val && !emailRegex.test(val)) {
            setEmailError(true);
            setEmailValid(false);
        } else if (val && emailRegex.test(val)) {
            setEmailError(false);
            setEmailValid(true);
        } else {
            setEmailError(false);
            setEmailValid(false);
        }
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (val && val.length < 8) {
            setPasswordError(true);
            setPasswordValid(false);
        } else if (val && val.length >= 8) {
            setPasswordError(false);
            setPasswordValid(true);
        } else {
            setPasswordError(false);
            setPasswordValid(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!emailValid || !passwordValid) return;
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            login({ name: 'Alex Morgan', email, plan: 'Free', initials: 'AM' });
            navigate('/links');
        }, 1200);
    };

    const getEmailStyles = () => {
        if (emailError) return { borderColor: '#DC2626' };
        if (emailValid) return { borderColor: '#10B981' };
        return {};
    };

    const getPasswordStyles = () => {
        if (passwordError) return { borderColor: '#F59E0B' };
        if (passwordValid) return { borderColor: '#10B981' };
        return {};
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
                    <h1 className="auth-title">Create your account</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ transition: 'transform 0.2s', ...(email ? { transform: 'translateY(-1px)'} : {} ) }}>
                            <label className="form-label" htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="form-input" 
                                placeholder="you@example.com" 
                                required 
                                value={email}
                                onChange={handleEmailChange}
                                style={getEmailStyles()}
                            />
                        </div>

                        <div className="form-group last" style={{ transition: 'transform 0.2s', ...(password ? { transform: 'translateY(-1px)'} : {} ) }}>
                            <label className="form-label" htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                className="form-input" 
                                placeholder="••••••••" 
                                required 
                                value={password}
                                onChange={handlePasswordChange}
                                style={getPasswordStyles()}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-continue" 
                            disabled={isLoading}
                            style={isLoading ? { opacity: 0.7 } : {}}
                        >
                            {isLoading ? 'Creating account...' : 'Continue'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

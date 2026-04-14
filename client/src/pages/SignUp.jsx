import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { register } = useAuth();

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const nextErrors = {};

        if (!trimmedEmail || !validateEmail(trimmedEmail)) {
            nextErrors.email = true;
        }
        if (!password.trim() || password.length < 8) {
            nextErrors.password = true;
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);
        try {
            await register({ email: trimmedEmail, password, name: trimmedEmail.split('@')[0] });
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
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
                        <i className="fas fa-tower-broadcast"></i>
                    </div>
                    <div className="brand-name">Beakon</div>
                    <div className="brand-tagline">Know exactly who clicked your link.</div>
                </div>
            </div>

            <div className="right-panel login-right-panel">
                <div className="auth-card login-auth-card">
                    <h1 className="auth-title">Create your account</h1>

                    <form onSubmit={handleSubmit}>
                        {errors.form && (
                            <div className="auth-error">
                                Failed to create account. Please try a different email.
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-email">Email</label>
                            <input
                                type="email"
                                id="signup-email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors((prev) => ({ ...prev, email: false, form: false }));
                                }}
                                style={errors.email ? { borderColor: '#ef4444' } : {}}
                            />
                        </div>

                        <div className="form-group last">
                            <label className="form-label" htmlFor="signup-password">Password</label>
                            <input
                                type="password"
                                id="signup-password"
                                className="form-input"
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors((prev) => ({ ...prev, password: false, form: false }));
                                }}
                                style={errors.password ? { borderColor: '#ef4444' } : {}}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-continue"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Continue'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <div className="auth-signup-row">
                            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

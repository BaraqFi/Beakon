import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            {/* Mobile Header (only visible on small screens) */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F8FAFC', fontWeight: 600 }}>
                    <i className="fas fa-tower-broadcast" style={{ color: '#8B5CF6' }}></i>
                    Beakon
                </div>
                <button className="mobile-header-btn" onClick={() => setIsSidebarOpen(true)}>
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            {/* Mobile Overlay */}
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

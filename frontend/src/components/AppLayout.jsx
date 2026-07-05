import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

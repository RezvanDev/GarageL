import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Truck } from 'lucide-react';

import { PortalLayout } from '../components/layout/PortalLayout';
import { PORTAL_THEMES } from '../constants/portalThemes';
import { LogistDashboard } from '../views/Logist/LogistDashboard';
import { LogistOrders } from '../views/Logist/LogistOrders';

const MENU_ITEMS = [
    { path: '/logist', label: 'Главная', icon: LayoutDashboard, exact: true },
    { path: '/logist/orders', label: 'Заказы & Склад', icon: Truck },
];

export const LogistPortal = ({ user, onLogout }) => (
    <PortalLayout user={user} onLogout={onLogout} menuItems={MENU_ITEMS} theme={PORTAL_THEMES.logist}>
        <Routes>
            <Route path="/" element={<LogistDashboard />} />
            <Route path="/orders" element={<LogistOrders />} />
            <Route path="*" element={<Navigate to="/logist" replace />} />
        </Routes>
    </PortalLayout>
);

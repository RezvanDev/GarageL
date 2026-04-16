import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare } from 'lucide-react';

import { PortalLayout } from '../components/layout/PortalLayout';
import { PORTAL_THEMES } from '../constants/portalThemes';
import { SupplierDashboard } from '../views/Supplier/SupplierDashboard';
import { ProductManagement } from '../views/Admin/ProductManagement';
import { SupplierOrders } from '../views/Supplier/SupplierOrders';

const MENU_ITEMS = [
    { path: '/supplier', label: 'Главная', icon: LayoutDashboard, exact: true },
    { path: '/supplier/products', label: 'Мои товары', icon: Package },
    { path: '/supplier/orders', label: 'Заявки клиентов', icon: MessageSquare },
];

export const SupplierPortal = ({ user, onLogout }) => (
    <PortalLayout user={user} onLogout={onLogout} menuItems={MENU_ITEMS} theme={PORTAL_THEMES.supplier}>
        <Routes>
            <Route path="/" element={<SupplierDashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<SupplierOrders />} />
            <Route path="*" element={<Navigate to="/supplier" replace />} />
        </Routes>
    </PortalLayout>
);

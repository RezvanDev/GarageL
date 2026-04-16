import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, CheckCircle2, ShoppingBag } from 'lucide-react';

import { PortalLayout } from '../components/layout/PortalLayout';
import { PORTAL_THEMES } from '../constants/portalThemes';
import { AdminDashboard } from '../views/Admin/AdminDashboard';
import { ProductManagement } from '../views/Admin/ProductManagement';
import { SupplierProductRequests } from '../views/Admin/SupplierProductRequests';
import { OrderModeration } from '../views/Admin/OrderModeration';
import { UserManagement } from '../views/Admin/UserManagement';
import { AdminPayments } from '../views/Admin/AdminPayments';

const MENU_ITEMS = [
    { path: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
    { path: '/admin/payments', label: 'Платежи', icon: ShoppingBag },
    { path: '/admin/products', label: 'Каталог товаров', icon: Package },
    { path: '/admin/requests', label: 'Заявки поставщиков', icon: ShoppingBag },
    { path: '/admin/moderation', label: 'Модерация заявок', icon: CheckCircle2 },
    { path: '/admin/users', label: 'Пользователи', icon: Users },
];

export const AdminPortal = ({ user, onLogout }) => (
    <PortalLayout user={user} onLogout={onLogout} menuItems={MENU_ITEMS} theme={PORTAL_THEMES.admin}>
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/requests" element={<SupplierProductRequests />} />
            <Route path="/moderation" element={<OrderModeration />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    </PortalLayout>
);

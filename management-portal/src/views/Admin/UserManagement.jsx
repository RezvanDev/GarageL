import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Shield, UserCog, Loader2, Search, Plus } from 'lucide-react';
import { CAR_BRANDS } from '../../constants/carBrands';

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getUsers();
            setUsers(data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Create User State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        phone: '',
        name: '',
        password: '',
        role: 'client',
        allowedBrands: []
    });

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.admin.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Ошибка при смене роли: ' + err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
        try {
            await api.admin.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert('Ошибка при удалении: ' + err.message);
        }
    };

    const handleViewOrders = async (user) => {
        setSelectedUser(user);
        setOrdersLoading(true);
        try {
            const res = await api.admin.getUserOrders(user.id);
            setUserOrders(res.data.orders);
        } catch (err) {
            console.error('Failed to fetch user orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await api.admin.createUser(newUserForm);
            setUsers([res.data.user, ...users]);
            setIsCreateModalOpen(false);
            setNewUserForm({ phone: '', name: '', password: '', role: 'client', allowedBrands: [] });
            alert('Пользователь успешно создан!');
        } catch (err) {
            alert('Ошибка при создании: ' + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const toggleBrand = (brand) => {
        setNewUserForm(prev => {
            const brands = prev.allowedBrands;
            if (brands.includes(brand)) {
                return { ...prev, allowedBrands: brands.filter(b => b !== brand) };
            } else {
                return { ...prev, allowedBrands: [...brands, brand] };
            }
        });
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm)
    );

    if (loading && users.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="spin" size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Управление пользователями</h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 45px',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                    >
                        <Plus size={18} />
                        Создать
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '20px' }}>Пользователь</th>
                            <th style={{ padding: '20px' }}>Телефон</th>
                            <th style={{ padding: '20px' }}>Роль</th>
                            <th style={{ padding: '20px' }}>Заказы</th>
                            <th style={{ padding: '20px' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'rgba(14, 165, 233, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent-blue)'
                                        }}>
                                            <User size={20} />
                                        </div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{user.name || 'Без имени'}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px', color: 'var(--text-dim)' }}>{user.phone}</td>
                                <td style={{ padding: '20px' }}>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            padding: '4px 8px',
                                            outline: 'none',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="client">Клиент</option>
                                        <option value="supplier">Поставщик</option>
                                        <option value="logist">Логист</option>
                                        <option value="admin">Админ</option>
                                    </select>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                        onClick={() => handleViewOrders(user)}
                                    >
                                        История
                                    </button>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <button
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        Пользователи не найдены
                    </div>
                )}
            </div>

            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                        <h3>История заказов: {selectedUser.name || selectedUser.phone}</h3>
                        <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                            {ordersLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="spin" /></div>
                            ) : userOrders.length > 0 ? (
                                userOrders.map(order => (
                                    <div key={order.id} style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{order.item_name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700 }}>${order.price || '—'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>{order.status}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>У пользователя еще нет заказов</p>
                            )}
                        </div>
                        <button className="btn-primary" onClick={() => setSelectedUser(null)} style={{ marginTop: '20px', width: '100%' }}>Закрыть</button>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
                        <h3 style={{ marginBottom: '20px' }}>Создание пользователя</h3>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Имя</label>
                                <input
                                    type="text"
                                    value={newUserForm.name}
                                    onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Телефон *</label>
                                <input
                                    type="text"
                                    required
                                    value={newUserForm.phone}
                                    onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Пароль *</label>
                                <input
                                    type="password"
                                    required
                                    value={newUserForm.password}
                                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Роль</label>
                                <select
                                    value={newUserForm.role}
                                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value, allowedBrands: [] })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="client">Клиент</option>
                                    <option value="supplier">Поставщик</option>
                                    <option value="logist">Логист</option>
                                    <option value="admin">Админ</option>
                                </select>
                            </div>

                            {newUserForm.role === 'supplier' && (
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(14, 165, 233, 0.05)', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Разрешенные марки авто:</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {Object.keys(CAR_BRANDS).map(brand => (
                                            <div
                                                key={brand}
                                                onClick={() => toggleBrand(brand)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    border: '1px solid',
                                                    background: newUserForm.allowedBrands.includes(brand) ? 'var(--accent-blue)' : 'transparent',
                                                    borderColor: newUserForm.allowedBrands.includes(brand) ? 'var(--accent-blue)' : 'var(--glass-border)',
                                                    color: '#fff',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {brand}
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '10px' }}>
                                        Если ничего не выбрать, поставщик <b>не сможет</b> получать заявки и добавлять товары.
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1 }}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isCreating}>
                                    {isCreating ? <Loader2 size={18} className="spin" /> : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

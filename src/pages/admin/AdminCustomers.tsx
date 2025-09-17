import React, { useState, useEffect } from 'react';
import { userService, type UserProfile } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'employees'>('customers');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [customersData, employeesData] = await Promise.all([
        userService.getCustomers(),
        userService.getEmployees()
      ]);
      
      setCustomers(customersData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(employee =>
    employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserCard = ({ user }: { user: UserProfile }) => (
    <div className="user-card">
      <div className="user-card__header">
        <div className="user-card__avatar">
          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="user-card__info">
          <h3 className="user-card__name">{user.full_name || 'Unnamed User'}</h3>
          <p className="user-card__email">{user.email}</p>
        </div>
        <div className="user-card__role">
          <span className={`role-badge role-badge--${user.role.toLowerCase().replace(' ', '-')}`}>
            {user.role}
          </span>
        </div>
      </div>
      
      <div className="user-card__details">
        {user.phone && (
          <div className="user-card__detail">
            <span className="user-card__label">Phone:</span>
            <span className="user-card__value">{user.phone}</span>
          </div>
        )}
        <div className="user-card__detail">
          <span className="user-card__label">Member since:</span>
          <span className="user-card__value">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
        {user.role !== 'Customer' && (
          <div className="user-card__detail">
            <span className="user-card__label">Permissions:</span>
            <span className="user-card__value">
              {user.is_admin && user.is_staff ? 'Admin + Staff' : 
               user.is_admin ? 'Admin Only' : 'Staff Only'}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-section">
        <div className="admin-section__loading">
          <div className="loading__spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">User Management</h2>
        <p className="admin-section__subtitle">
          Manage customers and employees
        </p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon">👥</div>
          <div className="admin-stat-card__info">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon">👨‍💼</div>
          <div className="admin-stat-card__info">
            <h3>{employees.length}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon">⭐</div>
          <div className="admin-stat-card__info">
            <h3>{employees.filter(e => e.is_admin).length}</h3>
            <p>Administrators</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="user-tabs">
        <button
          className={`user-tabs__button ${activeTab === 'customers' ? 'user-tabs__button--active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span className="user-tabs__icon">🛍️</span>
          Customers ({customers.length})
        </button>
        <button
          className={`user-tabs__button ${activeTab === 'employees' ? 'user-tabs__button--active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <span className="user-tabs__icon">👨‍💼</span>
          Employees ({employees.length})
        </button>
      </div>

      {/* Search */}
      <div className="admin-search">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search__input"
        />
        <Button
          onClick={loadUserData}
          variant="secondary"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {/* User Lists */}
      <div className="user-content">
        {activeTab === 'customers' && (
          <div className="user-section">
            <div className="user-section__header">
              <h3>Customers</h3>
              <p>Users with customer-only access</p>
            </div>
            
            {filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🛍️</div>
                <h3>No customers found</h3>
                <p>
                  {searchTerm 
                    ? `No customers match "${searchTerm}"`
                    : 'No customers have signed up yet'
                  }
                </p>
              </div>
            ) : (
              <div className="user-grid">
                {filteredCustomers.map(customer => (
                  <UserCard key={customer.id} user={customer} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="user-section">
            <div className="user-section__header">
              <h3>Employees</h3>
              <p>Users with administrative or staff access</p>
            </div>
            
            {filteredEmployees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">👨‍💼</div>
                <h3>No employees found</h3>
                <p>
                  {searchTerm 
                    ? `No employees match "${searchTerm}"`
                    : 'No employees are configured'
                  }
                </p>
              </div>
            ) : (
              <div className="user-grid">
                {filteredEmployees.map(employee => (
                  <UserCard key={employee.id} user={employee} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { useSearchParams } from 'react-router-dom';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'customers' | 'orders'>('products');

  const [searchParams] = useSearchParams();
  const preselectedTab = searchParams.get('tab');

  useEffect(() => {
    if (preselectedTab && ['products', 'customers', 'orders'].includes(preselectedTab)) {
      setActiveTab(preselectedTab as 'products' | 'customers' | 'orders');
      document.title = 'LavyaGlow Admin - ' + preselectedTab.charAt(0).toUpperCase() + preselectedTab.slice(1);
    }
  }, [preselectedTab]);
  return (
    <div className="admin-page">
      <div className="admin-page__container">
        {/* Header */}
        <div className="admin-page__header">
          <h1 className="admin-page__title">LavyaGlow Admin Dashboard</h1>
          <p className="admin-page__subtitle">Manage your luxury candle business</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="admin-tabs">
          <button 
            className={`admin-tabs__button ${activeTab === 'products' ? 'admin-tabs__button--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`admin-tabs__button ${activeTab === 'customers' ? 'admin-tabs__button--active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
          <button 
            className={`admin-tabs__button ${activeTab === 'orders' ? 'admin-tabs__button--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </nav>

        {/* Tab Content */}
        <div className="admin-page__content">
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'customers' && <AdminCustomers />}
          {activeTab === 'orders' && <AdminOrders />}
        </div>
      </div>
    </div>
  );
}

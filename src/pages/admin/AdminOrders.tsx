export function AdminOrders() {
  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Order Management</h2>
        <p className="admin-section__subtitle">Track and manage all orders</p>
      </div>
      
      <div className="admin-section__content">
        <div className="coming-soon">
          <div className="coming-soon__icon">📋</div>
          <h3>Order Management Coming Soon</h3>
          <p>This section will include order tracking, fulfillment, and order analytics.</p>
          
          <div className="coming-soon__features">
            <h4>Planned Features:</h4>
            <ul>
              <li>Order status tracking and updates</li>
              <li>Inventory management and fulfillment</li>
              <li>Payment status and refunds</li>
              <li>Shipping and delivery tracking</li>
              <li>Order analytics and reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

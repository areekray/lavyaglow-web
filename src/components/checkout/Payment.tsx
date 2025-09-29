export function Payment() {
  return (
    <div className="payment">
      <div className="section-header">
        <h2>💰 Payment</h2>
        <p>Choose your payment method</p>
      </div>

      <div className="payment-coming-soon">
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🚀</div>
          <h3>Payment Integration Coming Soon!</h3>
          <p>We're working on secure payment options including:</p>
          
          <div className="payment-methods">
            <div className="payment-method">
              <span className="method-icon">💳</span>
              <span>Credit/Debit Cards</span>
            </div>
            <div className="payment-method">
              <span className="method-icon">📱</span>
              <span>UPI Payment</span>
            </div>
            <div className="payment-method">
              <span className="method-icon">🏦</span>
              <span>Net Banking</span>
            </div>
            <div className="payment-method">
              <span className="method-icon">📲</span>
              <span>Mobile Wallets</span>
            </div>
          </div>

          <div className="coming-soon-note">
            <p>For now, you can complete your order and we'll contact you for payment details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

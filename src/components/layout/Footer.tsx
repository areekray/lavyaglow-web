export function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#1a1612',
      color: '#e8e3d8',
      padding: '3rem 0',
      marginTop: 'auto',
      borderTop: '1px solid #3d2317'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            paddingTop: 48,
          }}>
            <img 
                src="/pwa-512x512.png" 
                alt="LavyaGlow Logo" 
                style={{ 
                  position: 'absolute',
                  top: -86,
                  left: -15,
                  width: '180px', 
                  height: '180px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(193, 120, 23, 0.3))'
                }}
              />
            <p style={{ color: '#c9beb0', lineHeight: '1.6' }}>
              Premium handcrafted candles from Bangalore with Pan-India delivery.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#e8e3d8' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/products" style={{ color: '#c9beb0', textDecoration: 'none' }}>Products</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/about" style={{ color: '#c9beb0', textDecoration: 'none' }}>About</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/contact" style={{ color: '#c9beb0', textDecoration: 'none' }}>Contact</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#e8e3d8' }}>Contact Info</h4>
            <p style={{ color: '#c9beb0' }}>Bangalore, Karnataka, India</p>
            <p style={{ color: '#c9beb0' }}>Email: info@lavyaglow.in</p>
          </div>
        </div>
        <div style={{ 
          borderTop: '1px solid #3d2317',
          paddingTop: '1rem',
          textAlign: 'center',
          color: '#a39485'
        }}>
          <p>&copy; 2025 LavyaGlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

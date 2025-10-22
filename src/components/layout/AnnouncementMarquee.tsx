// components/layout/AnnouncementMarquee.tsx
export function AnnouncementMarquee() {
  const messages = [
    'Orders are carefully packed and shipped within 1-2 business days',
    "We currently do not offer Cash on Delivery — secure prepaid options only",
    "All online payments are 100% safe and powered by Razorpay",
    'We deliver across India with trusted and reliable courier partners',
  ];

  return (
    <div className="announce-marquee" aria-label="Store announcements">
      <div className="announce-marquee__viewport">
        {/* Duplicate track for seamless loop */}
        <div className="announce-marquee__track">
          {messages.map((m, i) => (
            <div key={`m1-${i}`} className="announce-marquee__item">
              <span>{m}</span>
            </div>
          ))}
          {messages.map((m, i) => (
            <div key={`m2-${i}`} className="announce-marquee__item">
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

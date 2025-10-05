import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  WalletIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export default function RazorpayWidget({ paymentMode }: {paymentMode : boolean}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#e8e3d8",
        border: "1px solid #e0e7ff",
        borderRadius: "12px",
        padding: "1rem 1.5rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        fontFamily: "Inter, sans-serif",
        gap: "1rem",
        flexWrap: "wrap",
        maxWidth: "calc(100vw - 5rem)"
      }}
    >
      {/* Left Logo Section */}
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <ShieldCheckIcon style={{ width: "40px", height: "40px", color: "#0f9d58" }} />
        <div style={{ marginLeft: "0.5rem" }}>
          <img style={{ width: "140px" }} src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/Razorpay_logo.svg" alt="Razor Pay" />
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#3395ff" }}>{paymentMode ? 'TRUSTED BUSINESS' : 'SECURED PAYMENTS'}</div>
        </div>
      </div>

      {/* Payment Methods */}
      {paymentMode && (<div
        className="payment-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
          flex: "1 1 420px",
        }}
      >
        {/* Cards */}
        <div className="payment-item" style={{ textAlign: "center" }}>
          <CreditCardIcon style={{ width: "25px", height: "25px", color: "#2563eb" }} />
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#111827" }}>Cards</div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280" }}>Visa, Mastercard, etc</div>
        </div>

        {/* UPI */}
        <div className="payment-item" style={{ textAlign: "center" }}>
          <QrCodeIcon style={{ width: "25px", height: "25px", color: "#2563eb" }} />
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#111827" }}>UPI</div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280" }}>GPay, PhonePe, etc</div>
        </div>

        {/* Netbanking */}
        <div className="payment-item" style={{ textAlign: "center" }}>
          <BanknotesIcon style={{ width: "25px", height: "25px", color: "#2563eb" }} />
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#111827" }}>Netbanking</div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280" }}>All major banks</div>
        </div>

        {/* Wallets */}
        <div className="payment-item" style={{ textAlign: "center" }}>
          <WalletIcon style={{ width: "25px", height: "25px", color: "#2563eb" }} />
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#111827" }}>Wallets</div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280" }}>MobiKwik, Airtel, etc</div>
        </div>
      </div>)}

      {/* COD note */}
      {paymentMode && <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.25rem",
          borderTop: "1px dashed #e5e7eb",
          paddingTop: "0.5rem",
        }}
      >
        <XCircleIcon style={{ width: "18px", height: "18px", minWidth: "18px", color: "#ef4444" }} />
        <span style={{ fontSize: "0.8rem", color: "#374151" }}>Cash on delivery not available</span>
      </div>}

      {paymentMode && <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.25rem",
          borderTop: "1px dashed #e5e7eb",
          paddingTop: "0.5rem",
        }}
      >
        <ArrowRightCircleIcon style={{ width: "18px", height: "18px", minWidth: "18px", color: "#050505ff" }} />
        <span style={{ fontSize: "0.8rem", color: "#374151" }}>After click Pay button, you will be redirected to Razorpay Secure to complete your purchase securely.</span>
      </div>}

      {/* {!paymentMode && <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.25rem",
          borderTop: "1px dashed #e5e7eb",
          paddingTop: "0.5rem",
        }}
      >
        <LockClosedIcon style={{ width: "18px", height: "18px", minWidth: "18px", color: "#050505ff" }} />
        <span style={{ fontSize: "0.8rem", color: "#374151" }}>Payments secured by Razorpay.</span>
      </div>} */}
      {/* Responsive tweaks */}
      <style>
        {`
          /* Default (desktop/tablet): regular grid */
          .payment-grid .payment-item { scroll-snap-align: start; }

          /* Small screens: turn into a horizontal scroller */
          @media (max-width: 640px) {
            .payment-grid {
              display: grid;
              grid-auto-flow: column;
              grid-auto-columns: minmax(160px, 1fr);
              overflow-x: auto;                 /* enable horizontal scroll */
              overscroll-behavior-x: contain;    /* prevent parent bounce */
              scroll-snap-type: x proximity;     /* snap to items */
              scroll-behavior: smooth;           /* smooth drag/buttons */
              -webkit-overflow-scrolling: touch; /* momentum on iOS */
              padding-bottom: 0.25rem;           /* room for scrollbar */
            }
            /* optional: hide scrollbar on WebKit while keeping scrollability */
            .payment-grid::-webkit-scrollbar { height: 6px; }
            .payment-grid::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 9999px; }
          }

          /* Very small phones: slightly wider cards to improve tap targets */
          @media (max-width: 380px) {
            .payment-grid { grid-auto-columns: 200px; }
          }
        `}
      </style>
    </div>
  );
}

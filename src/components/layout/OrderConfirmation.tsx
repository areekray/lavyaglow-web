import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function OrderConfirmed() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#2c1810",
        borderRadius: "12px",
        margin: "2rem auto",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <CheckCircleIcon style={{ width: "48px", height: "48px", color: "green" }} />
      <h2 style={{ fontSize: "1.5rem", marginTop: "1rem", color: "#e8e3d8" }}>
        Order Confirmed
      </h2>
      <p style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#e8e3d8" }}>
        Thank you for your purchase! Your order has been successfully placed and
        will be processed soon.
      </p>
    </div>
  );
}

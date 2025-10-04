import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Order, DatabaseOrderItem } from "@/types";
import { AnnouncementMarquee } from "@/components/layout/AnnouncementMarquee";
import { useAuthModal } from "@/contexts/AuthModalContext";

dayjs.extend(relativeTime);

interface DetailedOrder extends Order {
  order_items?: DatabaseOrderItem[];
  shipped_at?: string;
  delivered_at?: string;
  estimated_delivery_date?: string;
}

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const { openLogin } = useAuthModal();

  const handleLogin = () => {
    if (!user) {
      openLogin({
        redirectPath: "/checkout",
        message: "Login to view your orders!",
      });
      return;
    }
  };

  // Helper function to calculate dispatch messaging
  const getDispatchMessage = (
    confirmedAt: string
  ): {
    message: string;
    dates?: string;
    showWarning: boolean;
    showContact: boolean;
  } => {
    const confirmedDate = dayjs(confirmedAt);
    const today = dayjs();
    const daysElapsed = today.diff(confirmedDate, "day");

    // Expected dispatch window: 3-4 days
    const dispatchStart = confirmedDate.add(3, "day");
    const dispatchEnd = confirmedDate.add(4, "day");

    // Day 0 (same day as order): "Order will be dispatched by 5th-6th October"
    if (daysElapsed === 0) {
      return {
        message: "Order will be dispatched by",
        dates: `${dispatchStart.format("D")}-${dispatchEnd.format("D MMMM")}`,
        showWarning: false,
        showContact: false,
      };
    }

    // Days 1-2: "Order will be dispatched by 5th-6th October"
    if (daysElapsed >= 1 && daysElapsed <= 2) {
      return {
        message: "Order will be dispatched by",
        dates: `${dispatchStart.format("D")}-${dispatchEnd.format("D MMMM")}`,
        showWarning: false,
        showContact: false,
      };
    }

    // Day 3 (expected dispatch start): "Order should be dispatched by today or tomorrow"
    if (daysElapsed === 3) {
      return {
        message: "Order should be dispatched by today or tomorrow",
        showWarning: false,
        showContact: false,
      };
    }

    // Day 4 (expected dispatch end): "We are trying our best to dispatch it by today"
    if (daysElapsed === 4) {
      return {
        message: "We are trying our best to dispatch it by today",
        showWarning: true,
        showContact: false,
      };
    }

    // Day 5+: "Sorry, there has been a delay..."
    return {
      message:
        "Sorry, there has been a delay in dispatching. We are trying our best.",
      showWarning: true,
      showContact: true,
    };
  };

  const fetchOrderDetails = async () => {
    if (!orderId || !user) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            product_name,
            product_sku,
            product_image_url,
            purchase_type,
            set_size,
            quantity,
            unit_price,
            original_price,
            discounted_price,
            total_price,
            savings,
            selected_color,
            selected_scent
          )
        `
        )
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Order not found");
        navigate("/profile");
        return;
      }

      const transformedOrder: DetailedOrder = {
        id: data.id,
        user_id: data.user_id,
        order_number: data.order_number,
        user_email: data.user_email,
        user_phone: data.user_phone,
        delivery_name: data.delivery_name,
        delivery_address: data.delivery_address,
        delivery_city: data.delivery_city,
        delivery_state: data.delivery_state,
        delivery_phone: data.delivery_phone,
        total_amount: data.total_amount,
        subtotal: data.subtotal,
        total_savings: data.total_savings || 0,
        shipping_cost: data.shipping_cost || 0,
        status: data.order_status as any,
        order_status: data.order_status,
        payment_status: data.payment_status as any,
        payment_method: data.payment_method,
        tracking_number: data.tracking_number,
        courier_partner: data.courier_partner,
        tracking_url: data.tracking_url,
        special_request: data.special_request,
        gift_message: data.gift_message,
        created_at: data.created_at,
        updated_at: data.updated_at,
        confirmed_at: data.confirmed_at,
        shipped_at: data.shipped_at,
        delivered_at: data.delivered_at,
        paid_at: data.paid_at,
        estimated_delivery_date: data.estimated_delivery_date,
        shipping_address: {
          full_name: data.delivery_name,
          phone: data.delivery_phone,
          address_line1: data.delivery_address,
          address_line2: data.delivery_apartment || "",
          city: data.delivery_city,
          state: data.delivery_state,
          postal_code: data.delivery_zip,
          country: data.delivery_country || "India",
        },
        items: [],
        notes: data.special_request,
        order_items: data.order_items,
      };

      setOrder(transformedOrder);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, user]);

  if (!user) {
    return (
      <div className="orderdetail__error">
        <ExclamationTriangleIcon className="error__icon" />
        <h2>Please log in to view order details</h2>
        <Button onClick={handleLogin}>Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orderdetail__loader">
        <div className="loader__spinner"></div>
        <p>Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="orderdetail__error">
        <ExclamationTriangleIcon className="error__icon" />
        <h2>Order Not Found</h2>
        <p>This order doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate("/profile")}>Back to Orders</Button>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> =
      {
        confirmed: {
          color: "#10b981",
          icon: CheckCircleIcon,
          label: "Confirmed",
        },
        processing: { color: "#3b82f6", icon: ClockIcon, label: "Processing" },
        shipped: { color: "#8b5cf6", icon: TruckIcon, label: "Shipped" },
        delivered: {
          color: "#22c55e",
          icon: CheckCircleIcon,
          label: "Delivered",
        },
        cancelled: {
          color: "#ef4444",
          icon: ExclamationTriangleIcon,
          label: "Cancelled",
        },
        pending: { color: "#f59e0b", icon: ClockIcon, label: "Pending" },
      };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      {order.status !== "cancelled" &&
        order.status !== "delivered" &&
        order.status !== "shipped" && <AnnouncementMarquee />}

      <div className="orderdetail">
        <div className="orderdetail__wrap">
          {/* Back Button */}
          <button
            className="orderdetail__back"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeftIcon />
            <span>Back to Orders</span>
          </button>

          {/* Hero Section with Order Number & Status */}
          <div className="orderdetail__hero">
            <div className="hero__badge">
              <ShoppingBagIcon />
            </div>
            <h1 className="hero__number">{order.order_number}</h1>
            <div
              className="hero__status"
              style={{
                backgroundColor: `${statusConfig.color}15`,
                color: statusConfig.color,
              }}
            >
              <StatusIcon className="status__icon" />
              <span>{statusConfig.label}</span>
            </div>
            <div className="hero__date">
              Placed {dayjs(order.created_at).fromNow()} •{" "}
              {dayjs(order.created_at).format("MMM DD, YYYY")}
            </div>
          </div>

          {(order.order_status === "confirmed" ||
            order.order_status === "processing") &&
            order.confirmed_at &&
            (() => {
              const dispatchInfo = getDispatchMessage(order.confirmed_at);

              return (
                <div
                  className={`orderdetail__dispatch ${
                    dispatchInfo.showWarning
                      ? "orderdetail__dispatch--warning"
                      : ""
                  }`}
                >
                  <div className="dispatch__icon">
                    <TruckIcon />
                  </div>
                  <div className="dispatch__content">
                    <div className="dispatch__title">
                      {dispatchInfo.showWarning
                        ? "⚠️ Dispatch Update"
                        : "📦 Dispatch Timeline"}
                    </div>
                    <div className="dispatch__message">
                      {dispatchInfo.message}
                      {dispatchInfo.dates && (
                        <span className="dispatch__dates">
                          {" "}
                          {dispatchInfo.dates}
                        </span>
                      )}
                    </div>
                    {dispatchInfo.showContact && (
                      <a
                        href={`https://wa.me/+919036758208?text=Hi%20LavyaGlow%20Team!%20Please%provide%20for%20my%20order-%20${order.order_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--luxury btn--lg"
                        style={{marginTop: '1rem'}}
                      >
                        Contact us on WhatsApp →
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* Tracking Card (if available) */}
          {order.tracking_number && (
            <div className="orderdetail__tracking">
              <div className="tracking__header">
                <TruckIcon />
                <span>Track Your Order</span>
              </div>
              <div className="tracking__body">
                <div className="tracking__field">
                  <span className="field__label">Tracking Number</span>
                  <span className="field__value">{order.tracking_number}</span>
                </div>
                {order.courier_partner && (
                  <div className="tracking__field">
                    <span className="field__label">Courier</span>
                    <span className="field__value">
                      {order.courier_partner}
                    </span>
                  </div>
                )}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracking__link"
                  >
                    Track Package →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="orderdetail__panel">
            <div className="panel__head">
              <ShoppingBagIcon />
              <h2>Items ({order.order_items?.length || 0})</h2>
            </div>
            <div className="panel__body">
              {order.order_items?.map((item) => (
                <div key={item.id} className="item">
                  {item.product_image_url && (
                    <div className="item__image">
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}
                  <div className="item__info">
                    <h3 className="item__name">{item.product_name}</h3>
                    <div className="item__specs">
                      {item.purchase_type === "set" && item.set_size ? (
                        <span>
                          Set of {item.set_size} × {item.quantity}
                        </span>
                      ) : (
                        <span>Qty {item.quantity}</span>
                      )}
                      {item.selected_color && (
                        <span>• {item.selected_color}</span>
                      )}
                      {item.selected_scent && (
                        <span>• {item.selected_scent}</span>
                      )}
                    </div>
                  </div>
                  <div className="item__price">
                    <div className="price__current">
                      ₹{item.total_price.toLocaleString("en-IN")}
                    </div>
                    {item.savings > 0 && (
                      <div className="price__saved">
                        Saved ₹{item.savings.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="orderdetail__panel">
            <div className="panel__head">
              <MapPinIcon />
              <h2>Delivery Address</h2>
            </div>
            <div className="panel__body">
              <div className="address">
                <div className="address__name">{order.delivery_name}</div>
                <div className="address__lines">
                  <div>{order.delivery_address}</div>
                  {order.shipping_address.address_line2 && (
                    <div>{order.shipping_address.address_line2}</div>
                  )}
                  <div>
                    {order.delivery_city}, {order.delivery_state}{" "}
                    {order.shipping_address.postal_code}
                  </div>
                  <div className="address__phone">
                    📱 {order.delivery_phone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="orderdetail__panel">
            <div className="panel__head">
              <CurrencyRupeeIcon />
              <h2>Payment Summary</h2>
            </div>
            <div className="panel__body">
              <div className="summary">
                <div className="summary__line">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
                </div>
                {order.total_savings && order.total_savings > 0 && (
                  <div className="summary__line summary__line--green">
                    <span>You Saved</span>
                    <span>-₹{order.total_savings.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="summary__line">
                  <span>Shipping</span>
                  <span>
                    {order.shipping_cost && order.shipping_cost > 0
                      ? `₹${order.shipping_cost}`
                      : "Free"}
                  </span>
                </div>
                <div className="summary__line summary__line--total">
                  <span>Total Paid</span>
                  <span>₹{order.total_amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {(order.special_request || order.gift_message) && (
            <div className="orderdetail__panel">
              <div className="panel__head">
                <ClipboardDocumentListIcon />
                <h2>Special Instructions</h2>
              </div>
              <div className="panel__body">
                {order.special_request && (
                  <div className="instruction">
                    <div className="instruction__label">Special Request</div>
                    <div className="instruction__text">
                      {order.special_request}
                    </div>
                  </div>
                )}
                {order.gift_message && (
                  <div className="instruction">
                    <div className="instruction__label">Gift Message</div>
                    <div className="instruction__text">
                      {order.gift_message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {order.payment_status && (
            <div className="orderdetail__panel">
              <div className="panel__head">
                <CheckCircleIcon />
                <h2>Payment Details</h2>
              </div>
              <div className="panel__body">
                <div className="payment">
                  <div className="payment__row">
                    <span>Payment Status</span>
                    <span
                      className="payment__badge"
                      style={{
                        backgroundColor: `${
                          getStatusConfig(order.payment_status).color
                        }15`,
                        color: getStatusConfig(order.payment_status).color,
                      }}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </div>
                  {order.paid_at && (
                    <div className="payment__row">
                      <span>Paid On</span>
                      <span>
                        {dayjs(order.paid_at).format(
                          "MMM DD, YYYY [at] h:mm A"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

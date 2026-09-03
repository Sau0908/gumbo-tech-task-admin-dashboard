import { ChevronDown, Eye, MapPin, Package, X } from "lucide-react";
import { useState } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  Toast,
} from "../components/UI";
import { useRequest } from "../hooks/useRequest";
import { currency, shortDate } from "../lib/utils";
import { orderService } from "../services/orderService";
import type { Order, OrderStatus } from "../types";

const statuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Pending", "Confirmed", "Cancelled"],
  Confirmed: ["Confirmed", "Shipped", "Cancelled"],
  Shipped: ["Shipped", "Delivered", "Cancelled"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

function OrderDetail({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <Modal
      title={`Order #${order._id.slice(-6).toUpperCase()}`}
      description={`Placed ${shortDate(order.createdAt)}`}
      onClose={onClose}
    >
      <div className="order-detail">
        <div className="detail-block">
          <div className="detail-title">
            <span>
              <Package />
            </span>
            <div>
              <strong>Order items</strong>
              <small>
                {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
              </small>
            </div>
          </div>
          {order.items.map((item, i) => (
            <div className="detail-item" key={i}>
              <span className="mini-thumb">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt="" />
                ) : (
                  <Package />
                )}
              </span>
              <div>
                <strong>{item.product?.name ?? "Product unavailable"}</strong>
                <small>
                  {item.quantity} × {currency.format(item.price)}
                </small>
              </div>
              <strong>{currency.format(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="detail-total">
            <span>Total</span>
            <strong>{currency.format(order.totalAmount)}</strong>
          </div>
        </div>
        <div className="detail-block">
          <div className="detail-title">
            <span>
              <MapPin />
            </span>
            <div>
              <strong>Shipping address</strong>
              <small>Delivery destination</small>
            </div>
          </div>
          <p>
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
        <button className="btn secondary full" onClick={onClose}>
          <X /> Close details
        </button>
      </div>
    </Modal>
  );
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updateError, setUpdateError] = useState("");
  const query = useRequest(
    () => orderService.list(page, status),
    [page, status],
  );
  const updateStatus = async (id: string, value: OrderStatus) => {
    setUpdatingId(id);
    setUpdateError("");
    try {
      await orderService.updateStatus(id, value);
      setToast("Order status updated.");
      await query.reload();
    } catch (cause) {
      setUpdateError(
        cause instanceof Error ? cause.message : "Unable to update status.",
      );
      await query.reload();
    } finally {
      setUpdatingId("");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Review purchases and keep every delivery moving."
      />
      <div className="filter-tabs">
        <button
          className={!status ? "active" : ""}
          onClick={() => {
            setStatus("");
            setPage(1);
          }}
        >
          All orders
        </button>
        {statuses.map((value) => (
          <button
            key={value}
            className={status === value ? "active" : ""}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <section className="panel data-panel">
        {query.isLoading ? (
          <LoadingState label="Loading orders…" />
        ) : query.error ? (
          <ErrorState message={query.error.message} retry={query.reload} />
        ) : !query.data!.orders.length ? (
          <EmptyState
            title="No orders here"
            text="Orders matching this status will appear here."
          />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {query.data!.orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span>{order.user?.name?.charAt(0) || "?"}</span>
                          <div>
                            <strong>
                              {order.user?.name || "Unknown user"}
                            </strong>
                            <small>{order.user?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{shortDate(order.createdAt)}</td>
                      <td>
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}
                      </td>
                      <td>
                        <strong>{currency.format(order.totalAmount)}</strong>
                      </td>
                      <td>
                        <label
                          className={`status-select status-${order.status.toLowerCase()}`}
                        >
                          <select
                            value={order.status}
                            disabled={
                              updatingId === order._id ||
                              nextStatuses[order.status].length === 1
                            }
                            onChange={(e) =>
                              void updateStatus(
                                order._id,
                                e.target.value as OrderStatus,
                              )
                            }
                          >
                            {nextStatuses[order.status].map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                          <ChevronDown />
                        </label>
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => setDetail(order)}
                          aria-label="View order"
                        >
                          <Eye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...query.data!.pagination} onPage={setPage} />
          </>
        )}
      </section>
      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} />}{" "}
      {updateError && (
        <Toast
          type="error"
          message={updateError}
          onClose={() => setUpdateError("")}
        />
      )}{" "}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}

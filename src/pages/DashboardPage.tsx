import {
  ArrowRight,
  Boxes,
  ClipboardList,
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState, LoadingState, PageHeader } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useRequest } from "../hooks/useRequest";
import { currency, shortDate } from "../lib/utils";
import { dashboardService } from "../services/dashboardService";
import { orderService } from "../services/orderService";

const statusClass = (status: string) => `status status-${status.toLowerCase()}`;

export function DashboardPage() {
  const { user } = useAuth();
  const greeting = `Hii ${user?.name ?? "Admin"}`;
  const stats = useRequest(dashboardService.getStats);
  const recent = useRequest(() => orderService.list(1, "", 5));
  if (stats.isLoading)
    return (
      <>
        <PageHeader
          eyebrow="Daily Lookup"
          title={greeting}
          description="Here’s what’s happening with your store today."
        />
        <LoadingState />
      </>
    );
  if (stats.error)
    return (
      <>
        <PageHeader title="Overview" description="Your business at a glance." />
        <ErrorState message={stats.error.message} retry={stats.reload} />
      </>
    );
  const cards = [
    {
      label: "Total revenue",
      value: currency.format(stats.data!.totalRevenue),
      icon: IndianRupee,
      tone: "emerald",
      note: "Excludes cancelled orders",
    },
    {
      label: "Total orders",
      value: stats.data!.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      tone: "lime",
      note: "All-time orders",
    },
    {
      label: "Total products",
      value: stats.data!.totalProducts.toLocaleString(),
      icon: Boxes,
      tone: "teal",
      note: "Across your catalogue",
    },
    {
      label: "Total users",
      value: stats.data!.totalUsers.toLocaleString(),
      icon: Users,
      tone: "sage",
      note: "Registered accounts",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Daily Lookup"
        title={greeting}
        description="Here’s what’s happening with your store today."
        action={
          <Link className="btn primary" to="/products">
            <PackageCheck /> Manage inventory
          </Link>
        }
      />
      <section className="stat-grid">
        {cards.map(({ label, value, icon: Icon, tone, note }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon ${tone}`}>
              <Icon />
            </div>
            <div className="stat-meta">
              <span>{label}</span>
              <strong>{value}</strong>
              <small>
                <TrendingUp /> {note}
              </small>
            </div>
          </article>
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Latest activity</p>
              <h2>Recent orders</h2>
            </div>
            <Link to="/orders">
              View all <ArrowRight />
            </Link>
          </div>
          {recent.isLoading ? (
            <LoadingState label="Loading recent orders…" />
          ) : recent.error ? (
            <ErrorState message={recent.error.message} retry={recent.reload} />
          ) : recent.data!.orders.length === 0 ? (
            <div className="empty-mini">
              <ClipboardList />
              <strong>No orders yet</strong>
              <span>New orders will appear here.</span>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.data!.orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span>{order.user?.name?.charAt(0) || "?"}</span>
                          <div>
                            <strong>{order.user?.name || "Unknown"}</strong>
                            <small>{order.user?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{shortDate(order.createdAt)}</td>
                      <td>
                        <span className={statusClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <strong>{currency.format(order.totalAmount)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
        <aside className="panel quick-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Shortcuts</p>
              <h2>Quick actions</h2>
            </div>
          </div>
          <Link to="/products">
            <span className="quick-icon">
              <Boxes />
            </span>
            <div>
              <strong>Add a new product</strong>
              <small>Grow your catalogue</small>
            </div>
            <ArrowRight />
          </Link>
          <Link to="/orders">
            <span className="quick-icon">
              <ShoppingBag />
            </span>
            <div>
              <strong>Process orders</strong>
              <small>Review pending fulfilment</small>
            </div>
            <ArrowRight />
          </Link>
          <Link to="/categories">
            <span className="quick-icon">
              <ClipboardList />
            </span>
            <div>
              <strong>Organize categories</strong>
              <small>Keep products discoverable</small>
            </div>
            <ArrowRight />
          </Link>
        </aside>
      </section>
    </>
  );
}

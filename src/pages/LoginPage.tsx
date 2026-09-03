import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-brand">
          <span>
            <Leaf />
          </span>
          <strong>Verdant</strong>
        </div>
        <div className="showcase-copy">
          <span className="secure-pill">
            <ShieldCheck /> Secure administration
          </span>
          <h1>
            Your store,
            <br />
            <em>beautifully managed.</em>
          </h1>
          <p>
            A calm, focused workspace to track sales, manage inventory, and keep
            your customers happy.
          </p>
        </div>
        <div className="showcase-stats">
          <div>
            <strong>24/7</strong>
            <span>Store visibility</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Secure access</span>
          </div>
        </div>
        <div className="leaf-orb orb-one" />
        <div className="leaf-orb orb-two" />
      </section>
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={submit} noValidate>
          <div className="mobile-brand">
            <span>
              <Leaf />
            </span>
            <strong>Verdant</strong>
          </div>
          <p className="eyebrow">Admin portal</p>
          <h2>Welcome back</h2>
          <p className="form-intro">Sign in to continue to your workspace.</p>
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
          <label className="form-field">
            <span>Email address</span>
            <div>
              <Mail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>
          </label>
          <label className="form-field">
            <span>Password</span>
            <div>
              <LockKeyhole />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          <button className="login-submit" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" />
            ) : (
              <>
                Sign in to dashboard <ArrowRight />
              </>
            )}
          </button>
          <p className="auth-switch">
            Setting up the store?{" "}
            <Link to="/register">Create the first admin account</Link>
          </p>
          <p className="login-note">
            <ShieldCheck /> Protected with JWT authentication
          </p>
        </form>
      </section>
    </main>
  );
}

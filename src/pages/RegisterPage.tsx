import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await register(name.trim(), email, password);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to create the account.",
      );
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
            <ShieldCheck /> Secure store setup
          </span>
          <h1>
            Start managing
            <br />
            <em>with confidence.</em>
          </h1>
          <p>
            Create the first administrator account for your store. Public
            registration closes automatically after setup.
          </p>
        </div>
        <div className="showcase-stats">
          <div>
            <strong>One-time</strong>
            <span>Secure admin setup</span>
          </div>
          <div>
            <strong>Protected</strong>
            <span>JWT authentication</span>
          </div>
        </div>
        <div className="leaf-orb orb-one" />
        <div className="leaf-orb orb-two" />
      </section>
      <section className="login-form-wrap">
        <form className="login-form register-form" onSubmit={submit} noValidate>
          <div className="mobile-brand">
            <span>
              <Leaf />
            </span>
            <strong>Verdant</strong>
          </div>
          <p className="eyebrow">Store setup</p>
          <h2>Create admin account</h2>
          <p className="form-intro">
            Available only while your store has no administrator.
          </p>
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
          <label className="form-field">
            <span>Full name</span>
            <div>
              <UserRound />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                autoFocus
              />
            </div>
          </label>
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
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          <label className="form-field">
            <span>Confirm password</span>
            <div>
              <LockKeyhole />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter the password again"
                autoComplete="new-password"
              />
            </div>
          </label>
          <button className="login-submit" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" />
            ) : (
              <>
                Create account <ArrowRight />
              </>
            )}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in instead</Link>
          </p>
          <p className="login-note">
            <ShieldCheck /> Only the first administrator can register publicly
          </p>
        </form>
      </section>
    </main>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getUsers, setUsers, uid } from "../utils/helpers";
import styles from "./Auth.module.css";

/* ── shared layout ── */
function AuthShell({ children }) {
  return (
    <div className={styles.page}>
      <div className={styles.gridBg} />
      <div className={styles.card}>{children}</div>
    </div>
  );
}

function Brand() {
  return (
    <div className={styles.brand}>
      <div className={styles.brandIcon}>S</div>
      <span className={styles.brandName}>Smart<em>Cart</em></span>
    </div>
  );
}

/* ══════════════════ LOGIN ══════════════════ */
export function Login() {
  const { login } = useAuth();
  const { navigate, toast } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = async () => {
  setErr("");

  if (!form.email || !form.password) {
    setErr("Please fill all fields.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErr(data.message);
      return;
    }

    login(data.user);

    toast(`Welcome back, ${data.user.name}! 👋`, "success");

    navigate(data.user.role === "admin" ? "admin" : "home");
  } catch (error) {
    console.error(error);
    setErr("Server error");
  } finally {
    setLoading(false);
  }
};
  return (
    <AuthShell>
      <Brand />
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.sub}>Sign in to continue shopping</p>

      {err && <div className="error-msg">{err}</div>}

      <div className="field">
        <label>Email</label>
        <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>

      <div className="field">
        <label>Password</label>
        <div className={styles.pwdWrap}>
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handle()}
          />
          <button className={styles.showBtn} onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button className={`btn btn-primary ${styles.submitBtn}`} onClick={handle} disabled={loading}>
        {loading ? <span className="spinner" /> : "Sign In →"}
      </button>

      <p className={styles.switchLink}>
        Don't have an account?{" "}
        <span onClick={() => navigate("signup")}>Sign up</span>
      </p>

      <div className={styles.hint}>
        <strong>Demo Admin:</strong> admin@smartcart.com / admin123
      </div>
    </AuthShell>
  );
}

/* ══════════════════ SIGNUP ══════════════════ */
export function Signup() {
  const { navigate, toast } = useApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
  console.log("signup clicked");
  console.log(form);

  if (!form.name || !form.email || !form.password) {
    setErr("Please fill all fields.");
    return;
  }

  if (form.password !== form.confirm) {
    setErr("Passwords do not match.");
    return;
  }

  if (form.password.length < 6) {
    setErr("Password must be at least 6 characters.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch("http://localhost:8000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErr(data.message);
      return;
    }

    alert("Signup successful 🎉");
    setForm({
      name: "",
      email: "",
      password: "",
      confirm: "",
    });
   
      navigate ("login");

   
    

    setPage("login");
  } catch (error) {
    console.error(error);
    setErr("Server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthShell>
      <Brand />
      <h2 className={styles.title}>Create account</h2>
      <p className={styles.sub}>Join thousands of happy shoppers</p>

      {err && <div className="error-msg">{err}</div>}

      <div className="field">
        <label>Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Password</label>
        <div className={styles.pwdWrap}>
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <button
            type="button"
            className={styles.showBtn}
            onClick={() => setShowPwd(!showPwd)}
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="field">
        <label>Confirm Password</label>
        <div className={styles.pwdWrap}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat password"
            value={form.confirm}
            onChange={(e) =>
              setForm({ ...form, confirm: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          />
          <button
            type="button"
            className={styles.showBtn}
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        className={`btn btn-primary ${styles.submitBtn}`}
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? <span className="spinner" /> : "Create Account →"}
      </button>

      <p className={styles.switchLink}>
        Already have an account?{" "}
        <span onClick={() => navigate("login")}>Sign in</span>
      </p>
    </AuthShell>
  );
}
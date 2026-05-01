import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginApi(form);
      login(data);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold">Sign in</h2>
        <input className="w-full rounded border p-2" placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full rounded bg-slate-900 p-2 text-white" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-sm text-slate-600">
          New user? <Link to="/signup" className="underline">Create account</Link>
        </p>
      </form>
    </div>
  );
}


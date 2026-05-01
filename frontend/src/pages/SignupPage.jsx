import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupApi } from "../api/auth";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "member",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupApi(form);
      toast.success("Account created, please sign in");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold">Create account</h2>
        <input className="w-full rounded border p-2" placeholder="Full name" required onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full rounded border p-2" onChange={(e) => setForm({ ...form, role: e.target.value })} value={form.role}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full rounded bg-slate-900 p-2 text-white" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="text-sm text-slate-600">
          Already have an account? <Link to="/login" className="underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}


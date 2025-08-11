"use client";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setMsg(data?.message || "Check your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      {" "}
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>{" "}
      <form onSubmit={onSubmit} className="space-y-3">
        {" "}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />{" "}
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />{" "}
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Password (min 8 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
        />{" "}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded px-4 py-2"
        >
          {" "}
          {loading ? "Sending..." : "Sign up"}{" "}
        </button>{" "}
      </form>{" "}
      {msg && <p className="mt-4 text-green-600">{msg}</p>}{" "}
      {error && <p className="mt-4 text-red-600">{error}</p>}{" "}
    </main>
  );
}

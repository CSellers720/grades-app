"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params?.get('from') || '/';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo' }),
    });

    setLoading(false);

    if (res.ok) {
      // after login, navigate back to the original page
      router.push(from);
    } else {
      const data = await res.json().catch(() => ({ message: 'Login failed' }));
      setError(data.message || 'Login failed');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <p>This demo login accepts username: <b>demo</b> and password: <b>demo</b></p>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in as demo'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
}

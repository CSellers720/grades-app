import { NextResponse } from 'next/server';

// Demo-only login route. Do NOT use this in production.
// Accepts { username, password } and returns a Set-Cookie header with a simple
// unsigned JWT-like token (for demo purposes only).

function makeDemoToken() {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: 'demo-user',
    name: 'Demo User',
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };
  const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64(header)}.${b64(payload)}.`; // trailing dot for third segment
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body as any;

    if (username !== 'demo' || password !== 'demo') {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = makeDemoToken();

    const res = NextResponse.json({ ok: true });
    // Set a secure cookie; SameSite=lax so navigation from external origins still works.
    res.cookies.set({ name: 'token', value: token, httpOnly: true, path: '/', maxAge: 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

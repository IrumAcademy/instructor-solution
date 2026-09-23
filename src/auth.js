const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12h
const PBKDF2_ITERATIONS = 600000; // OWASP PBKDF2-HMAC-SHA256 recommendation; account is on Workers paid plan (30s CPU), not free tier's 10ms

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function textToBase64Url(text) {
  return bytesToBase64Url(new TextEncoder().encode(text));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256);
  return new Uint8Array(bits);
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  // Iteration count travels with the hash so raising PBKDF2_ITERATIONS later
  // doesn't break verification for already-stored hashes.
  return `${PBKDF2_ITERATIONS}:${bytesToBase64Url(salt)}:${bytesToBase64Url(hash)}`;
}

async function verifyPassword(password, storedHash) {
  try {
    const [iterationsStr, saltB64, hashB64] = storedHash.split(':');
    const iterations = Number.parseInt(iterationsStr, 10);
    if (!Number.isInteger(iterations) || iterations <= 0) return false;
    const salt = base64UrlToBytes(saltB64);
    const expected = base64UrlToBytes(hashB64);
    const candidate = await pbkdf2(password, salt, iterations);
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function getSecret(env) {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

async function hmacSign(env, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret(env)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function signToken(env, payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000) };
  body.exp = body.iat + TOKEN_TTL_SECONDS;
  const unsigned = `${textToBase64Url(JSON.stringify(header))}.${textToBase64Url(JSON.stringify(body))}`;
  const signature = await hmacSign(env, unsigned);
  return `${unsigned}.${signature}`;
}

async function verifyToken(env, token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const expected = await hmacSign(env, `${headerB64}.${payloadB64}`);
    if (!timingSafeEqual(base64UrlToBytes(signature), base64UrlToBytes(expected))) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function requireAuth(c, next) {
  const header = c.req.header('Authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }
  const payload = await verifyToken(c.env, token);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('instructorId', payload.sub);
  await next();
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAuth };

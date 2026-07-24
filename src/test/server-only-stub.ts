// Vitest runs in plain Node, not Next.js's bundler, so the real
// `server-only` package (which unconditionally throws to enforce
// server/client boundaries under webpack/turbopack's "react-server"
// resolve condition) would break every test that imports server code.
// This stub is aliased in vitest.config.ts to a no-op for tests only.
export {};

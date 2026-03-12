// ecosystem.config.js  (root project)
// PM2 config dioptimalkan untuk 114 concurrent users di Proxmox

module.exports = {
  apps: [
    {
      name: "absensi-app",
      script: "node_modules/.bin/next",
      args: "start",

      // ── Instance & clustering ───────────────────────────────────────────
      // Gunakan 2 instance (bukan cluster mode) agar Prisma singleton tetap stabil
      // cluster mode di Next.js bisa menyebabkan race condition pada in-memory cache
      instances: 2,
      exec_mode: "fork", // bukan "cluster" — lebih stabil dengan Next.js App Router

      // ── Memory ─────────────────────────────────────────────────────────
      max_memory_restart: "512M", // restart jika memory > 512MB per instance

      // ── Environment ────────────────────────────────────────────────────
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // ── Restart policy ─────────────────────────────────────────────────
      autorestart: true,
      restart_delay: 3000, // tunggu 3 detik sebelum restart
      max_restarts: 10,
      min_uptime: "10s",

      // ── Logging ────────────────────────────────────────────────────────
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,

      // ── Watch ──────────────────────────────────────────────────────────
      watch: false, // JANGAN watch di production (boros CPU)
    },
  ],
};

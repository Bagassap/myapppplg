
module.exports = {
  apps: [
    {
      name: "absensi-app",
      script: "node_modules/.bin/next",
      args: "start",

      instances: 2,
      exec_mode: "fork",

      max_memory_restart: "512M",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",

      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,

      watch: false,
    },
  ],
};

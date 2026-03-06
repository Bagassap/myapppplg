module.exports = {
  apps: [
    {
      name: "absensi-app",
      script: "node_modules/.bin/next",
      args: "start",

      instances: 2,
      exec_mode: "cluster",

      max_memory_restart: "512M",

      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,

      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};

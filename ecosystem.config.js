module.exports = {
  apps: [
    {
      name: 'voyage',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/voyage',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/voyage/error.log',
      out_file: '/var/log/voyage/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};


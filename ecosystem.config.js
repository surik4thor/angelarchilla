module.exports = {
  apps: [
    {
      name: 'nebulosamagica-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 5050
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '400M',
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      merge_logs: true
    }
  ]
};

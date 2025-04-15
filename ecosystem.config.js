module.exports = {
  apps: [{
    name: 'vmox-koa-ts-base',
    script: './dist/.bin/www.js',
    instances: 1,
    autorestart: true,
    watch: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
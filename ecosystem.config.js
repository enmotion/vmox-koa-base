const dotenv = require('dotenv');
console.log(process.env.NODE_ENV)
dotenv.config();
module.exports = {
  apps: [{
    name: 'koa',
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
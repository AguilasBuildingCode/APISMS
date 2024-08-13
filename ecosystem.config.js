module.exports = {
  apps: [{
    name: "APISMS",
    script: 'npm run start',
    watch: 'src',
    ignore_watch: ["node_modules", "dist/logs/access.log"]
  },],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'sms.apisap.com',
      ref: 'origin/master',
      repo: 'https://github.com/AguilasBuildingCode/APISMS.git',
      path: '~/projects/APISMS/',
      'pre-deploy-local': 'npm i',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm run setup'
    },
    development: {
      user: 'pm2',
      host: '192.168.68.53',
      ref: 'origin/master',
      repo: 'https://github.com/AguilasBuildingCode/APISMS.git',
      path: '',
      'pre-deploy-local': 'npm i',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env local',
      'pre-setup': 'npm run setup'
    }
  }
};

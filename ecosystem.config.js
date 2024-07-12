module.exports = {
  apps: [{
    name: "APISMS",
    script: 'npm run start',
    ignore_watch: ["node_modules", "dist/logs/access.log"]
  },],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'sms.apisap.com',
      ref: 'origin/master',
      repo: 'https://github.com/AguilasBuildingCode/APISMS.git',
      path: '~/projects/APISMS/',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env local',
      'pre-setup': 'npm run setup'
    },
    development: {
      user: '',
      host: '',
      ref: 'origin/master',
      repo: 'https://github.com/AguilasBuildingCode/APISMS.git',
      path: '',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env local',
      'pre-setup': 'npm run setup'
    }
  }
};

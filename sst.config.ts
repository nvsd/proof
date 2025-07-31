/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'proof',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    new sst.x.DevCommand('DatabaseStart', {
      dev: {
        autostart: true,
        command: 'docker compose up -d',
        title: 'PostgreSQL Database',
      },
    });

    const googleClientId = new sst.Secret('GoogleClientId');
    const googleClientSecret = new sst.Secret('GoogleClientSecret');

    const vpc = new sst.aws.Vpc('Vpc', { nat: 'ec2' });

    const database = new sst.aws.Aurora('AppDatabase', {
      engine: 'postgres',
      dev: {
        username: 'postgres',
        password: 'password',
        database: 'proof',
        host: 'localhost',
        port: 5432,
      },
      vpc,
    });

    new sst.aws.TanStackStart('WebApp', {
      link: [database, googleClientId, googleClientSecret],
      environment: { IS_DEV: String($dev) },
      dev: {
        command: 'bun run dev:client',
      },
    });
  },
});

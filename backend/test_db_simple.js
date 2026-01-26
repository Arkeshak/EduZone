const Sequelize = require('sequelize');

const configs = [
    { pass: '', host: 'localhost', user: 'root', port: 3308 },
    { pass: '', host: '127.0.0.1', user: 'root', port: 3308 },
    { pass: 'password123', host: 'localhost', user: 'root', port: 3308 },
    { pass: 'password123', host: '127.0.0.1', user: 'eduzone_admin', port: 3308 },
];

async function testConnection(config) {
    const user = config.user || 'root';
    const port = config.port || 3306;
    console.log(`Testing connection: User=${user}, Host=${config.host}, Port=${port}, Pass=${config.pass ? '****' : '(empty)'}`);
    const sequelize = new Sequelize('eduzone', user, config.pass, {
        host: config.host,
        dialect: 'mysql',
        logging: false,
        port: port
    });

    try {
        await sequelize.authenticate();
        console.log(`✅ SUCCESS! Connected with: Host=${config.host}, Pass=${config.pass ? '****' : '(empty)'}`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        return false;
    } finally {
        await sequelize.close();
    }
}

async function run() {
    for (const config of configs) {
        if (await testConnection(config)) break;
    }
}

run();

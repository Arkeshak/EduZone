const { Resource } = require('./models');

async function testQuery() {
    try {
        console.log('Testing Resource.findAll...');
        const resources = await Resource.findAll({
            where: { status: 'Approved' }
        });
        console.log('Query successful:', resources.length, 'resources found.');
    } catch (error) {
        console.error('Query failed:', error);
    }
}

testQuery();

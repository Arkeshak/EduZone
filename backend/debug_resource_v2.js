const { Resource } = require('./models');
const fs = require('fs');

async function testQuery() {
    try {
        console.log('Testing Resource.findAll...');
        const resources = await Resource.findAll({
            where: { status: 'Approved' }
        });
        fs.writeFileSync('debug_success.log', `Query successful: ${resources.length} resources found.`);
    } catch (error) {
        console.error('Query failed:', error);
        fs.writeFileSync('debug_error.log', JSON.stringify(error, null, 2));
        if (error.original) {
            fs.appendFileSync('debug_error.log', '\n\nORIGINAL ERROR:\n' + error.original);
        }
    }
}

testQuery();

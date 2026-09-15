const { handleUserQuery } = require('./NailAide');

async function test() {
    const query = "Tell me about your products";
    const response = await handleUserQuery(query);
    console.log("Response:", response);
}

test();

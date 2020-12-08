let Redis = require("./src/fooler-redis");

async function test() {
    let redis = await Redis.connect({
        "port": 6379,
        "host": "127.0.0.1",
        "options": {}
    });

    let keys = await redis.keys('*');
    console.log(keys);
}


test();
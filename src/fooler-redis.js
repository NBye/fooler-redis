const Redis = require("redis");
const bindProxy = function (redis) {
    return new Proxy(redis, {
        get: function (target, key, receiver) {
            if (typeof target[key] === 'function') {
                return async function (...args) {
                    return new Promise((resolve, reject) => {
                        try {
                            args.push((err, result) => err ? reject(err) : resolve(result));
                            target[key](...args);
                        } catch (err) {
                            reject(err);
                        }
                    });
                };
            } else {
                return Reflect.get(target, key);
            }
        }
    });
}
const clients = {};
exports.connect = async function ({ port, host, options }) {
    let uri = `${host}:${port}/${options.db || 0}`;
    return new Promise((resolve, reject) => {
        if (clients[uri]) {
            return resolve(clients[uri]);
        }
        try {
            let client = Redis.createClient(port, host, options);
            client.on('connect', function () {
                clients[uri] = bindProxy(client);
                reject = null;
                resolve(clients[uri]);
            });
            client.on('error', (err) => {
                clients[uri] && (clients[uri] = null);
                reject && reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};
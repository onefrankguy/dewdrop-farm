const Utils = {};

Utils.clone = (value) => (value !== undefined) ? JSON.parse(JSON.stringify(value)) : undefined;

module.exports = Utils;

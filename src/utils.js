const Utils = {};

Utils.clone = (value) => (value !== undefined) ? JSON.parse(JSON.stringify(value)) : undefined;

Utils.timestamp = () =>
  (window.performance && window.performance.now) ? window.performance.now() : new Date().getTime();

module.exports = Utils;

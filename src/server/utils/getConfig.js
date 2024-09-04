const pluginId = require('./pluginId');

/**
 * @typedef {("serverPublicHostname"| "region" | "accessKeyId" | "secretAccessKey" | "bucket")} ConfigParam
 */

/**
 * Get a config parameter.
 * @param {ConfigParam} param
 */
const getConfig = (param) => {
  return strapi.config.get(`plugin.${pluginId}.${param}`);
};

module.exports = {
  getConfig,
};

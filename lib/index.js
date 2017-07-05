var debug = require('debug')('config');
var objectAssign = require('object-assign');

var env = (process.env.NODE_ENV || 'development').toLowerCase();

function normaliseValue(value) {
  if (value === '0' || value === false) {
    return false;
  }

  return value;
}

function getValue(name, defaultValue) {
  var envSpecificName = name + '_' + env.toUpperCase();

  if (process.env[envSpecificName] != null) {
    debug(name + ' set from env var ' + envSpecificName);
    return normaliseValue(process.env[envSpecificName]);
  }

  if (process.env[name] != null) {
    debug(name + ' set from env var ' + name);
    return normaliseValue(process.env[name]);
  }

  if (defaultValue !== undefined) {
    debug(name + ' set from default value');
    return defaultValue;
  }

  throw new Error('No value for config var ' + name + '. Please set ' +
    name + ' or ' + envSpecificName + ' as an environment variable.');
}

function createConfig(initial) {
  var config = objectAssign(
    {},
    {
      TEST: env === 'test',
      PRODUCTION: env === 'production',
      NODE_ENV: env,
      ENV: env,
    },
    initial || {}
  );

  function def(name, defaultValue) {
    config[name] = getValue(name, defaultValue);
  }

  return {
    config: config,
    def: def,
  };
}

module.exports = createConfig;

module.exports = objectAssign(
  createConfig,
  createConfig(),
  {
    createConfig: createConfig,
    normaliseValue: normaliseValue,
    getValue: getValue,
    env: env,
  }
);

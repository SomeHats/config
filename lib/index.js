var fs = require('fs');
var debug = require('debug')('config');
var objectAssign = require('object-assign');
var dotenv = require('dotenv');

var env = (process.env.NODE_ENV || 'development').toLowerCase();

function normaliseValue(value) {
  if (value === '0' || value === false) {
    return false;
  }

  return value;
}

function getValue(name, defaultValue, configSources) {
  if (!configSources) {
    configSources = [{ config: process.env, name: 'process.env' }];
  }

  var envSpecificName = name + '_' + env.toUpperCase();

  for (var i = 0; i < configSources.length; i++) {
    var configSource = configSources[i];
    if (configSource.config[envSpecificName] != null) {
      debug(name + ' set from ' + envSpecificNam + ' in ' + configSource.name);
      return normaliseValue(configSource.config[envSpecificName]);
    }
  }

  for (var i = 0; i < configSources.length; i++) {
    var configSource = configSources[i];
    if (configSource.config[name] != null) {
      debug(name + ' set from ' + name + ' in ' + configSource.name);
      return normaliseValue(configSource.config[name]);
    }
  }

  if (defaultValue !== undefined) {
    debug(name + ' set from default value');
    return defaultValue;
  }

  throw new Error(
    'No value for config var ' +
      name +
      '. Please set ' +
      name +
      ' or ' +
      envSpecificName +
      ' as an environment variable.'
  );
}

function createConfig(initial) {
  var config = objectAssign(
    {},
    {
      TEST: env === 'test',
      PRODUCTION: env === 'production',
      NODE_ENV: env,
      ENV: env
    },
    initial || {}
  );

  var configSources = [{ config: process.env, name: 'process.env' }];

  function def(name, defaultValue) {
    config[name] = getValue(name, defaultValue, configSources);
  }

  function loadFromFile(filePath) {
    var fileContents = fs.readFileSync(filePath, 'utf-8');
    var parsed = dotenv.parse(fileContents);
    debug('Loaded ' + Object.keys(parsed).length + ' keys from ' + filePath);
    configSources.push({ config: parsed, name: 'file ' + filePath });
  }

  return {
    config: config,
    loadFromFile: loadFromFile,
    def: def
  };
}

module.exports = createConfig;

module.exports = objectAssign(createConfig, createConfig(), {
  createConfig: createConfig,
  normaliseValue: normaliseValue,
  getValue: getValue,
  env: env
});

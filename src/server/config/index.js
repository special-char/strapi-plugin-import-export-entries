'use strict';

module.exports = {
  default: {
    /**
     * Public hostname of the server.
     */
    serverPublicHostname: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
  },
  validator: ({ serverPublicHostname, region, accessKeyId, secretAccessKey, bucket } = {}) => {
    if (typeof serverPublicHostname !== 'string') {
      throw new Error('serverPublicHostname has to be a string.');
    }
    if (typeof region !== 'string') {
      throw new Error('region has to be a string.');
    }
    if (typeof accessKeyId !== 'string') {
      throw new Error('accessKeyId has to be a string.');
    }
    if (typeof secretAccessKey !== 'string') {
      throw new Error('secretAccessKey has to be a string.');
    }
    if (typeof bucket !== 'string') {
      throw new Error('bucket has to be a string.');
    }
  },
};

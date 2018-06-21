/*eslint-env node*/
'use strict';

const subject = require('../../index');
const assert  = require('../helpers/assert');

describe('Clasp plugin', function() {
  it('has a name', function() {
    let instance = subject.createDeployPlugin({
      name: 'clasp'
    });

    assert.equal(instance.name, 'clasp');
  });

  it('implements the correct hooks', function() {
    let plugin = subject.createDeployPlugin({
      name: 'clasp'
    });

    assert.isDefined(plugin.configure);
    assert.isFunction(plugin.configure);
  });
});

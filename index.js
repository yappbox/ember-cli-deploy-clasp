/*eslint-env node*/
/* global Promise */
'use strict';

const glob = require('glob');
const util = require('util');
const path = require('path');
const execFile = util.promisify(require('child_process').execFile);
const fs = require('fs');

//const RSVP = require('rsvp');
const DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-clasp',

  createDeployPlugin: function(options) {
    let DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      /*
       * Define any config validation here
       *
       * http://ember-cli-deploy.com/docs/v1.0.x/creating-a-plugin/#validating-plugin-config
       */

      defaultConfig: {
        distDir: function(context) {
          return context.distDir;
        }
      },
      requiredConfig: ['distDir'],

      /*
       * Implement any pipeline hooks here
       *
       * http://ember-cli-deploy.com/docs/v1.0.x/pipeline-hooks/
       */

      upload(/*context*/) {
        var distDir = this.readConfig('distDir');
        var claspConfigFiles = glob.sync(`${distDir}/**/.clasp.json`);
        var promises = [];
        claspConfigFiles.forEach((configFile) => {
          var claspProjectDir = path.dirname(configFile);
          process.chdir(claspProjectDir);
          this.log(`Running \`clasp push\` and \`clasp version\` in ${claspProjectDir}`);
          var claspPromise = execFile('clasp', ['push', '-f']).then(({ stdout , stderr }) => {
            this.log(stdout);
            this.log(stderr);
            if (stderr && stderr.includes('Push failed')) {
              throw new Error(stderr);
            }
          }).then(() => execFile('clasp', ['version', '"Pushed by ember-cli-deploy-clasp"']).then(({ stdout , stderr }) => {
            this.log(stdout);
            this.log(stderr);
          })).then(() => {
            if (fs.existsSync('.upload-message')) {
              var uploadMessage = fs.readFileSync('.upload-message', 'utf8');
              this.log(`\x1b[33m${uploadMessage}\x1b[0m`);
            }
          });
          promises.push(claspPromise);
        });
        return Promise.all(promises);
      }
    });

    return new DeployPlugin();
  }
};

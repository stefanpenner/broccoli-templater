'use strict';

const chai = require('chai');
const expect = chai.expect;
const broccoli = require('broccoli');
const Template = require('..');
const walkSync = require('walk-sync');
const fs = require('fs');

chai.use(require('chai-fs'));

describe('BroccoliTemplater', function() {
  describe('builds', function() {
    let builder;

    function template(tree, templatePath, callbackForValues) {
      builder = new broccoli.Builder(new Template(tree, templatePath , callbackForValues));
      return builder;
    }

    function filesWithin(result) {
      return walkSync(result.directory).filter(file => {
        return file.charAt(file.length - 1) !== '/'
      }).map(p => {
        return p.replace(__dirname, '')
      });
    }

    after(function() {
      builder.cleanup();
    });

    it('basic templating', function() {
      let tree = template(__dirname + '/fixtures/one', __dirname + '/fixtures/templates/module-template.js.t', (content, relativePath) => {
        return {
          moduleBody: content
        };
      })

      return tree.build().then(() => {
        let path = tree.outputPath + '/foo.js';

        expect(path).to.be.a.file;
        expect(path).to.have.content.that.match(/'fetch\/ajax'/);
      });
    });


  });
});

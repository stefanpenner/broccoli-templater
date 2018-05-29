'use strict';

const chai = require('chai');
const expect = chai.expect;
const broccoli = require('broccoli');
const Template = require('..');
const walkSync = require('walk-sync');
const fs = require('fs');
const { createBuilder, createTempDir } = require('broccoli-test-helper');
const co = require('co');

chai.use(require('chai-fs'));


const TEMPLATE = `
(function (global) {
  define('fetch', [ 'ember', 'exports' ], function(Ember, self) {
    'use strict';
    var Promise = Ember['default'].RSVP.Promise;
    if (global.FormData) {
      self.FormData = global.FormData;
    }
    if (global.FileReader) {
      self.FileReader = global.FileReader;
    }
    if (global.Blob) {
      self.Blob = global.Blob;
    }

    <%= moduleBody %>

    self['default'] = self.fetch;
  });

  define('fetch/ajax', [ 'fetch', 'exports' ], function(fetch, exports) {
    'use strict';

    exports['default'] = function() {
      return fetch['default'].apply(fetch, arguments).then(function(request) {
        return request.json();
      });
    };
  });
}(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this));`

describe('BroccoliTemplater', function() {
  describe('builds', function() {
    let input;
    let template;
    let output;

    beforeEach(co.wrap(function* () {
      input = yield createTempDir();
      template = yield createTempDir();

      let tree = new Template(input.path(), template.path() + '/module-template.js.t', (content, relativePath) => {
        return {
          moduleBody: content
        };
      });

      output = createBuilder(tree);

      template.write({
        'module-template.js.t': TEMPLATE
      });
    }));

    after(co.wrap(function* () {
      yield input.dispose();
      yield template.dispose();
      yield output.dispose();
    }));

    it('basic templating', co.wrap(function* () {
      input.write({
        'foo.js': `
function foo() {

}
        `
      });

      yield output.build();

      expect(output.read()['foo.js']).to.match(/'fetch\/ajax'/);
    }));

    it('stability', co.wrap(function* () {
      input.write({
        'foo.js': `
function foo() {

}
        `
      });

      yield output.build();
      expect(output.changes()).to.eql({ 'foo.js': 'create' });

input.write({
        'foo.js': `
function bar() {

}
        `
      });

      yield output.build();
      expect(output.changes()).to.eql({ 'foo.js': 'change' });


      yield output.build();

      // TODO: expect no changes, inputs haven't changed, so our output should also not.
      // expect(output.changes()).to.eql({ });
    }));
  });
});

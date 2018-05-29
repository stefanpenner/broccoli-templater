'use strict'

const fs = require('fs');

module.exports = class TemplateFile {
  constructor(path, type, stat) {
    this.path = path;
    this.type = type;
    this.stat = stat;
  }

  equal(file) {
    // key represents a file, diff the file
    if (this.type       === file.type &&
        this.path       === file.path &&
        this.stat.mode  === file.stat.mode &&
        this.stat.size  === file.stat.size &&
        this.type === 'directory' ? true : this.stat.mtime.getTime() === file.stat.mtime.getTime()) {
      return true;
    }
  }

  template(variables) {
    const templater = require('lodash.template');
    this.template = templater(fs.readFileSync(this.path));
    return this.template(variables);
  }
}

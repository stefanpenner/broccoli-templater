/* jshint node: true */
'use strict';

const Filter = require('broccoli-filter');
const TemplateFile = require('./template-file');
const p = require('path');
const fs = require('fs');

class Template extends Filter {
  constructor(inputTree, templatePath, variablesFn, options) {
    super(inputTree, options)

    this.templatePath = templatePath;
    this.variablesFn = variablesFn;
    this._template = undefined;
  }

  currentTemplateFile() {
    let stats = fs.statSync(this.templatePath);

    return new TemplateFile(this.templatePath, stats.isFile() ? 'file' : 'directory', stats);
  }

  processString(file, relativePath) {
    return this._template.template(this.variablesFn(file, relativePath));
  }

  isTemplatePath(path) {
    return this.templatePath === '/' + path;
  }

  canProcessFile(relativePath) {
    if (this.isTemplatePath(relativePath)) { return true; }

    return super.canProcessFile(relativePath);
  }

  processAndCacheFile(srcDir, destDir, relativePath) {
    if (this.isTemplatePath(relativePath)) { return; }

    if (this._template === undefined) {
      this._template = this.currentTemplateFile();
    } else {
      let newTemplateFile = this.currentTemplateFile();

      if (!newTemplateFile.equal(this._template)) {
        this._template = newTemplateFile;
        this.flushCache();
      }
    }

    return super.processAndCacheFile(srcDir, destDir, relativePath);
  }

  flushCache() {
    delete this._cache;
  }
}

Template.prototype.extensions = ['js'];
module.exports = Template;


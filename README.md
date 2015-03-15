# broccoli-templater

broccoli plugin that combines lodash.template and broccoli for fun stuff.

example:

```js
var templated = new Template(untemplated, templatePath, function buildVariables(content, relativePath) {
  return {
    moduleBody: content
  };
});
```

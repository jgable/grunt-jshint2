### Caching

Caching is done by keeping a computed sha1 hash of the file contents, the jshint options (stringified)
and the globals passed to the jshint.lint function.  

```javascript
_getContentsHash: function(content) {
    var sha1 = crypto.createHash('sha1');

    // The hash should include the file contents
    sha1.update(content);

    // And the jsHintOpts
    sha1.update(JSON.stringify(this.jsHintOpts));

    // And the globals
    sha1.update(JSON.stringify(this.globals));

    return sha1.digest("hex");
}
```

After a file is successfully linted an empty file with a name matching it's computed 
hash is created in a temp directory (using `os.tmpDir()`).  On subsequent jshint calls 
an existence check of the file determines whether we can skip validating it a second time.

By default, the directory where cached files is stored is dependant on the module version.  So 
updating the module will invalidate any already cached files.
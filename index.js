var through = require('through');
var riot = require('riot');
var preamble = "var riot = require('riot');";

function clean( str ) {
  // Escape single quotes and remove newlines
  return str.replace(/'/g,"\\'").replace(/\r|\n/g,'');
}

function fnWrap( tags ) {
  var compiled = "function(fn){";

  if ( tags.length ) {
    compiled += "var _o=typeof fn==='object'?fn:{init:fn};";
    tags.forEach(function(tag, i) {
      compiled +=
        "riot.tag("
          // Option to rename first tag
          +( i===0 ? "_o.tagName||" : "" )+"'"+tag.tagName+"',"
          +"'"+clean(tag.html)+"',"
          +"'"+clean(tag.css)+"',"
          +"'"+clean(tag.attribs)+"',"
          +"function(opts){"
            // Init script from tag file
            +"this.super=function(){"+tag.js+"\n}.bind(this);"
            +(
              // First tag
              i===0 ?
                // Extend with given properties
                "for(var k in _o){"
                  +"if(_o.hasOwnProperty(k)){this[k]=typeof _o[k]==='function'?_o[k].bind(this):_o[k]}"
                +"}"
                // Run given or default init function
                +"if(this.init){this.init(opts)}else{this.super()}"
              // Other tags
              : "this.super()"
            )
          +"}"
        +");";
    });
    compiled += "return '"+tags[0].tagName+"'";
  }
  compiled += "};";
  return compiled;
}

function riotifyFnTransform(file, o) {
  var opts = o || {};
  var content = '';

  opts.whitespace = false;

  var transforms = opts.ext || { tag: 'fn' };

  var returnTransform;

  Object.keys(transforms).forEach(function(ext) {

    if ( returnTransform || ! file.match('\.' + ext + '$') ) return;

    var exportMode = transforms[ext];
    opts.entities = (exportMode !== 'tag' ? true : false);

    returnTransform = through(
      // Write
      function (chunk) {
        content += chunk.toString();
      },
      // End
      function () {
        var compiled, result;
        result = preamble + "module.exports = ";
        try {
          compiled = riot.compile(content, opts);
          if (exportMode === 'tag') {
            // Default behavior: compiled with entities:false (same as riotify)
            result += compiled;
          } else if (exportMode === 'obj') {
            // Compiled with entities:true (object as literal JSON string)
            result += JSON.stringify(compiled);
          } else {
            // Compiled with entities:true (wrap with constructor function)
            result += fnWrap(compiled);
          }

          this.queue(result);
          //console.log('---> compiled to '+exportMode+'\n'+file+'\n', compiled, result);
          this.emit('end');
        } catch (e) {
          this.emit('error', e);
        }
      }
    );
  });

  return returnTransform || through();
};

module.exports = riotifyFnTransform;

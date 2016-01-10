var through = require('through');
var riot = require('riot');
var before = "var riot = require('riot');module.exports = function(fn){";
var after = "};";

function clean( str ) {
  // Escape single quotes and remove newlines
  return str.replace(/'/g,"\\'").replace(/\r|\n/g,'');
}

module.exports = function (file, o) {
  var opts = o || {};
  var ext = opts.ext || 'tag';
  var content = '';
  opts.entities = true;
  opts.whitespace = false;

  return !file.match('\.' + ext + '$') ? through() : through(
    // Write
    function (chunk) {
      content += chunk.toString();
    },
    // End
    function () {
      try {
        var tags = riot.compile(content, opts);
        var compiled = before;
        if ( tags.length ) {
          compiled += "var _o=typeof fn==='object'?fn:{init:fn};";
          tags.forEach(function(tag, i) {
            compiled +=
              "riot.tag("
              // Redefine first tag name, if set
              +( i===0 ? "_o.tagName||" : "" )+"'"+tag.tagName+"',"
              +"'"+clean(tag.html)+"','"+clean(tag.css)+"','"+clean(tag.attribs)+"',"
              +"function(){"
                // Init script from tag file
                +tag.js+"\n"
                // Extend first tag with given properties
                +( i===0 ? ";for(var k in _o){if(_o.hasOwnProperty(k)){this[k]=typeof _o[k]==='function'?_o[k].bind(this):_o[k]}}this.init&&this.init()" : "" )
              +"});";
          });
          compiled += "return '"+tags[0].tagName+"'";
        }
        compiled += after;
        this.queue(compiled);
        if (opts.debug) console.log('compiled tag', compiled);
        this.emit('end');
      } catch (e) {
        this.emit('error', e);
      }
    }
  );
};

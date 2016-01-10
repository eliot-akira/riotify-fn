# riotify-fn

`riotify-fn` is a [browserify](http://browserify.org/) transform for [Riot.js](http://riotjs.com/), to include `.tag` files as constructor functions.

It's a way to use `.tag` files as precompiled templates, which leaves the initialization to the consumer.

**What's the difference with riotify?**

- With `riotify`, requiring a `.tag` file initializes the tag and returns its name.
- With `riotify-fn`, requiring a `.tag` file returns a constructor function. It is then used to initialize the tag with given methods and properties.

**How does it work?**

`riotify-fn` compiles `.tag` files with the [*entities* option](https://github.com/riot/compiler/blob/dev/doc/guide.md#compiler-options) (new in Riot v2.3.12), which transforms them to raw tag parts. It returns a constructor function as a thin wrapper to extend and build the tag.


## Apply transform

In command line

```bash
$ browserify -t riotify-fn
```

..or `package.json`

```json
"browserify": {
  "transform": [ "riotify-fn" ]
}
```

..or gulp task

```javascript
var riotifyFn = require('riotify-fn');

browserify({ transform: [riotifyFn] });
```

## Include tag

Here is an example `.tag` file.

```html
<my-button>
  <button onclick={clicked}>{label}</button>
</my-button>
```

When required, it returns a constructor function.

```javascript
var makeButton = require('./my-button.tag');
```

## Build

The constructor will build all tags defined in the file.

```javascript
makeButton();
```

It takes an optional argument of a *function* or *object* to extend the tag.

Given a *function*, it is run when the tag is instantiated. It comes after the init script in the tag file, if any. `this` is the tag instance.

```javascript
makeButton(function() {
  this.label = 'Hi';
});
```

Given an *object*, its properties are assigned to the tag instance.

```javascript
makeButton({
  label: 'Hi',
  clicked: function() {
    this.label = 'Bye';
  }
});
```

Optionally, set `init` as initial function, and `tagName` to give a new tag name.

If multiple tags are defined in the `.tag` file, the first tag is extended.

## Result

After the constructor is done, it returns the tag name. This can be used to mount it, if needed.

```javascript
riot.mount(makeButton());
```

## Idea for future

- `riotify-class` to include tags as Tag class to be extended

## Credit

`riotify-fn` is based on [`riotify`](https://github.com/jhthorsen/riotify)

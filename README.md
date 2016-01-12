# riotify-fn

`riotify-fn` is a [browserify](http://browserify.org/) transform for [Riot.js](http://riotjs.com/), to include `.tag` files as constructor functions.

It's a way to use `.tag` files as precompiled templates, which leaves the initialization to the consumer.

**What's the difference with riotify?**

- With `riotify`, requiring a `.tag` file initializes the tag and returns its name.
- With `riotify-fn`, requiring a `.tag` file returns a constructor function. It is then used to initialize the tag with given methods and properties.

**How does it work?**

`riotify-fn` compiles `.tag` files with the [*entities* option](https://github.com/riot/compiler/blob/dev/doc/guide.md#compiler-options) (new in Riot v2.3.12), which transforms them to raw tag parts. It returns a constructor function that extends and builds the tag using [`riot.tag()`](http://riotjs.com/api/#manual-construction). Since the tag is precompiled, all template features like self-closing tags are supported.

## Install

```bash
$ npm i riotify-fn --save-dev
```

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
browserify({
  transform: [ 'riotify-fn' ]
});
```

**Transform options**

`ext` - an object mapping file extension (key) to transform mode (value)

Available modes are:

- `fn` returns constructor function (default)
- `tag` returns constructed tag name (same as riotify)
- `obj` returns an array of [raw tag entities](https://github.com/riot/compiler/blob/dev/doc/guide.md#the-entities-option)

Default setting is `{ tag: 'fn' }`.

The example below will compile `.tag` files the same as riotify, and export `.riot` files as contructor functions.

```javascript
browserify({
  transform: [
    ['riotify-fn', {
      ext: { tag: 'tag', riot: 'fn' }
    }]
  ]
});
```

## Include the tag

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

## Constructor

The constructor will build all tags defined in the file.

Given no argument, it is equivalent to requiring the tag using `riotify`.

```javascript
makeButton();
```

It takes an optional argument of a *function* or *object* to extend the tag. If multiple tags are defined in the `.tag` file, the first tag is extended.

Given a *function*, it will be used to instantiate the tag **in place of any script in the tag file**.


```javascript
makeButton(function() {
  this.label = 'Hi';
  this.super();
});
```

`this` is the tag instance. `this.super` is a function that runs the default script from the tag file, if there were any; otherwise it does nothing.

Given an *object*, its properties are assigned to the tag instance.

```javascript
makeButton({
  label: 'Hi',
  clicked: function() {
    this.label = 'Bye';
  }
});
```

Optionally, set:

- `tagName` to give a new tag name
- `init` as the initial function. It works the same as the *function* argument above. If `init` is not set, the default script in the tag file is used to instantiate the tag.

## Result

After the constructor is done, it returns the tag name. This can be used to mount it, if needed.

```javascript
riot.mount(makeButton());
```

## Future ideas

- Transform mode: JSX, ES6 classes?

## Credit

`riotify-fn` is based on [`riotify`](https://github.com/jhthorsen/riotify)

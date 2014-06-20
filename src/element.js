(function () {

  var POSITIONS = ['right', 'left', 'right-bottom', 'left-bottom'];
  var COLORS = ['red', 'green', 'orange', 'gray'];

  var RibbonPrototype = Object.create(HTMLElement.prototype);

  var currScript = document._currentScript || document.currentScript;
  var tmpl = currScript.ownerDocument.getElementById('ribbon-template');

  // Attribute handlers
  var attrs = {
    "position": function (oldVal, newVal) {
      this.ns.position = validOrDefault(POSITIONS, newVal);
    },
    "color": function (oldVal, newVal) {
      this.ns.color = validOrDefault(COLORS, newVal);
    },
    "user": function (oldVal, newVal) {
      this.ns.user = newVal;
    },
    "repo": function (oldVal, newVal) {
      this.ns.repo = newVal;
    },
    "content": function (oldVal, newVal) {
      this.ns.content = newVal;
    }
  };

  function validOrDefault (choices, newVal) {
    return (choices.indexOf(newVal) === -1) ? choices[0] : newVal;
  }

  function render (ribbon) {
    var ns = ribbon.ns;
    var root = ribbon.root;

    // Update class names
    root.className = [
      'github-fork-ribbon-wrapper',
      ns.position,
      'color-' + ns.color
    ].join(' ');

    // Update the repo link
    var link = root.querySelector('.github-link');
    var parts = ["https://github.com"];
    if (ns.user) {
      parts.push(ns.user);
      if (ns.repo) {
        parts.push(ns.repo);
      }
    }
    link.setAttribute('href', parts.join('/'));

    // Update the ribbon content (feels dirty)
    link.innerHTML = ns.content;
  }

  RibbonPrototype.createdCallback = function () {
    this.ns = {};

    // Capture & clear element content
    this.ns.content = this.innerHTML || 'Fork me on GitHub';
    this.innerHTML = '';
    
    // Grab root element from template, clone & remember it
    var frag = document.importNode(tmpl.content, true);
    this.root = frag.querySelector('.github-fork-ribbon-wrapper');
    this.appendChild(this.root);
  };

  RibbonPrototype.attachedCallback = function () {
    for (var k in attrs) {
      // Skip content; it comes from innerHTML
      if ('content' === k) { continue; }
      attrs[k].call(this, null, this.getAttribute(k));
    }
    render(this);
  };

  RibbonPrototype.detachedCallback = function () {
    // TODO: Do I really need to do this? Memory leak superstition.
    this.root = this.ns = null;
  };

  RibbonPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (!(attr in attrs)) { return; }
    attrs[attr].call(this, oldVal, newVal);
    render(this);
  };

  // Property accessors, magically boilerplated
  var props = {};
  function makeProp (name) {
    return {
      get: function () {
        return this.ns[name];
      },
      set: function (newVal) {
        return this.attributeChangedCallback(name, this.ns[name], newVal);
      }
    };
  }
  for (var name in attrs) {
    props[name] = makeProp(name);
  }
  Object.defineProperties(RibbonPrototype, props);

  // Register the element
  window.CustomElement = document.registerElement('fork-me-on-github', {
    prototype: RibbonPrototype
  });

})();

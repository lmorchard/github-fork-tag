(function () {

  var RibbonPrototype = Object.create(HTMLElement.prototype);

  var POSITIONS = {
    "default": "right",
    "left": "left",
    "right": "right",
    "right-bottom": "right-bottom",
    "left-bottom": "left-bottom"
  };

  // FIXME: Hard coded colors like this are a terrible idea.
  // Better figure out how component styling works
  var COLORS = {
    "default": null,
    "green": "#090",
    "orange": "#f80",
    "gray": "#333"
  };

  // Get access to the template 
  var curr_script = document._currentScript || document.currentScript;
  var tmpl = curr_script.ownerDocument.getElementById('ribbon-template');

  // Attribute handlers
  var attrs = {
    "position": function (oldVal, newVal) {
      this.ns.position = POSITIONS[newVal] || POSITIONS['default'];
    },
    "color": function (oldVal, newVal) {
      this.ns.color = COLORS[newVal] || COLORS['default'];
    },
    "user": function (oldVal, newVal) {
      this.ns.user = newVal;
    },
    "repo": function (oldVal, newVal) {
      this.ns.repo = newVal;
    }
  };

  function render (ribbon) {
    var ns = ribbon.ns;
    var root = ribbon.root;

    // Update the ribbon wrapper classes
    root.className = [
      'github-fork-ribbon-wrapper',
      ns.position
    ].join(' ');
    
    // Update the ribbon color (ribbon is a dumb idea)
    if (ribbon.ns.color) {
      var gfr = root.querySelector('.github-fork-ribbon');
      gfr.style.backgroundColor = ns.color;
    }

    // Update the github link
    var link = root.querySelector('.github-link');
    var parts = ["https://github.com"];
    if (ns.user) {
      parts.push(ns.user);
      if (ns.repo) {
        parts.push(ns.repo);
      }
    }
    link.setAttribute('href', parts.join('/'));
  };

  // Lifecycle methods
  RibbonPrototype.createdCallback = function () {
    this.ns = {};
    var frag = document.importNode(tmpl.content, true);
    this.root = frag.querySelector('.github-fork-ribbon-wrapper');
    this.appendChild(this.root);
  };

  RibbonPrototype.attachedCallback = function () {
    for (k in attrs) {
      attrs[k].call(this, null, this.getAttribute(k));
    }
    render(this);
  };

  RibbonPrototype.detachedCallback = function () {
    var ribbon = this; 
  };

  RibbonPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (attr in attrs) {
      attrs[attr].call(this, oldVal, newVal);
      render(this);
    }
  };

  // Property accessors, magically boilerplated
  var props = {};
  for (name in attrs) {
    props[name] = (function (name) {
      return {
        get: function () {
          return this.ns[name]
        },
        set: function (newVal) {
          return this.attributeChangedCallback(name, this.ns[name], newVal);
        }
      };
    })(name);
  }
  Object.defineProperties(RibbonPrototype, props);

  // Register the element
  window.CustomElement = document.registerElement('fork-me-on-github', {
    prototype: RibbonPrototype
  });

})();

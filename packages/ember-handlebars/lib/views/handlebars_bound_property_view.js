require('ember-handlebars/views/metamorph_view');

var getPath = Ember.Handlebars.getPath, escapeExpression = Handlebars.Utils.escapeExpression;

var HandlebarsBoundPropertyView = Ember.CoreObject.extend(Ember._Metamorph, {
  isView: true,
  init: function (opts) {
    // try to introduce all properties during constructor
    this._parentView = opts._parentView;
    this.path = opts.path;
    this.pathRoot = opts.pathRoot;
    this.templateData = opts.templateData;
    this.isEscaped = opts.isEscaped;
    this.buffer = null;
    this.lastResult = undefined;
    this._super();
  },
  renderToBuffer: function (buffer) {
    var result = getPath(this.pathRoot, this.path, { data: this.templateData });
    this.lastResult = result;
    if (this.isEscaped) { result = escapeExpression(result); }

    this.beforeRender(buffer);
    buffer.push(result);
    this.afterRender(buffer);
  },
  rerenderIfNeeded: function () {
    if (this.isDestroyed) { return; }

    var result = getPath(this.pathRoot, this.path, { data: this.templateData });
    if (result !== this.lastResult) {
      if (this.isEscaped) { result = escapeExpression(result); }

      // TODO put rerenderIfNeeded into states
      this.morph.html(result);

      this.lastResult = result;
    }
  },
  invokeRecursively: function (fn) { fn.call(this, this); },
  propertyDidChange: Ember.K, // comes from invalidate recursively, invokeRecursively
  transitionTo: Ember.K, // invokeRecursively
  trigger: Ember.K // invokeRecursively
});

// avoid merge mixin
HandlebarsBoundPropertyView.create = function (opts) {
  return new HandlebarsBoundPropertyView(opts);
};

Ember._HandlebarsBoundPropertyView = HandlebarsBoundPropertyView;

/* globals RSVP:true */

import Ember from 'ember-metal/core';
import Logger from 'ember-metal/logger';
import run from "ember-metal/run_loop";
import * as RSVP from 'rsvp';

var testModuleName = 'ember-testing/test';
var Test;

var asyncStart = function() {
  if (Ember.Test && Ember.Test.adapter) {
    Ember.Test.adapter.asyncStart();
  }
};

var asyncEnd = function() {
  if (Ember.Test && Ember.Test.adapter) {
    Ember.Test.adapter.asyncEnd();
  }
};

RSVP.configure('async', function(callback, promise) {
  var async = !run.currentRunLoop;

  if (Ember.testing && async) { asyncStart(); }

  run.backburner.schedule('actions', function() {
    if (Ember.testing && async) { asyncEnd(); }
    callback(promise);
  });
});

RSVP.Promise.prototype.fail = function(callback, label) {
  Ember.deprecate('RSVP.Promise.fail has been renamed as RSVP.Promise.catch');
  return this['catch'](callback, label);
};

var errorDispatcher = {
  handlers: [],
  register(fn) {
    this.handlers.push(fn);
  },
  unregister(fn) {
    let handlers = this.handlers;
    for (let i=0; i<handlers.length; i++) {
      if (handlers[i] === fn) {
        handlers.splice(i, 1);
        return true;
      }
    }
    return false;
  },
  dispatch(e) {
    let handlers = this.handlers;
    for(var i = handlers.length; i--; ) {
      if (handlers[i](e) === false) {
        break;
      }
    }
  }
};

RSVP.on('error', onerrorDefault);

// bottom of the stack
errorDispatcher.register(function (error) {
  Logger.error(error.stack);
  return false;
});

errorDispatcher.register(function (error) {
  if (Ember.onerror) {
    Ember.onerror(error);
    return false;
  }
});

export { errorDispatcher };

export function onerrorDefault(e) {
  var error;

  if (e && e.errorThrown) {
    // jqXHR provides this
    error = e.errorThrown;
    if (typeof error === 'string') {
      error = new Error(error);
    }
    error.__reason_with_error_thrown__ = e;
  } else {
    error = e;
  }

  if (error && error.name !== 'TransitionAborted') {
    errorDispatcher.dispatch(e);
  }
}

export default RSVP;

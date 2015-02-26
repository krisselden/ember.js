/**
@module ember
@submodule ember-htmlbars
*/

import Stream from "ember-metal/streams/stream";
import SimpleStream from "ember-metal/streams/simple";

export default function bindLocal(env, scope, key, value) {
  var existing = scope.locals[key];

  if (existing) {
    existing.setSource(value);
  } else {
    var newValue = Stream.wrap(value, SimpleStream);
    scope.locals[key] = newValue;
  }
}
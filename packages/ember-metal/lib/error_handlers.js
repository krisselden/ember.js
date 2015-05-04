import Logger from 'ember-metal/logger';

var errorHandlers = {
  handlers: [],
  register(fn) {
    this.handlers.push(fn);
  },
  unregister(fn) {
    let handlers = this.handlers;
    for (let i=0; i<handlers.length; i++) {
      if (handlers[i] === fn) {
        handlers.splice(i, 1);
      }
    }
  }
};

// start at top of stack and break if handler returns false
export function dispatch(error) {
  let handlers = errorHandlers.handlers;
  for (let i = handlers.length; i--; ) {
    if (handlers[i](error) === false) { break; }
  }
}

export function defaultHandler(error) {
  Logger.error(error.stack);
}

// register default handler on bottom of stack
errorHandlers.register(defaultHandler);

export default errorHandlers;

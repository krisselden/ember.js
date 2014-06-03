#!/usr/bin/env node
/* jshint node: true */
var broccoli = require('broccoli');
var printSlowTrees = require('broccoli/lib/logging').printSlowTrees;
var Watcher = require('broccoli-sane-watcher');
var middleware = require('broccoli/lib/middleware');
var http = require('http');
var tinylr = require('tiny-lr');
var connect = require('connect');

function serve (builder, options) {
  options = options || {};

  console.log('Serving on http://' + options.host + ':' + options.port + '\n');

  var watcher = options.watcher || new Watcher(builder, {verbose: true});

  var app = connect().use(middleware(watcher));

  var server = http.createServer(app);

  process.addListener('exit', function () {
    builder.cleanup();
  });

  // We register these so the 'exit' handler removing temp dirs is called
  process.on('SIGINT', function () {
    process.exit(1);
  });
  process.on('SIGTERM', function () {
    process.exit(1);
  });

  var livereloadServer = new tinylr.Server();
  livereloadServer.listen(options.liveReloadPort, function (err) {
    if(err) {
      throw err;
    }
  });

  var liveReload = function() {
    // We could pass files: glob.sync('**', {cwd: ...}), but this spams
    // stdout with messages and Chrome LiveReload doesn't seem to care
    // about the specific files.
    livereloadServer.changed({body: {files: ['LiveReload files']}});
  };

  watcher.on('change', function(results) {
    printSlowTrees(results.graph);
    console.log('Built - ' + Math.round(results.totalTime / 1e6) + ' ms');
    liveReload();
  });

  watcher.on('error', function(err) {
    console.log('Built with error:');
    // Should also show file and line/col if present; see cli.js
    if (err.file) {
      console.log('File: ' + err.file);
    }
    console.log(err.stack);
    console.log('');
    liveReload();
  });

  server.listen(parseInt(options.port, 10), options.host);
}

process.env.BROCCOLI_ENV = process.env.BROCCOLI_ENV || 'production';
var tree    = broccoli.loadBrocfile();
var builder = new broccoli.Builder(tree);
serve(builder, {
  host: 'localhost',
  port: 4200
});

'use strict';

const Io = require('legion-io');

module.exports = function(pieces, middle) {
  const cleanup = Io.get().chain(x => pieces.after(x));

  return Io.of().local(pieces.before, Io.of().chain(middle).chain(result => cleanup.chain(() => result)).catch(err => cleanup.chain(() => { throw err; })));
};

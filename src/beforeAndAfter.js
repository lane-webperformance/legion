'use strict';

const Io = require('legion-io');

// withSideEffect(Function) : Function
//
// Returns a function that acts as an identity
// (i.e. it returns the value that was passed as a parameter)
// but triggers the given side effect.
//
// Always returns an Io.
//
const withSideEffect = (f) => (value) => {
  return Io.of()
           .chain(f)
           .chain(() => value);
};

module.exports = function(pieces, middle) {
  return Io.of()
           .chain(withSideEffect(pieces.before))
           .chain(middle)
           .chain(withSideEffect(pieces.after));
};

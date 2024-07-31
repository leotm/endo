// TODO: equivalent of:
// import '../dist/ses.cjs';
// import '../src/assert-shim.js';
// Since Hermes has no native support for I/O

// Test lockdown

lockdown();

// Test Compartment

const c = new Compartment();

c.evaluate('1+1');
c.evaluate("const c2 = new Compartment(); c2.evaluate('1+2')");

// Test importHook and resolveHook

// https://github.com/facebook/hermes/blob/main/doc/Features.md
// In Progress: ES modules (`import` and `export`)

const resolveHook = (a) => a;

async function importHook() {
  return {
    imports: [],
    exports: ['meaning'],
    execute(exports) {
      exports.meaning = 42;
    },
  };
}

const compartment = new Compartment({}, {}, { resolveHook, importHook });

const module = compartment.module('.');

// const {
// namespace: { _meaning },
// } = await compartment.import('.');

assert(module);
// t.is(meaning, 42, 'exports seen');
// t.is(module.meaning, 42, 'exports seen through deferred proxy');

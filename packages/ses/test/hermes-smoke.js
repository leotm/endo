// Hermes doesn't support native I/O,
// so we concat the SES shim above,
// when running this test on the `hermesc`.

/**
 * Test calling SES lockdown.
 */
const testLockdown = () => {
  lockdown();
};

testLockdown();

/**
 * TODO: Test creating a new Compartment.
 */
// eslint-disable-next-line no-unused-vars
const testCompartment = () => {
  // eslint-disable-next-line no-unused-vars
  const c = new Compartment();
};

// testCompartment();

/**
 * TODO: Test Compartment import hook and resolve hook.
 */
// eslint-disable-next-line no-unused-vars
const testCompartmentHooks = async () => {
  const resolveHook = a => a;

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

  const {
    namespace: { _meaning },
  } = await compartment.import('.');

  assert(module);
};

// testCompartmentHooks();

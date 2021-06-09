const test = require('tape');
const fc = require('fast-check');

const memoize = f => {
  let cache = new Map();
  return x => cache.get(x) ?? cache.set(x, f(x)).get(x);
};

test('memoize', assert => {
  const increment = i => _ => ++i;

  assert.plan(1);

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.anything(), fc.integer(2, 10), (x, repeats) => {
        let count = {};
        let nonMemoized = increment(0);
        let memoized = memoize(increment(0));

        while (repeats-- >= 0)
          count = {
            memoized: memoized(x),
            nonMemoized: nonMemoized(x)
          }

        return count.memoized === 1 && count.nonMemoized !== count.memoized;
      })
    )
  }, 'should only call "increment" once.');
});

test('memoize random function', assert => {
  const memoized = memoize(Math.random);
  assert.plan(1);

  assert.notEqual(memoized(), Math.random(), 'should not be able to cache random numbers');
})
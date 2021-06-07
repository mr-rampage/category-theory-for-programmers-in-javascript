const test = require('tape');
const fc = require('fast-check');

const id = x => x;
const compose = (...f) => x => f.reverse().reduce((i, f) => f(i), x);

test('identity', assert => {
  assert.plan(1);
  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.anything(), x => x === id(x))
    )
  }, "should return the input for all inputs")
});

test('composition', assert => {
  const adder = x => y => x + y;
  const multiplier = x => y => x * y;

  assert.plan(3);
  assert.doesNotThrow(() => {
      fc.assert(
        fc.property(fc.integer(), fc.integer(), (x, y) =>
          compose(adder(x), multiplier(y))(x) === adder(x)(multiplier(y)(x)))
      )
  }, "should compose from right to left");

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (x, y) =>
        compose(adder(x), multiplier(y), adder(y))(x) === compose(compose(adder(x), multiplier(y)), adder(y))(x))
    )
  }, "should be associative")

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (x, y) =>
        compose(adder(x), id)(y) === compose(id, adder(x))(y))
    )
  }, "should contain a unit of composition")
})
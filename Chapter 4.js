const test = require('tape');
const fc = require('fast-check');

/**
 * Universal None type
 * @type {symbol}
 */
const None = Symbol('Represents an Empty value');

/**
 * Type representing an optional value.
 **/
class Some {
  constructor(value) {
    this.value = value;
  }
}

/**
 * Factory function to create optionals
 * @param value - *
 * @return {Some|None}
 */
const optional = value => (value !== null && value !== undefined) ? new Some(value) : None;

/**
 * Composes two optional types
 * @param g {function(*=): Some|None}
 * @return {function(*): function(*=): Some|None}
 */
const compose = g => f => x => f(x) instanceof Some ? g(f(x).value) : None;

/**
 * Identify for the optional type
 * @param x
 */
const identity = x => x;

test('optional identity', assert => {
  const some = new Some(5);
  assert.equal(None, identity(None));
  assert.equal(some, identity(some));
  assert.end();
});

test('optional compose', assert => {
  const f = _ => None;
  const g = x => optional(x);
  const h = x => optional(x * 2);

  assert.equal(None, compose(g)(f)(5));
  assert.equal(None, compose(f)(g)(5));

  assert.true((compose(g)(h)(5)) instanceof Some);
  assert.end();
});

test('safe root reciprocal', assert => {
  const safeRoot = x => x >= 0 ? new Some(Math.sqrt(x)) : None;
  const safeReciprocal = x => x !== 0 ? new Some(x) : None;
  const safeRootReciprocal = compose(safeRoot)(safeReciprocal);
  assert.equal(None, safeRootReciprocal(0));
  assert.equal(None, safeRootReciprocal(-1));
  assert.true(safeRootReciprocal(1) instanceof Some);

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.integer(), x => {
        return x <= 0 ? safeRootReciprocal(x) === None : safeRootReciprocal(x) instanceof Some
      })
    )
  }, 'should not crash for all integers')

  assert.end();
});
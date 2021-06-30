const test = require('tape');
const fc = require('fast-check');

const LEFT = Symbol("Left for Either");
const RIGHT = Symbol("Right for Either");
const EMPTY = Symbol("Empty Either");

/**
 * Flip Combinator - reverse the arguments of a 2 argument function
 */
const flip = f => y => x => f(x)(y);
/**
 * Either constructor - constructs an either with left and right values
 */
const either = l => r => ({ [LEFT]: l, [RIGHT]: r});

/**
 * Constructs a left object with an EMPTY right
 */
const left = flip(either)(EMPTY);

/**
 * constructs a right object with an EMPTY LEFT
 */
const right = either(EMPTY);

/**
 * Gets the value from an either by matching LEFT or RIGHT
 */
const match = leftOrRight => either => Reflect.has(either, leftOrRight) ? either[leftOrRight] : EMPTY;

test('either construction', assert => {
  assert.plan(2);

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.anything(), x => {
        const l = left(x);
        return match(LEFT)(l) === x && match(RIGHT)(l) === EMPTY;
      })
    )
  }, 'should return value from left and empty from right.');

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.anything(), x => {
        const l = right(x);
        return match(RIGHT)(l) === x && match(LEFT)(l) === EMPTY;
      })
    )
  }, 'should return value from right and empty from left.');
});


test("coproduct with map", assert => {
  const i = n => n;
  const j = b => b ? 0 : 1;

  const map = mapLeft => mapRight => either => match(LEFT)(either) !== EMPTY ? mapLeft(match(LEFT)(either)) : mapRight(match(RIGHT)(either));
  const m = map(i)(j)

  const eitherIntBool = x => Number.isInteger(x) ? left(x) : right(x);

  assert.plan(1);

  assert.doesNotThrow(() => {
    fc.assert(
      fc.property(fc.oneof(fc.boolean(), fc.integer()), x =>
        Number.isInteger(x)
          ? m(eitherIntBool(x)) === i(x)
          : m(eitherIntBool(x)) === j(x)
      )
    )
  }, 'should factorize i and j.');
});
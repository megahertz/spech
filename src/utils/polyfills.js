/**
 * Array.prototype.flat for Node.js < 11
 * @author jonathantneal/array-flat-polyfill
 */
if (!Array.prototype.flat) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'flat', {
    configurable: true,
    value: function flat(depth) {
      depth = Number.isNaN(depth) ? 1 : Number(depth);

      return depth ? Array.prototype.reduce.call(this, (acc, cur) => {
        if (Array.isArray(cur)) {
          acc.push(...flat.call(cur, depth - 1));
        } else {
          acc.push(cur);
        }

        return acc;
      }, []) : Array.prototype.slice.call(this);
    },
    writable: true,
  });
}

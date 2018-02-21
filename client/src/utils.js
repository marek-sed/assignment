/**
 * returns {Array} of children on keys provided after first argument
 * @param  {any} notFound - value returned if get fails
 * @param  {Strings} ...args
 */
export const getAll = (notFound, ...args) => data =>
  args.map(key => data.get(key, notFound));

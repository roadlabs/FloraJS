/*global exports */
/**
 * Creates a new BorderPalette object.
 *
 * Use this class to create a palette of border styles.
 *
 * @constructor
 */
function BorderPalette(opt_id) {

  'use strict';

  /**
   * Holds a list of border styles.
   * @private
   */
  this._borders = [];

  this.id = opt_id || BorderPalette._idCount;
  BorderPalette._idCount += 1; // increment id
}

/**
 * Increments as each BorderPalette is created.
 * @type number
 * @default 0
 * @private
 */
BorderPalette._idCount = 0;

BorderPalette.prototype.name = 'BorderPalette';

/**
 * Adds a random number of the passed border style to the 'borders' array.
 *
 * @param {Object} options A set of required options
 *    that includes:
 *    options.min {number} The minimum number of styles to add.
 *    options.max {number} The maximum number of styles to add.
 *    options.style {string} The border style.
 */
BorderPalette.prototype.addBorder = function(options) {

  'use strict';

  var requiredOptions = {
    min: 'number',
    max: 'number',
    style: 'string'
  }, i, ln;

  if (exports.Interface.checkRequiredParams(options, requiredOptions)) {

    ln = exports.Utils.getRandomNumber(options.min, options.max);

    for (i = 0; i < ln; i++) {
      this._borders.push(options.style);
    }
  }
  return this;
};

/**
 * @returns A style randomly selected from the 'borders' property.
 * @throws {Error} If the 'borders' property is empty.
 */
BorderPalette.prototype.getBorder = function() {

  'use strict';

  if (this._borders.length > 0) {
    return this._borders[exports.Utils.getRandomNumber(0, this._borders.length - 1)];
  } else {
    throw new Error('BorderPalette.getBorder: You must add borders via addBorder() before using getBorder().');
  }
};
exports.BorderPalette = BorderPalette;
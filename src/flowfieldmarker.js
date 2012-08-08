/*global console */
/** 
    A module representing a FlowFieldMarker.
    @module FlowFieldMarker
 */

/**
 * Creates a new FlowFieldMarker.
 *
 * @constructor
 * @param {Object} [opt_options] Options.
 * @param {Object} opt_options.location Location.
 * @param {number} opt_options.scale Scale. 
 * @param {number} opt_options.opacity Opacity
 * @param {number} opt_options.width Width.
 * @param {number} opt_options.height Height. 
 * @param {number} opt_options.angle Angle. 
 * @param {string} opt_options.colorMode Color mode. 
 * @param {Object} opt_options.color Color. 
 */    
function FlowFieldMarker(options) {

  'use strict';

  var requiredOptions = {
        location: 'object',
        scale: 'number',
        angle: 'number',
        opacity: 'number',
        width: 'number',
        height: 'number',
        colorMode: 'string',
        color: 'object'
      }, el, nose;

  if (exports.Interface.checkRequiredParams(options, requiredOptions)) {

    el = document.createElement("div");
    nose = document.createElement("div");
    el.className = "flowFieldMarker";
    nose.className = "nose";
    el.appendChild(nose); 

    el.style.cssText = this.getCSSText({
      x: options.location.x - options.width/2,
      y: options.location.y - options.height/2,
      s: options.scale,
      a: options.angle,
      o: options.opacity,
      w: options.width,
      h: options.height,
      cm: options.colorMode,
      c: options.color
    });

    exports.world.el.appendChild(el);
  }
}

FlowFieldMarker.prototype.getCSSText = function(props) {

  'use strict';

  return [
    '-webkit-transform: translateX(' + props.x + 'px) translateY(' + props.y + 'px) translateZ(0) rotate(' + props.a + 'deg) scaleX(' + props.s + ') scaleY(' + props.s + ')',
    '-moz-transform: translateX(' + props.x + 'px) translateY(' + props.y + 'px) translateZ(0) rotate(' + props.a + 'deg) scaleX(' + props.s + ') scaleY(' + props.s + ')',
    '-o-transform: translateX(' + props.x + 'px) translateY(' + props.y + 'px) translateZ(0) rotate(' + props.a + 'deg) scaleX(' + props.s + ') scaleY(' + props.s + ')',
    'opacity: ' + props.o,
    'width: ' + props.w + 'px',
    'height: ' + props.h + 'px',
    'background: ' + props.cm + '(' + props.c.r + ', ' + props.c.g + ', ' + props.c.b + ')'
  ].join(';');
};

exports.FlowFieldMarker = FlowFieldMarker;
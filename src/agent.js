/*global exports */
/**
 * Creates a new Agent.
 *
 * Agents are autonomous objects affected by World forces (gravity, wind) and Proximity forces (Attractors, Repellers, Liquid).
 * Because their primary purpose is to navigate their World, they carry navigational properties like 'avoidEdges',
 * 'maxSteeringForce' or 'turningRadius' which can be manipulated to adjust their observed behavior. They can also carry
 * Sensors which react to Stimuli and return information about the World.
 *
 * @constructor
 * @extends Element
 *
 * @param {Object} [opt_options] Agent options.
 * @param {number} [opt_options.mass = 10] Mass
 * @param {number} [opt_options.maxSpeed = 10] Maximum speed
 * @param {number} [opt_options.minSpeed = 0] Minimum speed
 * @param {number} [opt_options.motorSpeed = 2] Motor speed
 * @param {number} [opt_options.lifespan = -1] Life span. Set to -1 to live forever.
 * @param {number} [opt_options.offsetDistance = 30] The distance from the center of the agent's parent.
 * @param {number} [opt_options.offsetAngle = 30] The angle of rotation around the parent carrying the agent.
 * @param {boolean} [opt_options.pointToDirection = true] If true, object will point in the direction it's moving.
 * @param {boolean} [opt_options.followMouse = false] If true, object will follow mouse.
 * @param {boolean} [opt_options.seekTarget = null] An object to seek.
 * @param {boolean} [opt_options.isStatic = false] If true, object will not move.
 * @param {boolean} [opt_options.checkEdges = true] Set to true to check the object's location against the world's bounds.
 * @param {boolean} [opt_options.wrapEdges = false] Set to true to set the object's location to the opposite
 * side of the world if the object moves outside the world's bounds.
 * @param {boolean} [opt_options.avoidEdges = false] Set to true to calculate a steering force away from the
 * world's bounds.
 * @param {number} [opt_options.avoidEdgesStrength = 200] Sets the strength of the steering force when avoidEdges = true.
 * @param {number} [opt_options.bounciness = 0.75] Set the strength of the rebound when an object is outside the
 * world's bounds and wrapEdges = false.
 * @param {number} [opt_options.maxSteeringForce = 10] Set the maximum strength of any steering force.
 * @param {number} [opt_options.turningRadius = 60] Used to calculate steering force with key control.
 * @param {number} [opt_options.thrust = 5] Used to apply forward motion with key control.
 * @param {boolean} [opt_options.flocking = false] Set to true to apply flocking forces to this object.
 * @param {number} [opt_options.desiredSeparation = Twice the object's default width] Sets the desired separation from other objects when flocking = true.
 * @param {number} [opt_options.separateStrength = 1] The strength of the force to apply to separating when flocking = true.
 * @param {number} [opt_options.alignStrength = 1] The strength of the force to apply to aligning when flocking = true.
 * @param {number} [opt_options.cohesionStrength = 1] The strength of the force to apply to cohesion when flocking = true.
 * @param {Object} [opt_options.flowField = null] If a flow field is set, object will use it to apply a force.
 * @param {function} [opt_options.beforeStep = ''] A function to run before the step() function.
 * @param {function} [opt_options.afterStep = ''] A function to run after the step() function.
 */


function Agent(opt_options) {

  'use strict';

  var options = opt_options || {};

  exports.Element.call(this, options);

  this.mass = options.mass || 10;
  this.maxSpeed = options.maxSpeed === 0 ? 0 : options.maxSpeed || 10;
  this.minSpeed = options.minSpeed || 0;
  this.motorSpeed = options.motorSpeed || 0;
  this.lifespan = options.lifespan === 0 ? 0 : options.lifespan || -1;
  this.offsetDistance = options.offsetDistance === 0 ? 0 : options.offsetDistance|| 30;
  this.offsetAngle = options.offsetAngle || 0;
  this.pointToDirection = options.pointToDirection === false ? false : options.pointToDirection || true;
  this.followMouse = !!options.followMouse;
  this.seekTarget = options.seekTarget || null;
  this.followTarget = options.followTarget || null;
  this.isStatic = !!options.isStatic;
  this.draggable = !!options.draggable;
  this.checkEdges = options.checkEdges === false ? false : options.checkEdges || true;
  this.wrapEdges = !!options.wrapEdges;
  this.avoidEdges = !!options.avoidEdges;
  this.avoidEdgesStrength = options.avoidEdgesStrength === 0 ? 0 : options.avoidEdgesStrength || 200;
  this.bounciness = options.bounciness === 0 ? 0 : options.bounciness || 0.75;
  this.maxSteeringForce = options.maxSteeringForce === 0 ? 0 : options.maxSteeringForce || 100;
  this.turningRadius = options.turningRadius === 0 ? 0 : options.turningRadius || 90;
  this.thrust = options.thrust === 0 ? 0 : options.thrust || 5;
  this.flocking = !!options.flocking;
  this.desiredSeparation = options.desiredSeparation === 0 ? 0 : options.desiredSeparation || this.width * 2;
  this.separateStrength = options.separateStrength === 0 ? 0 : options.separateStrength || 0.3;
  this.alignStrength = options.alignStrength === 0 ? 0 : options.alignStrength || 0.2;
  this.cohesionStrength = options.cohesionStrength === 0 ? 0 : options.cohesionStrength || 0.1;
  this.flowField = options.flowField || null;
  this.beforeStep = options.beforeStep || undefined;
  this.afterStep = options.afterStep || undefined;

  var mouseover = (function (me) {
    return (function(e) {
      exports.Element.mouseover(e, me);
    });
  })(this);

  var mousedown = (function (me) {
    return (function(e) {
      exports.Element.mousedown(e, me);
    });
  })(this);

  var mousemove = (function (me) {
    return (function(e) {
      exports.Element.mousemove(e, me);
    });
  })(this);

  var mouseup = (function (me) {
    return (function(e) {
      exports.Element.mouseup(e, me);
    });
  })(this);

  var mouseout = (function (me) {
    return (function(e) {
      exports.Element.mouseout(e, me);
    });
  })(this);

  if (this.draggable) {
    exports.Utils.addEvent(this.el, 'mouseover', mouseover);
    exports.Utils.addEvent(this.el, 'mousedown', mousedown);
    exports.Utils.addEvent(this.el, 'mousemove', mousemove);
    exports.Utils.addEvent(this.el, 'mouseup', mouseup);
    exports.Utils.addEvent(this.el, 'mouseout', mouseout);
  }
}
exports.Utils.extend(Agent, exports.Element);



Agent.prototype.name = 'Agent';

/**
 * Called every frame, step() updates the instance's properties.
 */
Agent.prototype.step = function() {

  'use strict';

  var i, max, dir, friction, force, r, theta, x, y, sensor, className, sensorActivated,
    world = this.world, elements = exports.elementList.all();

  //

  if (this.beforeStep) {
    this.beforeStep.apply(this);
  }

  //

  if (!this.isStatic && !this.isPressed) {

    // APPLY FORCES -- start

    if (exports.liquids.length > 0) { // liquid
      for (i = 0, max = exports.liquids.length; i < max; i += 1) {
        if (this.id !== exports.liquids[i].id && this.isInside(exports.liquids[i])) {
          force = this.drag(exports.liquids[i]);
          this.applyForce(force);
          className = exports.liquids[i].className + ' activated';
          exports.liquids[i].el.className = className;
        }
      }
    }

    if (exports.repellers.length > 0) { // repeller
      for (i = 0, max = exports.repellers.length; i < max; i += 1) {
        if (this.id !== exports.repellers[i].id) {
          force = this.attract(exports.repellers[i]);
          this.applyForce(force);
        }
      }
    }

    if (exports.attractors.length > 0) { // attractor
      for (i = 0, max = exports.attractors.length; i < max; i += 1) {
        if (this.id !== exports.attractors[i].id) {
          force = this.attract(exports.attractors[i]);
          this.applyForce(force);
        }
      }
    }

    if (this.sensors.length > 0) { // Sensors
      for (i = 0, max = this.sensors.length; i < max; i += 1) {

        sensor = this.sensors[i];

        r = sensor.offsetDistance; // use angle to calculate x, y
        theta = exports.Utils.degreesToRadians(this.angle + sensor.offsetAngle);
        x = r * Math.cos(theta);
        y = r * Math.sin(theta);

        sensor.location.x = this.location.x;
        sensor.location.y = this.location.y;
        sensor.location.add(new exports.Vector(x, y)); // position the sensor

        if (sensor.activated) {
          this.applyForce(sensor.getActivationForce({
            agent: this
          }));
          sensorActivated = true;
        }

      }
    }

    /**
     * If no sensors were activated and this.motorSpeed != 0,
     * apply a force in the direction of the current velocity.
     */
    if (!sensorActivated && this.motorSpeed) {
      dir = exports.Utils.clone(this.velocity);
      dir.normalize();
      if (this.velocity.mag() > this.motorSpeed) { // decelerate to defaultSpeed
        dir.mult(-this.motorSpeed);
      } else {
        dir.mult(this.motorSpeed);
      }
      this.applyForce(dir); // constantly applies a force
    }

    if (world.c) { // friction
      friction = exports.Utils.clone(this.velocity);
      friction.mult(-1);
      friction.normalize();
      friction.mult(world.c);
      this.applyForce(friction);
    }

    this.applyForce(world.wind); // wind

    this.applyForce(world.gravity); // gravity

    if (this.followMouse) { // follow mouse
      var t = {
        location: new exports.Vector(exports.mouse.loc.x, exports.mouse.loc.y)
      };
      this.applyForce(this.seek(t));
    }

    if (this.seekTarget) { // seek target
      this.applyForce(this.seek(this.seekTarget));
    }

    if (this.flowField) { // follow flow field
      var res = this.flowField.resolution,
        col = Math.floor(this.location.x/res),
        row = Math.floor(this.location.y/res),
        loc, target;

      if (this.flowField.field[col]) {
        loc = this.flowField.field[col][row];
        if (loc) { // sometimes loc is not available for edge cases
          this.followTargetVector.x = loc.x;
          this.followTargetVector.y = loc.y;
        } else {
          this.followTargetVector.x = this.location.x;
          this.followTargetVector.y = this.location.y;
        }
        target = {
          location: this.followTargetVector
        };
        this.applyForce(this.follow(target));
      }

    }

    if (this.flocking) {
      this.flock(elements);
    }

    if (this.avoidEdges) {
      this.checkAvoidEdges();
    }

    // end -- APPLY FORCES

    this.velocity.add(this.acceleration); // add acceleration

    if (this.maxSpeed) {
      this.velocity.limit(this.maxSpeed); // check if velocity > maxSpeed
    }

    if (this.minSpeed) {
      this.velocity.limitLow(this.minSpeed); // check if velocity < minSpeed
    }

    this.location.add(this.velocity); // add velocity

    if (this.pointToDirection) { // object rotates toward direction
      if (this.velocity.mag() > 0.1) {
        this.angle = exports.Utils.radiansToDegrees(Math.atan2(this.velocity.y, this.velocity.x));
      }
    }

    if (this.controlCamera) { // check camera after velocity calculation
      this.checkCameraEdges();
    }

    if (this.checkEdges || this.wrapEdges) {
      this.checkWorldEdges(world);
    }


    if (this.parent) { // parenting

        if (this.offsetDistance) {

          r = this.offsetDistance; // use angle to calculate x, y
          theta = exports.Utils.degreesToRadians(this.parent.angle + this.offsetAngle);
          x = r * Math.cos(theta);
          y = r * Math.sin(theta);

          this.location.x = this.parent.location.x;
          this.location.y = this.parent.location.y;
          this.location.add(new exports.Vector(x, y)); // position the child

        } else {
          this.location = this.parent.location;
        }

    }

    //

    if (this.afterStep) {
      this.afterStep.apply(this);
    }

    this.acceleration.mult(0); // reset acceleration

    if (this.lifespan > 0) {
      this.lifespan -= 1;
    }
  }
};

/**
 * Applies a force to this object's acceleration via F = M * A.
 *
 * @param {Object} force The force to be applied (expressed as a vector).
 */
Agent.prototype.applyForce = function(force) {

  'use strict';

  this.applyForceVector.x = force.x;
  this.applyForceVector.y = force.y;

  this.applyForceVector.div(this.mass);
  this.acceleration.add(this.applyForceVector);
};

/**
 * Calculates a steering force to apply to an object seeking another object.
 *
 * @param {Object} target The object to seek.
 * @returns {Object} The force to apply.
 */
Agent.prototype.seek = function(target) {

  'use strict';

  var world = this.world,
    desiredVelocity = exports.Vector.VectorSub(target.location, this.location),
    distanceToTarget = desiredVelocity.mag();

  desiredVelocity.normalize();

  if (distanceToTarget < world.width/2) {
    var m = exports.Utils.map(distanceToTarget, 0, world.width/2, 0, this.maxSpeed);
    desiredVelocity.mult(m);
  } else {
    desiredVelocity.mult(this.maxSpeed);
  }

  desiredVelocity.sub(this.velocity);
  desiredVelocity.limit(this.maxSteeringForce);

  return desiredVelocity;
};

/**
 * Calculates a steering force to apply to an object following another object.
 * Agents with flow fields will use this method to calculate a steering force.
 *
 * @param {Object} target The object to follow.
 * @returns {Object} The force to apply.
 */
Agent.prototype.follow = function(target) {

  'use strict';

  this.followDesiredVelocity.x = target.location.x;
  this.followDesiredVelocity.y = target.location.y;

  this.followDesiredVelocity.mult(this.maxSpeed);
  this.followDesiredVelocity.sub(this.velocity);
  this.followDesiredVelocity.limit(this.maxSteeringForce);

  return this.followDesiredVelocity;
};

/**
 * Bundles flocking behaviors (separate, align, cohesion) into one call.
 */
Agent.prototype.flock = function(elements) {

  'use strict';

  this.applyForce(this.separate(elements).mult(this.separateStrength));
  this.applyForce(this.align(elements).mult(this.alignStrength));
  this.applyForce(this.cohesion(elements).mult(this.cohesionStrength));
};

/**
 * Loops through a passed elements array and calculates a force to apply
 * to avoid all elements.
 *
 * @param {array} elements An array of Flora elements.
 * @returns {Object} A force to apply.
 */
Agent.prototype.separate = function(elements) {

  'use strict';

  var i, max, element, diff, d,
  sum, count = 0, steer;

  this.separateSumForceVector.x = 0;
  this.separateSumForceVector.y = 0;
  sum = this.separateSumForceVector;

  for (i = 0, max = elements.length; i < max; i += 1) {
    element = elements[i];
    if (this.className === element.className && this.id !== element.id) {

      d = this.location.distance(element.location);

      if ((d > 0) && (d < this.desiredSeparation)) {
        diff = exports.Vector.VectorSub(this.location, element.location);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count += 1;
      }
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    sum.sub(this.velocity);
    sum.limit(this.maxSteeringForce);
    return sum;
  }
  return this.zeroForceVector;
};

/**
 * Loops through a passed elements array and calculates a force to apply
 * to align with all elements.
 *
 * @param {array} elements An array of Flora elements.
 * @returns {Object} A force to apply.
 */
Agent.prototype.align = function(elements) {

  'use strict';

  var i, max, element, d,
    neighbordist = this.width * 2,
    sum, count = 0, steer;

  this.alignSumForceVector.x = 0;
  this.alignSumForceVector.y = 0;
  sum = this.alignSumForceVector;

  for (i = 0, max = elements.length; i < max; i += 1) {
    element = elements[i];
    d = this.location.distance(element.location);

    if ((d > 0) && (d < neighbordist)) {
      if (this.className === element.className && this.id !== element.id) {
        sum.add(element.velocity);
        count += 1;
      }
    }
  }

  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    sum.sub(this.velocity);
    sum.limit(this.maxSteeringForce);
    return sum;
  }
  return this.zeroForceVector;
};

/**
 * Loops through a passed elements array and calculates a force to apply
 * to stay close to all elements.
 *
 * @param {array} elements An array of Flora elements.
 * @returns {Object} A force to apply.
 */
Agent.prototype.cohesion = function(elements) {

  'use strict';

  var i, max, element, d,
    neighbordist = 10,
    sum, count = 0, desiredVelocity, steer;

  this.cohesionSumForceVector.y = 0;
  this.cohesionSumForceVector.y = 0;
  sum = this.cohesionSumForceVector;

  for (i = 0, max = elements.length; i < max; i += 1) {
    element = elements[i];
    d = this.location.distance(element.location);

    if ((d > 0) && (d < neighbordist)) {
      if (this.className === element.className && this.id !== element.id) {
        sum.add(element.location);
        count += 1;
      }
    }
  }

  if (count > 0) {
    sum.div(count);
    sum.sub(this.location);
    sum.normalize();
    sum.mult(this.maxSpeed);
    sum.sub(this.velocity);
    sum.limit(this.maxSteeringForce);
    return sum;
  }
  return this.zeroForceVector;
};

/**
 * Calculates a force to apply to flee a target. The force is the inverse
 * of the object's maximum speed.
 *
 * @param {Object} target The object to flee from.
 * @returns {Object} A force to apply.
 */
Agent.prototype.flee = function(target) {

  'use strict';

  var desiredVelocity = exports.Vector.VectorSub(target.location, this.location); // find vector pointing at target

  desiredVelocity.normalize(); // reduce to 1
  desiredVelocity.mult(-this.maxSpeed); // multiply by maxSpeed in opposite direction

  return desiredVelocity;
};

/**
 * Calculates a force to apply to simulate drag on an object.
 *
 * @param {Object} target The object that is applying the drag force.
 * @returns {Object} A force to apply.
 */
Agent.prototype.drag = function(target) {

  'use strict';

  var speed = this.velocity.mag(),
    dragMagnitude = -1 * target.c * speed * speed, // drag magnitude
    drag = exports.Utils.clone(this.velocity);

  drag.normalize(); // drag direction
  drag.mult(dragMagnitude);

  return drag;
};

/**
 * Calculates a force to apply to simulate attraction on an object.
 *
 * @param {Object} attractor The attracting object.
 * @returns {Object} A force to apply.
 */
Agent.prototype.attract = function(attractor) {

  'use strict';

  var force = exports.Vector.VectorSub(attractor.location, this.location),
    distance, strength;

  distance = force.mag();
  distance = exports.Utils.constrain(distance, this.width * this.height/8, attractor.width * attractor.height); // min = scale/8 (totally arbitrary); max = scale; the size of the attractor
  force.normalize();
  strength = (attractor.G * attractor.mass * this.mass) / (distance * distance);
  force.mult(strength);

  return force;
};

/**
 * Determines if this object is inside another.
 *
 * @param {Object} container The containing object.
 * @returns {boolean} Returns true if the object is inside the container.
 */
Agent.prototype.isInside = function(container) {

  'use strict';

  if (container) {
    if (this.location.x + this.width/2 > container.location.x - container.width/2 &&
      this.location.x - this.width/2 < container.location.x + container.width/2 &&
      this.location.y + this.height/2 > container.location.y - container.height/2 &&
      this.location.y - this.height/2 < container.location.y + container.height/2) {
      return true;
    }
  }
  return false;
};

/**
 * Checks if object is within range of a world edge. If so, steers the object
 * in the opposite direction.
 */
Agent.prototype.checkAvoidEdges = function() {

  var maxSpeed, desiredVelocity;

  if (this.location.x < this.avoidEdgesStrength) {
    maxSpeed = this.maxSpeed;
  } else if (this.location.x > this.world.width - this.avoidEdgesStrength) {
    maxSpeed = -this.maxSpeed;
  }
  if (maxSpeed) {
    desiredVelocity = new exports.Vector(maxSpeed, this.velocity.y);
    desiredVelocity.sub(this.velocity);
    desiredVelocity.limit(this.maxSteeringForce);
    this.applyForce(desiredVelocity);
  }

  if (this.location.y < this.avoidEdgesStrength) {
    maxSpeed = this.maxSpeed;
  } else if (this.location.y > this.world.height - this.avoidEdgesStrength) {
    maxSpeed = -this.maxSpeed;
  }
  if (maxSpeed) {
    desiredVelocity = new exports.Vector(this.velocity.x, maxSpeed);
    desiredVelocity.sub(this.velocity);
    desiredVelocity.limit(this.maxSteeringForce);
    this.applyForce(desiredVelocity);
  }
};

/**
 * Determines if this object is outside the world bounds.
 *
 * @param {Object} world The world object.
 * @returns {boolean} Returns true if the object is outside the world.
 */
Agent.prototype.checkWorldEdges = function(world) {

  'use strict';

  var x = this.location.x,
    y = this.location.y,
    velocity = this.velocity,
    desiredVelocity,
    steer,
    maxSpeed,
    check = false;

  // transform origin is at the center of the object

  if (this.wrapEdges) {
    if (this.location.x > world.width) {
      this.location.x = 0;
      check = true;
      if (this.controlCamera) {
        this.cameraDiffVector.x = x - this.location.x;
        this.cameraDiffVector.y = 0;
      }
    } else if (this.location.x < 0) {
      this.location.x = world.width;
      check = true;
      if (this.controlCamera) {
        this.cameraDiffVector.x = x - this.location.x;
        this.cameraDiffVector.y = 0;
      }
    }
  } else {
    if (this.location.x + this.width/2 > world.width) {
      this.location.x = world.width - this.width/2;
      velocity.x *= -1 * this.bounciness;
      check = true;
      if (this.controlCamera) {
        this.cameraDiffVector.x = x - this.location.x;
        this.cameraDiffVector.y = 0;
      }
    } else if (this.location.x < this.width/2) {
      this.location.x = this.width/2;
      velocity.x *= -1 * this.bounciness;
      check = true;
      if (this.controlCamera) {
       this.cameraDiffVector.x = x - this.location.x;
        this.cameraDiffVector.y = 0;
      }
    }
  }

  ////

  if (this.wrapEdges) {
    if (this.location.y > world.height) {
      this.location.y = 0;
      check = true;
      if (this.controlCamera) {
        this.cameraDiffVector.x = 0;
        this.cameraDiffVector.y = y - this.location.y;
      }
    } else if (this.location.y < 0) {
      this.location.y = world.height;
      check = true;
      if (this.controlCamera) {
        this.cameraDiffVector.x = 0;
        this.cameraDiffVector.y = y - this.location.y;
      }
    }
  } else {
    if (this.location.y + this.height/2 > world.height) {
      this.location.y = world.height - this.height/2;
      this.velocity.y *= -1 * this.bounciness;
      check = true;
      if (this.controlCamera) {
       this.cameraDiffVector.x = 0;
        this.cameraDiffVector.y = y - this.location.y;
      }
    } else if (this.location.y < this.height/2) {
      this.location.y = this.height/2;
      this.velocity.y *= -1 * this.bounciness;
      check = true;
      if (this.controlCamera) {
        this.cameraDiffVector.x = 0;
        this.cameraDiffVector.y = y - this.location.y;
      }
    }
  }

  if (check && this.controlCamera) {
    world.location.add(this.cameraDiffVector); // add the distance difference to World.location
  }
  return check;
};

/**
 * Moves the world in the opposite direction of the Camera's controlObj.
 */
Agent.prototype.checkCameraEdges = function() {

  'use strict';

  this.checkCameraEdgesVector.x = this.velocity.x;
  this.checkCameraEdgesVector.y = this.velocity.y;

  this.world.location.add(this.checkCameraEdgesVector.mult(-1));
};

/**
 * Returns this object's location.
 *
 * @param {string} [type] If no type is supplied, returns a clone of this object's location.
                          Accepts 'x', 'y' to return their respective values.
 * @returns {boolean} Returns true if the object is outside the world.
 */
Agent.prototype.getLocation = function (type) {

  'use strict';

  if (!type) {
    return new exports.Vector(this.location.x, this.location.y);
  } else if (type === 'x') {
    return this.location.x;
  } else if (type === 'y') {
    return this.location.y;
  }
};

/**
 * Returns this object's velocity.
 *
 * @param {string} [type] If no type is supplied, returns a clone of this object's velocity.
                          Accepts 'x', 'y' to return their respective values.
 * @returns {boolean} Returns true if the object is outside the world.
 */
Agent.prototype.getVelocity = function (type) {

  'use strict';

  if (!type) {
    return new exports.Vector(this.location.x, this.location.y);
  } else if (type === 'x') {
    return this.velocity.x;
  } else if (type === 'y') {
    return this.velocity.y;
  }
};

exports.Agent = Agent;

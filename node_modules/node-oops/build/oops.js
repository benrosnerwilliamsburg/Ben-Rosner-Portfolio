;(function(undefined) {
  "use strict";

  var $scope
  , inferFromName = function (f) { return f.name; }
  , conflict, conflictResolution = [], obstructions = [];
  if (typeof global == 'object' && global) {
    $scope = global;
    conflict = global.oops;
  } else if (typeof window !== 'undefined'){
    $scope = window;
    conflict = window.oops;
    if (typeof (function x(){}).name == 'undefined') {
      // the environment doens't report an anonymous function's name (IE?)
      // parse it out of the toString.
      inferFromName = function(f) {
        var n = f.toString().match(/^function\s*(?:\s+([\w\$]*))?\s*\(/);
        return (n) ? n[1] : "";
      }
    }
  } else {
    $scope = {};
  }
  if (conflict) {
    conflictResolution.push(
      function() {
        if ($scope.oops === Define) {
          $scope.oops = conflict;
          conflict = undefined;
        }
      });
  }

  function dbc(requirements, description) {
    requirements = (Array.isArray(requirements)) ? requirements : [requirements];
    var i, disposition;
    for(i = 0; i < requirements.length; i++) {
      var req = requirements[i];
      disposition = (typeof req === 'function') ? req() : (req);
      if(!disposition) {
        description = description || 'Failed contract requirement:'.concat(req);
        throw new ContractError((typeof description === 'function') ? description() : description);
      }
    }
  }

  function val(target, name, value, descriptor) {
    dbc([typeof name === 'string'], "Invalid property name [String].");
    descriptor = descriptor || {};
    descriptor.value = value;
    Object.defineProperty(target, name, descriptor);
  }

  function meth(target, name, method, descriptor) {
    dbc([!method || typeof method === 'function'], "Invalid method [Function].");
    descriptor = descriptor || {};
    val(target, name, method, descriptor);
  }

  function prop(target,name,get,set,descriptor) {
    dbc([typeof name === 'string'], "Invalid property name [String].");
    dbc([!get || typeof get === 'function'], "Invalid getter [Function].");
    dbc([!set || typeof set === 'function'], "Invalid setter [Function].");
    descriptor = descriptor || {};
    delete descriptor.writable; // not valid for properties.
    if (get) { descriptor.get = get; }
    if (set) { descriptor.set = set; }
    Object.defineProperty(target, name, descriptor);
  }

  function CEW(c,e,w){
    // set from actual booleans, not from truthy args.
    var d = {};
      if(c === true) { d.configurable = true; }
      if(e === true) { d.enumerable = true; }
      if(w === true) { d.writable = true; }
      return d;
  }

  function cloneDesc(d) {
    d = d || {};
    return CEW(d.configurable, d.enumerable, d.writable);
  }

  function Define(it, abs){
    /** Ensure declarations are applied to either an instance or its prototype,
    but not the function (Ctor) itself (unless instructed so by 'abs')... */
    var target = it;
    if(!abs && typeof it.prototype === 'object' && typeof it.prototype.constructor === 'function') {
      target = it.prototype;
    }
    val(this, '_it', target);
    val(this, '_d', {});
  }

  Object.defineProperties(Define.prototype, {
    enumerable: {
      get: function() { this._d.enumerable = true; return this; },
      enumerable: true
    },
    configurable: {
      get: function() { this._d.configurable = true; return this; },
      enumerable: true
    },
    writable: {
      get: function() { this._d.writable = true; return this; },
      enumerable: true
    },
    value: {
      value: function(name, value) {
        val(this._it, name, value, cloneDesc(this._d));
        return this;
      },
      enumerable: true
    },
    method: {
      value: function(name, method) {
        var typeofName = typeof name;
        dbc([typeofName === 'string' || typeofName === 'function'], "Either the method or its name must be provided as the first argument.");
        if (typeofName === 'function') {
          dbc([typeof method === 'undefined'], "When the method is given as first argument, additional arguments indicate an error on the part of the caller.");
          meth(this._it, inferFromName(name), name, cloneDesc(this._d));
        } else {
          dbc([typeof method !== 'undefined'], "When the method's name is provided as the first argument the method must appear as the second.");
          meth(this._it, name, method, cloneDesc(this._d));
        }
        return this;
      },
      enumerable: true
    },
    property: {
      value: function(name, get, set) {
        var typeofName = typeof name;
        dbc([typeofName === 'string' || typeofName === 'function'], "Either the property's name or it's getter [Function] must be provided as the first argument.");
        var d = this._d
        if (typeofName === 'function') {
          /** When first arg is [Function] treat it as a getter.
          The property's name is taken from the getter. (args shift 1 left) */
          prop(this._it, inferFromName(name), name, get, cloneDesc(this._d));
        } else {
          prop(this._it, name, get, set, cloneDesc(this._d));
        }
        return this;
      },
      enumerable: true
    }
  });

  // nodejs compatible on server side and in the browser.
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  /**
  * Factory for Define.
  */
  function create(it, abs) {
    return new Define(it || this, abs);
  }

  if (Object.getOwnPropertyDescriptor(Object.prototype, 'defines')) {
    obstructions.push('defines');
  } else {
    Object.defineProperties(Object.prototype, {
      defines: {
        get: create,
        configurable: true
      }
    });
    conflictResolution.push(function() {
      delete Object.prototype.defines;
      obstructions.push('defines');
    });
  }

  if (Object.getOwnPropertyDescriptor(Function.prototype, 'inherits')) {
    obstructions.push('inherits');
  } else {
    Object.defineProperties(Function.prototype, {
      inherits: {
        value:
        function (superCtor) {
          inherits(this, superCtor);
          // Prevent multiple inheritance (no intentional support)...
          // user should duck type if they must behave like a catdog.
          this.inherits = undefined;
        },
        configurable: true
      }
    });
    conflictResolution.push(function() {
      delete Function.prototype.inherits;
      obstructions.push('inherits');
    });
  }

  function obstructed(which) {
    return which && obstructions.indexOf(which) >= 0;
  }

  function noConflict() {
    if (conflictResolution) {
      conflictResolution.forEach(function (it) { it(); });
      conflictResolution = null;
    }
    return Define;
  }

  function ContractError(message) {
    ContractError.super_.call(this, message);
    (new Define(this)).value('message', message || '');
  }
  inherits(ContractError, Error);

  (new Define(ContractError)).configurable.enumerable.method(function toString() {
    return 'ContractError: '.concat(this.message);
  });

  (new Define(Define, true)).enumerable
  .method(dbc)
  .method(Define)
  .method(create)
  .method(ContractError)
  .method(inherits)
  .method(noConflict)
  .method(obstructed)
  ;

  if (typeof module != 'undefined' && module && typeof exports == 'object' && exports && module.exports === exports) {
    // Yay! probably nodejs
    module.exports = Define;
  } else {
    // hrm. browser?
    $scope.oops = Define;
  }
}());
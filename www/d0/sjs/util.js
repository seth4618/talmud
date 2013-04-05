/**
 * Util
 * general utility functions
 *
 * @constructor
 **/
function Util() {}


/**
 * inherits
 *
 * COPIED from nodejs util.js exports.inherits.  Copy here for compiler type checker
 * 
 * @param {Object} ctor
 * @param {Object} superCtor
 * @return {undefined}
 **/
Util.inherits = function(ctor, superCtor) 
{
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

/**
 * curry
 * curry a function and return a closure with args bound
 *
 * @param {...*} xargs
 * @return {!Function}
 **/
Function.prototype.curry = function(xargs) {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function() {
	return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments)));
    };
};


Util.romanize = function(num) {
    var lookup = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],
		  ['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
    var len = lookup.length;
    var roman = [];
    for (var i=0; i<len; i++) {
	var letter = lookup[i][0];
	while (num >= lookup[i][1]) {
	    roman.push(letter);
	    num -= lookup[i][1];
	}
    }
    return roman.join('');
};

/**
 * fatal
 * a fatal error occurred.  Do something smart
 *
 * @param {...*} xargs
 **/
Util.fatal = function(xargs)
{
    console.log(xargs);
    throw Error(xargs);
};

/**
 * error
 * an error occurred.  Do something smart
 *
 * @param {...*} xargs
 **/
Util.error = function(xargs)
{
    console.log(xargs);
};

/**
 * error
 * an error occurred.  Do something smart
 *
 * @param {...*} xargs
 **/
Util.info = function(xargs)
{
    console.log(xargs);
};

/**
 * assert
 *
 * @param {*} x					assertion to evalute. if true, do nothing
 * @param {!string=} msg		msg to output if x is false
 */
Util.assert = function(x, msg) {
    if (!!x) return;
    msg = msg ? msg : 'failed assert with no message';
    msg = 'FAILED ASSERT: ' + msg;
    Util.fatal(msg);
}

/** @type {Object.<number,!Array.<!function()>>} */ Util.readyHooks = {};
/** @type {Object.<number,!Array.<!function(!function())>>} */ Util.asynchReadyHooks = {};
/** @type {number} */ Util.nextHook = 0;
/** @type {number} */ Util.hookPhase = 0;
/** @type {Array.<!function(!function())>} */ Util.AsynchHookList = [];

/**
 * addReadyHook
 * add hook to list of functions to run when document is ready.
 * hook < 0: put at start of functions to be run
 * hook == 0: put anywhere
 * hook > 0: put at end
 *
 * @param {number} order
 * @param {function()} hook
 **/
Util.addReadyHook = function(order, hook) {
    if (!(order in Util.readyHooks)) {
	    Util.readyHooks[order] = [];
    }
    Util.readyHooks[order].push(hook);
};

/**
 * addAsynchReadyHook
 * add hook to list of functions which are ASYNCH to run when document is ready.
 * each of these functions will be run when the previous issues its callback.
 * When all are done, the readyhook functions will be run
 * hook < 0: put at start of functions to be run
 * hook == 0: put anywhere
 * hook > 0: put at end
 *
 * @param {number} order
 * @param {function(cb)} hook
 **/
Util.addAsynchReadyHook = function(order, hook) {
    if (!(order in Util.asynchReadyHooks)) {
	    Util.asynchReadyHooks[order] = [];
    }
    Util.asynchReadyHooks[order].push(hook);
};

/**
 * sortHookList
 * sort a hook list and return array
 *
 * @private
 * @param {Object.<number,!Array>} list
 * @return {!Array}
 **/
Util.sortHookList = function(list)
{
    var result = [];
	var keys = [];
	for (var i in list) {
		keys.push(i);
	}
	
	keys.sort(function(a,b)	{return a - b;});
	var len = keys.length;
	var i;
	for (i=0; i<len; i++) {
		var arr = list[keys[i]];
		var alen = arr.length;
		var j;
		for (j=0; j<alen; j++) {
            result.push(arr[j]);
		}
    }
    return result;
};

Util.executeHooks = function()
{
    if (Util.nextHook < Util.HookList.length) {
        var f = Util.HookList[Util.nextHook++];
        f(Util.executeHooks);
        return;
    }
    // if we get here, then we have finished the asynch calls, so execute synch ones
    var list = Util.sortHookList(Util.readyHooks);
    for (var i=0; i<list.length; i++) {
        var f = list[i];
        f();
    }
};

Util.getType = function(x) { if (x === undefined) return "undefined"; return x.constructor.name; }

$(document).ready(function() 
{
    // first process all asynch hooks
    Util.HookList = Util.sortHookList(Util.asynchReadyHooks);
    Util.nextHook = 0;
    Util.hookPhase = 0;
    Util.executeHooks();
});

if (typeof window === 'undefined') {
    console.log('running in node');
    module.exports = Util;
}

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:

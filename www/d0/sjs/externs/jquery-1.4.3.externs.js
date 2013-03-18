/*
 * Copyright 2010 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @constructor
 */
function TopLeft() {}
/** @type{number} */ TopLeft.prototype.top;
/** @type{number} */ TopLeft.prototype.left;

/**
 * @fileoverview Externs for jQuery 1.4.3.
 * Note that some functions use different return types depending on the number
 * of parameters passed in. In these cases, you may need to annotate the type
 * of the result in your code, so the JSCompiler understands which type you're
 * expecting. For example:
 *    <code>var elt = /** @type {Element} * / (foo.get(0));</code>
 * @see http://api.jquery.com/
 * @externs
 */

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject|Array|Object|function())=} arg1
 * @param {(Element|jQueryObject|Document|Object)=} arg2
 * @return {jQueryObject}
 */
function $(arg1, arg2) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject|Array|Object|function())=} arg1
 * @param {(Element|jQueryObject|Document|Object)=} arg2
 * @return {jQueryObject}
 */
function jQuery(arg1, arg2) {};

/**
 * @param {Object.<string,*>} settings
 * @return {XMLHttpRequest}
 */
jQuery.ajax = function(settings) {};

/** @param {Object.<string,*>} options */
jQuery.ajaxSetup = function(options) {};

/** @type {boolean} */
jQuery.boxModel;

/** @type {Object.<string,*>} */
jQuery.browser;

/** @type {string} */
jQuery.browser.version;

/**
 * @param {Element} container
 * @param {Element} contained
 * @return {boolean}
 */
jQuery.contains = function(container, contained) {};

/**
 * @param {Element} elem
 * @param {string=} key
 * @param {(number|Object)=} value
 * @return {(jQueryObject|Object)}
 */
jQuery.data = function(elem, key, value) {};

/**
 * @param {Element} elem
 * @param {string=} queueName
 * @return {jQueryObject}
 */
jQuery.dequeue = function(elem, queueName) {};

/**
 * @param {Object} collection
 * @param {function(number,*)} callback
 * @return {Object}
 */
jQuery.each = function(collection, callback) {};

/** @param {string} message */
jQuery.error = function(message) {};

/**
 * @constructor
 * @param {string} eventType
 */
jQuery.event = function(eventType) {};

/** @type {Element} */
jQuery.event.prototype.currentTarget;

/** @type {*} */
jQuery.event.prototype.data;

/** @return {boolean} */
jQuery.event.prototype.isDefaultPrevented = function() {};

/** @return {boolean} */
jQuery.event.prototype.isImmediatePropagationStopped = function() {};

/** @return {boolean} */
jQuery.event.prototype.isPropagationStopped = function() {};

/** @type {string} */
jQuery.event.prototype.namespace;

/** @type {number} */
jQuery.event.prototype.pageX;

/** @type {number} */
jQuery.event.prototype.pageY;

/** @return {undefined} */
jQuery.event.prototype.preventDefault = function() {};

/** @type {Element} */
jQuery.event.prototype.relatedTarget;

/** @type {Object} */
jQuery.event.prototype.result;

/** @return {undefined} */
jQuery.event.prototype.stopImmediatePropagation = function() {};

/** @return {undefined} */
jQuery.event.prototype.stopPropagation = function() {};

/** @type {Element} */
jQuery.event.prototype.target;

/** @type {number} */
jQuery.event.prototype.timeStamp;

/** @type {string} */
jQuery.event.prototype.type;

/** @type {string} */
jQuery.event.prototype.which;

/** @type {boolean} */
jQuery.event.prototype.ctrlKey;

/** @type {boolean} */
jQuery.event.prototype.metaKey;

/** @type {Object} */
jQuery.event.prototype.special;  // jQuery API for homemade plugins

/** @type {Object} */
jQuery.event.prototype.originalEvent;  // jQueryEvent's storage of the original window event

/** @return {Object} */
jQuery.event.prototype.fix = function() {};

/**
 * @param {(Object|boolean)=} arg1
 * @param {Object=} arg2
 * @param {Object=} arg3
 * @param {Object=} objectN
 * @return {Object}
 */
jQuery.extend = function(arg1, arg2, arg3, objectN) {};

jQuery.fx = {};

/** @type {number} */
jQuery.fx.interval;

/** @type {boolean} */
jQuery.fx.off;

/**
 * @param {string} url
 * @param {(Object.<string,*>|string)=} data
 * @param {function(string,string,XMLHttpRequest)=} callback
 * @param {string=} dataType
 * @return {XMLHttpRequest}
 */
jQuery.get = function(url, data, callback, dataType) {};

/**
 * @param {string} url
 * @param {Object.<string,*>=} data
 * @param {function(string,string)=} callback
 * @return {XMLHttpRequest}
 */
jQuery.getJSON = function(url, data, callback) {};

/**
 * @param {string} url
 * @param {function(string,string)=} success
 * @return {XMLHttpRequest}
 */
jQuery.getScript = function(url, success) {};

/** @param {string} code */
jQuery.globalEval = function(code) {};

/**
 * @param {Array} arr
 * @param {function(*,number)} fnc
 * @param {boolean=} invert
 * @return {Array}
 */
jQuery.grep = function(arr, fnc, invert) {};

/**
 * @param {*} value
 * @param {Array} arr
 * @return {number}
 */
jQuery.inArray = function(value, arr) {};

/**
 * @param {Object} obj
 * @return {boolean}
 * @nosideeffects
 */
jQuery.isArray = function(obj) {};

/**
 * @param {Object} obj
 * @return {boolean}
 * @nosideeffects
 */
jQuery.isEmptyObject = function(obj) {};

/**
 * @param {Object} obj
 * @return {boolean}
 * @nosideeffects
 */
jQuery.isFunction = function(obj) {};

/**
 * @param {Object} obj
 * @return {boolean}
 * @nosideeffects
 */
jQuery.isPlainObject = function(obj) {};

/**
 * @param {Object} obj
 * @return {boolean}
 * @nosideeffects
 */
jQuery.isWindow = function(obj) {};

/**
 * @param {Element} node
 * @return {boolean}
 * @nosideeffects
 */
jQuery.isXMLDoc = function(node) {};

/**
 * @param {Object} obj
 * @return {Array}
 */
jQuery.makeArray = function(obj) {};

/**
 * @param {Array} arr
 * @param {function(*,number)} callback
 * @return {Array}
 */
jQuery.map = function(arr, callback) {};

/**
 * @param {Array} first
 * @param {Array} second
 * @return {Array}
 */
jQuery.merge = function(first, second) {};

/**
 * @param {boolean=} removeAll
 * @return {Object}
 */
jQuery.noConflict = function(removeAll) {};

/**
 * @return {function()}
 * @nosideeffects
 */
jQuery.noop = function() {};

/**
 * @param {(Array|Object)} obj
 * @param {boolean=} traditional
 * @return {string}
 */
jQuery.param = function(obj, traditional) {};

/**
 * @param {string} json
 * @return {Object}
 */
jQuery.parseJSON = function(json) {};

/**
 * @param {string} url
 * @param {(Object.<string,*>|string)=} data
 * @param {function(string,string,XMLHttpRequest)=} success
 * @param {string=} dataType
 * @return {XMLHttpRequest}
 */
jQuery.post = function(url, data, success, dataType) {};

/**
 * @param {(function()|Object)} arg1
 * @param {(Object|string)} arg2
 * @return {function()}
 */
jQuery.proxy = function(arg1, arg2) {};

/**
 * @param {Element} elem
 * @param {string=} queueName
 * @param {(Array|function())=} arg3
 * @return {(Array|jQueryObject)}
 */
jQuery.queue = function(elem, queueName, arg3) {};

/**
 * @param {Element} elem
 * @param {string=} name
 * @return {jQueryObject}
 */
jQuery.removeData = function(elem, name) {};

/** @type {Object} */
jQuery.support;

/**
 * @param {string} str
 * @return {string}
 * @nosideeffects
 */
jQuery.trim = function(str) {};

/**
 * @param {Object} obj
 * @return {string}
 * @nosideeffects
 */
jQuery.type = function(obj) {};

/**
 * @param {Array} arr
 * @return {Array}
 */
jQuery.unique = function(arr) {};

/**
 * @constructor
 * @private
 */
function jQueryObject() { };

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} arg1
 * @param {Element=} context
 * @return {jQueryObject}
 */
jQueryObject.prototype.add = function(arg1, context) {};

/**
 * @param {(string|function(number,string))} arg1
 * @param {(number|string)=} arg2
 * @param {function()=} arg3
 * @return {jQueryObject}
 */
jQueryObject.prototype.addClass = function(arg1, arg2, arg3) {};

/**
 * @param {(string|Element|jQueryObject|function(number))} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.after = function(arg1) {};

/**
 * @param {function(jQuery.event,XMLHttpRequest,Object.<string, *>)} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ajaxComplete = function(handler) {};

/**
 * @param {function(jQuery.event,XMLHttpRequest,Object.<string, *>,*)} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ajaxError = function(handler) {};

/**
 * @param {function(jQuery.event,XMLHttpRequest,Object.<string, *>)} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ajaxSend = function(handler) {};

/**
 * @param {function()} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ajaxStart = function(handler) {};

/**
 * @param {function()} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ajaxStop = function(handler) {};

/**
 * @param {function(jQuery.event,XMLHttpRequest,Object.<string, *>)} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ajaxSuccess = function(handler) {};

/** @return {jQueryObject} */
jQueryObject.prototype.andSelf = function() {};

/**
 * @param {Object.<string,*>} properties
 * @param {(string|number|Object.<string,*>)=} arg2
 * @param {(string|Function)=} easing
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.animate = function(properties, arg2, easing, callback) {};

/**
 * @param {(string|Element|jQueryObject|function(number,string))} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.append = function(arg1) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} target
 * @return {jQueryObject}
 */
jQueryObject.prototype.appendTo = function(target) {};

/**
 * @param {(string|Object.<string,*>)} arg1
 * @param {(number|Object|string|function(number,string))=} arg2
 * @return {(string|jQueryObject)}
 */
jQueryObject.prototype.attr = function(arg1, arg2) {};

/**
 * @param {(string|Object.<string,*>)} arg1
 * @param {(number|boolean|Object|string|function(number,string))=} arg2
 * @return {(string|jQueryObject)}
 */
jQueryObject.prototype.prop = function(arg1, arg2) {};

/**
 * @param {(string|Element|jQueryObject|function())} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.before = function(arg1) {};

/**
 * @param {(string|Object)} arg1
 * @param {Object=} eventData
 * @param {(function(jQuery.event)|boolean)=} arg3
 * @return {jQueryObject}
 */
jQueryObject.prototype.bind = function(arg1, eventData, arg3) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.blur = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.change = function(arg1, handler) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.children = function(selector) {};

/**
 * @param {string=} queueName
 * @return {jQueryObject}
 */
jQueryObject.prototype.clearQueue = function(queueName) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.click = function(arg1, handler) {};

/**
 * @param {boolean=} withDataAndEvents
 * @return {jQueryObject}
 */
jQueryObject.prototype.clone = function(withDataAndEvents) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject|Array)} arg1
 * @param {Element=} context
 * @return {(jQueryObject|Array)}
 */
jQueryObject.prototype.closest = function(arg1, context) {};

/** @return {jQueryObject} */
jQueryObject.prototype.contents = function() {};

/** @type {Element} */
jQueryObject.prototype.context;

/**
 * @param {(string|Object.<string,*>)} arg1
 * @param {(string|number|function(number,*))=} arg2
 * @return {(string|jQueryObject)}
 */
jQueryObject.prototype.css = function(arg1, arg2) {};

/**
 * @param {(string|Object)=} arg1
 * @param {(boolean|number|Object|string)=} value
 * @return {(jQueryObject|Object|number)}
 */
jQueryObject.prototype.data = function(arg1, value) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.dblclick = function(arg1, handler) {};

/**
 * @param {number} duration
 * @param {string=} queueName
 * @return {jQueryObject}
 */
jQueryObject.prototype.delay = function(duration, queueName) {};

/**
 * @param {string} selector
 * @param {string} eventType
 * @param {(function()|Object)} arg3
 * @param {function()=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.delegate = function(selector, eventType, arg3, handler) {};

/**
 * @param {string=} queueName
 * @return {jQueryObject}
 */
jQueryObject.prototype.dequeue = function(queueName) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.detach = function(selector) {};

/**
 * @param {string=} eventType
 * @param {string=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.die = function(eventType, handler) {};

/**
 * @param {string=} eventType
 * @param {string=} arg2
 * @param {string=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.off = function(eventType, arg2, handler) {};

/**
 * @param {function(number,Element)} fnc
 * @return {jQueryObject}
 */
jQueryObject.prototype.each = function(fnc) {};

/** @return {jQueryObject} */
jQueryObject.prototype.empty = function() {};

/** @return {jQueryObject} */
jQueryObject.prototype.end = function() {};

/**
 * @param {number} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.eq = function(arg1) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.error = function(arg1, handler) {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.fadeIn = function(duration, arg2, callback) {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.fadeOut = function(duration, arg2, callback) {};

/**
 * @param {(string|number)=} duration
 * @param {number=} opacity
 * @param {(function()|string)=} arg3
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.fadeTo = function(duration, opacity, arg3, callback) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject|function(number)|Object)} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.filter = function(arg1) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.find = function(selector) {};

/** @return {jQueryObject} */
jQueryObject.prototype.first = function() {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.focus = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.focusin = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.focusout = function(arg1, handler) {};

/**
 * @param {number=} index
 * @return {(Element|Array)}
 * @nosideeffects
 */
jQueryObject.prototype.get = function(index) {};

/**
 * @param {(string|Element)} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.has = function(arg1) {};

/**
 * @param {string} className
 * @return {boolean}
 */
jQueryObject.prototype.hasClass = function(className) {};

/**
 * @param {(string|number|function(number,number))=} arg1
 * @return {(number|jQueryObject)}
 * @nosideeffects
 */
jQueryObject.prototype.height = function(arg1) {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.hide = function(duration, arg2, callback) {};

/**
 * @param {function(jQuery.event)} arg1
 * @param {function(jQuery.event)=} handlerOut
 * @return {jQueryObject}
 */
jQueryObject.prototype.hover = function(arg1, handlerOut) {};

/**
 * @param {(!jQueryObject|string|function(number,string))=} arg1
 * @return {(string|jQueryObject)}
 */
jQueryObject.prototype.html = function(arg1) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} arg1
 * @return {number}
 */
jQueryObject.prototype.index = function(arg1) {};

/**
 * @return {number}
 * @nosideeffects
 */
jQueryObject.prototype.innerHeight = function() {};

/**
 * @return {number}
 * @nosideeffects
 */
jQueryObject.prototype.innerWidth = function() {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} target
 * @return {jQueryObject}
 */
jQueryObject.prototype.insertAfter = function(target) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} target
 * @return {jQueryObject}
 */
jQueryObject.prototype.insertBefore = function(target) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} selector
 * @return {boolean}
 * @nosideeffects
 */
jQueryObject.prototype.is = function(selector) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.keydown = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.keypress = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.keyup = function(arg1, handler) {};

/** @return {jQueryObject} */
jQueryObject.prototype.last = function() {};

/** @type {number} */
jQueryObject.prototype.length;

/**
 * @param {string} eventType
 * @param {(function()|Object)} arg2
 * @param {function()=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.live = function(eventType, arg2, handler) {};

/**
 * @param {string} eventType
 * @param {(function()|Object|string)} arg2
 * @param {function()=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.on = function(eventType, arg2, handler) {};

/**
 * @param {(function(jQuery.event)|Object|string)=} arg1
 * @param {(function(jQuery.event)|Object.<string,*>|string)=} arg2
 * @param {function(string,string,XMLHttpRequest)=} complete
 * @return {jQueryObject}
 */
jQueryObject.prototype.load = function(arg1, arg2, complete) {};

/**
 * @param {function(number,Element)} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.map = function(callback) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mousedown = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseenter = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseleave = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mousemove = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseout = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseover = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseup = function(arg1, handler) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.next = function(selector) {};

/**
 * @param {string=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.nextAll = function(selector) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.nextUntil = function(selector) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject|function(number))} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.not = function(arg1) {};

/**
 * @param {(Object|function(number,{top:number,left:number}))=} arg1
 * @return {(Object|jQueryObject)}
 * @nosideeffects
 */
jQueryObject.prototype.offset = function(arg1) {};

/** @return {jQueryObject} */
jQueryObject.prototype.offsetParent = function() {};

/**
 * @param {string} eventType
 * @param {Object=} eventData
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.one = function(eventType, eventData, handler) {};

/**
 * @param {boolean=} includeMargin
 * @return {number}
 * @nosideeffects
 */
jQueryObject.prototype.outerHeight = function(includeMargin) {};

/**
 * @param {boolean=} includeMargin
 * @return {number}
 * @nosideeffects
 */
jQueryObject.prototype.outerWidth = function(includeMargin) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.parent = function(selector) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.parents = function(selector) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.parentsUntil = function(selector) {};

// SHOULD REALLY BE !jQueryObject but I can't seem to get that right
// Maybe should also return a jqueryObject if the ui call is the one being made?
/**
 * @param {({my:!string, at:!string, of:jQueryObject, offset:!string}|{my:!string, at:!string, of:jQueryObject})=} opt
 * @return {TopLeft}
 *
 */
//  * @nosideeffects (this isn't true if using jqui version.  Bummer!
jQueryObject.prototype.position = function(opt) {};

/**
 * @param {(string|Element|jQueryObject|function(number,string))} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.prepend = function(arg1) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)} target
 * @return {jQueryObject}
 */
jQueryObject.prototype.prependTo = function(target) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.prev = function(selector) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.prevAll = function(selector) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.prevUntil = function(selector) {};

/**
 * @param {Array} elements
 * @param {string=} name
 * @param {Array=} args
 * @return {jQueryObject}
 */
jQueryObject.prototype.pushStack = function(elements, name, args) {};

/**
 * @param {string=} queueName
 * @param {(Array|function(function()))=} arg2
 * @return {(Array|jQueryObject)}
 */
jQueryObject.prototype.queue = function(queueName, arg2) {};

/**
 * @param {function()} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.ready = function(handler) {};

/**
 * @param {string=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.remove = function(selector) {};

/**
 * @param {string} attributeName
 * @return {jQueryObject}
 */
jQueryObject.prototype.removeAttr = function(attributeName) {};

/**
 * @param {(string|function(number,string))=} arg1
 * @param {(string|number)=} arg2
 * @param {function()=} arg3
 * @return {jQueryObject}
 */
jQueryObject.prototype.removeClass = function(arg1, arg2, arg3) {};

/**
 * @param {string=} name
 * @return {jQueryObject}
 */
jQueryObject.prototype.removeData = function(name) {};

/** @return {jQueryObject} */
jQueryObject.prototype.replaceAll = function() {};

/**
 * @param {(string|Element|jQueryObject|function())} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.replaceWith = function(arg1) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.resize = function(arg1, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.scroll = function(arg1, handler) {};

/**
 * @param {number=} value
 * @return {(number|jQueryObject)}
 */
jQueryObject.prototype.scrollLeft = function(value) {};

/**
 * @param {number=} value
 * @return {(number|jQueryObject)}
 */
jQueryObject.prototype.scrollTop = function(value) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.select = function(arg1, handler) {};

/** @type {string} */
jQueryObject.prototype.selector;

/** @return {string} */
jQueryObject.prototype.serialize = function() {};

/** @return {Array} */
jQueryObject.prototype.serializeArray = function() {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.show = function(duration, arg2, callback) {};

/**
 * @param {(Window|Document|Element|Array.<Element>|string|jQueryObject)=} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.siblings = function(selector) {};

/** @return {number} */
jQueryObject.prototype.size = function() {};

/**
 * @param {number} start
 * @param {number=} end
 * @return {jQueryObject}
 */
jQueryObject.prototype.slice = function(start, end) {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.slideDown = function(duration, arg2, callback) {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.slideToggle = function(duration, arg2, callback) {};

/**
 * @param {(string|number)=} duration
 * @param {(function()|string)=} arg2
 * @param {function()=} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.slideUp = function(duration, arg2, callback) {};

/**
 * @param {boolean=} clearQueue
 * @param {boolean=} jumpToEnd
 * @return {jQueryObject}
 */
jQueryObject.prototype.stop = function(clearQueue, jumpToEnd) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.submit = function(arg1, handler) {};

/**
 * @param {(string|function(number,string))=} arg1
 * @return {(string|jQueryObject)}
 */
jQueryObject.prototype.text = function(arg1) {};

/** @return {Array} */
jQueryObject.prototype.toArray = function() {};

/**
 * @param {(function(jQuery.event)|string|number|boolean)=} arg1
 * @param {(function(jQuery.event)|string)=} arg2
 * @param {function(jQuery.event)=} arg3
 * @return {jQueryObject}
 */
jQueryObject.prototype.toggle = function(arg1, arg2, arg3) {};

/**
 * @param {(string|function(number,string))} arg1
 * @param {string=} arg2
 * @param {boolean=} arg3
 * @return {jQueryObject}
 */
jQueryObject.prototype.toggleClass = function(arg1, arg2, arg3) {};

/**
 * @param {(string|jQuery.event)} arg1
 * @param {Array=} extraParameters
 * @return {jQueryObject}
 */
jQueryObject.prototype.trigger = function(arg1, extraParameters) {};

/**
 * @param {string} eventType
 * @param {Array} extraParameters
 * @return {Object}
 */
jQueryObject.prototype.triggerHandler = function(eventType, extraParameters) {};

/**
 * @param {(string|Object)} arg1
 * @param {(function(jQuery.event)|boolean)=} arg2
 * @return {jQueryObject}
 */
jQueryObject.prototype.unbind = function(arg1, arg2) {};

/**
 * @param {string=} selector
 * @param {string=} eventType
 * @param {function()=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.undelegate = function(selector, eventType, handler) {};

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.unload = function(arg1, handler) {};

/** @return {jQueryObject} */
jQueryObject.prototype.unwrap = function() {};

/**
 * @param {(string|function(number,*))=} arg1
 * @return {(string|Array|jQueryObject)}
 */
jQueryObject.prototype.val = function(arg1) {};

/**
 * @param {(string|number|function(number,number))=} arg1
 * @return {(number|jQueryObject)}
 * @nosideeffects
 */
jQueryObject.prototype.width = function(arg1) {};

/**
 * @param {(string|Window|Document|Element|Array.<Element>|jQueryObject|function())} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.wrap = function(arg1) {};

/**
 * @param {(string|Window|Document|Element|Array.<Element>|jQueryObject)} wrappingElement
 * @return {jQueryObject}
 */
jQueryObject.prototype.wrapAll = function(wrappingElement) {};

/**
 * @param {(string|function())} arg1
 * @return {jQueryObject}
 */
jQueryObject.prototype.wrapInner = function(arg1) {};

/**
 * @param {function()=} hoverIn
 * @param {function()=} hoverOut
 */
jQueryObject.prototype.hoverIntent = function(hoverIn, hoverOut) {};

/**
 * @param {Object=} arg1
 * @return {!jQueryObject}
 */
jQueryObject.prototype.cuteTime = function(arg1) {};

/**
 * @param {Object=} arg1
 * @return {!jQueryObject}
 */
jQueryObject.prototype.ThreeDots = function(arg1) {};

/**
 * @param {Object=} arg1
 * @return {!jQueryObject}
 */
jQueryObject.prototype.datetimepicker = function(arg1) {};

jQueryObject.fn;

/**
 * @param {!string} e
 */
$.Event = function(e) {};

/**
 * @type {Object} 
 */
$.fn;

/**
 * @type {Object} 
 */
$.ui;

$.ui.keyCode = {
    ALT : 18
    ,BACKSPACE : 8
    ,CAPS_LOCK : 20
    ,COMMA : 188
    ,COMMAND : 91
    ,COMMAND_LEFT : 91
    ,COMMAND_RIGHT : 93
    ,CONTROL : 17
    ,DELETE : 46
    ,DOWN : 40
    ,END : 35
    ,ENTER : 13
    ,ESCAPE : 27
    ,HOME : 36
    ,INSERT : 45
    ,LEFT : 37
    ,MENU : 93
    ,NUMPAD_ADD : 107
    ,NUMPAD_DECIMAL : 110
    ,NUMPAD_DIVIDE : 111
    ,NUMPAD_ENTER : 108
    ,NUMPAD_MULTIPLY : 106
    ,NUMPAD_SUBTRACT : 109
    ,PAGE_DOWN : 34
    ,PAGE_UP : 33
    ,PERIOD : 190
    ,RIGHT : 39
    ,SHIFT : 16
    ,SPACE : 32
    ,TAB : 9
    ,UP : 38
    ,WINDOWS : 91
};

/**
 * @param {Object} obj
 * @param {!string} str
 * @returns {!string}
 */
$.cuteTime = function(obj, str) {} ;

/**
 * @type {Object} 
 */
$.browser = {
    safari : '',
    webkit : '',
    opera : '',
    gecko : ''
};

/**
 * @constructor
 * @private
 */
function Farbtastic() { };

/**
 * @param {!string} color
 */
Farbtastic.prototype.setColor = function(color) {};

/**
 * @param {(string|jQueryObject)=} placeholder
 * @param {Function=} callback
 * @returns {!Farbtastic}
 */
$.farbtastic = function(placeholder, callback) {};

/**
 * @param {!Object.<!string, *>} params
 */
jQueryObject.prototype.colorpicker = function(params) {};

/**
 * @param {Object=} options
 */
jQueryObject.prototype.slowFadeIn = function(options) {};

/**
 * @param {jQueryObject.deferred} deferreds
 * @return {jQueryObject.Promise}
 */
jQuery.when = function(deferreds) {};

/**
 * @param {jQueryObject.deferred} deferreds
 * @return {jQueryObject.Promise}
 */
$.when = function(deferreds) {};

/**
 * @param {(string|Object)=} type
 * @param {Object=} target
 * @return {jQueryObject.Promise}
 */
jQueryObject.prototype.promise = function(type, target) {};

/**
 * @interface
 * @private
 * @see http://api.jquery.com/Types/#Promise
 */
jQueryObject.Promise = function () {};

/**
 * @param {function()} doneCallbacks
 * @return {jQueryObject.Promise}
 */
jQueryObject.Promise.prototype.done = function(doneCallbacks) {};

/**
 * @param {function()} failCallbacks
 * @return {jQueryObject.Promise}
 */
jQueryObject.Promise.prototype.fail = function(failCallbacks) {};

/**
 * @return {boolean}
 * @nosideeffects
 * @deprecated
 */
jQueryObject.Promise.prototype.isRejected = function() {};

/**
 * @return {boolean}
 * @nosideeffects
 * @deprecated
 */
jQueryObject.Promise.prototype.isResolved = function() {};

/**
 * @param {function()} doneCallbacks
 * @param {function()} failCallbacks
 * @return {jQueryObject.Promise}
 */
jQueryObject.Promise.prototype.then = function(doneCallbacks, failCallbacks) {};

/**
 * @constructor
 * @param {function()=} opt_fn
 * @see http://api.jquery.com/category/deferred-object/
 */
jQueryObject.deferred = function(opt_fn) {};

/**
 * @constructor
 * @extends {jQueryObject.deferred}
 * @param {function()=} opt_fn
 * @return {jQuery.Deferred}
 */
jQuery.Deferred = function(opt_fn) {};

/**
 * @constructor
 * @extends {jQueryObject.deferred}
 * @param {function()=} opt_fn
 * @see http://api.jquery.com/category/deferred-object/
 */
$.deferred = function(opt_fn) {};

/**
 * @constructor
 * @extends {jQueryObject.deferred}
 * @param {function()=} opt_fn
 * @return {jQueryObject.deferred}
 */
$.Deferred = function(opt_fn) {};

/**
 * @param {function()} alwaysCallbacks
 * @param {function()=} alwaysCallbacks2
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.always
    = function(alwaysCallbacks, alwaysCallbacks2) {};

/**
 * @param {function()} doneCallbacks
 * @param {function()=} doneCallbacks2
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.done = function(doneCallbacks, doneCallbacks2) {};

/**
 * @param {function()} failCallbacks
 * @param {function()=} failCallbacks2
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.fail = function(failCallbacks, failCallbacks2) {};

/**
 * @return {boolean}
 * @deprecated
 * @nosideeffects
 */
jQueryObject.deferred.prototype.isRejected = function() {};

/**
 * @return {boolean}
 * @deprecated
 * @nosideeffects
 */
jQueryObject.deferred.prototype.isResolved = function() {};

/**
 * @param {...*} var_args
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.notify = function(var_args) {};

/**
 * @param {Object} context
 * @param {...*} var_args
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.notifyWith = function(context, var_args) {};

/**
 * @param {function()=} doneFilter
 * @param {function()=} failFilter
 * @param {function()=} progressFilter
 * @return {jQueryObject.Promise}
 */
jQueryObject.deferred.prototype.pipe
    = function(doneFilter, failFilter, progressFilter) {};

/**
 * @param {function()} progressCallbacks
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.progress = function(progressCallbacks) {};

/**
 * @param {Object=} target
 * @return {jQueryObject.Promise}
 */
jQueryObject.deferred.prototype.promise = function(target) {};

/**
 * @param {...*} var_args
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.reject = function(var_args) {};

/**
 * @param {Object} context
 * @param {Array.<*>=} args
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.rejectWith = function(context, args) {};

/**
 * @param {...*} var_args
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.resolve = function(var_args) {};

/**
 * @param {Object} context
 * @param {Array.<*>=} args
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.resolveWith = function(context, args) {};

/** @return {string} */
jQueryObject.deferred.prototype.state = function() {};

/**
 * @param {function()} doneCallbacks
 * @param {function()} failCallbacks
 * @param {function()=} progressCallbacks
 * @return {jQueryObject.deferred}
 */
jQueryObject.deferred.prototype.then = function(doneCallbacks, failCallbacks, progressCallbacks) {};


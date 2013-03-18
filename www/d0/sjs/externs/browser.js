/**
 * @constructor
 */
function LocationObject() {}

/** @type {!string} */ LocationObject.prototype.protocol;
/** @type {!string} */ LocationObject.prototype.hostname;
/** @type {!string} */ LocationObject.prototype.host;
/** @type {!string} */ LocationObject.prototype.href;
/** @type {!string} */ LocationObject.prototype.port;
/** @type {!string} */ LocationObject.prototype.pathname;
/** @type {!string} */ LocationObject.prototype.hash;
/** @type {function(!string)} */ LocationObject.prototype.replace;
/** @type {function()} */ LocationObject.prototype.reload;

/** @type {LocationObject} */ window.location;

/** @type {LocationObject} */ HTMLDocument.prototype.location;

/** @type {Event} */ window.event;

/** @type {!string} */ Element.prototype.nodeName;
/** @type {!ElementNode} */ Element.prototype.node;

/**
 * @constructor
 */
function ElementNode() {}

/** @type {!string} */ ElementNode.prototype.id;

/**
 * @constructor
 */
function console() {
}

/**
 * log
 *
 * @param {...*} x
 **/
console.log = function(x) {};

/**
 * @constructor
 */
function JSON() {
}

/**
 * stringify
 *
 * @param {*} obj
 * @return {!string}
 **/
JSON.stringify = function(obj) {};

/**
 * parse
 *
 * @param {!string} str
 * @return {*}
 **/
JSON.parse = function(str) {};


// not all browsers have it, but if they don't they have stack which is alrady defined (and we check for it anyway)
/** @type {!string} */ Error.prototype.stacktrace;

/**
 * LocalStorage
 * browser localstorage key/value pair manager
 *
 * @constructor
 **/
function LocalStorage() {};

/** @type {LocalStorage} */ var localStorage;


/** @type {!IDBFactory} */ window.msIndexedDB;
/** @type {!IDBFactory} */ window.webkitIndexedDB;
/** @type {!IDBFactory} */ window.mozIndexedDB;
/** @type {!IDBFactory} */ window.indexedDB;

/** @type {!IDBTransaction} */ window.IDBTransaction;
/** @type {!IDBTransaction} */ window.webkitIDBTransaction;
/** @type {!IDBTransaction} */ window.msIDBTransaction;

/** @type {!IDBKeyRange} */ window.IDBKeyRange;
/** @type {!IDBKeyRange} */ window.webkitIDBKeyRange;
/** @type {!IDBKeyRange} */ window.msIDBKeyRange;

/**
 * openKeyCursor
 * open a cursor which has keys to objects
 *
 * @param {!IDBKeyRange} keyrange
 * @return {!IDBRequest}
 **/
IDBIndex.prototype.openKeyCursor = function(keyrange) {};

/**
 * only
 *
 * @param {*} val
 * @return {!IDBKeyRange}
 **/
IDBKeyRange.only = function(val) {};

/**
 * continues
 * instead of continue (for type checking only)
 *
 **/
IDBCursor.prototype.continues = function() {};
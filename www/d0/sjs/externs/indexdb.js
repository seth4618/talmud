/**
 * IDBFactory
 * <desc>
 *
 * @constructor
 **/
function IDBFactory()
{
}

/**
 * open
 * <desc>
 *
 * @param {!string} name
 * @param {number} version
 * @return {!IDBOpenDBRequest}
 **/
IDBFactory.prototype.open = function (name, version) {};

/**
 * IDBRequest
 *
 * @constructor
 **/
function IDBRequest() {}

/** @type {*} */ IDBRequest.prototype.result;
/** @type {Object} */ IDBRequest.prototype.error;
/** @type {(Object|null)} */ IDBRequest.prototype.source;
/** @type {(IDBTransaction|null)} */ IDBRequest.prototype.transaction;
/** @type {number} */ IDBRequest.prototype.readyState;
/** @type {function(*)} */ IDBRequest.prototype.onerror;
/** @type {function(*,*)} */ IDBRequest.prototype.onsuccess;

/**
 * IDBOpenDBRequest
 *
 * @constructor
 * @extends IDBRequest
 **/
function IDBOpenDBRequest() {}

/**
 * IDBDatabase
 *
 * @constructor
 **/
function IDBDatabase() {}

/** @type {!string} */ IDBDatabase.prototype.name;
/** @type {number} */ IDBDatabase.prototype.version;
/** @type {Object.<!string>} */ IDBDatabase.prototype.objectStoreNames;

/**
 * createObjectStore
 *
 * @param {!string} name
 * @param {Object=} optionalParameters
 * @return {!IDBObjectStore}
 **/
IDBDatabase.prototype.createObjectStore = function (name, optionalParameters) {};

/**
 * deleteObjectStore
 *
 * @param {!string} name
 * @return {!IDBRequest}
 **/
IDBDatabase.prototype.deleteObjectStore = function (name) {};

/**
 * transaction
 *
 * @param {!Array.<!string>} storeNames
 * @param {!string=} mode
 * @return {!IDBTransaction}
 **/
IDBDatabase.prototype.transaction = function (storeNames, mode) {}

/**
 * close
 *
 **/
IDBDatabase.prototype.close = function() {};

/**
 * IDBObjectStore
 *
 * @constructor
 **/
function IDBObjectStore()
{
}


/**
 * IDBKeyRange
 *
 * @constructor
 **/
function IDBKeyRange()
{
}

/**
 * upperBound
 * <desc>
 *
 * @param {*} x
 * @param {boolean=} open
 * @return {!IDBKeyRange}
 **/
IDBKeyRange.upperBound = function(x, open) {}

/**
 * lowerBound
 * <desc>
 *
 * @param {*} y
 * @param {boolean=} open
 * @return {!IDBKeyRange}
 **/
IDBKeyRange.lowerBound = function(y, open) {}

/**
 * bound
 * <desc>
 *
 * @param {*} x
 * @param {*} y
 * @param {boolean=} lowopen
 * @param {boolean=} upopen
 * @return {!IDBKeyRange}
 **/
IDBKeyRange.bound = function(x, y, lowopen, upopen) {}

/**
 * only
 * <desc>
 *
 * @param {*} z
 * @return {!IDBKeyRange}
 **/
IDBKeyRange.only = function(z) {}

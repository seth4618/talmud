var Util = require("./util.js");

// simple parser for google closure type annotations used in schema definitions

/**
 * Type
 * A node in a type
 *
 * @constructor
 * @param {!string|Type.number} name
 * @param {number} mod
 * @param {boolean} hip
 **/
function Type(name, mod, hip) {
    if (typeof(name) == 'number') {
	this.base = name;
    } else {
	if (name in Type.builtin) {
	    // builtin type
	    this.base = Type.builtin[name];
	} else if (name in Type.user) {
	    // already defined user type
	    this.base = Type.number.User;
	    this.name = name;
	} else {
	    // a new user defined type
	    Type.user[name] = this;
	    this.base = Type.number.User;
	    this.name = name;
	}
    }
    this.modifier = mod;
    this.hasIdPtr = hip;
    this.children = null;
}

/**
 * Enum for type constants
 * @enum {number}
 */
Type.number = {
    Array: 0,
    Object: 1,
    Boolean: 2,
    Number: 3,
    String: 4,
    Union: 5,
    Record: 6,
    User: 7};

Type.builtin = {
    Array: Type.number.Array,
    Object: Type.number.Object,
    boolean: Type.number.Boolean,
    number: Type.number.Number,
    string: Type.number.String
};

Type.recurable = [];
Type.recurable[Type.number.Array] = 1;
Type.recurable[Type.number.Object] = 1;
Type.recurable[Type.number.Boolean] = 0;
Type.recurable[Type.number.Number] = 0;
Type.recurable[Type.number.String] = 0;
Type.recurable[Type.number.Union] = 0;
Type.recurable[Type.number.Record] = 0;
Type.recurable[Type.number.User] = 0;

Type.user = {};

Type.modifier = {"?": 1,
		 "!": 2};

Type.baserx = /([A-Za-z_][A-Za-z0-9_]*)(.*)/;

/** @type {Type.number} */ Type.prototype.base;
/** @type {number} */ Type.prototype.modifier;
/** @type {boolean} */ Type.prototype.hasIdPtr;
/** @type {?Array.<!Type>} */ Type.prototype.children;

/**
 * parse
 * parse a type into its type tree
 *
 * grammer for types
 * type := typename | '(' type-ors ')' | '{' type-pairs '} | '?' type | '!' type | id '.' '<' type '>' | id '.' '<' type ',' type '>'
 * typename := compound-id | '@' compound-id
 * type-ors := type | type '|' type-ors
 * type-pairs := type-pair | type-pair ',' type-pairs
 * type-pair := id ':' type
 * compound-id := id | id '.' compound-id
 *
 * @param {!string} str
 * @return {?Type}
 **/
Type.parse = function(str)
{
    // tokenize the string
    str = str.replace(/[ \t\n]/g, '');
    // get rid of multiple meanings of .
    str = str.replace(/.</g, '<');
    // now tokenize rest of string (note: compound-id will be lumped together here
    var rawtokens = str.split(/([(){}?!@<>,:|])/);
    var tokens = [];
    for (var i=0; i<rawtokens.length; i++) if (rawtokens[i] != "") tokens.push(rawtokens[i]);

    //console.log('%s => %j', str, tokens);
    // now parse it
    var type = Type.parseTokens(tokens);
    //console.log('%d: Parsed %s into %j', tokens.length, str, type);
    if (tokens.length != 0) throw new Error('More stuff after parsing type: ['+tokens.join('%')+"]");
    return type;
}

/**
 * parse
 * parse a type into its type tree
 *
 * grammer for types (once they have been tokenized
 * type := id | '(' type-ors ')' | '{' type-pairs '} | '?' type | '!' type | id '<' type '>' | id '<' type ',' type '>'
 * type-ors := type | type '|' type-ors
 * type-pairs := type-pair | type-pair ',' type-pairs
 * type-pair := id ':' type
 *
 * @private
 * @param {!Array.<!string>} str
 * @return {?Type}
 **/
Type.parseTokens = function(tokens)
{
    // get optional modifier
    var mod;
    switch (tokens[0]) {
    case '?': 
    case '!':
	mod = Type.modifier[tokens[0]];
	tokens.shift();
	break;

    default:
	mod = 0;
	break;
    }

    var type;			// type we will return

    // check for record or union
    switch (tokens[0]) {
    case '{':
	type = new Type(Type.number.Record, mod);
	tokens.shift();
	type.children = Type.parseRecord(tokens);
	return type;

    case '(':
	type = new Type(Type.number.Union, mod);
	tokens.shift();
	type.children = Type.parseUnion(tokens);
	return type;

    default:
	// not a union, what follows is a single unmodified type, i.e., tokens[0] is an id or @id
    }
    
    // see if there is a .ID modifier (@)
    var id = tokens.shift();
    var hasIdPtr = false;
    if (id == '@') {
	// yup, this is a class which has a .id field stored in the db or going to front end
	hasIdPtr = true;
	id = tokens.shift();
    }

    // tokens will match: id | id < type > | id < type, type >

    type = new Type(id, mod, hasIdPtr);
    if (tokens.length == 0) return type;
    //if (hasIdPtr) throw new Error('@ found on non-base type: '+id);
    if (type.isRecurable() && (tokens[0] == '<')) {
	tokens.shift();
	type.children = [];
	type.children.push(Type.parseTokens(tokens));
	if (tokens[0] == ',') {
	    tokens.shift();
	    type.children.push(Type.parseTokens(tokens));
	}
	if (tokens[0] != '>') throw new Error("Expected '>' and got "+tokens[0]);
	tokens.shift();
	return type;
    } 
    return type;
}

/**
 * parseRecord
 * parse out a record definition, returns array of pairs
 *
 * @private
 * @param {!Array.<!string>} tokens
 * @return {!Array.<!Field>}
 **/
Type.parseRecord = function(tokens)
{
    var result = [];
    var next;
    do {
	var name = tokens.shift();
	var t = tokens.shift();
	if (t != ':') throw new Error('Expected : in record def');
	var type = Type.parseTokens(tokens);
	result.push([name, type]);
	next = tokens.shift();
    } while (next == ',');
    if (next != '}') throw new Error('Expected closing } in record def');
    return result;
}

/**
 * parseUnion
 * parse out a union definition, returns array of types
 *
 * @private
 * @param {!Array.<!string>} tokens
 * @return {!Array.<!Type>}
 **/
Type.parseUnion = function(tokens)
{
    var result = [];
    var next;
    do {
	var type = Type.parseTokens(tokens);
	result.push(type);
	next = tokens.shift();
    } while (next == "|");
    if (next != ")") throw new Error("Expected a ) after a union type");
    return result;
};

/**
 * clone
 * make a copy of this type.  If resolve is true, convert @X to X
 *
 * @param {boolean} resolve
 * @return {!Type}
 **/
Type.prototype.clone = function(resolve)
{
    resolve = resolve || false;
    var type = new Type(this.base, this.modifier, this.hasIdPtr);
    type.name = this.name;
    if (resolve) this.hasIdPtr = false;
    if (this.children) {
	type.children = [];
	for (var i=0; i<this.children.length; i++) type.children.push(this.children[i].clone(resolve));
    }
    return type;
};

Type.prototype.setBaseName = function(newname)
{
    if (newname in Type.builtin) {
	this.base = Type.builtin[name];
    } else {
	this.base = Type.number.User;
	this.name = newname;
    }
};

/**
 * isRecurable
 * see if this type is parameterizable (not whether it actually is, just if it is possible
 *
 * @private
 * @return {boolean}
 **/
Type.prototype.isRecurable = function()
{
    if (this.isUserType()) return false;
    //console.log("%j", this.base);
    return (Type.recurable[this.base] == 1);
};

/**
 * isArrayType
 * return true if this is an array
 *
 * @return {boolean}
 **/
Type.prototype.isArrayType = function()
{
    if (this.base == Type.number.Array) return true;
    return false;
}

/**
 * isUserType
 * return true if this is a user defined type
 *
 * @private
 * @return {boolean}
 **/
Type.prototype.isUserType = function()
{
    if (this.base == Type.number.User) return true;
    return false;
};

Type.prototype.isIdFor = function(base)
{
    if (this.hasIdPtr && !base.hasIdPtr && (this.name == base.name)) return true;
    return false;
};


/**
 * baseTypeName
 * return name of base type
 *
 * @return {!string}
 **/
Type.prototype.baseTypeName = function()
{
    if (this.base == Type.number.User) return this.name;
    switch (this.base) {
    case Type.number.Array:
	return "Array";

    case Type.number.Object:
	return "Object";

    case Type.number.Boolean:
	return "Boolean";

    case Type.number.Number:
	return "Number";

    case Type.number.String:
	return "String";

    case Type.number.Union:
	return "Union";

    case Type.number.Record:
	return "Record";

    default:
	throw new Error('unknown base');
    }
}

Type.prototype.getChildType = function()
{
    Util.assert(((this.children != null)&&(this.children.length >= 1)), "No child type to get");
    return this.children[0];
}

/**
 * toString
 * convert to a string for either the object or an id to the object
 * defaults to the object
 *
 * @param {boolean} IdOrObj	// true -> include .ID if @ is here
 * @return {!string}
 **/
Type.prototype.toString = function(IdOrObj)
{
    IdOrObj = true;
    var output = "";
    if (this.modifier) {
	if (this.modifier == 1) output += "?";
	else if (this.modifier == 2) output += "!";
	else output += "#%$";
    }
    switch (this.base) {
    case Type.number.Array:
	output += "Array";
	if (this.children != null) {
	    output += (".<"+this.children[0].toString(IdOrObj)+">");
	}
	break;

    case Type.number.Object:
	output += "Object";
	if (this.children != null) {
	    output += (".<"+this.children[0].toString(IdOrObj));
	    if (this.children.length == 2) {
		output += (","+this.children[1].toString(IdOrObj));
	    }
	    output += ">";
	}
	break;

    case Type.number.Boolean:
	output += "Boolean";
	break;

    case Type.number.Number:
	output += "Number";
	break;

    case Type.number.String:
	output += "String";
	break;

    case Type.number.Union:
	output += "(";
	for (i=0; i<this.children.length; i++) {
	    output += this.children[i].toString(IdOrObj);
	    if ((i+1)<this.children.length) output += "|";
	}
	output += ")";
	break;

    case Type.number.Record:
	output += "{";
	for (var i=0; i<this.children.length; i++) {
	    output += (this.children[i][0]+":"+this.children[i][1].toString(IdOrObj));
	    if ((i+1)<this.children.length) output += ", ";
	}
	output += "}";
	break;

    case Type.number.User:
	output += this.name;
	if (IdOrObj && this.hasIdPtr) output += ".ID";
	break;

    default:
    throw new Error('unknown base');
    }
    return output;
}

if (0) {
    ////////////////////////////////////////////////////////////////
    // testing here
    ////////////////////////////////////////////////////////////////
    
    var fs = require("fs");
    var util = require("util");
    var Util = require("./util.js");
    
    var argv = require('optimist')
	.usage('makedb [-v] def-file')
	.describe('v', 'verbose')
	.argv;
    
    var srcFilename = argv._[0];
    var s = fs.readFileSync(srcFilename).toString();
    var t = s.split('\n');
    for (var i=0; i<t.length; i++) {
	//console.log("%d Parsing %s", i, t[i]);
	var type = Type.parse(t[i]);
	console.log("%s ==> %s", t[i], type.toString());
    }
}

module.exports = Type;

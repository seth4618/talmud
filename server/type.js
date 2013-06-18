// parser for google closure type annotations

/**
 * Type
 * A node in a type
 *
 * @constructor
 * @param {!string|Type.number} name
 * @param {number} mod
 **/
function Type(name, mod) {
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
/** @type {?Array.<!Type>} */ Type.prototype.children;

/**
 * parse
 * parse a type into its type tree
 *
 * grammer for types
 * type := compound-id | '(' type-ors ')' | '{' type-pairs '} | '?' type | '!' type | id '.' '<' type '>' | id '.' '<' type ',' type '>'
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
    var rawtokens = str.split(/([(){}?!<>,:|])/);
    var tokens = [];
    for (var i=0; i<rawtokens.length; i++) if (rawtokens[i] != "") tokens.push(rawtokens[i]);

    //console.log('%s => %j', str, tokens);
    // now parse it
    var type = Type.parseTokens(tokens);
    //console.log('Parsed %s into %j', str, type);
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
	// not a union, what follows is a single unmodified type, i.e., tokens[0] is an id
    }
    
    // tokens will match: id | id < type > | id < type, type >

    var id = tokens.shift();
    type = new Type(id, mod);
    if (tokens.length == 0) return type;
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
}

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
}

Type.prototype.toString = function()
{
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
	    output += (".<"+this.children[0].toString()+">");
	}
	break;

    case Type.number.Object:
	output += "Object";
	if (this.children != null) {
	    output += (".<"+this.children[0].toString());
	    if (this.children.length == 2) {
		output += (","+this.children[1].toString());
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
	    output += this.children[i].toString();
	    if ((i+1)<this.children.length) output += "|";
	}
	output += ")";
	break;

    case Type.number.Record:
	output += "{";
	for (var i=0; i<this.children.length; i++) {
	    output += (this.children[i][0]+":"+this.children[i][1].toString());
	    if ((i+1)<this.children.length) output += ", ";
	}
	output += "}";
	break;

    case Type.number.User:
	output += this.name;
	break;

    default:
    throw new Error('unknown base');
    }
    return output;
}

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

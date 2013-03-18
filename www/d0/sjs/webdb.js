function DB(name, size) {
    try {
	this.name = name;
	this.db = window.openDatabase(name, "1.0", "talmudproject - "+name, size);
    } catch (e) {
	alert("your browser doesn't support db ops, nothing will work");
    }
    this.sfail = function sqlFail(err) { alert("SQL failed:" + name + ":" + err.message); }
    this.tfail = function txFail(err) { alert("TX failed: "+ name + ":" + err.message); }    
    this.tables = {};
    
}
/** @type {!string} */ DB.prototype.name;
/** @type {!WebDB} */ DB.prototype.db;
/** @type {function(!Error)} */ DB.prototype.sfail;
/** @type {function(!Error)} */ DB.prototype.tfail;
/** @type {!Object.<!string,boolean>} */ DB.prototype.tables;

pagetable = {
    id: {order: 0, name: "id", db: "INT NOT NULL PRIMARY KEY AUTOINCREMENT"},
    name: {order: 1, name: "desc", db: "INT NOT NULL"}, // index into sourcetable
    path: {order: 2, name: "path", db: "VARCHAR(128) NOT NULL UNIQUE"}
};

sourcetable = {
    id: {order: 0, name: "id", db: "INT NOT NULL PRIMARY KEY AUTOINCREMENT"},
    parent: {order: 1, name: "parent", db: "INT"}, // index into this table
    type: {order: 2, name: "type", db: "INT NOT NULL"},
    name: {order: 3, name: "name", db: "VARCHAR(128) NOT NULL"},
    number: {order: 4, name: "number", db: "INT"}
};

pageitemstable = {
    id: {order: 0, name: "id", db: "INT NOT NULL PRIMARY KEY AUTOINCREMENT"},
    type: {order: 2, name: "type", db: "INT NOT NULL"},
    x: {order: 2, name: "type", db: "INT NOT NULL"},
    y: {order: 2, name: "type", db: "INT NOT NULL"},
    name: {order: 3, name: "name", db: "VARCHAR(128) NOT NULL"},
    number: {order: 4, name: "number", db: "INT"}
};    

DB.prototype.createTable = function(name, spec) 
{
    var q = ["CREATE TABLE IF NOT EXISTS ",
	     name,
	     "(" ];
    for (var i=0; i<spec.length; i++) {
	
    }
};

DB.prototype.add = function(table, record)
{
    if (table in this.tables) {
	record._id = this.makeid();
};

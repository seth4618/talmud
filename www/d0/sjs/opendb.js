// define your db here

var db;

function opendb(cb)
{
    var ndb = new DB('talmud', 9);
    ndb.addStoreDefinition('source', {keyPath: '_id', autoIncrement: true});
    ndb.addIndex('source', 'name', 'name', {});
    ndb.addIndex('source', 'parent', 'parent', {});
	ndb.addStoreDefinition('page', {keyPath: '_id', autoIncrement: true}, true);
	ndb.addIndex('page', 'source', 'name', {unique: true});
	ndb.addStoreDefinition('shape', {keyPath: '_id', autoIncrement: true}, true);
    ndb.open(function(r) {
	if (r != null) throw new Error('Failed to open DB:'+r);
	db = ndb;
	cb();
    });
}

// this is run before all ready hooks
Util.addAsynchReadyHook(-100, function(cb) {
    opendb(cb);
});

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:


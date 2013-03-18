/**
 * Storage
 * local storage
 *
 * @constructor
 **/
function Storage()
{
}

/**
 * getString
 * <desc>
 *
 * @param {!string} x
 * @return {!string}
 **/
Storage.getString = function(x)
{
    return localStorage.getItem(x);
};

/**
 * getString
 * <desc>
 *
 * @param {!string} x
 * @return {number}
 **/
Storage.getInt = function(x)
{
    var val = localStorage.getItem(x);
    if (val == undefined) return val;
    return parseInt(val, 10);
};

/**
 * get
 * <desc>
 *
 * @param {!string} x
 * @return {!Object}
 **/
Storage.get = function(x)
{
    var val = localStorage.getItem(x);
    if (val == undefined) return val;
    return JSON.parse(val);
};

/**
 * set
 * <desc>
 *
 * @param {!string} x
 * @param {!Object} y
 **/
Storage.set = function(x, y)
{
    localStorage.setItem(x, JSON.stringify(y));
};

/**
 * setInt
 * <desc>
 *
 * @param {!string} x
 * @param {number} y
 **/
Storage.setInt = function(x, y)
{
    localStorage.setItem(x, y);
};

/**
 * set
 * <desc>
 *
 * @param {!string} x
 * @param {number} y
 **/
Storage.setString = function(x, y)
{
    localStorage.setItem(x, y);
};

/**
 * remove
 * <desc>
 *
 * @param {!string} x
 **/
Storage.remove = function(x)
{
    localStorage.removeItem(x);
};

/**
 * has
 * <desc>
 *
 * @param {!string} x
 * @return {boolean}
 **/
Storage.has = function(x)
{
    if (localStorage.getItem(x) != undefined) return true;
    return false;
};


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:

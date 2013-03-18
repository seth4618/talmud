var uniq = 0;
Function.prototype.curry = function() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function() {
      return fn.apply(this, args.concat(
        Array.prototype.slice.call(arguments)));
    };
  };


function A()
{
    this.val = uniq++;
};
A.prototype.show = function() {
    console.log('I am %d', this.val);
}
A.prototype.showp = function(p) {
    console.log('%s from %d', p, this.val);
};
A.prototype.showpandq = function(p, q) {
    console.log('%s %s from %d', p, q, this.val);
};

A.prototype.trick = function(p, trick, q) {
    trick.showpandq(p, q);
};
A.tricky = function(p, me, q) {
    me.showpandq(p, q);
};
var a = new A();
var b = new A();
var foo = A.prototype.showp;
foo.call(a, 'hi');
var bar = A.prototype.showpandq.curry('curry');
bar.call(a, 'and q (a)');
bar.call(b, ' from b');
console.error('Am done!');
console.log('really done.');
console.error('And exiting!');



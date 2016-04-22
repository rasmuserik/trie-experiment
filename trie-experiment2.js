if(!Object.assign) {
  Object.assign = function(o1, o2) {
    for(a in o2) {
      if(o2.hasOwnProperty(a)) {
        o1[a] = o2[a];
      }
    }
  }
}
////////////////////////////////////////////////////////////////////

function Trie() { throw "abstract"; }
Trie.prototype.insert = function(s, val) { 
  return this._insert(str2arr(s), 0, val); 
}
Trie.prototype._insert = function(arr, pos, val) {
  var c = arr[pos];
  if(pos < arr.length) {
    return this.add(c, this.next(c)._insert(arr, pos + 1, val));
  } else {
    return this.addVal(val);
  }
}
Trie.prototype.get = function(s) { 
  var arr = str2arr(s), len = arr.length, trie = this;
  for(var i = 0; i < len; ++i) { trie = trie.next(arr[i]); }
  return trie.val();
};
Trie.prototype.print = function(n) {
  this._print("", n);
};
Trie.prototype._print = function(s, n) {
  if(n <= 0) { return n; }
  if(this.value !== undefined) { console.log(s, this.value); --n; }
  return this.__print(s, n);
};
Trie.prototype.val = function() { return this.value; };

function str2arr(s) {
  var arr = new Array(s.length);
  for(var i = 0; i < s.length; ++i) {
    arr[i] = s.charCodeAt(i);
  }
  return arr;
}
function addVal(o, val) { o.value = val; return o; }

function EmptyTrie() {};
Object.assign(EmptyTrie.prototype, Trie.prototype);
EmptyTrie.prototype.next = function(c) { return emptyTrie; }
EmptyTrie.prototype.add = function(c, trie) { return new PrefixTrie(c, trie); }
EmptyTrie.prototype.addVal = function(val) { return addVal(new EmptyTrie(), val); }
EmptyTrie.prototype.__print = function(s, n) { return n};
var emptyTrie = new EmptyTrie();

function PrefixTrie(c, trie) { this.c = c; this.trie = trie; }
Object.assign(PrefixTrie.prototype, Trie.prototype);
PrefixTrie.prototype.next = function(c) { return c === this.c ? this.trie : emptyTrie; }
PrefixTrie.prototype.add = function(c, trie) { 
  if(c === this.c) {
    return new PrefixTrie(c, trie);
  } else {
    return multiTrieAdd(multiTrieAdd(new MultiTrie(_emptyArr), this.c, this.trie), c, trie); 
  }
}
PrefixTrie.prototype.addVal = function(val) { return addVal(new PrefixTrie(this.c, this.trie), val); };
PrefixTrie.prototype._print = function(s, n) { return this.trie._print(s + String.fromCharCode(this.c), n); }

function MultiTrie(arr) { this.arr = arr; }
function multiTrieAdd(multiTrie, c, trie) {
  prevArr = multiTrie.arr
  var hibits = (c >> 4);
  var arr = prevArr.slice();
  var loArr = arr[hibits] = prevArr[hibits].slice();
  loArr[c & 15] = trie;
  multiTrie.arr = arr;
  return multiTrie;
}
Object.assign(MultiTrie.prototype, Trie.prototype);
MultiTrie.prototype.next = function(c) { return this.arr[c >> 4][c & 15]; }
MultiTrie.prototype.add = function(c, trie) { return multiTrieAdd(new MultiTrie(this.arr), c, trie); }
MultiTrie.prototype.addVal = function(val) { return addVal(new MultiTrie(this.arr), val); }
MultiTrie.prototype.__print = function(s, n) {
  for(var i = 0; i < 16; ++i) {
    for(var j = 0; j < 16; ++j) {
      if(this.arr[i][j] !== emptyTrie) { n = this.arr[i][j]._print(s + String.fromCharCode((i << 4) + j), n) }
    }
  }
  return n;
}
var _et = emptyTrie;
_e = [_et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et] 
_emptyArr = [_e, _e, _e, _e, _e, _e, _e, _e,_e, _e, _e, _e, _e, _e, _e, _e];

t = emptyTrie.insert('hello', 1);
t = t.insert('world', 2);
t = t.insert('word', 3);
//t = t.insert('ba', 2);
t.print();

// ----------------

var n = 11;
s = "s"

var t0 = Date.now();
var o = {};
for(var i = 0; i < n; ++i) {
  o[s + i] = i;
}
console.log("object insert time: ", Date.now() - t0);

var t0 = Date.now();
var trie = emptyTrie;
for(var i = 0; i < n; ++i) {
  trie = trie.insert(s + i , i);
}
console.log("trie insert time: ", Date.now() - t0);

var t0 = Date.now();
var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += o[s + i];
}
console.log("object get time: ", Date.now() - t0, sum);

var t0 = Date.now();
var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += trie.get(s + i);
}
console.log("trie get time: ", Date.now() - t0, sum);

trie.print(10);
/*
*/

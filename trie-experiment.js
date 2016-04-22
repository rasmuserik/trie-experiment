var emptyArray = new Array(16);
var emptyTrieDispatch;

function get(s) {
  var key = new Array(s.length);
  for(var i = 0; i < s.length; ++i) {
    key[i] = s.charCodeAt(i);
  }
  return this._get(key, 0);
}
function insert(s, val) {
  var key = new Array(s.length);
  for(var i = 0; i < s.length; ++i) {
    key[i] = s.charCodeAt(i);
  }
  return this._insert(key, 0, val);
}

function TrieVal(key, keypos, val) {
  this.key = key;
  this.val = val;
}
TrieVal.prototype._insert = function(key, keypos, val) {
  if(key.length === this.key.length) {
    while(keypos < key.length) {
      if(key[keypos] !== this.key[keypos]) {
        break;
      }
      ++keypos;
    }
    if(keypos === key.length) {
      this.val = val;
      return this;
    }
  }
  return emptyTrieDispatch._insert(this.key, keypos, this.val, this)._insert(key, keypos, val);
}
TrieVal.prototype._get = function(key, keypos) {
  var mykey = this.key;
  while(keypos < key.length) {
    if(mykey[keypos] !== key[keypos]) {
      return undefined;
    }
    ++keypos;
  }
  return this.val;
}
TrieVal.prototype.get = get;
TrieVal.prototype.insert = insert;
TrieVal.prototype.print = function(total, onlyPrint) {
  var key = "";
  for(var i = 0; i < this.key.length; ++i) {
    key += String.fromCharCode(this.key[i]);
  }
  if(total <= onlyPrint) {
    console.log(key, this.val);
  }
  return total - 1;
}

function TrieDispatch(arr) {
  this.arr = arr;
}
TrieDispatch.prototype._insert = function(key, keypos, val, trieVal) {
  keypos = keypos | 0;
  var c = key[keypos] | 0;
  var hibits = (c >> 4);
  var lobits = (c & 15);
  var hi = this.arr;
  var newTrie = hi.slice();
  var lo = newTrie[hibits] = hi[hibits].slice();
  var next = lo[lobits];
  if(next) {
    lo[lobits] = next._insert(key, keypos + 1, val);
  } else {
    lo[lobits] = trieVal || new TrieVal(key, keypos, val);
  }
  return new TrieDispatch(newTrie);
}
TrieDispatch.prototype._get = function(key, keypos) {
  keypos = keypos | 0;
  var c = key[keypos] | 0;
  var next = this.arr[c >> 4][c & 15];
  if(next) {
    return next._get(key, keypos + 1);
  }
}
TrieDispatch.prototype.get = get;
TrieDispatch.prototype.insert = insert;
TrieDispatch.prototype.print = function(total, skip) {
  var hi = this.arr;
  total = total || Number.MAX_VALUE;
  skip = skip || total;
  for(var i = 0; i < 16; ++i) {
    var lo = hi[i];
    if(lo !== emptyArray) {
      for(var j = 0; j < 16; ++j) {
        if(total <= 0) {
          return 0;
        }
        var trie = lo[j];
        if(trie !== undefined) {
          total = trie.print(total, skip);
        }
      }
    }
  }
  return total;
}

var emptyDispatch = [emptyArray, emptyArray, emptyArray, emptyArray,
emptyArray, emptyArray, emptyArray, emptyArray,
emptyArray, emptyArray, emptyArray, emptyArray,
emptyArray, emptyArray, emptyArray, emptyArray];
emptyTrieDispatch = new TrieDispatch(emptyDispatch);



var n = 1000000;
s = "h"

var t0 = Date.now();
var o = {};
for(var i = 0; i < n; ++i) {
  o[s + i] = i;
}
console.log("object insert time: ", Date.now() - t0);

/*
var t0 = Date.now();
var map = new Map();
for(var i = 0; i < n; ++i) {
  map.set(s + i, i);
}
console.log("Map insert time: ", Date.now() - t0);
*/

var t0 = Date.now();
var trie = emptyTrieDispatch;
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

/*
var t0 = Date.now();
var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += map.get(s + i);
}
console.log("map get time: ", Date.now() - t0, sum);
*/

var t0 = Date.now();
var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += trie.get(s + i);
}
console.log("trie get time: ", Date.now() - t0, sum);
// trie.print(10);

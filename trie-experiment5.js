// # Init
if(!Object.assign) {
  Object.assign = function(o1, o2) {
    for(a in o2) {
      if(o2.hasOwnProperty(a)) {
        o1[a] = o2[a];
      }
    }
  }
}

var n = 300000;
var radix = 10;
const reverseOrder = true;
var maxLinearTrie = 100;
////////////////////////////////////////////////////////////////////

function trie(maxLinearTrie) {
// # Trie
// ## Trie-general
function Trie() { throw "abstract"; }
Trie.prototype.insert = function(s, val) { 
  return this._insert(str2arr(s), 0, val); 
}
Trie.prototype._insert = function(arr, pos, val) {
  if(pos < arr.length) {
    var c = arr[pos];
    return this.add(c, this.next(c)._insert(arr, pos + 1, val));
  } else {
    return this.addVal(val);
  }
}
Trie.prototype.get = function(s) { 
  var arr = str2arr(s), len = arr.length, trie = this;
  for(var i = 0; i < len; ++i) { trie = trie.next(arr[i]); }
  return trie.val;
};
Trie.prototype.print = function(n) {
  this._print("", n || 1000000000);
};
Trie.prototype._print = function(s, n) {
  if(n <= 0) { return n; }
  if(this.val !== undefined) { console.log(s, this.val); --n; }
  var list = this.list();
  for(var i = 0; i < list.length; ++i) {
    var c = list[i];
    n = this.next(c)._print(s + String.fromCharCode(c), n);
  }
  return n;
};

function str2arr(s) {
  var arr = new Array(s.length);
  for(var i = 0; i < s.length; ++i) {
    arr[i] = s.charCodeAt(i);
  }
  return arr;
}

// ## Empty
function EmptyTrie(val) { this.val = val;};
Object.assign(EmptyTrie.prototype, Trie.prototype);
EmptyTrie.prototype.next = function(c) { return emptyTrie; }
EmptyTrie.prototype.add = function(c, trie) { 
  return new PrefixTrie(c, trie, this.val); 
}
EmptyTrie.prototype.addVal = function(val) { 
  return new EmptyTrie(val);
}
EmptyTrie.prototype.list = function() { return emptyList; };
var emptyTrie = new EmptyTrie();
var emptyList = [];

// ## Prefix
function PrefixTrie(c, trie, val) { 
  this.c = c; this.trie = trie; this.val = val; 
}
Object.assign(PrefixTrie.prototype, Trie.prototype);
PrefixTrie.prototype.next = function(c) { 
  return c === this.c ? this.trie : emptyTrie; 
}
PrefixTrie.prototype.add = function(c, trie) { 
  if(c === this.c) {
    return new PrefixTrie(c, trie, this.val);
  } else {
    if(c < this.c) {
      return new BinaryTrie(c, this.c, trie, this.trie, this.val);
    } else {
      return new BinaryTrie(this.c, c, this.trie, trie, this.val);
    }
  }
};
PrefixTrie.prototype.addVal = function(val) { 
  return new PrefixTrie(this.c, this.trie, this.val);
};
PrefixTrie.prototype.list = function() { return [this.c]; };

// ## Binary
function BinaryTrie(a, b, A, B, val) { 
  this.a = a, this.b = b, this.A = A, this.B = B, this.val = val;}
  Object.assign(BinaryTrie.prototype, Trie.prototype);
  BinaryTrie.prototype.next = function(c) { 
    return this.a === c ? this.A : (this.b === c ? this.B : emptyTrie);
  }
BinaryTrie.prototype.addVal = function(val) { 
  return new BinaryTrie(this.a, this.b, this.A, this.B, this.val);
};
BinaryTrie.prototype.add = function(c, trie) {
  if(this.a === c) {
    return new BinaryTrie(this.a, this.b, trie, this.B, this.val);
  }
  if(this.b === c) {
    return new BinaryTrie(this.a, this.b, this.A, trie, this.val);
  }
  return new LinearTrie([this.a, this.b], 
      [this.A, this.B], this.val).add(c, trie);
};
BinaryTrie.prototype.list = function() { return [this.a, this.b]; };


// ## Linear
function LinearTrie(cs, tries, val) { this.cs = cs, this.tries = tries; this.val = val; }
Object.assign(LinearTrie.prototype, Trie.prototype);
LinearTrie.prototype.next = function(c) {
  var min = 0;
  var max = this.cs.length - 1;
  var arr = this.cs;
  while(min <= max) {
    var mid = (min + max >> 1);
    var midc = arr[mid];
    if(midc=== c) {
      return this.tries[mid];
    }
    if(c > midc) {
      min = mid + 1;
    } else {
      max = mid - 1;
    }
  }
  return emptyTrie;
}
LinearTrie.prototype.add = function(c, trie) {
  var pos; var cs = this.cs; var tries = this.tries;
  for(pos = 0; pos < cs.length; ++pos) {
    if(c <= cs[pos]) {
      break;
    }
  }

  if(cs[pos] === c) {
    tries = tries.slice();
    tries[pos] = trie;
    return new LinearTrie(cs, tries, this.val);
  } 

  var len = cs.length + 1;
  var cs1 = new Array(len); var tries1 = new Array(len);
  for(var i = 0; i < pos; ++i) { cs1[i] = cs[i]; tries1[i] = tries[i]; }
  cs1[i] = c; tries1[i] = trie;
  for(var i = pos + 1; i < len; ++i) { cs1[i] = cs[i - 1]; tries1[i] = tries[i - 1]; }
  cs = cs1; tries = tries1;

  return (cs.length > maxLinearTrie)
    ? makeMultiTrie(cs, tries, this.val)
    : new LinearTrie(cs, tries, this.val);
};
LinearTrie.prototype.list = function() { return this.cs; };

// ## Multi-16
function makeMultiTrie(cs, tries, val) {
  var result = new MultiTrie(_emptyArr, val);
  for(var i = 0; i < cs.length; ++i) {
    multiTrieAdd(result, cs[i], tries[i]);
  }
  return result;
}
function MultiTrie(arr, val) { this.arr = arr; this.val = val; }
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
MultiTrie.prototype.add = function(c, trie) { return multiTrieAdd(new MultiTrie(this.arr, this.val), c, trie); }
MultiTrie.prototype.addVal = function(val) { return new MultiTrie(this.arr, this.val); };
MultiTrie.prototype.list = function() {
  result = [];
  for(var i = 0; i < 16; ++i) {
    if(this.arr[i] !== _e) {
      for(var j = 0; j < 16; ++j) {
        if(this.arr[i][j] !== emptyTrie) {
          result.push((i << 4) + j); } } } }
  return result;
}
var _et = emptyTrie;
_e = [_et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et] 
_emptyArr = [_e, _e, _e, _e, _e, _e, _e, _e,_e, _e, _e, _e, _e, _e, _e, _e];
return emptyTrie;
}
// # test
// ----------------
linearTrie = trie(256);
multiTrie = trie(0);

function bench(radix) {
function s(i) {
  if(reverseOrder) {
  result = '';
  var j = i
  while(i) {
    result = String.fromCharCode((i % radix)) + result;
    i = (i / radix) |0;
  }

  return result + j;
  } else {
  return "h" + i;
  }

}

var t = [];
var t0 = Date.now();
var trie = linearTrie;
for(var i = 0; i < n; ++i) {
  trie = trie.insert(s(i) , i);
}

t.push(Date.now() - t0); t0 = Date.now();

var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += trie.get(s(i));
}
t.push(Date.now() - t0); t0 = Date.now();

var trie = multiTrie;
for(var i = 0; i < n; ++i) {
  trie = trie.insert(s(i) , i);
}
t.push(Date.now() - t0); t0 = Date.now();

var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += trie.get(s(i));
}
t.push(Date.now() - t0); t0 = Date.now();
console.log("time: ", t, n, reverseOrder && radix, sum, t[0] < t[2], t[1] < t[3]);
if(radix < 200) {
  setTimeout(function() { bench(radix + 1); }, 100);
}
}
bench(2);

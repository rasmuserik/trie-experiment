if(!Object.assign) {
  Object.assign = function(o1, o2) {
    for(a in o2) {
      if(o2.hasOwnProperty(a)) {
        o1[a] = o2[a];
      }
    }
  }
}

var n = 50000;
var radix = 20;
var maxLinearTrie = 30;
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
};

function str2arr(s) {
  var arr = new Array(s.length);
  for(var i = 0; i < s.length; ++i) {
    arr[i] = s.charCodeAt(i);
  }
  return arr;
}

//
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

//
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

//
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


//
function LinearTrie(cs, tries, val) { this.cs = cs, this.tries = tries; this.val = val; }
Object.assign(LinearTrie.prototype, Trie.prototype);
LinearTrie.prototype.next = function(c) {
  var cs = this.cs;
  for(var i = 0; i < cs.length; ++i) {
    if(cs[i] === c) {
      return this.tries[i];
    }
  }
  return emptyTrie;
}
LinearTrie.prototype.add = function(c, trie) {
  var pos;
  var cs = this.cs;
  var tries = this.tries;
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
  var cs = cs.slice(0, pos).concat([c], cs.slice(pos));
  var tries = tries.slice(0, pos).concat([trie], tries.slice(pos));

  if(cs.length > maxLinearTrie) {
    return makeMultiTrie(cs, tries, this.val);
  } else {
    return new LinearTrie(cs, tries, this.val);
  }
};
LinearTrie.prototype.list = function() { return this.cs; };

//
function EmptyTree() { this.depth = 0; }
Object.assign(Tree.prototype, Trie.prototype);
Tree.prototype.next = function(c) { return emptyTrie }
Tree.prototype.add = function(c, trie) {
  return new Tree(c, trie, emptyTree, emptyTree);
}
Tree.prototype.addVal = function(c, trie) { }
Tree.prototype.list = function(acc) { return acc; }
emptyTree = new EmptyTree();

function Tree(c, trie, left, right) {
  this.c = c; this.trie = trie;
  this.left = left; this.right = right;
}
Object.assign(Tree.prototype, Trie.prototype);
Tree.prototype.next = function(c) {
  if(this.c === c) {
    return this.trie;
  }
  if(c < this.c) {
    return this.left.next(c);
  } else {
    return this.right.next(c);
  }
}
Tree.prototype.add = function(c, trie) {
  if(this.c === c) {
    return new Tree(c, trie, this.left, this.right);
  } 
  var c0 = this.c;
  var trie0 = this.trie;
  var left, right;
  if(c < this.c) {
    left = this.left.add(c, trie);
    right = this.right;
  } else {
    left = this.left;
    right = this.right.add(c, trie);
  }
  return new Tree(c0, trie0, left, right);
}
Tree.prototype.addVal = function(c, trie) { }
Tree.prototype.list = function(acc) {
}

function TreeTrie(c, left, right, trie, val) {
  this.c = c;
  this.left = left; 
  this.right = right;
  this.trie = trie;
  this.val = val;
}

Object.assign(TreeTrie.prototype, Trie.prototype);
TreeTrie.prototype.next = function(c) { 
}
TreeTrie.prototype.add = function(c, trie) { 
  return new PrefixTrie(c, trie, this.val); 
}
TreeTrie.prototype.addVal = function(val) { 
  return new TreeTrie(val);
}
TreeTrie.prototype.list = function() { return emptyList; };

//
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

t = emptyTrie.insert('hello', 1);
t = t.insert('world', 2);
t = t.insert('word', 3);
//t = t.insert('ba', 2);
t.print(10);

// ----------------

function s(i) {
  /*
  result = 'hello';
  while(i) {
    result += String.fromCharCode(65 + (i % radix));
    i = (i / radix) |0;
  }

  //return result;
  //*/
  return "h" + i;

}

var t0 = Date.now();
var o = {};
for(var i = 0; i < n; ++i) {
  o[s(i)] = i;
}
console.log("object insert time: ", Date.now() - t0);

var t0 = Date.now();
var trie = emptyTrie;
for(var i = 0; i < n; ++i) {
  trie = trie.insert(s(i) , i);
}
console.log("trie insert time: ", Date.now() - t0);

var t0 = Date.now();
var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += o[s(i)];
}
console.log("object get time: ", Date.now() - t0, sum);

var t0 = Date.now();
var sum = 0;
for(var i = 0; i < n; ++i) {
  sum += trie.get(s(i));
}
console.log("trie get time: ", Date.now() - t0, sum);

//trie.print(30);
/*
*/

(function() {
  "use strict";
  var bon = require('./bon');
  var str2arr = bon.str2arr;

  if(!Object.assign) {
    Object.assign = function(o1, o2) {
      for(var a in o2) {
        if(o2.hasOwnProperty(a)) {
          o1[a] = o2[a];
        }
      }
    }
  }
  // # Trie
  // ## Trie-general
  var buffer = new Array(100);
  function Trie() { throw "abstract"; }
  Trie.prototype._insert = function(arr, pos, len, val) {
    if(pos < len) {
      var c = arr[pos];
      return this.add(c, this.next(c)._insert(arr, pos + 1, len, val));
    } else {
      return this.addVal(val);
    }
  }
  Trie.prototype.insert = function(s, val) {
    var len = str2arr(buffer, s);
    return this._insert(buffer, 0, len, val);
  }
  Trie.prototype._get = function(arr, len, pos) {
    return pos === len
      ? this.val
      : this.next(arr[pos])._get(arr, len, pos + 1);
  };
  Trie.prototype.get = function(s) {
    var len = str2arr(buffer, s);
    return this._get(buffer, len, 0);
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
    var arr = this.cs, min = 0, max = arr.length - 1;
    while(min <= max) {
      var mid = (min + max >> 1);
      var midc = arr[mid];
      if(midc === c) {
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

    return (cs.length >= 50 )
      ? makeMultiTrie(cs, tries, this.val)
      : new LinearTrie(cs, tries, this.val);
  };
  LinearTrie.prototype.addVal = function(val) { return new LinearTrie(this.cs, this.tries, val); };
  LinearTrie.prototype.list = function() { return this.cs; };

  // ## Multi-16
  function makeMultiTrie(cs, tries, val) {
    var arr = _emptyArr.slice();
    for(var i = 0; i < cs.length; ++i) {
      var c = cs[i];
      var trie = tries[i];
      var hibits = (c >> 4);
      var loArr = arr[hibits] = arr[hibits].slice();
      loArr[c & 15] = trie;
    }
    return new MultiTrie(arr, val);
  }
  function MultiTrie(arr, val) { this.arr = arr; this.val = val; }
  Object.assign(MultiTrie.prototype, Trie.prototype);
  MultiTrie.prototype.next = function(c) { return this.arr[c >> 4][c & 15]; }
  MultiTrie.prototype.add = function(c, trie) {
    var prevArr = this.arr;
    var hibits = (c >> 4);
    var arr = prevArr.slice();
    var loArr = arr[hibits] = prevArr[hibits].slice();
    loArr[c & 15] = trie;
    return new MultiTrie(arr, this.val);
  }
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
  var _e = [_et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et]
  var _emptyArr = [_e, _e, _e, _e, _e, _e, _e, _e,_e, _e, _e, _e, _e, _e, _e, _e];

  module.exports = emptyTrie;
})();

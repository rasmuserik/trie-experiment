function Trie(cs, tries, val) { this.cs = cs, this.tries = tries; this.val = val; }
Trie.prototype._insert = function(arr, pos, len, val) {
  if(pos < len) {
    var c = arr.charCodeAt(pos);
    return this.add(c, this.next(c)._insert(arr, pos + 1, len, val));
  } else {
    return this.addVal(val);
  }
}
Trie.prototype.insert = function(s, val) {
  return this._insert(s, 0, s.length, val);
}
Trie.prototype._get = function(arr, len, pos) {
  return pos === len
    ? this.val
    : this.next(arr.charCodeAt(pos))._get(arr, len, pos + 1);
};
Trie.prototype.get = function(s) {
  return this._get(s, s.length, 0);
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
Trie.prototype.next = function(c) {
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
Trie.prototype.add = function(c, trie) {
  var pos; var cs = this.cs; var tries = this.tries;
  for(pos = 0; pos < cs.length; ++pos) {
    if(c <= cs[pos]) {
      break;
    }
  }

  if(cs[pos] === c) {
    tries = tries.slice();
    tries[pos] = trie;
    return new Trie(cs, tries, this.val);
  }

  var len = cs.length + 1;
  var cs1 = new Array(len); var tries1 = new Array(len);
  for(var i = 0; i < pos; ++i) { cs1[i] = cs[i]; tries1[i] = tries[i]; }
  cs1[i] = c; tries1[i] = trie;
  for(var i = pos + 1; i < len; ++i) { cs1[i] = cs[i - 1]; tries1[i] = tries[i - 1]; }
  cs = cs1; tries = tries1;

  return new Trie(cs, tries, this.val);
};
Trie.prototype.addVal = function(val) { return new Trie(this.cs, this.tries, val); };
Trie.prototype.list = function() { return this.cs; };

var emptyTrie = new Trie([],[],undefined); // ##
module.exports = emptyTrie;

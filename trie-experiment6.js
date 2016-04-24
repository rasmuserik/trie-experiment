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

var n = 100000;
var repeat = 1;
radix = 2;
var strPrefix = "hello";
const reverseOrder = true;
////////////////////////////////////////////////////////////////////
//console.log('+'.charCodeAt(0));
// # ToArray
var converter = new ArrayBuffer(8);
var converterFloat = new Float64Array(converter);
var converterBytes = new Uint8Array(converter);
//console.log('"'.charCodeAt(0));
// ## str2arr / toBon
function pushVB(buf, pos, n) { // ###
  var pos0 = pos;
  buf[pos] = n & 127;
  if(n > 127) {
    do {
      n = n >> 7;
      buf[++pos] = 128 | n;
    } while(n > 127);
    var pos1 = pos;
    while(pos0 < pos1) {
      var t = buf[pos0];
      buf[pos0] = buf[pos1];
      buf[pos1] = t;
      ++pos0; --pos1;
    }
  }
  return ++pos;
}
function pushNVB(buf, pos, n) { // ###
  var pos0 = pos;
  buf[pos] = ~(n & 127);
  if(n > 127) {
    do {
      n = n >> 7;
      buf[++pos] = ~(128 | n);
    } while(n > 127);
    var pos1 = pos;
    while(pos0 < pos1) {
      var t = buf[pos0];
      buf[pos0] = buf[pos1];
      buf[pos1] = t;
      ++pos0; --pos1;
    }
  }
  return ++pos;
}
var any2arr = function(buf, pos, o) { // ###
  // types:
  // 1. string
  // 2. negative integer
  // 3. positive integer
  // 4. double
  // 5. array/list
  // 6. object/map
  // ... keyword, buffer, true, false, null ...
  if(typeof o === 'string') { // ###
    buf[pos++] = 1;
    for(var i = 0; i < o.length; ++i) {
      var c = o.charCodeAt(i) + 1;
      if(c < 128) {
        buf[pos++] = c;
      } else {
        pushVB(c);
      }
    }
    buf[pos++] = 0;
  } else if(typeof o === 'number') { // ###
    if((o | 0) === o) {
      if(o < 0) {
        buf[pos++] = 2;
        pos = pushNVB(buf, pos, o);
      } else {
        buf[pos++] = 3;
        pos = pushVB(buf, pos, o);
      }
    } else {
      buf[pos++] = 4;
      converterFloat[0] = o;
      for(var i = 0; i < 8; ++i) {
        buf[pos++] = converterBytes[i];
      }
    }
  } else if(Array.isArray(o)) { // ###
    buf[pos++] = 5;
    for(var i = 0; i < o.length; ++i) {
      pos = any2arr(buf, pos, o[i]);
    }
    buf[pos++] = 0;
  } else if(o.constructor === Object) { // ###
    buf[pos++] = 6;
    for(var key in o) {
      pos = any2arr(buf, pos, key);
      pos = any2arr(buf, pos, o[key]);
    }
    buf[pos++] = 0;
  } else { // ###
    throw {"unserialisable type": o};
  }
  return pos;
}
var str2arr = function(buf, s) { // ###
  pos = any2arr(buf, 0, s);
  while(!buf[--pos]) {};
  return ++pos;
}
function toBon(o) { // ###
  a = [];
  any2arr(a, 0, o);
  return a;
}
// ## fromBon
function popAny(buf) { // ###
  switch(buf.arr[buf.pos++]) {
    case 0: return popAny(buf);
    case 1: return popStr(buf);
    case 2: return popNeg(buf);
    case 3: return popPos(buf);
    case 4: return popDouble(buf);
    case 5: return popArr(buf);
    case 6: return popObj(buf);
  }
}
function popStr(buf) { // ###
  var c, s = "";
  while(c = popPos(buf)) {
    s += String.fromCharCode(c - 1);
  }
  return s;
}
function popNeg(buf) { // ###
  var res = 0;
  do {
    var c = ~ buf.arr[buf.pos++];
    res = (res << 7) | (c & 127);
  } while(c & 128);
  return -res;
}
function popPos(buf) { // ###
  var res = 0;
  do {
    var c = buf.arr[buf.pos++];
    res = (res << 7) | (c & 127);
  } while(c & 128);
  return res;
}
function popDouble(buf) { // ###
  for(var i = 0; i < 8; ++i) {
    converterBytes[i] = buf.arr[buf.pos++];
  }
  return converterFloat[0];
}
function popArr(buf) { // ###
  var result = [];
  while(buf.arr[buf.pos]) {
    result.push(popAny(buf));
  }
  buf.pos++;
  return result;
}
function popObj(buf) { // ###
  var result = {};
  while(buf.arr[buf.pos]) {
    var key = popAny(buf);
    result[key] = popAny(buf);
  }
  buf.pos++;
  return result;
}
function fromBon(arr) { // ###
  return popAny({arr:arr, pos:0});
}

// ## bench
if(true) {
  function arrToStr(arr) {
    var str = "";
    for(var i = 0; i < arr.length; ++i) {
      str += String.fromCharCode(arr[i]);
    }
    return str
  }

  var o = [3, "hello", -1, 0, 100.1, [0.1,{"hi": ["hello", ["wo", "r", ["l", "d"],{a: 1, c: {b:-3}}, 1,-2,3, "!"]]}]];
  //o = [123, 100.1];

  var n = 100000;
  var timings = [];
  var s;
  t0 = Date.now();
  for(var i = 0; i < n; ++i) {
    var json  = JSON.stringify(o);
  }
  timings.push(Date.now() - t0); t0 = Date.now();

  for(var i = 0; i < n; ++i) {
    JSON.parse(json);
  }
  timings.push(Date.now() - t0); t0 = Date.now();
  timings.push(json.length);

  for(var i = 0; i < n; ++i) {
    var binary = toBon(o);
  }
  timings.push(Date.now() - t0); t0 = Date.now();
  console.log(JSON.stringify(arrToStr(binary)));
  console.log(JSON.stringify(fromBon(binary)));

  for(var i = 0; i < n; ++i) {
    fromBon(binary);
  }
  timings.push(Date.now() - t0); t0 = Date.now();
  timings.push(binary.length);

  console.log(timings, JSON.stringify(o) === JSON.stringify(fromBon(binary)));
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
LinearTrie.prototype.list = function() { return this.cs; };

// ## Multi-16
function makeMultiTrie(cs, tries, val) {
  var arr = _emptyArr.slice();
  for(var i = 0; i < cs.length; ++i) {
    var c = cs[i];
    trie = tries[i];
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
_e = [_et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et, _et]
_emptyArr = [_e, _e, _e, _e, _e, _e, _e, _e,_e, _e, _e, _e, _e, _e, _e, _e];

// # Benchmark
function bench(radix) {
  function s(i) {
    result = '';
    var j = i
      while(i) {
        if(reverseOrder) {
          result = result + String.fromCharCode(1+(i % radix));
        } else {
          result = String.fromCharCode(1+(i % radix)) + result;
        }
        i = (i / radix) |0;
      }
    return strPrefix + result;
  }

  var t = [];
  var t0 = Date.now();
  for(var j = 0; j < repeat; ++j) {
    var trie = emptyTrie;
    for(var i = 0; i < n; ++i) {
      trie = trie.insert(s(i) , i);
    }

  }
  t.push(Date.now() - t0); t0 = Date.now();
  for(var j = 0; j < repeat; ++j) {

    var sum = 0;
    for(var i = 0; i < n; ++i) {
      sum += trie.get(s(i));
    }
  }

  t.push(Date.now() - t0); t0 = Date.now();
  t.push("obj");
  for(var j = 0; j < repeat; ++j) {
    var o = {};
    for(var i = 0; i < n; ++i) {
      o[s(i)] = i;
    }
  }
  t.push(Date.now() - t0); t0 = Date.now();
  for(var j = 0; j < repeat; ++j) {
    var sum2 = 0;
    for(var i = 0; i < n; ++i) {
      sum2 += o[s(i)];
    }
  }
  t.push(Date.now() - t0); t0 = Date.now();

  if(typeof Immutable !== "undefined") {
    t.push("imm");

    for(var j = 0; j < repeat; ++j) {
      var map = Immutable.Map();
      var o = {};
      for(var i = 0; i < n; ++i) {
        map = map.set(s(i), i);
      }
    }
    t.push(Date.now() - t0); t0 = Date.now();
    for(var j = 0; j < repeat; ++j) {
      var sum2 = 0;
      for(var i = 0; i < n; ++i) {
        sum2 += map.get(s(i));
      }
    }
    t.push(Date.now() - t0); t0 = Date.now();

  }

  if(typeof Immutable !== "undefined") {
    t.push("mori");

    for(var j = 0; j < repeat; ++j) {
      var map = mori.hashMap();
      var o = {};
      for(var i = 0; i < n; ++i) {
        map = mori.assoc(map, s(i), i);
      }
    }
    t.push(Date.now() - t0); t0 = Date.now();
    for(var j = 0; j < repeat; ++j) {
      var sum2 = 0;
      for(var i = 0; i < n; ++i) {
        sum2 += mori.get(map, s(i));
      }
    }
    t.push(Date.now() - t0); t0 = Date.now();

  }




  console.log("time: ", t, n, reverseOrder && radix, sum);
  /*
     if(radix < 200) {
     setTimeout(function() { bench(radix + 1); }, 100);
     }
     */
}
bench(radix);

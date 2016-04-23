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

var n = 1000000;
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
// ## toArray
function toArray(buf, o) {
  var pos = 0;
  var result = [];
  function pushInt(n) {
    if(n >= 128) { pushInt(n >> 7); }
    buf[pos++] = ( (n & 127) | 128);
  }
  function toArray(o) {
    if(typeof o === "string") {
      buf[pos++] = (39);
      for(var i = 0; i < o.length; ++i) {
        var num = o.charCodeAt(i) || 65536;
        if(num >= 128) { pushInt(num); buf[pos++] = (num & 127); } else { buf[pos++] = (num); }
      }
      buf[pos++] = (0);
    } else if(Array.isArray(o)) {
      buf[pos++] = (91);
      num = o.length;
      //if(num >= 128) { pushInt(num); buf[pos++] = (num & 127); } else { buf[pos++] = (num); }
      for(var i = 0; i < num; ++i) {
        toArray(o[i], result);
      }
      buf[pos++] = (93);
    } else if(typeof o === "number") {
      if(o === (o|0)) {
        if(o >= 0) {
          buf[pos++] = (43);
          if(o >= 128) { pushInt(o); buf[pos++] = (o & 127); } else { buf[pos++] = (o); }
        } else {
          buf[pos++] = (45);
          o = -o;
          if(o >= 128) { pushInt(o); buf[pos++] = (o & 127); } else { buf[pos++] = (o); }
        }
      } else {
        buf[pos++] = (46);
        converterFloat[0] = o;
        buf[pos++] = (converterBytes[0]);
        buf[pos++] = (converterBytes[1]);
        buf[pos++] = (converterBytes[2]);
        buf[pos++] = (converterBytes[3]);
        buf[pos++] = (converterBytes[4]);
        buf[pos++] = (converterBytes[5]);
        buf[pos++] = (converterBytes[6]);
        buf[pos++] = (converterBytes[7]);
      }
    } else if(typeof o === "object") {
      buf[pos++] = (123);
      for(var key in o) {
        toArray(key, result);
        toArray(o[key], result);
      }
      buf[pos++] = (125);
    }
  }
  toArray(o);
  return pos;
}
// ## fromArray
function fromArray(arr) {
  var pos = 0;
  function readInt() {
    var c = arr[pos++];
    return (c & 128) ? (c << 7) | readInt() : c;
  }
  function fromArray() {
    switch(arr[pos++]) {
      case 39: // '
        var s = "";
        while(arr[pos] !== 0) {
          s += String.fromCharCode(readInt());
        }
        ++pos;
        return s;
      case 43: // +
        return readInt();
      case 45: // -
        return - readInt();
      case 46: // .
        converterBytes[0] = arr[pos++];
        converterBytes[1] = arr[pos++];
        converterBytes[2] = arr[pos++];
        converterBytes[3] = arr[pos++];
        converterBytes[4] = arr[pos++];
        converterBytes[5] = arr[pos++];
        converterBytes[6] = arr[pos++];
        converterBytes[7] = arr[pos++];
        return converterFloat[0];
      case 123: // {
        var result = {}
        while(arr[pos] !== 125) { // ]
          var key = fromArray();
          result[key] = fromArray();
        }
        ++pos;
        return result;
      case 91: // [
        var result = [];
        while(arr[pos] !== 93) { // ]
          result.push(fromArray());
        }
        ++pos;
        return result;
    }
    }
    return fromArray();
  }
  function arrToStr(arr) {
    var str = "";
    for(var i = 0; i < arr.length; ++i) {
      str += String.fromCharCode(arr[i]);
    }
    return str
  }


  var o = [3, "hello", -1, 0, 100.1, [0.1,{"hi": ["hello", ["wo", "r", ["l", "d"],{a: 1, c: {b:-3}}, 1,-2,3, "!"]]}]];
  /*
  console.log(JSON.stringify(arrToStr(toArray(tests))))
  console.log(JSON.stringify(fromArray(toArray(tests))));
  */

// ## str2arr
var str2arr = function(buf, s) {
    if(typeof s === 'string') {
      buf[0] = 123;
      for(var i = 0; i < s.length; ++i) {
        buf[i + 1] = s.charCodeAt(i);
      }
      return i + 1;
    }
  }
//var str2arr = toArray;

  // ## bench
  if(false) {
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
      var binary = [];
      toArray(binary, o);
    }
    timings.push(Date.now() - t0); t0 = Date.now();

    for(var i = 0; i < n; ++i) {
      fromArray(binary);
    }
    timings.push(Date.now() - t0); t0 = Date.now();
    timings.push(binary.length);

    console.log(timings, JSON.stringify(o) === JSON.stringify(fromArray(binary)));
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

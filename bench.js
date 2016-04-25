(function() {
  "use strict";
  var emptyTrie = require(((typeof process === 'object'?process:{}).argv ||[])[2] || './trie');

  var radix = 20;
  function bench(radix, cacheHostile) {
    var n = 400000;
    var repeat = 1;
    var strPrefix = "hello";
    function s(i) {
      var result = '';
      var j = i
        while(i) {
          if(cacheHostile) {
            result = result + String.fromCharCode(1+(i % radix));
          } else {
            result = String.fromCharCode(1+(i % radix)) + result;
          }
          i = (i / radix) |0;
        }
      return strPrefix + result;
    }

    var ss = [];
    for(var i = 0; i < n; ++i) {
      ss[i] = s(i);
    }

    var t = [];
    var t0 = Date.now();
    for(var j = 0; j < repeat; ++j) {
      var trie = emptyTrie;
      for(var i = 0; i < n; ++i) {
        trie = trie.insert(ss[i] , i);
      }

    }
    t.push(Date.now() - t0); t0 = Date.now();
    for(var j = 0; j < repeat; ++j) {

      var sum = 0;
      for(var i = 0; i < n; ++i) {
        sum += trie.get(ss[i]);
      }
    }

    t.push(Date.now() - t0); t0 = Date.now();
    t.push("obj");
    for(var j = 0; j < repeat; ++j) {
      var o = {};
      for(var i = 0; i < n; ++i) {
        o[ss[i]] = i;
      }
    }
    t.push(Date.now() - t0); t0 = Date.now();
    for(var j = 0; j < repeat; ++j) {
      var sum2 = 0;
      for(var i = 0; i < n; ++i) {
        sum2 += o[ss[i]];
      }
    }
    t.push(Date.now() - t0); t0 = Date.now();

    if(typeof Immutable !== "undefined") {
      t.push("imm");

      for(var j = 0; j < repeat; ++j) {
        var map = Immutable.Map();
        var o = {};
        for(var i = 0; i < n; ++i) {
          map = map.set(ss[i], i);
        }
      }
      t.push(Date.now() - t0); t0 = Date.now();
      for(var j = 0; j < repeat; ++j) {
        var sum2 = 0;
        for(var i = 0; i < n; ++i) {
          sum2 += map.get(ss[i]);
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
          map = mori.assoc(map, ss[i], i);
        }
      }
      t.push(Date.now() - t0); t0 = Date.now();
      for(var j = 0; j < repeat; ++j) {
        var sum2 = 0;
        for(var i = 0; i < n; ++i) {
          sum2 += mori.get(map, ss[i]);
        }
      }
      t.push(Date.now() - t0); t0 = Date.now();
    }

    console.log("time: ", t, n, cacheHostile, radix, sum);
    return(t);
  }

  bench(radix, false);
  bench(radix, true);
  module.exports = emptyTrie;
})();

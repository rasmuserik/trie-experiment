(function() {
  "use strict";
  // # ToArray
  var converter = new ArrayBuffer(8);
  var converterFloat = new Float64Array(converter);
  var converterBytes = new Uint8Array(converter);
  // ## toBon
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
        var c = o.charCodeAt(i);
        // UCS2 to UTF8 encoding
        if(c < 0x80) {
          buf[pos++] = c;
        } else if(c < 0x800) {
          buf[pos++] =  (128|64) | (c >> 6);
          buf[pos++] =  (128) | (c & 63);
        } else {
          buf[pos++] =  (128|64|32) | (c >> 12);
          buf[pos++] =  (128) | ((c >> 6) & 63);
          buf[pos++] =  (128) | (c & 63);
        }
      }
      buf[pos++] = 255;
    } else if(typeof o === 'number') { // ###
      if((o | 0) === o) {
        if(o < 0) {
          buf[pos++] = 2;
          pos = pushNVB(buf, pos, -o);
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
    var pos = any2arr(buf, 0, s);
    while(!buf[--pos]) {};
    return ++pos;
  }
  function toBon(o) { // ###
    var a = [];
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
    c = buf.arr[buf.pos++];
    while(c !== 255) {
      if(c & 128) {
        var t = c & 32;
        c = ((c & 31) << 6) | (63 & buf.arr[buf.pos++]);
        if(t) {
          c = (c << 6) | (63 & buf.arr[buf.pos++]);
        } 
      }
      s += String.fromCharCode(c);
      c = buf.arr[buf.pos++];
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
  function arrToStr(arr) {
    var str = "";
    for(var i = 0; i < arr.length; ++i) {
      str += String.fromCharCode(arr[i]);
    }
    return str
  }
  exports.any2arr = any2arr;
  exports.str2arr = str2arr;
  exports.toBon = toBon;
  exports.fromBon = fromBon;

  if(require.main === module) {
    var o = [3, "hello", -1, 0, 100.1, [0.1,{"hi": ["hello", ["wo", "r", ["l", "d"],{a: 1, c: {b:-3}}, 1,-2,3, "!"]]}]];
    //o = [123, 100.1];

    var n = 100000;
    var timings = [];
    var s;
    var t0 = Date.now();
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
})();

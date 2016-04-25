# Trie experiments

This is an experimental implementation of a trie, which is a key/value-mapping and a persistent data structure.
It is more cache aware / sensitive for access patterns than HAMT, so it is difficult to benchmark versus other persistent data structures, but initial experiments indicates it might be twice as fast as immutable-js, which seems faster than mori.


The vision is a compact key/value-datastructure/database, that can be synchronised to disk and across network, and is also useful for functional-reactive-programming. The intention is to merge ideas from the Trie, the B-Tree and compressed/succint datastructures.

Currently this is just initial steps.

## Bon - Binary Object Notation

The trie works only with binary data.
To store strings and other objects, they need to be encoded into byte arrays.
The following properties are desired:

- Fast, - for every key lookup/store, the key has to be converted to a byte array, so the encoding needs to be fast, - preliminary benchmark shows that Bon is about twice as fast as JSON.stringify.
- Prefix-free, - No encoded object should be a prefix of another, - this makes the trie-implementation simpler, as data is only stored in the leafs. Example: the string "the" is a prefix of "there", but zero-terminated strings "the\0" is not a prefix of "there\0".
- Compact - the shorter the better, though for tradeofs it is generally a higher priority to be fast.
- Different data types, - not only strings, but also integers, numbers, objects, arrays, ... should be encodeable
- Order preserving. The lexicograhical sorted binary strings should preserver the order of the sorted strings, ie "hello" < "hi", and -10 < -5 < 20 < 300 < 1000.  For performance reason order of floating point numbers are not preserved.

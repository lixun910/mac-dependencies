# mac-dependencies

Mac-dependencies is a node.js module to walk dependencies of an executable or dylib on Mac.

## Usage

### print_deps()

```javascript
```

Example:
```javascript
const macdep = require('mac-dependencies');

macdep.print_deps('/usr/lib/libcurl.dylib');
```

Output:
```
└─ ✔ libcurl.dylib /usr/lib/libcurl.dylib
   ├─ ✔ libcrypto.42.dylib /usr/lib/libcrypto.42.dylib
   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
   ├─ ✔ libssl.44.dylib /usr/lib/libssl.44.dylib
   │  ├─ ✔ libcrypto.42.dylib /usr/lib/libcrypto.42.dylib
   │  │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
   ├─ ✔ libapple_nghttp2.dylib /usr/lib/libapple_nghttp2.dylib
   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
   ├─ ✔ libz.1.dylib /usr/lib/libz.1.dylib
   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
   └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
```


If the real path of a dependency can not be found, the output will use a "question mark" icon ❓ to highlight it. 

For example:
```javascript
macdep.print_deps('/Users/xun/test.dylib');
```

Since the @rpath is not defined in `test.dylib`, the output of `print_deps()` will report that dependency `libpng16.16.dylib` cannot be found:
```
└─ ✔ test.dylib /Users/xun/test.dylib
   ├─ ❓ libpng16.16.dylib @rpath/libpng16.16.dylib
   └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
```

One can specify a list of search dirs as an option to tell the program to search the missing dependency:
```javascript
macdep.print_deps('/Users/xun/test.dylib', {"search_dirs" : ["/usr/lib", "/usr/local/lib"]});


```
The output:
```
└─ ✔ test.dylib /Users/xun/test.dylib
   ├─ ✔ libpng16.16.dylib /usr/local/lib/libpng16.16.dylib
   └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
```

### get_deps()

```javascript
```

Example:
```javascript
const macdep = require('mac-dependencies');

var deps = macdep.get_deps('/usr/lib/libcurl.dylib');
```

Output is an array of first-order dependencies:
```
0:"/usr/lib/libcrypto.42.dylib"
1:"/usr/lib/libssl.44.dylib"
2:"/usr/lib/libapple_nghttp2.dylib"
3:"/usr/lib/libz.1.dylib"
4:"/usr/lib/libSystem.B.dylib"
```

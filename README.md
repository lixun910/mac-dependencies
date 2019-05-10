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

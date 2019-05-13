# mac-dependencies

Mac-dependencies is a node.js module to "walk" dependencies of an executable or dylib on Mac. It will automatically resolve the `@executable_path`, `@rpath` and `@loader_path` paths to find dependent libraries.

Users can use it to print the dependencies, check which dependencies were missing, and build a DMG by copying dependent libraries of an executable on Mac (see its usage in [GeoDa](https://github.com/lixun910/GeoDa) build toolchain).

## Usage

### 1. print_deps()

```javascript
print_deps(file_path : String, {options : Dict}) : String
```

> Example:
```javascript
const macdep = require('mac-dependencies');

macdep.print_deps('/usr/lib/libcurl.dylib');
```

> Output:
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

#### 1.1 Check missing dependencies

Any missing dependencies will be highlighed in the output with a "question mark" icon ❓.

> Example:
```javascript
macdep.print_deps('/Users/xun/test.dylib');
```

> Output:
```
└─ ✔ test.dylib /Users/xun/test.dylib
   ├─ ❓ libpng16.16.dylib @rpath/libpng16.16.dylib
   └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
```

#### 1.2 Option: `search_dirs`
For missing dependencies, one can specify a list of search dirs as an option to tell the program to search any missing dependencies.

> Example:
```javascript
var opts = {"search_dirs" : ["/usr/lib", "/usr/local/lib"]};
macdep.print_deps('/Users/xun/test.dylib', opts);
```

> Output:
```
└─ ✔ test.dylib /Users/xun/test.dylib
   ├─ ✔ libpng16.16.dylib /usr/local/lib/libpng16.16.dylib
   └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib
```

#### 1.3 Option: `system_dirs`

Default value: ['/usr/lib/system', '/Library/System']

One can specify a list of system dirs as an option to tell the program to ignore when searching dependencies.

> Example:
```javascript
var opts = {
    "system_dirs" : ["/usr/lib"], 
    "search_dirs" : ["/usr/lib", "/usr/local/lib"]
};
macdep.print_deps('/Users/xun/test.dylib', opts);
```

>Output:
```
└─ ✔ test.dylib /Users/xun/test.dylib
   └─ ✔ libpng16.16.dylib /usr/local/lib/libpng16.16.dylib
```

### 2. get_deps()

```javascript
get_deps(file_path : String, {options : dict}) : object
```

Example:
```javascript
const macdep = require('mac-dependencies');

var dep = macdep.get_deps('/usr/lib/libcurl.dylib');
```

Returns a javascript object representing the tree structure of dependencies. For example:
```javascript
dep {
   // attributes
   this.file_path = '/Users/xun/test.dylib', // 
   this.file_name = 'test.lib', //
   this.is_system = false, //
   this.is_valid = true, //
   this.dependencies = ['/usr/local/lib/libpng16.16.dylib', // a list of dependencies as dep objects
                        '/usr/lib/libSystem.B.dylib'], 
   this.executable_path = '/Users/xun',
   this.loader_path = '/Users/xun',
   this.r_path = undefined
}
```

One can traverse this tree structure starting from the return object by `get_deps()` function, and looping its children in `dependencies[]`.

## Contact

Xun Li lixun at gmail.com

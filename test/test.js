var assert = require('assert');
var macdep = require('../index')

var test_dylib_path = "/usr/lib/libcurl.dylib";

//var output = macdep.print_deps('/usr/lib/libcurl.dylib', {'is_oneline' : true});

/**
 * test cases for function print_deps() 
 */
describe('mac-dependencies', function() {
    describe('->print_deps()', function() {
        it('should return "" when the file path is not present', function() {
          assert.equal(macdep.print_deps(), "");
        });
    });
 
    describe('->print_deps("/usr/lib/libcurl.dylib")', function() {
        it('should return all dependencies of libcurl.dylib', function() {
          assert.equal(macdep.print_deps(test_dylib_path, {'is_oneline' : true}), 
          "└─ ✔ libcurl.dylib /usr/lib/libcurl.dylib   ├─ ✔ libcrypto.42.dylib /usr/lib/libcrypto.42.dylib   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib   ├─ ✔ libssl.44.dylib /usr/lib/libssl.44.dylib   │  ├─ ✔ libcrypto.42.dylib /usr/lib/libcrypto.42.dylib   │  │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib   ├─ ✔ libapple_nghttp2.dylib /usr/lib/libapple_nghttp2.dylib   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib   ├─ ✔ libz.1.dylib /usr/lib/libz.1.dylib   │  └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib   └─ ✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib");
        });
    });
});

/**
 * test cases for function get_deps() 
 */
describe('mac-dependencies', function() {
    describe('->get_deps("/usr/lib/libcurl.dylib")', function(){
        it('should return an empty dict object.', function(){
            assert.deepEqual(macdep.get_deps(), {});
        })
    });

    describe('->get_deps("/usr/lib/libcurl.dylib")', function(){
        it('should return a dictionary object.', function(){
            assert.deepEqual(macdep.get_deps(test_dylib_path), 
            {
                "✔ libcurl.dylib /usr/lib/libcurl.dylib" : {
                    "✔ libcrypto.42.dylib /usr/lib/libcrypto.42.dylib" : {
                        "✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib" : null    
                    },
                    "✔ libssl.44.dylib /usr/lib/libssl.44.dylib" : {
                        "✔ libcrypto.42.dylib /usr/lib/libcrypto.42.dylib" : {
                            "✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib" : null
                        },
                        "✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib" : null
                    },
                    "✔ libapple_nghttp2.dylib /usr/lib/libapple_nghttp2.dylib" : {
                        "✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib" : null
                    },
                    "✔ libz.1.dylib /usr/lib/libz.1.dylib" : {
                        "✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib" : null
                    },
                    "✔ libSystem.B.dylib /usr/lib/libSystem.B.dylib" : null
                }   
            });
        });
    });
});
    
/**
 * test cases for function copy_deps() 

var test_dest_dir = '/private/tmp';
var test_system_files = [];

describe('mac-dependencies', function() {
    describe('->copy_deps("/usr/lib/libcurl.dylib", "/private/tmp")', function(){
        it('should copy all dependencies (files) to dest_dir.', function(){
            var copied_files = macdep.copy_deps(test_dylib_path, test_dest_dir);
            assert.deepEqual(copied_files, []);
        })
    }),

    // with system_files option
    describe('->copy_deps("/usr/lib/libcurl.dylib", "/private/tmp")', function(){
        it('should copy all dependencies (files) except system_files options to dest_dir.', function(){
            var copied_files = macdep.copy_deps(test_dylib_path, test_dest_dir, {'system_files' : test_system_files});
            assert.deepEqual(copied_files, []);
        })
    })
});
 */
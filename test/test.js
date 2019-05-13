var assert = require('assert');
var macdep = require('../index')

var test_dylib_path = "/usr/lib/libcurl.dylib";
var test_dylib_path1 = "/Users/xun/Library/Developer/Xcode/DerivedData/GeoDa-dncapxghsajzlcbchzwqcqewkqkn/Build/Products/Debug/GeoDa.app/Contents/MacOS/GeoDa";

//macdep.print_deps(test_dylib_path, {"system_dirs" : ['/usr/lib', '/System/Library']});
//var out  = macdep.get_deps(test_dylib_path);
//var output = macdep.print_deps(test_dylib_path, {'is_oneline' : true});

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
    describe('->get_deps()', function(){
        it('should return an empty dict object.', function(){
            assert.deepEqual(macdep.get_deps(), null);
        })
    });

    describe('->get_deps("/usr/lib/libcurl.dylib")', function(){
        it('should return a dictionary object.', function(){
            var rtn_obj = macdep.get_deps(test_dylib_path);
            assert.equal(rtn_obj.file_path, '/usr/lib/libcurl.dylib');
            assert.equal(rtn_obj.file_name, 'libcurl.dylib');
            assert.equal(rtn_obj.is_system, false);
            assert.equal(rtn_obj.is_valid, true);
            assert.deepEqual(rtn_obj.executable_path, undefined);
            assert.equal(rtn_obj.loader_path, '/usr/lib');
            assert.deepEqual(rtn_obj.r_path, undefined);
            assert.equal(rtn_obj.dependencies.length, 5);
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
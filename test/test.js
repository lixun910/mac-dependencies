var assert = require('assert');
var macdep = require('../index')

console.log(macdep.get_deps('/usr/lib/libcurl.dylib'));

describe('mac-dependencies', function() {
    describe('#print()', function() {
        it('should return "" when the file path is not present', function() {
          assert.equal(macdep.print(), "");
        });
    });
  
    describe('#get_deps("/usr/lib/libcurl.dylib")', function(){
        it('should return ', function(){
            assert.equal(macdep.get_deps(
                '/usr/lib/libcurl.dylib'
            ), {

            });
        });
    });
});
    

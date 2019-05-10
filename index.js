// Author: lixun910@gmail.com

const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;
const ab2str = require('arraybuffer-to-string');
const treeify = require('treeify');

//  global variables
// search directories for finding dylibs
var g_search_dirs = ['/usr/lib', '/usr/local/lib'];

// default system directories
var g_system_dirs = ['/usr/lib/system', '/System/Library']

// global functions
function g_is_file_executable(file_path) {
    // when Mach header: filetype == 2
    // otool -l xxx | grep Mach -A2
    var cmd = 'otool -l ' + file_path;
    var exe_out = execSync(cmd);
    var exe_result = ab2str(exe_out); // arrybuffer to string
    if (exe_result.length == 0) return false; // raise Error?
    
    // e.g.
    //Mach header
    //magic cputype cpusubtype  caps    filetype ncmds sizeofcmds      flags
    //0xfeedfacf 16777223          3  0x80           2    34       4752 0x00218085
    var lines = exe_result.split('\n');
    if (lines.length < 4) return false;

    var last_line = lines[3];
    var items = last_line.trim().split(/(\s+)/).filter( e => e.trim().length > 0);
   
    if (items.length < 5) return false;
    if ( 2 == items[4]) return true; // filetype == 2
    return false;
}

function g_get_r_path(file_path) {
    // 
    var cmd = 'otool -l ' + file_path;
    var exe_out = execSync(cmd);
    var exe_result = ab2str(exe_out); // arrybuffer to string
    if (exe_result.length == 0) return ""; // raise Error?

    var start_pos = exe_result.indexOf("LC_RPATH");
    if (start_pos > 0) {
        var left_pos = exe_result.indexOf("path", start_pos) + 4;
        var right_pos = exe_result.indexOf("(offset");
        if (left_pos > 0 && right_pos > left_pos) {
            return exe_result.substr(left_pos, right_pos - left_pos);
        }
    }
    return "";
}

module.exports = {
    /**
     * get dependencies of an input file
     * 
     * @param {String} file_path 
     * @param {Object} options 
     * @throws {Error} throw an error if file path can not be found. 
     * @return {Object} a dictionary of representing the structure of dependencies
     * 
     * @api public
     */
    get_deps : function(file_path, options) {
        options = options || {};
        if (options.search_dirs)  g_search_dirs = options.search_dirs;
        if (options.system_dirs)  g_system_dirs = options.system_dirs;

        var results = {};
        var exe_type = typeof file_path;
        if (exe_type === 'string' && file_path.length > 0) {
            if (fs.existsSync(file_path)) {
                
                var parent_dir = path.dirname(file_path);
                var opts = {};
                var is_exe = g_is_file_executable(file_path);
                if (is_exe) {
                    opts["executable_path"] = parent_dir;
                } 
                // the parent path can be used as loader_path
                opts["loader_path"] =  parent_dir;
                
                // find r_path 
                var r_path = g_get_r_path(file_path);
                if (r_path.length > 0) {
                    opts["r_path"] = r_path;
                }

                var target = new TargetFile(file_path, opts);
                results = target.print_json();
            } 
        }  
        return results;
    },

    /**
     * print the dependencies of an input file.
     *
     * Options: {Object} 
     *  - `array` search directories [search_dirs]
     *  - `array` system directories [system_dirs]
     *  - `bool`  is print as one line [is_oneline]
     *
     * @param {String} file_path
     * @param {Object} [options]
     * @throws {Error} throw an error if file path can not be found.
     * @return {String}
     *  
     * @api public
     */
    print_deps: function(file_path, options) {
        var deps = this.get_deps(file_path, options);
        
        options = options || {};
        var is_oneline = false;
        if (options.is_oneline) is_oneline = options.is_oneline;

        var output = "";
        if (is_oneline) { 
            treeify.asLines(deps, true, function(line) {
                output += line;
                console.log(line);
            });
        } else { 
            output = treeify.asTree(deps);
            console.log(output);
        }
        return output;
    },

    isExecutable : function(file_path) {
        return g_is_file_executable(file_path);
    },

    get_rpath : function(file_path) {
        return g_get_r_path(file_path);
    }
};

/**
 * class TargetFile 
 * 
 * a class represent a file with attributes
 * 
 *  - `array` dependencies  a list of TargetFile objects represent dependencies
 * 
 */
class TargetFile {
    constructor (file_path, options) {
        options = options || {};

        this.executable_path = options.executable_path;
        this.loader_path = options.loader_path;
        this.r_path = options.r_path;

        this.dependencies = [];
        this.file_path = path.normalize(file_path);
        this.is_system = false;
        this.is_valid = this._is_file_valid(this.file_path);
        this.file_name = path.basename(this.file_path);
        
        if (this.is_valid) {
            this.is_system = this._is_system_lib(this.file_path);
            if (this.is_system == false) {
                this._find_dependencies(this.file_path);
            }
        }
    }

    // print out function
    print_json () {
        var rst = {};
        var file_str = "";
        if (this.is_valid) file_str += "\u2714 "; else file_str += "\u2753 ";
        file_str += this.file_name;
        file_str += " " + this.file_path.trim();
        if (this.is_system) file_str += " *";

        if (this.dependencies.length == 0) {
            rst[file_str] = null;
        } else {
            var child_rst = {};
            for (var idx = 0; idx < this.dependencies.length; ++idx) {
                var tmp_rst = this.dependencies[idx].print_json();
                for (var k in tmp_rst) {
                    child_rst[k] = tmp_rst[k];
                }
            }
            rst[file_str] = child_rst;
        }
        return rst;
    }

    // check if file path is valid (existed), if not try to u
    _is_file_valid (file_path) {
        if (fs.existsSync(file_path)) return true;
        // try to find it in search_dirs e.g. /usr/lib and /usr/local/lib
        var guess_path = _guess_file(file_path);
        if (fs.existsSync(guess_path))  {
            this.file_path = guess_path;
            return true;
        }
        return false;
    }

    // check if two file paths are same
    _is_same_file(file_path_1, file_path_2) {
        if (path.basename(file_path_1) == path.basename(file_path_2)) { 
            return true;
        }

        var real_1 = fs.realpathSync(file_path_1);
        var real_2 = fs.realpathSync(file_path_2);
        if (real_1 == real_2) return true;
        
        return false;
    }

    // try to find a file from search_dirs e.g. /usr/lib and /usr/local/lib
    _guess_file (file_path) {
        var file_name = this._get_fname_from_path(file_path); 
        for (var i=0; i < g_search_dirs.length; ++i) {
            var search_dir = g_search_dirs[i];
            var guess_path  = search_dir + '/' + file_name; 
            if (fs.existsSync(guess_path)) {
                return guess_path;
            }
        }
        return file_path;
    }

    // check if dylib is system dylib, if yes, there is no need to find its dependencies 
    _is_system_lib (file_path) {
        for (var idx = 0; idx < g_system_dirs.length; ++idx) {
            if (file_path.indexOf(g_system_dirs[idx]) == 0) {
                return true;
            }
        }
        return false;
    }

    // find dependencies of a given file using  otool -L command
    _find_dependencies (exe_path) {
        var exe_out = execSync('otool -L ' + exe_path);
        var exe_result = ab2str(exe_out); // arrybuffer to string
        if (exe_result.length == 0) return;
        var items = exe_result.split('\n');
        if (items.length == 0) return;

        // first line of return shows path itself
        for (var idx = 1; idx < items.length; idx++) {
            var el = items[idx];
            el = el.trim();
            if (el.length == 0) continue;
    
            el = el.replace('\t', '');
            el = el.substring(0, el.indexOf(' (compatibility version'));
    
            if (this._is_same_file(el, exe_path)) {
                // for dylib, the second line is dylib itself
                // e.g. /usr/lib/libcurl.dylib --> symbolic link /usr/lib/libcurl.4.dylib
                continue;
            }
            // get an absolute dylib path
            var abs_el = this._check_dylib_path(el);
           
            var opts = {};
            opts["executable_path"] = this.executable_path;

            // get dir of this dylib as loader_path
            var loader_path = path.dirname(abs_el);
            opts["loader_path"] = loader_path;

            // get rpath from this dylib if any
            var r_path = g_get_r_path(abs_el);
            if (r_path.length > 0) opts["r_path"] = r_path;

            var child = new TargetFile(abs_el, opts);
            if (this._dep_exist(child) == false && child.is_system == false) {
                this.dependencies.push(child);
            }
        }
    }

    _dep_exist(dep_obj) {
        var target_fname = path.basename(dep_obj.file_path);
        for (var idx = 0; idx < this.dependencies.length; ++idx) {
            var orig_fname = path.basename(this.dependencies[idx].file_path);
            if (target_fname == orig_fname) {
                return true;
            }
        }
        return false;
    }

    _check_dylib_path(dylib_path) {
        // relatieve path
        // @executable_path
        // @loader_path
        // @rpath
        if (dylib_path.indexOf('@executable_path') >= 0 && this.executable_path) {
            dylib_path = dylib_path.replace('@executable_path', this.executable_path);
            if (fs.existsSync(dylib_path)) return dylib_path;
    
        } else if (dylib_path.indexOf('@loader_path') >= 0 && this.loader_path) {
            dylib_path = dylib_path.replace('@loader_path', this.loader_path);
            if (fs.existsSync(dylib_path)) return dylib_path;
    
        } else if (dylib_path.indexOf('@rpath') >= 0) {
            dylib_path = dylib_path.replace('@rpath', this.r_path);
            if (fs.existsSync(dylib_path)) return dylib_path;
    
        } else if (dylib_path.indexOf('/') != 0 && this.loader_path) {
            // relative path
            dylib_path = this.loader_path + '/' + dylib_path;
            if (fs.existsSync(dylib_path)) return dylib_path;
        }
        return dylib_path; 
    }
}

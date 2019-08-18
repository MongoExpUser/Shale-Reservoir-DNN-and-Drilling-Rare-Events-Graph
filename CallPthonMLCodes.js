/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * ...Ecotert's CallPthonMLCodes.js (released as open-source under MIT License) implements:
 *
 *
 *  Calling of machine learning codes (or any other code) written in Python from Node.js.
 *
 *  The motivation, for calling of machine learning codes written in Python from Node.js,
 *  is to prevent re-inventing/re-creating of existing codes in Python.
 *  This way, existing machine learning codes written in Python can easily be used within
 *  asynchronous Node.js server and integrated with TensorFlow.js codes.
 *
 *
 */

class CallPthonMLCodes
{
    constructor()
    {
        return null;
    }
    
    callPythonMLScriptFromNodeJS(pyFile, pyScriptPath, pyVersionPath, pyMode)
    {
        var {PythonShell}   = require('python-shell');          // ver 1.0.8 or above
        pyFile              = pyFile
        pyScriptPath        = pyScriptPath;
        pyVersionPath       = pyVersionPath;
        pyMode              = pyMode;
        var value1          = 'build_ext';                      // command arg 1: for cython_C_extension
        var value2          = '--inplace';                      // command arg 2: for cython_C_extension
        var value           = 0;                                // general arg: any valid datatype/object can be passed in
        //var pyArgs        = [value1, value2];                 // arguments to python script: use this for cython
        //var pyArgs        = [value, value, value];            // arguments to python script: use this for pure python with args
        var pyArgs          = [];                               // arguments to python script: use this for pure python with no args
        var options         = {mode: pyMode, pythonPath: pyVersionPath, scriptPath: pyScriptPath, args: pyArgs, pythonOptions: ["-u"]};
            
        var pyShell = PythonShell.run(pyFile, options, function (error) 
        {
          if(error)
          {
              console.log("Error running Script:", error);
              return;
          }
        });
    
        pyShell.on('message', function (message)
        {
            console.log(message);
        });
            
        pyShell.end(function (error, code, signal)
        {
            if(error) {console.log(error);}
            console.log("end of script");
        });
    }
}

class TestMLCall
{
    constructor(test=true)
    {
        if(test === true)
        {
            var pyFile        = 'fileName.py' 
            var pyScriptPath  = "./";                   // or any other path to file
            var pyVersionPath = "/usr/bin/python3.7";   // or any other path e.g ".../miniconda3/bin/python3.7
            var pyMode        = "text";                 // or "json" or "binary"
            var cpml = new CallPthonMLCodes();
            cpml.callPythonMLScriptFromNodeJS(pyFile, pyScriptPath, pyVersionPath, pyMode);
        }
    }
}

module.exports = {CallPthonMLCodes};

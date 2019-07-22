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
    constructor(pyVersion='3.7')
    {
        this.pyVersion = pyVersion;
    }
    
    callpython(pyFile, pyScriptPath, options, PythonShell)
    {
        var pyShellTwo = PythonShell.run(pyFile, options, function (CallBackError, callbackMsg)
        {
            if(CallBackError)
            {
                console.log("Error running Script:", CallBackError);
                return;
            }
                        
            // an array consisting of messages collected during execution
            var message = JSON.parse(JSON.stringify(callbackMsg));
            console.log(message);
                
            for(let i in message)
            {
                var eachMessage = message[i];
                console.log(eachMessage);
            }
        });
    }
    
    invokePythonShell(pyFileName, pyVersionPath, pyScriptPath, pyMode="text")
    {
        try
        {
            var {PythonShell}       = require('python-shell');          // ver 1.0.7 or above
            var path                = require('path');
            var pyFile              = pyFileName
            var pyMode              = pyMode;
            var value1              = 'build_ext';                      // command arg 1: for cython_C_extension
            var value2              = '--inplace';                      // command arg 2: for cython_C_extension
            var value               = 5;                                // general arg: any valid datatype/object can be passed in
            //var pyArgs            = [value1, value2];                 // arguments to python script: use this for cython
            //var pyArgs            = [value, value, value];            // arguments to python script: use this for pure python with args
            var pyArgs              = [];                               // arguments to python script: use this for pure python with no args
            var options             = {mode: pyMode, pythonPath: pyVersionPath, scriptPath: pyScriptPath, args: pyArgs, pythonOptions: ["-u"]};
        }
        catch(err)
        {
            console.log("Error running script!: ", err);
            return;
        }
        finally
        {
            var cpml = new CallPthonMLCodes(this.pyVersion);
            cpml.callpython(pyFile, pyScriptPath, options, PythonShell)
        }
    }
}

class TestCall
{
    constructor(test=true)
    {
        if(test === true)
        {
            var pyScriptPath    = "./";
            var pyMode          = "text";                                    // or "json" or "binary"
            var pyVersion       = "3.7"                                      // or "3.6" or "3.8" or later
            var pyVersionPath   = "/usr/bin/python" + pyVersion;             // or any other path e.g ".../miniconda3/bin/python" + pyVersion;
            var pyFileName      = "CallPythonMLCodesFromNodeJS.py";
            new CallPthonMLCodes(pyVersion).invokePythonShell(pyFileName, pyVersionPath, pyScriptPath, pyMode);
        }
    }
}

new TestCall(true);
//new TestCall("doNotTest");


module.exports = {CallPthonMLCodes};

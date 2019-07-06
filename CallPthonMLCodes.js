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
 * Calling of machine learning codes (or any other code) written in Python from Node.js.
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
    

    invokePythonShell(pyFileName, pyScriptPath, pyVersion='3.6')
    {
        try
        {
            var {PythonShell}       = require('python-shell');          // run Py from Node.js with inter-process communication & error handling: ver 1.0.6 and above
            var path                = require('path');
            var pyFile              = pyFileName
            var pyVersionPath       = '/usr/bin/python' + pyVersion;    // path to python version to use: default python3.6 or python3.7 or higher
            var pyMode              = 'text';                           // message/data exchange mode: could also be: 'json' or 'binary'
            var pyMode2             = 'json';                           // message/data exchange mode: could also be: 'text' or 'binary'
            //args: for cython_C_extension
            var value1              = 'build_ext';                      // command arg 1: for cython_C_extension
            var value2              = '--inplace';                      // command arg 2: for cython_C_extension
            var value3              = 5;                                // arg 3: general
            var pyArgs              = [value1, value2];                 // arguments to python script
            var pyArgs              = [value3, value3, value3];         // arguments to python script
            var options             = {mode: pyMode, pythonPath: pyVersionPath, scriptPath: pyScriptPath, args: pyArgs, pythonOptions: ["-u"]};
        }
        catch(err)
        {
            console.log("Error running script!: ", err);
            return;
        }
        finally
        {
            var cpml = new CallPthonMLCodes();
            cpml.callpython(pyFile, pyScriptPath, options, PythonShell)
        }
    }
}


//test
var pyScriptPath = './';
var pyVersion = 3.6  // or 3.7 or later
pyFileName='CallPythonMLCodesFromNodeJS.py',
new CallPthonMLCodes().invokePythonShell(pyFileName, pyScriptPath, pyVersion);

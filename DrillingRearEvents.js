/*
 * Ecotert's DrillingRearEvents .js (released as open-source under MIT License) implements:
 *
 * Drilling Rear Events or Anomalies (vibration, kick and stuckpipe) detection and prevention with graph-based method.
 *
 * It inherits/extends the BaseAIML for its implementation.
 *
 */

const BaseAIML = require('./BaseAIML.js').BaseAIML;

class DrillingRearEvents extends BaseAIML
{
    constructor(pyFile, pyScriptPath, pyVersionPath, pyMode, modelingOption, fileOption, gpuOption, inputFromCSVFileX,
                inputFromCSVFileY, mongDBCollectionName, mongDBSpecifiedDataX, mongDBSpecifiedDataY)
    {
        super(modelingOption, fileOption, gpuOption, inputFromCSVFileX, inputFromCSVFileY, mongDBCollectionName, mongDBSpecifiedDataX, mongDBSpecifiedDataY);
        this.pyFile = pyFile;
        this.pyScriptPath = pyScriptPath;
        this.pyVersionPath = pyVersionPath;
        this.pyMode = pyMode;
    }
    
    drillingRearEvents()
    {
        // call (Python-Shell call) to AIML codes, developed in Python
        var pyFile              = this.pyFile;
        var pyScriptPath        = this.pyScriptPath;
        var pyVersionPath       = this.pyVersionPath;
        var pyMode              = this.pyMode;
        var cpml                =  new CallPthonMLCodes();
        var CallPthonMLCodes    = require('./CallPthonMLCodes.js').CallPthonMLCodes;
        var cpml = new CallPthonMLCodes();
        cpml.callPythonMLScriptFromNodeJS(pyFile, pyScriptPath, pyVersionPath, pyMode);
    }
    
    testDrillingRearEvents()
    {
        /// call (Python-Shell call) to AIML codes, developed in Python
        var pyFile              = this.pyFile;
        var pyScriptPath        = this.pyScriptPath;
        var pyVersionPath       = this.pyVersionPath;
        var pyMode              = this.pyMode;
        var cpml                =  new CallPthonMLCodes();
        var CallPthonMLCodes    = require('./CallPthonMLCodes.js').CallPthonMLCodes;
        var cpml = new CallPthonMLCodes();
        cpml.callPythonMLScriptFromNodeJS(pyFile, pyScriptPath, pyVersionPath, pyMode);
    }
}


module.exports = {DrillingRearEvents};

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
    
    drillingEventCreateTableInMySQL(tableName)
    {
        var mySqlQuery = "CREATE TABLE IF NOT EXISTS " + String(tableName) +
                            " (" + //primary key
                            "DATA_ID INT AUTO_INCREMENT PRIMARY KEY, " +
                            //data from regular drilling operation
                            "ROP_fph DOUBLE, " +
                            "RPM_rpm DOUBLE, " +
                            "SPP_psi DOUBLE, " +
                            "DWOB_lb DOUBLE, " +
                            "SWOB_lb DOUBLE, " +
                            "TQR_Ibft DOUBLE, " +
                            "MUD_WEIGHT_sg DOUBLE, " +
                            "MUD_VISC_cp DOUBLE, " +
                            "MUD_FLOW_RATE_gpm DOUBLE, " +
                            "BHA_TYPE_no_unit TEXT, " +
                            //data from downhole MWD/LWD tool measurements
                            "TVD_ft DOUBLE, " +
                            "MD_ft DOUBLE, " +
                            "INC_deg DOUBLE, " +
                            "AZIM_deg DOUBLE, " +
                            "CALIPER_HOLE_SIZE_inches DOUBLE, " +
                            "GR_api DOUBLE, " +
                            "DEEP_RESISTIVITY_ohm_m DOUBLE, " +
                            "SHOCK_g DOUBLE, " +
                            //event data
                            "IS_VIBRATION BOOLEAN, " +
                            "IS_KICK BOOLEAN, " +
                            "IS_STUCKPIPE BOOLEAN, " +
                            //time data
                            "TIME_ymd_hms TEXT" +
                            //constraints on some LWD data
                            "CHECK (0 >= GR_api <= 150), " +
                            "CHECK (0 >= DEEP_RESISTIVITY_ohm_m <= 2000)" +
                        ")";
      
            return mySqlQuery;
    }
       
            
    drillingEventInsertRecordInMySQL(tableName)
    {
        const value = true;
            
        if(value === true)
        {
            var mySqlQuery = "INSERT INTO " + String(tableName) +
                                " (ROP_fph, " +
                                "RPM_rpm, " +
                                "SPP_psi, " +
                                "DWOB_lb, " +
                                "SWOB_lb, " +
                                "TQR_Ibft, " +
                                "MUD_WEIGHT_sg, " +
                                "MUD_VISC_cp, " +
                                "MUD_FLOW_RATE_gpm, " +
                                "BHA_TYPE_no_unit, " +
                                //data from downhole MWD/LWD tool measurements
                                "TVD_ft, " +
                                "MD_ft, " +
                                "INC_deg, " +
                                "AZIM_deg, " +
                                "CALIPER_HOLE_SIZE_inches, " +
                                "GR_api, " +
                                "DEEP_RESISTIVITY_ohm_m, " +
                                "SHOCK_g, " +
                                //event data
                                "IS_VIBRATION, " +
                                "IS_KICK, " +
                                "IS_STUCKPIPE, " +
                                //time data
                                "TIME_ymd_hms)" +
                                " VALUE (30, 300, 100, 350, 200, 95, 1.18, 3, 35.14, 'slick', 1000, 1200, 67, 110, 8.5, 50, 120, 20, FALSE, FALSE, FALSE, '10:22'" +
                            ")";
        }
            
        return mySqlQuery;
    }
    
    drillingRearEvents()
    {
        // call AIML python script (this.pyFile) via Python-Shell 
        // pyFile (py_file_AIML.py) implements drilling rear events detection and prevention using graph method
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
        // call AIML python script (this.pyFile) via Python-Shell
        // pyFile (test_py_file_AIML.py) implements testing of drillingRearEvents() method
        var pyFile              = this.pyFile;
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

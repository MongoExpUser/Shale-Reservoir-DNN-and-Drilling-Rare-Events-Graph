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
                            "IS_VIBRATION_boolean_0_or_1 BOOLEAN, " +
                            "IS_KICK_boolean_0_or_1 BOOLEAN, " +
                            "IS_STUCKPIPE_boolean_0_or_1 BOOLEAN, " +
                            
                            //time data
                            "TIME_ymd_hms DATETIME, " +
                            
                            //constraints on some LWD data
                            "CHECK (0>=GR_api<=150), " +
                            "CHECK (0>=DEEP_RESISTIVITY_ohm_m<= 2000)" +
                        ")";
            
            return mySqlQuery;
    }
       
    drillingEventInsertRecordInMySQL(tableName, values)
    {
        const valueSeperator = ", ";
        
        if(values !== null && values !== undefined)
        {
            const actualValues =    values.ROP_fph + valueSeperator +
                                    values.RPM_rpm + valueSeperator +
                                    values.SPP_psi + valueSeperator +
                                    values.DWOB_lb + valueSeperator +
                                    values.SWOB_lb + valueSeperator +
                                    values.TQR_Ibft + valueSeperator +
                                    values.MUD_WEIGHT_sg + valueSeperator +
                                    values.MUD_VISC_cp + valueSeperator +
                                    values.MUD_FLOW_RATE_gpm + valueSeperator +
                                    values.BHA_TYPE_no_unit + valueSeperator +
                                    values.TVD_ft + valueSeperator +
                                    values.MD_ft + valueSeperator +
                                    values.INC_deg + valueSeperator +
                                    values.AZIM_deg + valueSeperator +
                                    values.CALIPER_HOLE_SIZE_inches + valueSeperator +
                                    values.GR_api + valueSeperator +
                                    values.DEEP_RESISTIVITY_ohm_m + valueSeperator +
                                    values.SHOCK_g + valueSeperator +
                                    values.IS_VIBRATION_boolean_0_or_1 + valueSeperator +
                                    values.IS_KICK_boolean_0_or_1 + valueSeperator +
                                    values.IS_STUCKPIPE_boolean_0_or_1 + valueSeperator +
                                    values.TIME_ymd_hms;
            
            var mySqlQuery = "INSERT INTO " + String(tableName) +
                                //data from regular drilling operation
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
                                "IS_VIBRATION_boolean_0_or_1, " +
                                "IS_KICK_boolean_0_or_1, " +
                                "IS_STUCKPIPE_boolean_0_or_1, " +
                                //time data
                                "TIME_ymd_hms)" +
                                //populate columns with actual values
                                " VALUE (" + actualValues + ")"
                            ")";
        }
            
        return mySqlQuery;
    }
    
    drillingEventDefaultValues()
    {
        const values = {"ROP_fph": null,
                        "RPM_rpm": null,
                        "SPP_psi": null,
                        "DWOB_lb": null,
                        "SWOB_lb": null,
                        "TQR_Ibft": null,
                        "MUD_WEIGHT_sg": null,
                        "MUD_VISC_cp": null,
                        "MUD_FLOW_RATE_gpm": null,
                        "BHA_TYPE_no_unit": null,
                        "TVD_ft": null,
                        "MD_ft": null,
                        "INC_deg": null,
                        "AZIM_deg": null,
                        "CALIPER_HOLE_SIZE_inches": null,
                        "GR_api": null,
                        "DEEP_RESISTIVITY_ohm_m": null,
                        "SHOCK_g": null,
                        "IS_VIBRATION_boolean_0_or_1": null,
                        "IS_KICK_boolean_0_or_1": null,
                        "IS_STUCKPIPE_boolean_0_or_1": null,
                        "TIME_ymd_hms": "CURRENT_TIMESTAMP()"
        }
        
        return values;
    }
    
    drillingEventSampleValues()
    {
        const values = {"ROP_fph": 30,
                        "RPM_rpm": 300,
                        "SPP_psi": 100,
                        "DWOB_lb": 350,
                        "SWOB_lb": 200,
                        "TQR_Ibft": 95,
                        "MUD_WEIGHT_sg": 1.18,
                        "MUD_VISC_cp": 3,
                        "MUD_FLOW_RATE_gpm": 35.14,
                        "BHA_TYPE_no_unit": JSON.stringify('slick'),
                        "TVD_ft": 1000,
                        "MD_ft": 1200,
                        "INC_deg": 67.2,
                        "AZIM_deg": 110.5,
                        "CALIPER_HOLE_SIZE_inches": 6,
                        "GR_api": 20,
                        "DEEP_RESISTIVITY_ohm_m": 303.3,
                        "SHOCK_g": 3,
                        "IS_VIBRATION_boolean_0_or_1": false,
                        "IS_KICK_boolean_0_or_1": false,
                        "IS_STUCKPIPE_boolean_0_or_1": false,
                        "TIME_ymd_hms": "CURRENT_TIMESTAMP()"
        }
        
        return values;
    }
}


module.exports = {DrillingRearEvents};

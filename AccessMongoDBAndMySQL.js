/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 * @License Ends
 *
 *
 * ...Ecotert's AccessMongoDBAndMySQL.js (released as open-source under MIT License) implements:
 *
 * A) AccessMongoDBAndMySQL() class to:
 *    i)  connect to and carry out CRUD operations & simple queries on MongoDB & MySQL (both regular SQL & NoSQL/Document Store)
 *    ii) upload/download  files
 *
 *    using:
 *
 *    (1) MongoDB native driver - https://www.npmjs.com/package/mongodb
 *    (2) Mongoose ORM - https://www.npmjs.com/package/mongoose
 *    (3) MySQL Node.js driver - https://www.npmjs.com/package/mysql
 *    (4) MySQL Connector/Node.js - https://www.npmjs.com/package/@mysql/xdevapi
 *    (5) Node.js file system & stream modules and MongoDB GridFS
 *
 * B) TestAccessMongoDBAndMySQL() class: to test AccessMongoDBAndMySQL() class
 *
 */


class AccessMongoDBAndMySQL
{
    constructor()
    {
      return null;
    }
    
    static getMongoDBCollectionNames(collectionsList)
    {
        const namesList = [];
                            
        for(let index in collectionsList)
        {
            for(let key in collectionsList[index])
            {
                if(key === "name")
                {
                    namesList.push(collectionsList[index]["name"]);
                }
            }
        }
        
        return namesList;
    }
    
    static getMySQLDocumentStoreCollectionNames(collectionsList)
    {
        const namesList = [];
    
        for(let index = 0; index < collectionsList.length; index++)
        {
            namesList.push(collectionsList[index].inspect().collection)
        }
                        
        return namesList;
    }
    
    static collectionExist(collectionNamesList, collectionName)
    {
        for(let index in collectionNamesList)
        {
            if(collectionNamesList[index] === collectionName)
            {
                return true;
            }
        }
        
        return false;
    }
    
    static convertMapToObject(inputMap)
    {
        const outputObject = {};
        
        inputMap.forEach(function(value, key)
        {
            outputObject[key] = value;
        });
        
        return outputObject;
    }
    
    static validDocument(keys, values)
    {
        return  (keys !== null) && (keys !== undefined) && (values !== null) &&
                (values !== undefined) && (keys.length === values.length);
    }
    
    static reservdataPipeline(nthLimit=30, reservoirZone=undefined, option=undefined)
    {
        let sqlQuery = "";
        
        if(option === "prolific_reservoir_zone")
        {
            // 1. nth top-most prolific very-sandy SPECIFIED "reservoirZone"
            sqlQuery = "" +
                "SELECT rsp.Reservoir_ID, rsp.Cum_prod_mm_bbls, rsp.Prod_Rate_m_bopd, rsp.Days " +
                "FROM ReservoirProduction rsp " +
                "INNER JOIN Reservoir rs ON rsp.Reservoir_ID=rs.Reservoir_ID " +
                "WHERE rs.Reservoir_Zone=" + "'" + reservoirZone  + "'" + " AND rs.Avg_GR_api<30 " +
                "ORDER BY rsp.Cum_prod_mm_bbls " +
                "LIMIT " + String(nthLimit) + ";";
            return sqlQuery;
        }
        else if(option === "thickest_reservoir_zone")
        {
            // 2. nth top-most thick SPECIFIED "reservoirZone", with Reservoir_ID, Cum_prod and Days
            sqlQuery = "" +
                "SELECT rs.Reservoir_Zone, rso.Net_pay_ft, rs.Reservoir_ID, rsp.Cum_prod_mm_bbls, rsp.Days " +
                "FROM Reservoir rs " +
                "INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID " +
                "INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID " +
                "ORDER BY rsp.Cum_prod_mm_bbls " +
                "LIMIT " + String(nthLimit) + ";";
            return sqlQuery;
        }
        else
        {
            //3. .... add more data pipeline as deem necessary
            return null;
        }
    
    static reservoirTableSchema()
    {
        //define schema variable and bracket, with correct spaces & commas
        let schema = "";
        let closeBracket = ")";
        let openBracket  = "(";
        let closeIndexBracket = "), "
        
         //define input keys
        let inputKeys = AccessMongoDBAndMySQL.reservoirDocumentsKeys();
        
        //define data types, with correct spaces and commas
        const doubleDataType = " DOUBLE, ";
        const textDataType = " TEXT, ";
        const intDataType = " INT, ";
        
        const indexStatement = "INDEX ";

        //add "ROWID" primary key as auto increment (primary key is like automatically assigned "_id" in MongoDB)
        schema = " (ROWID INT AUTO_INCREMENT PRIMARY KEY, ";
        
        //then concatenate all keys, data types, spaces and commas
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index === 0)
            {
                //this is Reservoir_ID: foreign key designate to other TABLES -> must be INDEXED
                schema = schema + inputKeys[index] + intDataType + indexStatement + openBracket + inputKeys[index] + closeIndexBracket;
            }
            else if(index === 1)
            {
                
                schema = schema + inputKeys[index] + textDataType;
            }
            else if(index > 1)
            {
                schema = schema + inputKeys[index] +  doubleDataType;
            }
        }
        
        //add check constraints on GR and Deep resistvity data
        let check_constraints = "CHECK (0>=Avg_GR_api<=150), CHECK (0>=Avg_Deep_Resis_ohm_m<=2000)";
        
        //finally concatenate all, including check_constraints,  & closeBracket to get the "tableSchema"
        const tableSchema = schema + check_constraints +  closeBracket;
        
        return tableSchema;
    }
    
    static reservoirTableKeys()
    {
        //define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
        let keys = "";
        let seperator =  ", ";
        let openBracket = " (";
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.reservoirDocumentsKeys();
        
        //then concatenate opening bracket, all keys, spaces, commas and close bracket
        keys = keys + openBracket;
        
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < (inputKeys.length-1))
            {
                keys = keys + inputKeys[index] + seperator;
            }
            else
            {
                keys = keys + inputKeys[index];
            }
        }
        
        keys = keys + closeBracket;
    
        return keys;
        
    }
    
    static reservoirTableValuesOne()
    {
        //values below map directly, sequentially, to keys in reservoirDocumentsKeys()
        return [1200, 'Upper-Yoho', 540.89, 25.23, 3445.90, 3001.35];
    }

    static reservoirTableValuesTwo()
    {
        //values below map directly, sequentially, to keys in reservoirDocumentsKeys()
        return [1400, 'Middle-Salabe', 345.61, 20.11, 8000.00, 7609.62];
    }

    static reservoirDocumentsKeys()
    {
        return ["Reservoir_ID", "Reservoir_Zone", "Avg_Deep_Resis_ohm_m", "Avg_GR_api", "Top_MD_ft", "Top_TVD_ft"];
    }

    static reservoirSTOOIPTableSchema()
    {
        //define schema variable and bracket, with correct spaces & commas
        let schema = "";
        let closeBracket = ")";
        let openBracket  = "(";
        let closeIndexBracket = "), ";
        
         //define input keys
        let inputKeys = AccessMongoDBAndMySQL.reservoirSTOOIPDocumentsKeys();
        
        //define data types, with correct spaces and commas
        const doubleDataType = " DOUBLE, ";
        const intDataType = " INT, ";
        
        const indexStatement = "INDEX ";

        //add "ROWID" primary key as auto increment (primary key is like automatically assigned "_id" in MongoDB)
        schema = " (ROWID INT AUTO_INCREMENT PRIMARY KEY, ";
        
        //then concatenate all keys, data types, spaces and commas
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index === 0)
            {
                //this is Reservoir_ID: foreign key designate to other TABLES -> must be INDEXED
                schema = schema + inputKeys[index] + intDataType + indexStatement + openBracket + inputKeys[index] + closeIndexBracket;
            }
            else
            {
                schema = schema + inputKeys[index] +  doubleDataType;
            }
        }
        
        //add foreign key constraint for Reservoir_ID
        let foreign_key_constraint = "FOREIGN KEY (Reservoir_ID) REFERENCES Reservoir(Reservoir_ID)";

        //finally concatenate all, including foreign_key_constraint and closeBracket to get the "tableSchema"
        const tableSchema = schema + foreign_key_constraint + closeBracket;
        
        return tableSchema;
    }
    
    static reservoirSTOOIPTableKeys()
    {
        //define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
        let keys = "";
        let seperator =  ", ";
        let openBracket = " ("
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.reservoirSTOOIPDocumentsKeys();
        
        //then concatenate opening bracket, all keys, spaces, commas and close bracket
        keys = keys + openBracket;
        
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < (inputKeys.length-1))
            {
                keys = keys + inputKeys[index] + seperator;
            }
            else
            {
                keys = keys + inputKeys[index];
            }
        }
        
        keys = keys + closeBracket;
    
        return keys;
        
    }
    
    static reservoirSTOOIPTableValuesOne()
    {
        //values below map directly, sequentially, to keys in reservoirSTOOIPDocumentsKeys()
        //note: STOOIP_bbls = 7758 * Area_acres * Net_pay_ft * Porosity_frac * Oil_sat_frac * (1/Bo) * (1/10E+6)
        return [1200, 103.15, 0.2645, 0.8378, 100, 600, 997.89, 1.0000];
    }
    
    static reservoirSTOOIPTableValuesTwo()
    {
        //values below map directly, sequentially, to keys in reservoirSTOOIPDocumentsKeys()
        //note: STOOIP_bbls = 7758 * Area_acres * Net_pay_ft * Porosity_frac * Oil_sat_frac * (1/Bo) * (1/10E+6)
        return [1400, 81.19, 0.2237, 0.7301, 89, 720, 1200, 1.0001];
    }
    
    static reservoirSTOOIPDocumentsKeys()
    {
        return ["Reservoir_ID", "STOOIP_mm_bbls", "Porosity_frac", "Oil_sat_frac", "Net_pay_ft", "Area_acres", "Perm_mD", "Bo_factor"];
    }
    
    static reservoirProductionTableSchema()
    {
        //define schema variable and bracket, with correct spaces & commas
        let schema = "";
        let closeBracket = ")";
        let openBracket  = "(";
        let closeIndexBracket = "), "
        
         //define input keys
        let inputKeys = AccessMongoDBAndMySQL.reservoirProductionDocumentsKeys();
        
        //define data types, with correct spaces and commas
        const doubleDataType = " DOUBLE, ";
        const intDataType = " INT, ";
        
        const indexStatement = "INDEX ";

        //add "ROWID" primary key as auto increment (primary key is like automatically assigned "_id" in MongoDB)
        schema = " (ROWID INT AUTO_INCREMENT PRIMARY KEY, ";
        
        //then concatenate all keys, data types, spaces and commas
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index === 0)
            {
                //this is Reservoir_ID: foreign key designate to other TABLES -> must be INDEXED
                schema = schema + inputKeys[index] + intDataType + indexStatement + openBracket + inputKeys[index] + closeIndexBracket;
            }
            else
            {
                schema = schema + inputKeys[index] +  doubleDataType;
            }
        }
        
        //add foreign key constraint for Reservoir_ID
        let foreign_key_constraint = "FOREIGN KEY (Reservoir_ID) REFERENCES Reservoir(Reservoir_ID)";

        //finally concatenate all, including foreign_key_constraint and closeBracket to get the "tableSchema"
        const tableSchema = schema + foreign_key_constraint + closeBracket;
        
        return tableSchema;
    }
    
    static reservoirProductionTableKeys()
    {
        //define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
        let keys = "";
        let seperator =  ", ";
        let openBracket = " ("
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.reservoirProductionDocumentsKeys();
        
        //then concatenate opening bracket, all keys, spaces, commas and close bracket
        keys = keys + openBracket;
        
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < (inputKeys.length-1))
            {
                keys = keys + inputKeys[index] + seperator;
            }
            else
            {
                keys = keys + inputKeys[index];
            }
        }
        
        keys = keys + closeBracket;
    
        return keys;
    }
    
    static reservoirProductionTableValuesOne()
    {
        //values below map directly, sequentially, to keys in reservoirProductionDocumentsKeys()
        return [1200, 0.3671, 1.0211, 365.0];
    }
    
    static reservoirProductionTableValuesTwo()
    {
        //values below map directly, sequentially, to keys in reservoirProductionDocumentsKeys()
        return [1400, 1.0206, 0.7656, 1460.0];
    }
    
    static reservoirProductionDocumentsKeys()
    {
        return ["Reservoir_ID", "Cum_prod_mm_bbls", "Prod_Rate_m_bopd", "Days"];
    }
    
    static drillingEventTableSchema()
    {
        //define schema variable and bracket, with correct spaces & commas
        let schema = "";
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
        
        //define data types, with correct spaces and commas
        const doubleDataType = " DOUBLE, ";
        const textDataType = " TEXT, ";
        const booleanDataType = " BOOLEAN, ";
        const datatimeDataType = " DATETIME, ";
        
        //add "ROWID" primary key as auto increment (primary key is like automatically assigned "_id" in MongoDB)
        schema = " (ROWID INT AUTO_INCREMENT PRIMARY KEY, ";
        
        //then concatenate all keys, data types, spaces and commas
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < 6)
            {
                schema = schema + inputKeys[index] + doubleDataType;
            }
            else if(index === 6)
            {
                schema = schema + inputKeys[index] + textDataType;
            }
            else if(index > 6  && index < 20)
            {
                schema = schema + inputKeys[index] + doubleDataType;
            }
            else if(index >= 20  && index < 23)
            {
                schema = schema + inputKeys[index] + booleanDataType;
            }
            else if(index === 23)
            {
                schema = schema + inputKeys[index] + datatimeDataType;
            }
        }
        
        //add check constraints on some LWD data
        let constraints = "CHECK (0>=GR_api<=150), CHECK (0>=DEEP_RESISTIVITY_ohm_m<= 2000)";
        
         //finally concatenate all, including constraints and closeBracket to get the "tableSchema"
        const tableSchema = schema + constraints + closeBracket;
        
        return tableSchema;
    }
    
    static drillingEventTableKeys()
    {
        //define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
        let keys = "";
        let seperator =  ", ";
        let openBracket = " ("
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
        
        //then concatenate opening bracket, all keys, spaces, commas and close bracket
        keys = keys + openBracket;
        
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < (inputKeys.length-1))
            {
                keys = keys + inputKeys[index] + seperator;
            }
            else
            {
                keys = keys + inputKeys[index];
            }
        }
        
        keys = keys + closeBracket;
    
        return keys;
    }

    static drillingEventTableValues()
    {
        //values below map directly, sequentially, to keys in drillingEventTableKeys()
        return AccessMongoDBAndMySQL.drillingEventDocumentValues();
    }
    
    static drillingEventDocumentKeys()
    {
        return [
                //data from regular drilling operation (drillstring-related)
                "ROP_fph",
                "RPM_rpm",
                "SPP_psi",
                "DWOB_lb",
                "SWOB_lb",
                "TQR_Ibft",
                "BHA_TYPE_no_unit",
                //data from regular drilling operation (mud-related)
                "MUD_WEIGHT_sg",
                "MUD_PLASTIC_VISC_cp",
                "MUD_YIELD_POINT_lb_per_100ft_sq",
                "MUD_FLOW_RATE_gpm",
                //data (measured or calculated) from downhole MWD/LWD tool measurements
                "TVD_ft",
                "MD_ft",
                "INC_deg",
                "AZIM_deg",
                "Dogleg_deg_per_100ft",
                "CALIPER_HOLE_SIZE_inches",
                "GR_api",
                "DEEP_RESISTIVITY_ohm_m",
                "SHOCK_g",
                //event data from MWD/LWD tool measurements and other sources
                "IS_VIBRATION_boolean_0_or_1",
                "IS_KICK_boolean_0_or_1",
                "IS_STUCKPIPE_boolean_0_or_1",
                //time data
                "TIME_ymd_hms"
        ]
    }
    
    static drillingEventDocumentValues()
    {
        //values below map directly, sequentially, to keys in drillingEventDocumentKeys()
        return [    //data from regular drilling operation (drillstring-related)
                    35, 65, 235, 20000, 10000, 800, 'slick',
                    //data from regular drilling operation (mud-related)
                    1.18, 18.01, 16, 98.14,
                    //data (measured or calculated) from downhole MWD/LWD tool measurements
                    8000, 12000, 67.2, 110.5, 1.1, 6, 20, 303.3, 26,
                    //event data from MWD/LWD tool measurements and other sources
                    0, 0, 0,
                    //time data
                    new Date()
        ];
    }
    
    static drillingEventDocumentKeyValuePairs(keys, values)
    {
        const keyValuePairsMap = new Map();
        const validKeyValuePairs = AccessMongoDBAndMySQL.validDocument(keys, values);
        
        if(validKeyValuePairs === true)
        {
            for(let index = 0; index < keys.length; index++)
            {
                keyValuePairsMap.set(keys[index], values[index]);
            }
        }
        
        //add constraints on some LWD data
        // 1. GR_api constraint => 0>=GR_api<=150
        if(keyValuePairsMap.get(keys[17]) < 0 || keyValuePairsMap.get(keys[17]) > 150)
        {
          keyValuePairsMap.set(keys[17], NaN);
        }
        // 2. DEEP_RESISTIVITY_ohm_m constraint => 0>=DEEP_RESISTIVITY_ohm_m<= 2000
        if(keyValuePairsMap.get(keys[18]) < 0 || keyValuePairsMap.get(keys[18]) > 2000)
        {
          keyValuePairsMap.set(keys[18], NaN);
        }
        
        return keyValuePairsMap;
    }
    
    static drillingEventDocumentKeyValuePairsBinned(keys, values)
    {
        /*
            note:
            1) returns key-value pairs (for drilling event document) classified/binned into suitable categories
            2) data in this document are used for drilling rear event/anomaly detection analytics with AIML algorithms
            3) data are denormlized with embedded documents as sub-documents (i.e. classified/binned)
        */
        
        const keyValuePairsMap = new Map();
        const validKeyValuePairs = AccessMongoDBAndMySQL.validDocument(keys, values);
        
        if(validKeyValuePairs === true)
        {
            let keyValue = {};
            
            for(let index = 0; index < keys.length; index++)
            {
                if(index < 7)
                {
                    keyValue[keys[index]] = values[index];
                    
                    if(index === 6)
                    {
                        keyValuePairsMap.set("drillStringData", keyValue);
                        keyValue = {}; //reset to empty for next loop logic
                    }
                }
                else if(index >= 7  && index < 11)
                {
                    keyValue[keys[index]] = values[index];
                    
                    if(index === 10)
                    {
                        keyValuePairsMap.set("drillingMudData", keyValue);
                        keyValue = {};
                    }
                }
                else if(index >= 11  && index < 20)
                {
                    keyValue[keys[index]] = values[index];
                    
                    if(index === 19)
                    {
                        keyValuePairsMap.set("mwdLwdData", keyValue);
                        keyValue = {};
                    }
                }
                else if(index >= 20  && index < 23)
                {
                    keyValue[keys[index]] = values[index];
                    
                    if(index === 22)
                    {
                        keyValuePairsMap.set("eventData", keyValue);
                        keyValue = {};
                    }
                }
                else if(index === 23)
                {
                    keyValue[keys[index]] = values[index];
                    
                    if(index === 23)
                    {
                        keyValuePairsMap.set("time", keyValue);
                        keyValue = {};
                    }
                }
            }
        }
       
        return keyValuePairsMap;
    }
    
    static shaleReservoirDocumentKeys()
    {
        return { "reservoir_characteristics": "reservoir_characteristics",
                 "completion_details_per_pad":  "completion_details_per_pad",
                 "production_details_per_pad": "production_details_per_pad"
        };
    }
    
    static shaleReservoirDocumentValues()
    {
        return {
                    //1. reservoir_characteristics
                    reservoir_characteristics: {
                        reservoir_type: "dolomite_shale",
                        fluid_type: "oil",
                        fluid_species_mol_fraction: { HO: 0.0800, LO: 0.9090, CH4: 0.0090, CO2: 0.0010, others_traces: 0.0010 },
                        oil_api: 38.1,
                        maturity_level_Ro: 0.72,
                        init_oil_sat_frac: 0.82,
                        porosity_frac: 0.04,
                        thickness_ft: 86.2,
                        toc_frac: 0.056,
                        perm_nD: 5.1,
                        tvd_pressure_proxy_ft: 8900.3,
                        avg_calcite_frac: 0.017
                    },
                    //2. completion_details_per_pad
                    completion_details_per_pad: {
                        avg_number_of_stages_per_well: 20,
                        avg_perf_inverval_per_well_ft: 5200,
                        avg_proppant_loading_per_well_lbs: 9000.1,
                        avg_pumped_fluid_vol_per_well_mm_bbls: 4.2,
                        avg_well_direc_relative_to_max_prin_stress_deg_deg: 78.0,  // also called: // also called: avg_fracture_directional_disparity_deg
                        number_of_wells: 5
                    },
                    //  3. production_details_per_pad
                    production_details_per_pad: {
                        ip_mboe_per_day_30day_avg: 1.12,
                        ip_mboe_per_day_12hrs_avg: 1.50,
                        cum_prod_boe_mm_bbls: { months_06: 0.342, months_18: 0.560, months_36: 0.637}
                    }
            }
    }
    
    static shaleReservoirDocumentKeyValuePairsBinned(keys, values)
    {
        /*
            note:
            1) returns key-value pairs (for shale reservoir document) classified/binned into suitable categories
            2) data in this document are used for shale reservoir analytics with AIML algorithms
            3) data are denormlized with embedded documents as sub-documents (i.e. classified/binned)
        */
        
        const keyValuePairsMap = new Map();
        const validKeyValuePairs = AccessMongoDBAndMySQL.validDocument(keys, values);
        
        if(validKeyValuePairs === true)
        {
            keyValuePairsMap.set(keys.reservoir_characteristics, values.reservoir_characteristics);
            keyValuePairsMap.set(keys.completion_details_per_pad, values.completion_details_per_pad);
            keyValuePairsMap.set(keys.production_details_per_pad, values.production_details_per_pad);
        }

        return keyValuePairsMap;
    }
    
    static createUserDocument(userName, email, password, productOrServiceSubscription, assetName)
    {
        const EconomicCrypto = require('./EconomicCrypto.js').EconomicCrypto;
        const uuidV4 = require('uuid/v4');
        const economicCrypto = new EconomicCrypto();
        const hashAlgorithmPasd = 'bcrypt';
        const hashAlgorithmBlockchain = 'whirlpool';
        const pasd = economicCrypto.isHashConsensus([password], hashAlgorithmPasd);
        const initDate = new Date();
        const verificationCode = uuidV4();
        const initConfirmation = false;
        const initBlockChain = economicCrypto.isHashConsensus([uuidV4()], hashAlgorithmBlockchain);
        const blockchain = [initBlockChain[0], initBlockChain[1], initBlockChain[2]];
        const maxLoginAttempts = 10;
        const lockTime = 1*60*60*1000; // 1 hour
          
        const newUserMap = new Map();  // user document
           
        newUserMap.set("username", userName);
        newUserMap.set("email", email);
        newUserMap.set("subscription", productOrServiceSubscription);
        newUserMap.set("pasd", {"current": pasd, "lastFive": [pasd, pasd, pasd, pasd, pasd]});
        newUserMap.set("assetname", assetName);
        newUserMap.set("timeManagement", {"createdOn": initDate, "modifiedOn": initDate, "lastLogin": initDate, "lastLogOut": initDate});
        newUserMap.set("accountStatus", {"verificationCode": verificationCode, "isAccountVerified": initConfirmation, "isAccountInUse": initConfirmation});
        newUserMap.set("accountBalance", {"balanceDays": 0, "balanceDollars": 0, "initDays": 0});;
        newUserMap.set("loginStatus", {"loginAttempts": 0, "maxLoginAttempts": maxLoginAttempts, "lockUntil": lockTime});
        newUserMap.set("blockchain", blockchain);
        //initialise files storage on the Document Stores (Distribued Ledgers) as Buffer -> note: limit on each file size is 16MB
        //arbitrary initialise Buffer values will be over-written once actual files are uploaded to the Distributed Ledgers
        newUserMap.set("distributedLedgersFiles", { "location": Buffer.from("lo"),
                                                    "reservoirVolumetrics": Buffer.from("resv"),
                                                    "petrophysical": Buffer.from("pp"),
                                                    "geoscience": Buffer.from("geo"),
                                                    "drilling": Buffer.from("drlg"),
                                                    "production": Buffer.from("prod")
        });
    
        return newUserMap;
    }

    mongoDBConnectionOptions(sslCertOptions, enableSSL)
    {
        if(enableSSL === true)
        {
            return {useNewUrlParser: true, useUnifiedTopology: true, readPreference: 'primaryPreferred',
                    maxStalenessSeconds: 90, poolSize: 200, ssl: true, sslValidate: true,
                    sslCA: sslCertOptions.ca, sslKey: sslCertOptions.key, sslCert: sslCertOptions.cert
            };
        }
        else
        {
            return {useNewUrlParser: true, useUnifiedTopology: true, readPreference: 'primaryPreferred',
                    maxStalenessSeconds: 90, poolSize: 200, ssl: false, sslValidate: false
            };
        }
    }
    
    mySQLConnectionOptions(sslCertOptions, enableSSL, connectionOptions)
    {
        if(enableSSL === true)
        {
            return {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                    password: connectionOptions.password, database: connectionOptions.database, debug: connectionOptions.debug,
                    timezone: 'Z', supportBigNumbers: true, ssl:{ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert},
                    pooling: { enabled: true, maxSize: 200 }
            };
        }
        else
        {
            return {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                    password: connectionOptions.password, database: connectionOptions.database, debug: connectionOptions.debug,
                    timezone: 'Z', supportBigNumbers: true, ssl: enableSSL, pooling: { enabled: true, maxSize: 200 }
            };
        }
    }
    
    AccessMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase, sslCertOptions,
                  createCollection=false, dropCollection=false, enableSSL=false, collectionDisplayOption=undefined)
    {
        //connect with "MongoDB Node.js Native Driver". See - https://www.npmjs.com/package/mongodb
        const mongodb = require('mongodb');
        const fs = require('fs');
        const util = require('util');
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        const mda = new AccessMongoDBAndMySQL();
        const mongodbOptions = mda.mongoDBConnectionOptions(sslCertOptions, enableSSL);
        
        mongodb.MongoClient.connect(uri, mongodbOptions, function(connectionError, client)
        {
            // 0.connect (authenticate) to database with mongoDB native driver (client)
            if(connectionError)
            {
                console.log(connectionError);
                console.log("Connection error: MongoDB-server is down or refusing connection.");
                return;
            }

            console.log();
            console.log("Now connected to MongoDB Server on:", dbDomainURL);
            console.log();
        
            const db = client.db(dbName);
            
            if(confirmDatabase === true && dbName !== null)
            {
                //1...... confirm collection(s) exit(s) within database
                db.listCollections().toArray(function(confirmCollectionError, existingCollections)
                {
                    if(confirmCollectionError)
                    {
                        console.log("confirm Collection Error: ", confirmCollectionError);
                        return;
                    }
                        
                    const collectionNamesList = AccessMongoDBAndMySQL.getMongoDBCollectionNames(existingCollections)
                        
                    if(existingCollections.length > 0)
                    {
                        console.log("Total number of COLLECTION(S) within", dbName, "database:", existingCollections.length);
                        console.log();
                        console.log("It is confirmed that the COLLECTION(S) below exist(s) within", dbName, "database:");
                        console.log(collectionNamesList);
                        console.log();
                    }

                    if(createCollection === true)
                    {
                        //2...... create collection (TABLE equivalent in MySQL), if desired
                        //note: "strict: true" ensures unique collectionName: this is like "CREATE TABLE IF NOT EXISTS tableName" in MySQL
                        //2a. create document
                        db.createCollection(collectionName, {strict: true}, function(createCollectionError, createdCollection)
                        {
                            if(createCollectionError && createCollectionError.name === "MongoError")
                            {
                                console.log("Error: Existing COLLLECTION Error or other Error(s)");
                                console.log()
                            }
                                
                            if(createdCollection)
                            {
                                console.log(collectionName, " COLLECTION successfully created!");
                                console.log();
                            }

                            //2b. count document(s)
                            //use aggregate pipeline stage to obtain number of existing document in the collection
                            const pipeline = [ { $group: { _id: null, numberOfDocuments: { $sum: 1 } } }, { $project: { _id: 0 } } ];
    
                            db.collection(collectionName).aggregate(pipeline).toArray(function(numberOfDocumentsError, documentPipeline)
                            {
                                if(numberOfDocumentsError)
                                {
                                    console.log("Document Counts Error: ", numberOfDocumentsError);
                                    return;
                                }
                                
                                var documentsCount = undefined;
                                
                                if(documentPipeline[0] === undefined)
                                {
                                    documentsCount = 0;
                                }
                                else
                                {
                                    documentsCount  =  documentPipeline[0].numberOfDocuments;
                                }
                                
                                console.log("Total number of documents in the ", collectionName, "Collection is: ", documentsCount);
                                console.log()
                                
                                //3...... insert/add document and its fields (key-value pairs) into collection
                                // .......this is equivalent to ROW & COLUMN-VALUES in regular MySQL
                                
                                // 3a. defined documents and its fields (key-value pairs)
                                const keys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
                                const values = AccessMongoDBAndMySQL.drillingEventDocumentValues();
                                const documentObjectMap = AccessMongoDBAndMySQL.drillingEventDocumentKeyValuePairsBinned(keys, values);
                                const documentObject = AccessMongoDBAndMySQL.convertMapToObject(documentObjectMap);
                              
                                //3b. insert
                                db.collection(collectionName).insertOne(documentObject, function(insertDocumentError, insertedObject)
                                {
                                    if(insertDocumentError)
                                    {
                                        console.log("Insert Document Error: ", insertDocumentError);
                                        return;
                                    }
                                                        
                                    console.log("Document with id (", documentObject._id, ") and its fields (key-value pairs), is inserted into " + String(collectionName) + " COLLECTION successfully!");
                                    console.log();
                                    
                                    //4...... show documents and its fields (i.e. key-value pairs) in the collection
                                    // note a: if "collectionDisplayOption" is null or undefined or unspecified, all documents & their
                                    //         fields (key-value pairs) in the COLLECTION will be displayed based on MongoDB default ordering
                                    // note b: empty {} documentNames signifies all document names in the collection
                                    if(collectionDisplayOption === "all" || collectionDisplayOption === null || collectionDisplayOption === undefined)
                                    {
                                        //option a: show all documents & their key-value pairs in the COLLECTION (sorted by dateTime in ascending order)
                                        var sortByKeys = {_id: 1};
                                        var specifiedKeys = {};
                                        var documentNames = {};
                                    }
                                    else if(collectionDisplayOption === "wellTrajectory")
                                    {
                                        //option b: show all documents & fields (key-value pairs), based on specified key, in the COLLECTION (sorted by _id in ascending order)
                                        //note: specified keys (except _id and TIME_ymd_hms) are related to "well trajectory"
                                        var sortByKeys = {_id: 1};
                                        var specifiedKeys =  {_id: 1, MD_ft: 1, TVD_ft: 1, INC_deg: 1, AZIM_deg: 1, Dogleg_deg_per_100ft: 1, TIME_ymd_hms: 1};
                                        var documentNames = {};
                                    }
                                                
                                    db.collection(collectionName).find(documentNames, {projection: specifiedKeys}).sort(sortByKeys).toArray(function(showCollectionError, foundCollection)
                                    {
                                        if(showCollectionError)
                                        {
                                                console.log("Show Collection Error: ", showCollectionError);
                                                return;
                                        }
                                                
                                        console.log("Some or all documents and their fields (key-value pairs) in " + String(collectionName) + " COLLECTION are shown below!");
                                        console.log(util.inspect(foundCollection, { showHidden: true, colors: true, depth: 4 }));
                                        console.log();
                                        
                                        //5...... drop/delete collection, if desired
                                        if(dropCollection === true)
                                        {
                                            db.collection(collectionName).drop(function(dropCollectionError, droppedCollectionConfirmation)
                                            {
                                                if(dropCollectionError)
                                                {
                                                    console.log("Drop/Delete Collection Error: ", dropCollectionError);
                                                    return;
                                                }
                                                                
                                                console.log(String(collectionName) + " Collection is successfully dropped/deleted!");
                                                console.log("Dropped?: ", droppedCollectionConfirmation);
                                                console.log();
                                            });
                                        }
                                        //6. create index on specified field(s) key, if collection is not dropped & documentsCount === 1
                                        else if(dropCollection !== true && documentsCount === 1)
                                        {
                                            const indexedFields =  {"mwdLwdData.TVD_ft": 1, "mwdLwdData.Dogleg_deg_per_100ft": 1};

                                            db.collection(collectionName).createIndex(indexedFields, function(indexedFieldError, indexedConfirmation)
                                            {
                                                if(indexedFieldError)
                                                {
                                                    console.log("Indexed Field Error: ", indexedFieldError);
                                                    return;
                                                }
                                                
                                                console.log("Confirm indexed fields: ", indexedConfirmation);
                                            });
                                        }
                                         
                                        //finally close client (i.e. disconnect) from MongoDB server
                                        client.close();
                                        console.log("Connection closed.......");
                                        console.log();
                                    });
                                });
                            });
                        });
                    }
                });
            }
        });
    }
    
    AccessMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase=false,
                createTable=false, dropTable=false, enableSSL=false, tableDisplayOption=undefined)
    {
        //connect with "MySQL Node.js Driver". See - https://www.npmjs.com/package/mysql
        const mysql = require('mysql');
        const fs = require('fs');
        const util = require('util');
        const mda = new AccessMongoDBAndMySQL();
        const mysqlOptions = mda.mySQLConnectionOptions(sslCertOptions, enableSSL, connectionOptions);
        const dbName = String(mysqlOptions.database);
        
        //0. connect (authenticate) to database with msql node.js driver (client)
        const client = mysql.createConnection(mysqlOptions);
        console.log();
        console.log("Connecting......");
           
        client.connect(function(connectionError)
        {
            if(connectionError)
            {
                console.log("Connection Error: ", connectionError);
                return;
            }
                        
            console.log("Now connected to MySql server on:", mysqlOptions.host);
            console.log();
            
            if(confirmDatabase === true && dbName !== null)
            {
                //1. confirm table(s) exit(s) within database
                var mySqlQuery = "SHOW TABLES"
                    
                client.query(mySqlQuery, function (confirmTableError, result)
                {
                    if(confirmTableError)
                    {
                        console.log("Confirm TABLE Error: ", confirmTableError);
                        return;
                    }
                          
                    if(result)
                    {
                        console.log("It is confirmed that the TABLE(S) below exist(s) within ", dbName, " database");
                        console.log(result);
                        console.log();
                    }
         
                    if(createTable === true)
                    {
                        //2. create a new table, if desired
                        const mda = AccessMongoDBAndMySQL;
                        const tableSchema =  mda.drillingEventTableSchema();
                        var mySqlQuery = "CREATE TABLE IF NOT EXISTS " + String(tableName) + tableSchema;
                            
                        client.query(mySqlQuery, function (createTableError, result)
                        {
                            if(createTableError)
                            {
                                console.log("Create TABLE Error: ", createTableError);
                                return;
                            }
                                
                            if(result)
                            {
                                console.log(String(tableName) + " TABLE successfully created!");
                                console.log();
                            }
              
                            //3. insert column values into TABLE row
                            var keys = AccessMongoDBAndMySQL.drillingEventTableKeys();
                            //note: "values" is an Array/List containing values of data types: double, text/string, boolean & datetime/date
                            var values = AccessMongoDBAndMySQL.drillingEventTableValues();
                            var mySqlQuery = "INSERT INTO " + String(tableName) + keys + " VALUES (?, ?, ?, ?,"
                                             + "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                            
                            client.query(mySqlQuery, values, function (insertTableError, result)
                            {
                                if(insertTableError)
                                {
                                    console.log("Insert TABLE Error: ", insertTableError);
                                    return;
                                }
                                    
                                console.log("Column values are inserted into " + String(tableName) + " TABLE successfully!");
                                console.log();
                     
                                //4. show rows and column values in the TABLE
                                if(tableDisplayOption === "all" || tableDisplayOption === null || tableDisplayOption === undefined)
                                {
                                    //a. all rows and columns
                                    var mySqlQuery = "SELECT * FROM " + String(dbName) + "." + String(tableName);
                                    var rowID = {}; //implies all rows
                                }
                                else if(tableDisplayOption === "wellTrajectoryAllRows")
                                {
                                    //b. all rows and and columns values related to "well trajectory" and "TIME"
                                    var someColumns = "MD_ft, TVD_ft, INC_deg, AZIM_deg, TIME_ymd_hms";
                                    var mySqlQuery = "SELECT " + someColumns + " FROM " + String(dbName) + "." + String(tableName);
                                    var rowID = {}; //implies all rows
                                }
                                else if(tableDisplayOption === "wellTrajectoryOneRow")
                                {
                                    //c. one row and and columns values related to "well trajectory" and "TIME"
                                    var someColumns = "MD_ft, TVD_ft, INC_deg, AZIM_deg, TIME_ymd_hms";
                                    var mySqlQuery = "SELECT " + someColumns + " FROM " + String(dbName) + "." + String(tableName) + " WHERE ROWID=?";
                                    var rowID = 1;
                                }
                                else
                                {
                                    //default: same as all
                                    var mySqlQuery = "SELECT * FROM " + String(dbName) + "." + String(tableName);
                                    var rowID = {}; //implies all rows
                                }

                                client.query(mySqlQuery, [rowID], function (showTableError, result)
                                {
                                    if(showTableError)
                                    {
                                        console.log("Show TABLE Error: ", showTableError);
                                        return;
                                    }
                                    
                                    console.log("Some or all rows and column values in " + String(tableName) + " TABLE are shown below!");
                                    console.log(util.inspect(result, { showHidden: true, colors: true, depth: 4 }));
                                    console.log();
                         
                                    //5. drop/delete table, if desired
                                    if(dropTable === true)
                                    {
                                        var mySqlQuery = "DROP TABLE IF EXISTS " + String(tableName);
                                            
                                        client.query(mySqlQuery, function (dropTableError, result)
                                        {
                                            if(dropTableError)
                                            {
                                                console.log("Drop/Delete TABLE Error: ", dropTableError);
                                                return;
                                            }
                                            
                                            console.log(String(tableName) + " TABLE is successfully dropped/deleted!")
                                            console.log();
                                        });
                                    }

                                    //finally close client (i.e. disconnect) from MySQL server
                                    client.end();
                                    console.log("Connection closed.......");
                                    console.log();
                                });
                            });
                        });
                    }
                });
            }
        });
    }
    
    AccessMySQLDocumentStore(sslCertOptions, connectionOptions, tableName, confirmDatabase=false,
                             createTable=false, dropTable=false, enableSSL=false, tableDisplayOption=undefined)
    {
        //connect with "MySQL Connector/Node.js". See - https://www.npmjs.com/package/@mysql/xdevapi
        const mysqlx = require('@mysql/xdevapi');
        const fs = require('fs');
        const util = require('util');
        const mda = new AccessMongoDBAndMySQL();
        const mysqlxOptions = mda.mySQLConnectionOptions(sslCertOptions, enableSSL, connectionOptions);
        const dbName = String(mysqlxOptions.database);
        
        //map mysql variables to no-mysql (document store) variables
        const collectionName = tableName;
        const createCollection = createTable;
        const dropCollection = dropTable;
        const collectionDisplayOption = tableDisplayOption;
        
        //change port to mysqlx default port of '33060' before passing "options" to connecting session
        mysqlxOptions.port = '33060';
        
        //0. connect (authenticate) to database with mysql connector/ node.js (client) - i.e. mysqlx
        const session = mysqlx.getSession(mysqlxOptions);
        console.log();
        console.log("Connecting......");
        
        session.then(function(clientSession)
        {
            console.log();
            console.log("Now connected to MySqlx server on:", mysqlxOptions.host);
            console.log();
            const db = clientSession.getSchema(dbName);
            
            if(confirmDatabase === true && dbName !== null)
            {
                //1...... confirm collection(s) exit(s) within database
                db.getCollections().then(function(existingCollections)
                {
                    const collectionNamesList = AccessMongoDBAndMySQL.getMySQLDocumentStoreCollectionNames(existingCollections)
                    
                    if(collectionNamesList.length > 0)
                    {
                        console.log("Total number of COLLECTION(S) within", dbName, "database:", collectionNamesList.length);
                        console.log();
                        console.log("It is confirmed that the COLLECTION(S) below exist(s) within", dbName, "database:");
                        console.log(collectionNamesList);
                        console.log();
                    }
                    
                }).catch(function(confirmCollectionError)
                {
                    if(confirmCollectionError)
                    {
                        console.log("Confirm Collection Error: ", confirmCollectionError);
                        return;
                    }
                });
                
                if(createCollection === true)
                {
                    //2...... create collection (TABLE equivalent in MySQL), if desired
                    db.createCollection(collectionName).then(function(createdCollection)
                    {
                        if(createdCollection)
                        {
                                console.log(collectionName, " COLLECTION successfully created!");
                                console.log();
                        }
                            
                    }).catch(function(createCollectionError)
                    {
                        if(createCollectionError && createCollectionError.info.code === 1050)
                        {
                            console.log("Create Collection Error: Collection", JSON.stringify(collectionName), "already exists.");
                        }
                        else
                        {
                            console.log("Create Collection Error: ", createCollectionError);
                        }
                    });
                        
                    //3...... insert/add document and its fields (key-value pairs) into collection
                    // .......this is equivalent to ROW & COLUMN-VALUES in regular MySQL
                    const keys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
                    const values = AccessMongoDBAndMySQL.drillingEventDocumentValues();
                    const documentObjectMap = AccessMongoDBAndMySQL.drillingEventDocumentKeyValuePairsBinned(keys, values);
                    const documentObject = AccessMongoDBAndMySQL.convertMapToObject(documentObjectMap);
          
                    db.getCollection(collectionName).add(documentObject).execute().then(function(addedDocument)
                    {
                        console.log("Document with id (", addedDocument.getGeneratedIds(), ") and its field values " + "are inserted into " + String(collectionName) + " COLLECTION successfully!");
                        console.log();

                    }).catch(function(addDocumentError)
                    {
                        if(addDocumentError)
                        {
                            console.log("Add Document Error: ", addDocumentError);
                            return;
                        }
                    });
                            
                    //4...... show documents and its fields (i.e. key-value pairs) in the collection
                    db.getCollection(collectionName).find().execute(function(foundCollection)
                    {
                        console.log("Document with id (", foundCollection._id, ") and its key-value pair in " + String(collectionName) + " COLLECTION, is shown below!");
                        console.log(util.inspect(foundCollection, { showHidden: true, colors: true, depth: 4 }));
                                    
                    }).catch(function(showCollectionError)
                    {
                        if(showCollectionError)
                        {
                            console.log("Show COLLECTION Error: ", showCollectionError);
                            return;
                        }
                    });
                                
                    //5...... drop/delete collection, if desired
                    if(dropCollection === true)
                    {
                        db.dropCollection(collectionName).then(function(droppedCollectionConfirmation)
                        {
                            console.log(String(collectionName) + " COLLECTION is successfully dropped/deleted!");
                            console.log("Dropped?: ", droppedCollectionConfirmation);
                            console.log();
                            
                            //finally close client (i.e. disconnect) from MySQL server session
                            clientSession.close();
                            console.log("Connection closed.......");
                            console.log();
                                
                        }).catch(function(dropCollectionError)
                        {
                            if(dropCollectionError)
                            {
                                console.log("Drop/Delete COLLECTION Error: ", dropCollectionError);
                                return;
                            }
                        });
                    }
                    
                    //finally close client (i.e. disconnect) from MySQL server session
                    clientSession.close();
                    console.log("Connection closed.......");
                    console.log();
                }
            }
            
        }).catch(function(connectionError)
        {
            if(connectionError)
            {
                console.log("Connection Error: ", connectionError);
                return;
            }
        });
    }
    
    mongoDBGridFSUploadDownloadFiles(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions,
                                  collectionName, enableSSL, inputFilePath, outputFileName, action)
    {
        const fs = require('fs');
        const assert = require('assert');
        const mongodb = require('mongodb');
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        const mda = new AccessMongoDBAndMySQL();
        const mongodbOptions = mda.mongoDBConnectionOptions(sslCertOptions, enableSSL);
        
        mongodb.MongoClient.connect(uri, mongodbOptions, function(connectionError, client)
        {
            if(connectionError)
            {
                console.log(connectionError);
                console.log("Connection error: MongoDB-server is down or refusing connection.");
                return;
            }
            
            const bufferSize = 1024;
            const db = client.db(dbName);
            const bucket  = new mongodb.GridFSBucket(db, {bucketName: collectionName, chunkSizeBytes: bufferSize});
                   
            if(action === "upload")
            {
                const upload = fs.createReadStream(inputFilePath, {'bufferSize': bufferSize}).pipe(bucket.openUploadStream(outputFileName));
                    
                upload.on('error', function(error)
                {
                    assert.ifError(error);
                   
                });
                    
                upload.on('finish', function()
                {
                    console.log('Done uploading' + inputFilePath + '!');
                    client.close();
                    process.exit(0);
                });
            }
                    
            if(action === "download")
            {
                const download = bucket.openDownloadStreamByName(inputFilePath).pipe(fs.createWriteStream(outputFileName), {'bufferSize': bufferSize});
                    
                download.on('error', function(error)
                {
                    assert.ifError(error);
                });
                    
                download.on('finish', function()
                {
                    console.log('Done downloading ' + outputFileName + '!');
                    client.close();
                    process.exit(0);
                });
            }
        });
    }

    isMongoDBConnected(mongoDBConnection)
    {
        return mongoDBConnection.client.isConnected();
    }

    reusableMongoDBConnection(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, enableSSL, connectionBolean)
    {
        //use mongoose ORM as interface to "MongoDB Node.js Native Driver" - this ensures reusability of a
        //MongoDBConnection, instead of connecting everytime a CRUD operation request is sent to the server
        const mongoose = require('mongoose');
        mongoose.Promise = require('bluebird');
        //set mongoose to remove globally, the "deprecation warnings" related to the following options
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useUnifiedTopology', true);
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        const mda = new AccessMongoDBAndMySQL();
        const mongodbOptions = mda.mongoDBConnectionOptions(sslCertOptions, enableSSL);
        
        if(mongoose.connection.readyState === 1 && connectionBolean === false)
        {
            //is connected & want to close/disconnect
            mongoose.connection.close(function(err)
            {
                if(err)
                {
                    console.log(err);
                    return;
                }
                console.log('NOW disconnected from MongoDB-server');
            });
        }
        
        if(mongoose.connection.readyState === 0 && connectionBolean === true)
        {
            // connect (authenticate) to database - using promise with mongoose ORM
            mongoose.connect(uri, mongodbOptions, function(connectionError, connection)
            {
                if(connectionError)
                {
                    console.log(connectionError);
                    console.log("Connection error: MongoDB server is down or refusing connection.");
                    return;
                }
    
            }).then(function(mongoCallback)
            {
                console.log();
                console.log("Now connected to MongoDB Server on: ", mongoose.connection.host); //or
                //console.log("Now connected to MongoDB Server on: ", mongoCallback.connections[0].host);
    
            }).catch(function(otherError)
            {
                if(otherError)
                {
                    console.log("Other error:", otherError);
                    return;
                }
            });
        }
        
        process.on('SIGINT', function()
        {
            //is connected and app is terminated: then close
            mongoose.connection.close(function ()
            {
                console.log('NOW disconnected from MongoDB server through app termination');
                console.log('  ');
                process.exit(0);
            });
                    
        }).setMaxListeners(0); //handles max event emmitter error
        
        return mongoose.connection;
    }
}


class TestAccessMongoDBAndMySQL
{
    constructor(test=true, dbType=undefined)
    {
        const fs = require('fs');
        const mda = new TestAccessMongoDBAndMySQL();
            
        if(test === true && dbType === 'MongoDB')
        {
          const dbUserName = "dbUserName";
          const dbUserPassword = "dbUserPassword";
          const dbDomainURL = "db.domain.com";
          const dbName = "dbName";
          const collectionName = "Drilling_Events";
          const confirmDatabase = true;
          const sslCertOptions = {
            ca: fs.readFileSync('/path_to_/ca.pem'),
            key: fs.readFileSync('//path_to_/key.pem'),
            cert: fs.readFileSync('//path_to_/cert.pem')
          };
          const createCollection = true;
          const dropCollection = true;
          const enableSSL = false;
          const collectionDisplayOption = "all"; //or "wellTrajectory"
          mda.AccessMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase,
                            sslCertOptions, createCollection, dropCollection, enableSSL, collectionDisplayOption);
        }
        
        if(test === true && (dbType === 'MySql' || dbType === 'MySqlx'))
        {
          const sslCertOptions = {
            ca: fs.readFileSync('/path_to_/ca.pem'),
            key: fs.readFileSync('/path_to_/client-key.pem'),
            cert: fs.readFileSync('/path_to_/client-cert.pem'),
          };
          const connectionOptions = {
            host: 'host',
            port: 'port',
            user: 'user',
            password: 'password',
            database: 'databaseName',
            debug: false,
            ssl: {ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert}
          };
          const tableName = "Drilling_Events"
          const confirmDatabase = true;
          const createTable = true;
          const dropTable = true;
          const enableSSL = false;
          const tableDisplayOption = "all"; // or "wellTrajectoryOneRow" or "wellTrajectoryAllRows" 
          if(dbType == 'MySql')
          {
            mda.AccessMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }
          else if(dbType == 'MySqlx')
          {
              mda.AccessMySQLDocumentStore(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }
        }
    }
}

module.exports = {AccessMongoDBAndMySQL, TestAccessMongoDBAndMySQL};

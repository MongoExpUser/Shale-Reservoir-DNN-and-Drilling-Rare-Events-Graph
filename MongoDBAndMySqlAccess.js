/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 * @License Ends
 *
 *
 * ...Ecotert's MongoDBAndMySQLAccess.js (released as open-source under MIT License) implements:
 
 * A) MongoDBAndMySQLAccess(): to get access (cconnect & CRUD) to MongoDB and MySQL databases and file i/o using:
 *
 *    (1) MongoDB native driver - https://www.npmjs.com/package/mongodb
 *    (2) Mongoose ORM - https://www.npmjs.com/package/mongoose
 *    (3) MySQL's JavaScript/Node.js driver - https://www.npmjs.com/package/mysql
 *    (4) Node.js native stream modules and MongoDB's GridFS
 *
 * B) TestMongoDBAndMySqlAccess(): a test class for testing MongoDBAndMySQLAccess()
 *
 *
 */

class MongoDBAndMySqlAccess
{
    constructor()
    {
      return null;
    }
    
    static getCollectionNames(collectionsList)
    {
        var namesList = [];
                            
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
    
    static drillingEventTableSchema()
    {
        let keys = "";
        let closeBracket = ") ";
        let closeBracketFinally = ")";
        let inputKeys = MongoDBAndMySqlAccess.drillingEventDocumentKeys();
        
        //add "ROWID" primary key as auto increment (primary key is like automatically assigned "_id" in MongoDB)
        keys = " (ROWID INT AUTO_INCREMENT PRIMARY KEY, ";
        
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < 9)
            {
                keys = keys + inputKeys[index] + " DOUBLE, ";
            }
            else if(index === 9)
            {
                keys = keys + inputKeys[index] + " TEXT, ";
            }
            else if(index > 9  && index < 17)
            {
                keys = keys + inputKeys[index] + " DOUBLE, ";
            }
            else if(index >= 17  && index < 21)
            {
                keys = keys + inputKeys[index] + " BOOLEAN, ";
            }
            else
            {
                keys = keys + inputKeys[index] + " DATETIME, ";
            }
        }
        
        //add constraints on some LWD data
        let constraints = "CHECK (0>=GR_api<=150), CHECK (0>=DEEP_RESISTIVITY_ohm_m<= 2000)";
        
        const tableSchema = keys + constraints + closeBracketFinally;
        
        return tableSchema;
    }
    
    static drillingEventTableKeys()
    {
        return " " +
                //data from regular drilling operation
                "(ROP_fph, " +
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
                //event data from MWD/LWD MWD/LWD tool measurements and other sources
                "IS_VIBRATION_boolean_0_or_1, " +
                "IS_KICK_boolean_0_or_1, " +
                "IS_STUCKPIPE_boolean_0_or_1, " +
                //time data
                "TIME_ymd_hms)";
    }

    static drillingEventTableValues()
    {
        //values below map directly, sequentially, to keys in drillingEventTableKeys()
        return MongoDBAndMySqlAccess.drillingEventDocumentValues();
    }
    
    static drillingEventDocumentKeys()
    {
        return [
                //data from regular drilling operation
                "ROP_fph",
                "RPM_rpm",
                "SPP_psi",
                "DWOB_lb",
                "SWOB_lb",
                "TQR_Ibft",
                "MUD_WEIGHT_sg",
                "MUD_VISC_cp",
                "MUD_FLOW_RATE_gpm",
                "BHA_TYPE_no_unit",
                //data from downhole MWD/LWD tool measurements
                "TVD_ft",
                "MD_ft",
                "INC_deg",
                "AZIM_deg",
                "CALIPER_HOLE_SIZE_inches",
                "GR_api",
                "DEEP_RESISTIVITY_ohm_m",
                "SHOCK_g",
                //event data from MWD/LWD MWD/LWD tool measurements and other sources
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
        return [    //data from regular drilling operation
                    35, 65, 235, 20000, 10000, 800, 1.18, 1.03, 98.14, 'slick',
                    
                    //data from downhole MWD/LWD tool measurements
                    8000, 12000, 67.2, 110.5, 6, 20, 303.3, 26,
                    
                    //event data from MWD/LWD MWD/LWD tool measurements and other sources
                    0, 0, 0,
                    
                    //time data
                    new Date()
                ];
    }
    
    static drillingEventDocumentKeyValuePairs(keys, values)
    {
        const keyValuePairs = {};
        const validKeyValuePairs = (keys !== null) && (keys !== undefined) && (values !== null) &&
                                   (values !== undefined) && (keys.length === values.length);
        
        if(validKeyValuePairs === true)
        {
            for(let index = 0; index < keys.length; index++)
            {
                keyValuePairs[keys[index]] = values[index];
            }
        }
        
        return keyValuePairs;
    }
    
    static drillingEventDefaultValues()
    {
        //values below map directly, sequentially, to keys in drillingEventDocumentKeys()
        return [    //data from regular drilling operation
                    null, null, null, null, null, null, null, null, null, null,
                    
                    //data from downhole MWD/LWD tool measurements
                    null, null, null, null, null, null, null, null,
                    
                    //event data from MWD/LWD MWD/LWD tool measurements and other sources
                    null, null, null,
                    
                    //time data
                    null
                ];
    }
   
    static connectToMongoDBInit(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase, sslCertOptions,
                                createCollection=false, dropCollection=false, enableSSL=false, documentDisplayOption=undefined)
    {
        const mongoose = require('mongoose');
        mongoose.Promise = require('bluebird');
        const fs = require('fs');
        //set mongoose to remove globally, the "deprecation warnings" related to these 3 options
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        
        //const uri = 'mongodb://username:pasd@domain.com/dbName';
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        
        let connOptions = {};
        
        if(enableSSL === true)
        {
            connOptions = {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, readPreference: 'primaryPreferred', maxStalenessSeconds: 90,
                           ssl: true, sslValidate: true, poolSize: 200, sslCA: sslCertOptions.ca, sslKey: sslCertOptions.key, sslCert: sslCertOptions.cert,
                          };
        }
        else
        {
            connOptions = {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, readPreference: 'primaryPreferred', maxStalenessSeconds: 90,
                           ssl: false, sslValidate: true, poolSize: 200
                          };
        }
             
        //0. connect (authenticate) to database - using promise
        mongoose.connect(uri, connOptions, function(connectionError)
        {
            if(connectionError)
            {
                console.log(connectionError);
                console.log("Connection error: MongoDB-server is down or refusing connection.");
                return;
            }
            
        }).then(function(callbackDB)
        {
            console.log("Now connected to MongoDB Server on: ", mongoose.connection.host);
            console.log();
            const db  = mongoose.connection;  // or callbackDB.connections[0];
            const dbm = db.client.db(dbName);
            console.log();
            
            if(confirmDatabase === true && dbName !== null)
            {
                //1. confirm collection(s) exit(s) within database - using Async IIFE
                (async function()
                {
                    dbm.listCollections().toArray(function(confirmCollectionError, existingCollections)
                    {
                        if(confirmCollectionError)
                        {
                            console.log("confirm Collection Error: ", confirmCollectionError);
                            return;
                        }
                        
                        //2. check if "collectionName" exists in collection(s)
                        const collectionNamesList = MongoDBAndMySqlAccess.getCollectionNames(existingCollections)
                        
                        if(existingCollections.length > 0)
                        {
                            console.log("It is confirmed that the COLLECTION(S) below exist(s) within ", dbName, " database");
                            console.log(collectionNamesList);
                            console.log();
                        }
                    });
                    
                })().then(function()
                {
                    if(createCollection === true)
                    {
                        //3. create collection (TABLE equivalent in MySQL), if desired - using Async IIFE
                        (async function()
                        {
                            //note: "strict: true" ensures unique collectionName: this is like "CREATE TABLE IF NOT EXISTS tableName" in MySQL
                            db.createCollection(collectionName, {strict: true}, function(createCollectionError, createdCollection)
                            {
                                if(createCollectionError && createCollectionError.name === "MongoError")
                                {
                                    console.log("Error: Existing COLLLECTION Error or other Error(s)");
                                }
                                
                                if(createdCollection)
                                {
                                    console.log(collectionName, " COLLECTION successfully created!");
                                    console.log();
                                }
                            });
                            
                        })().then(function()
                        {
                            //4. insert document and its key-value pairs (ROWS-COLUMN_VALUES equivalent in MySQL) into collection - using Async IIFE
                            (async function()
                            {
                                const mda = MongoDBAndMySqlAccess;
                                const keys = mda.drillingEventDocumentKeys();
                                const values = mda.drillingEventDocumentValues()
                                const documentObject = mda.drillingEventDocumentKeyValuePairs(keys, values);

                                db.collection(collectionName).insertOne(documentObject, function(insertCollectError, insertedObject)
                                {
                                    if(insertCollectError)
                                    {
                                        console.log("Insert Collection Error: ", insertCollectError);
                                        return;
                                    }
                                        
                                    console.log("Document with id (",documentObject._id,") and its field values are inserted into " + String(collectionName) + " COLLECTION successfully!");
                                    console.log();
                                });
                                
                            })().then(function()
                            {
                                //5. show records - using Async IIFE
                                // note a: if "documentDisplayOption" is null or undefined or unspecified, all documents & their
                                //         key-value pairs in the COLLECTION will be displayed based on MongoDB default ordering
                                // note b: empty {} documentNames signifies all document names in the collection
                                (async function()
                                {
                                    if(documentDisplayOption === "all" || documentDisplayOption === null || documentDisplayOption === undefined)
                                    {
                                        //option a: show all documents & their key-value pairs in the COLLECTION (sorted by dateTime in ascending order)
                                        var sortByKeys = {TIME_ymd_hms: 1};
                                        var specifiedKeys = {};
                                        var documentNames = {};
                                    }
                                    else if(documentDisplayOption === "wellTrajectory")
                                    {
                                        //option b: show all documents & key-value pairs, based on specified key, in the COLLECTION (sorted by dateTime in ascending order)
                                        //note: specified keys (except _id and TIME_ymd_hms) are related to "well trajectory"
                                        var sortByKeys = {TIME_ymd_hms: 1};
                                        var specifiedKeys =  {_id: 1, MD_ft: 1, TVD_ft: 1, INC_deg: 1, AZIM_deg: 1, TIME_ymd_hms: 1};
                                        var documentNames = {};
                                    }
                                    
                                    db.collection(collectionName).find(documentNames, {projection: specifiedKeys}).sort(sortByKeys).toArray(function(showCollectionError, foundCollection)
                                    {
                                        if(showCollectionError)
                                        {
                                            console.log("Show COLLECTION Error: ", showCollectionError);
                                            return;
                                        }
                                    
                                        console.log("All documents and their field values in " + String(collectionName) + " COLLECTION are shown below!");
                                        console.log(foundCollection);
                                        console.log();
                                    });
                                    
                                })().then(function()
                                {
                                    //6. drop/delete collection, if desired - using Async IIFE
                                    (async function()
                                    {
                                        if(dropCollection === true)
                                        {
                                            db.collection(collectionName).drop(function(dropCollectionError, droppedCollectionConfirmation)
                                            {
                                                if(dropCollectionError)
                                                {
                                                    console.log("Drop/Delete COLLECTION Error: ", dropCollectionError);
                                                    return;
                                                }
                                                            
                                                console.log(String(collectionName) + " COLLECTION is successfully dropped/deleted!");
                                                console.log("Dropped?: ", droppedCollectionConfirmation);
                                                console.log();
                                                db.close();
                                            });
                                        }
                                        else if(dropCollection !== true)
                                        {
                                            db.close();
                                        }
                                        
                                    })().catch(function(error){throw error});
                                    
                                }).catch(function(error){throw error});
                                
                            }).catch(function(error){throw error});
                            
                        }).catch(function(error){throw error});
                    }
                    
                }).catch(function(error){throw error});
            }
            
        }).catch(function(error){throw error});
    }
    
    connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase, sslCertOptions,
                     connectionBolean=true, createCollection=false, dropCollection=false, enableSSL=false,
                     documentDisplayOption=undefined)
    {
        const mongoose = require('mongoose');
            
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
            //is closed/disconnected & want to connect
            console.log();
            console.log("Connecting......");
            MongoDBAndMySqlAccess.connectToMongoDBInit(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase,
                                                       sslCertOptions, createCollection, dropCollection, enableSSL, documentDisplayOption);
        }
                
        process.on('SIGINT', function()
        {
            //is connected and app is terminated: then close
            mongoose.connection.close(function ()
            {
                console.log('NOW disconnected from MongoDB-server through app termination');
                console.log('  ');
                process.exit(0);
            });
                    
        }).setMaxListeners(0); //handles max event emmitter error
             
        return mongoose.connection;
    }
    
    connectToMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase=false,
                   createTable=false, dropTable=false, enableSSL=false, tableDisplayOption=undefined)
    {
        const fs = require('fs');
        const mysql = require('mysql');
        let mysqlOptions = {};
        
        if(enableSSL === true)
        {
            mysqlOptions = {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                            password: connectionOptions.password, database: connectionOptions.database, debug: connectionOptions.debug,
                            timezone: 'Z', supportBigNumbers: true, ssl: {ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert}
                           }
        }
        else
        {
            mysqlOptions = {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                            password: connectionOptions.password, database: connectionOptions.database, debug: connectionOptions.debug,
                            timezone: 'Z', supportBigNumbers: true, ssl: enableSSL
                           }
            
        }
        
        //get database name
        const dbName = String(connectionOptions.database);
        
        //create connection (authenticate) to database
        const nodeJSConnection = mysql.createConnection(mysqlOptions);
        console.log();
        console.log("Connecting......");
           
        //0. connect to database - using Async IIFE
        (async function()
        {
            nodeJSConnection.connect(function(connectionError)
            {
                if(connectionError)
                {
                    console.log("Connection Error: ", connectionError);
                    return;
                }
                        
                console.log("Now connected to MySql server on: ", connectionOptions.host);
                console.log();
            
            });
            
        })().then(function()
        {
            if(confirmDatabase === true && dbName !== null)
            {
                //1. confirm table(s) exit(s) within database - using Async IIFE
                (async function()
                {
                    var mySqlQuery = "SHOW TABLES"
                    
                    nodeJSConnection.query(mySqlQuery, function (confirmTableError, result)
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
                    });
                    
                })().then(function()
                {
                    if(createTable === true)
                    {
                        //2. create a new table, if desired - using Async IIFE
                        (async function()
                        {
                            const mda = MongoDBAndMySqlAccess;
                            
                            const tableSchema =  mda.drillingEventTableSchema();
                            
                            var mySqlQuery = "CREATE TABLE IF NOT EXISTS " + String(tableName) + tableSchema;
                            
                            nodeJSConnection.query(mySqlQuery, function (createTableError, result)
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
                            });
                            
                        })().then(function()
                        {
                            //3. insert column values - using Async IIFE
                            (async function()
                            {
                                var keys = MongoDBAndMySqlAccess.drillingEventTableKeys();
                                
                                var values = MongoDBAndMySqlAccess.drillingEventTableValues();

                                var mySqlQuery = "INSERT INTO " + String(tableName) + keys + " VALUES (?, ?, ?,"
                                                 + " ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                
                                nodeJSConnection.query(mySqlQuery, values, function (insertTableError, result)
                                {
                                    if(insertTableError)
                                    {
                                        console.log("Insert TABLE Error: ", insertTableError);
                                        return;
                                    }
                                    
                                    console.log("Column values are inserted into " + String(tableName) + " TABLE successfully!");
                                    console.log();
                                });
                            
                            })().then(function()
                            {
                                //4. show rows and column values in the TABLE - using Async IIFE
                                (async function()
                                {
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

                                    nodeJSConnection.query(mySqlQuery, [rowID], function (showTableError, result)
                                    {
                                        if(showTableError)
                                        {
                                            console.log("Show TABLE Error: ", showTableError);
                                            return;
                                        }
                                    
                                        console.log("Some or all rows and column values in " + String(tableName) + " TABLE are shown below!");
                                        console.log(result);
                                        console.log();
                                    });
                                
                                })().then(function()
                                {
                                    //5. drop/delete table, if desired - using Async IIFE
                                    (async function()
                                    {
                                        if(dropTable === true)
                                        {
                                            var mySqlQuery = "DROP TABLE IF EXISTS " + String(tableName);
                                            
                                            nodeJSConnection.query(mySqlQuery, function (dropTableError, result)
                                            {
                                                if(dropTableError)
                                                {
                                                    console.log("Drop/Delete TABLE Error: ", dropTableError);
                                                    return;
                                                }
                                            
                                                console.log(String(tableName) + " TABLE is successfully dropped/deleted!")
                                                console.log();
                                                nodeJSConnection.end();
                                            });
                                        }
                                        else if(dropTable !== true)
                                        {
                                            nodeJSConnection.end();
                                        }
                                        
                                    }()).catch(function(error){throw error});
                                    
                                    
                                }).catch(function(error){throw error});
                                
                            }).catch(function(error){throw error});
                            
                        }).catch(function(error){throw error});
                        
                    }
                    
                }).catch(function(error){throw error});
            
            }
            
        }).catch(function(error){throw error});
    }
    
    uploadDownloadFileGridFS(collectionName, connectedDB, inputFilePath, outputFileName, action)
    {
        // method to upload and download file from MongoDB database in GridFS format
        const mongodb         = require('mongodb');
        const fs              = require('fs');
        const assert          = require('assert');
        const db              = connectedDB.db;
            
        const bucket  = new mongodb.GridFSBucket(db, {bucketName: collectionName, chunkSizeBytes: 1024});
               
        if(action === "upload")
        {
            const upload = fs.createReadStream(inputFilePath, {'bufferSize': 1024}).pipe(bucket.openUploadStream(outputFileName));
                
            upload.on('error', function(error)
            {
                assert.ifError(error);
            });
                
            upload.on('finish', function()
            {
                console.log('Done uploading' + inputFilePath + '!');
            });
        }
                
        if(action === "download")
        {
            const download = bucket.openDownloadStreamByName(inputFilePath).pipe(fs.createWriteStream(outputFileName), {'bufferSize': 1024});
                
            download.on('error', function(error)
            {
                assert.ifError(error);
            });
                
            download.on('finish', function()
            {
                console.log('Done downloading ' + outputFileName + '!');
            });
        }
    }
    
    uploadDownloadFileInMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions,
                                connectionBolean, collectionName, inputFilePath, outputFileName, action)
    {
        const mda = new MongoDBAndMySqlAccess();
        const connectedDB = mda.connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, connectionBolean);
            
        connectedDB.then(function()
        {
            mda.uploadDownloadFileGridFS(collectionName, connectedDB, inputFilePath, outputFileName, action);
        }).catch(function(error)
        {
            if(error)
            {
                console.log(error, " : Uploading file error successfully intercepted and handled.");
            }
        });
    }
}

class TestMongoDBAndMySqlAccess
{
    constructor(test=true, dbType=undefined)
    {
        const fs = require('fs');
        const mda = new MongoDBAndMySqlAccess();
            
        if(test === true && dbType == 'MongoDB')
        {
          const dbUserName = "dbUserName";
          const dbUserPassword = "dbUserPassword";
          const dbDomainURL = "db.domain.com";
          const dbName = "dbName";
          const collectionName = "Drilling_Events";
          const confirmDatabase = true;
          const connectionBolean = true;
          const sslCertOptions = {
            ca: fs.readFileSync('/path_to_/ca.pem'),
            key: fs.readFileSync('//path_to_/key.pem'),
            cert: fs.readFileSync('//path_to_/cert.pem')
          };
          const createCollection = true;
          const dropCollection = true;
          const enableSSL = false;
          const documentDisplayOption = "all"; //or "wellTrajectory"
          mda.connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase, sslCertOptions,
                               connectionBolean, createCollection, dropCollection, enableSSL, documentDisplayOption);
        }
        
        if(test === true && dbType == 'MySql')
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
          //const tableDisplayOption = "all"; // or "wellTrajectoryOne" or "wellTrajectoryAll"
          mda.connectToMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
        }
    }
}

module.exports = {MongoDBAndMySqlAccess, TestMongoDBAndMySqlAccess};

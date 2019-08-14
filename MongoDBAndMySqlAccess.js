/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * ...Ecotert's MongoDBAndMySQLAccess.js (released as open-source under MIT License) implements:
 *
 * Relevant access to MongoDB and MySQL databases and file i/o using:
 *
 * (1) MongoDB native driver - https://www.npmjs.com/package/mongodb
 * (2) Mongoose ORM - https://www.npmjs.com/package/mongoose
 * (3) MySQL's JavaScript/Node.js driver - https://www.npmjs.com/package/mysql
 * (4) Node.js native stream modules and MongoDB's GridFS
 *
 */

class MongoDBAndMySqlAccess
{
    constructor()
    {
      return null;
    }
    static connectMongoDBWithMongoose(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions)
    {
        const mongoose = require('mongoose');
        mongoose.Promise = require('bluebird');
        mongoose.set('useCreateIndex', true);
        const fs = require('fs');

        //const uri = 'mongodb://username:pasd@domain.com/dbName';
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName)
        const connOptions = {useNewUrlParser: true, readPreference: 'primaryPreferred', maxStalenessSeconds: 90,
                             ssl: true, sslValidate: true, sslCA: sslCertOptions.ca, sslKey: sslCertOptions.key,
                             sslCert: sslCertOptions.cert, poolSize: 20};
             
        //connect (authenticate) to database using promise
        mongoose.connect(uri, connOptions, function(err)
        {
            if(err)
            {
                console.log(err);
                console.log("Connection error: MongoDB-server is down or refusing connection.");
                return;
            }
    
            console.log("NOW connected to MongoDB on: ", mongoose.connection.host);
                    
        }).then(function(callbackDB)
        {
            return callbackDB.connections[0];

        }).catch(function(err)
        {
            if(err)
            {
                console.log(err);
                console.log("Connection error: Connection refusal error detected and successfully handled.");
                return;
            };
        });
    }
    
    connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, connectionBolean=true)
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
            MongoDBAndMySqlAccess.connectMongoDBWithMongoose(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions);
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
    
    connectToMySQL(sslCertOptions, connectionOptions, confirmDatabase=false, createTable=false)
    {
        const fs = require('fs');
        const mysql = require('mysql');
        const mysqlOptions = {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                              password: connectionOptions.password, database: connectionOptions.database,
                              ssl: {ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert},
                              debug: connectionOptions.debug
                             }
        
        //get database name
        const dbName = String(connectionOptions.database);
        
        //create connection (authenticate) to database
        const nodeJSConnect = mysql.createConnection(mysqlOptions);
                
        nodeJSConnect.connect(function(connectionError)
        {
            if(connectionError)
            {
                console.log("Connection Error: ", connectionError);
                return;
            }
                      
            console.log("Connection to MySql server is established......");
            
            //then confirm table(s) exit(s) within database, and create table is desired, using callbacks/asynchronously
            if(confirmDatabase === true && dbName !== null)
            {
                var mySqlQuery = "SHOW TABLES"
                
                nodeJSConnect.query(mySqlQuery, function (confirmTableError, result)
                {
                    if(confirmTableError)
                    {
                        console.log("Table confirmation Error: ", confirmTableError);
                        return;
                    }
                      
                    console.log(result);
                    console.log("Confirmed TABLE(S) exist within ", dbName);
                    
                    //create a new table
                    if(createTable === true)
                    {
                        var mySqlQuery = "CREATE TABLE reservoirType (dominantMineral VARCHAR(255), fluidContent VARCHAR(255))";
                        
                        nodeJSConnect.query(mySqlQuery, function (createTableError, result)
                        {
                            if(createTableError)
                            {
                                console.log("Table creation Error: ", createTableError);
                                return;
                            }
                            
                            console.log(result);
                            console.log("TABLE successfully created");
                        });
                    }
                });
            }
        });
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
    
    uploadDownloadFileInMongoDB (dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, connectionBolean, collectionName, inputFilePath, outputFileName, action)
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

module.exports = {MongoDBAndMySqlAccess};

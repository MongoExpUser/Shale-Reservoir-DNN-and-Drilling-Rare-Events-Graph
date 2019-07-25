/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * ...Ecotert's MongoDBAccess.js (released as open-source under MIT License) implements:
 *
 * Relevant access to MongoDB database using:
 *
 * (1) MongoDB native driver
 * (2) Mongoose ORM
 * (3) Other objects from "ShaleReservoirCommunication.js"
 * (4) etc.
 *
 */


class MongoDBAccess
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
                             sslCert: sslCertOptions.cert
                            };
             
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
            MongoDBAccess.connectMongoDBWithMongoose(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions);
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
        
    uploadDownloadFileInMongoDB (dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, connectionBolean, collectionName, inputFilePath, outputFileName, action)
    {
        const mda = new MongoDBAccess();
        const connectedDB = mda.connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, connectionBolean);
            
        connectedDB.then(function()
        {
            const ShaleReservoirCommunication  = require('./ShaleReservoirCommunication.js').ShaleReservoirCommunication;
            const src = new ShaleReservoirCommunication();
            src.uploadDownloadFileGridFS(collectionName, connectedDB, inputFilePath, outputFileName, action);

        }).catch(function(error)
        {
            if(error)
            {
                console.log(error, " : Uploading file error successfully intercepted and handled.");
            }
        });
    }
}

module.exports = {MongoDBAccess};


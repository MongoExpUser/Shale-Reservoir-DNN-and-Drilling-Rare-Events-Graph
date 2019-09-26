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
 
 * A) MongoDBAndMySQLAccess() class: to get access (connect, CRUD & simple queries) to MongoDB & MySQL databases and files upload/download
 *
 *    (1) MongoDB native driver - https://www.npmjs.com/package/mongodb
 *    (2) MySQL's JavaScript/Node.js driver - https://www.npmjs.com/package/mysql
 *    (3) Node.js native file stream module and MongoDB's GridFS
 *
 * B) TestMongoDBAndMySqlAccess() class : a test class for testing MongoDBAndMySQLAccess()
 *
 *
 */


class TestMongoDBAndMySqlAccess
{
    constructor(test=true, dbType=undefined, action=undefined)
    {
        const fs = require('fs');
        const mda = new MongoDBAndMySqlAccess();
        
        if(test === true && dbType == 'MongoDB')
        {
          const dbUserName = "ecotert";
          const dbUserPassword = "$2a$10$f6Al.cKIOBDdBcGpnovYxeALqb86OZoGWPcEsmKlxYIV4lTpHp9Ju";
          const dbDomainURL = "ecotert.com";
          const dbName = "urppsdb";
          const collectionName = "Katy";
          const confirmDatabase = true;
          const sslCertOptions = {
            ca: fs.readFileSync('/etc/ssl/ca.pem'),
            key: fs.readFileSync('/etc/ssl/mongodb.pem'),
            cert: fs.readFileSync('/etc/ssl/mongodb.pem')
          };
          const createCollection = true;
          const dropCollection = false;
          const enableSSL = true;
          //--> const documentDisplayOption = "all";
          //-->
          const documentDisplayOption = "wellTrajectory";
          mda.connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase, sslCertOptions, createCollection, dropCollection, enableSSL, documentDisplayOption);
          if(action === "upload")
          {
            const inputFilePath = './privateServer/ecotert.png';
            const outputFileName = 'xyz.png';
            //const inputFilePath = '_eagle_ford_SPE_19260-MS_X.csv';
            //const outputFileName = '_eagle_ford_SPE_19260-MS_X.csv';
            mda.mongoDBGridFSUploadDownloadFiles(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions, collectionName, enableSSL, inputFilePath, outputFileName, action);
          }
        }
        
        if(test === true && (dbType == 'MySql' || dbType == 'MySqlx'))
        {
          const sslCertOptions = {
            ca: fs.readFileSync('/var/lib/mysql/client/ca.pem'),
            key: fs.readFileSync('/var/lib/mysql/client/client-key.pem'),
            cert: fs.readFileSync('/var/lib/mysql/client/client-cert.pem'),
          };
          const connectionOptions = {
            //host: '45.79.68.153',
            host: 'ecotert.com',
            port: '3306',
            user: 'olu',
            password: 'Ecotert20!',
            database: 'urppsdb',
            debug: false,
            ssl: {ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert}
          };
          const tableName = "Drilling_Events_A"
          const confirmDatabase = true;
          const createTable = true;
          const dropTable = true;
          const enableSSL = true;
          //-->
          const tableDisplayOption = "all";
          //-->const tableDisplayOption = "wellTrajectoryOneRow";
          //--> const tableDisplayOption = "wellTrajectoryAllRows";
          if(dbType == 'MySql')
          {
            mda.connectToMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }
          else if(dbType == 'MySqlx')
          {
              mda.connectToMySQLDocumentStore(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
              console.log("Test is okay");
          }
          
          //view data on table incrementally on mysql shell:
          /*
            SELECT ROWID, ROP_fph, RPM_rpm, SPP_psi, DWOB_lb, SWOB_lb, TQR_Ibft, MUD_WEIGHT_sg FROM  urppsdb.Drilling_Events;
            SELECT ROWID, MUD_VISC_cp, MUD_FLOW_RATE_gpm, BHA_TYPE_no_unit, TVD_ft, MD_ft, INC_deg AZIM_deg FROM  urppsdb.Drilling_Events;
            SELECT ROWID, CALIPER_HOLE_SIZE_inches, GR_api, DEEP_RESISTIVITY_ohm_m, SHOCK_g FROM  urppsdb.Drilling_Events;
            SELECT ROWID, IS_VIBRATION_boolean_0_or_1, IS_KICK_boolean_0_or_1, IS_STUCKPIPE_boolean_0_or_1, TIME_ymd_hms FROM  urppsdb.Drilling_Events;
          */
        }
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
          const sslCertOptions = {
            ca: fs.readFileSync('/path_to_/ca.pem'),
            key: fs.readFileSync('//path_to_/key.pem'),
            cert: fs.readFileSync('//path_to_/cert.pem')
          };
          const createCollection = true;
          const dropCollection = true;
          const enableSSL = false;
          const documentDisplayOption = "all"; //or "wellTrajectory"
          mda.connectToMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase,
                               sslCertOptions, createCollection, dropCollection, enableSSL, documentDisplayOption);
        }
        
        if(test === true && (dbType == 'MySql' || dbType == 'MySqlx'))
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
          const tableDisplayOption = "all"; // or "wellTrajectoryOne" or "wellTrajectoryAll"
          if(dbType == 'MySql')
          {
            mda.connectToMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }
          else if(dbType == 'MySqlx')
          {
              mda.connectToMySQLDocumentStore(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }

         
         
        }
    }
}

module.exports = {MongoDBAndMySqlAccess, TestMongoDBAndMySqlAccess};

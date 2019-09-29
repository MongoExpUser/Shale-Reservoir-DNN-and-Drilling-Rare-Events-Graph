/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 * @License Ends
 *
 *
 * ...Ecotert's ShaleReservoir.js (released as open-source under MIT License) implements:
 *
 * Shale Reservoir Production Performance with Tensorflow-Based Deep Neural Network (DNN).
 *
 * It is a Tensorflow-Based DNN Model for hydraulically-fractured-driven production performance prediction of shale reservoirs.
 *
 * It inherits/extends the BaseAIML for its implementation.
 *
 * This implementation is based on Node.js with option to use either gpu or cpu.
 *
 * It can also be adapted for use in the browser with the tfjs-vis library enabled for browser visualization.
 *
 *
 * Objectives:
 * 1) Obtain a set of hyper-parameters for the DNN architecture per: well, pad and section/DA.
 * 2) Then: (a) compare across field-wide production and (b) generate type curves per: well, pad and section/DA.
 * 3) Target output: Cumulative production @ time, t (30 180, 365, 720, 1095, .... 1825.....n days)
 *     a) BOE in MBoe
 *     b) Gas in MMScf
 *     c) Oil in Mbbls
 * 4) Target inputs:
 *     a) Richness/OHIP-Related: so, phi, h, TOC
 *     b) Reservoir Flow Capacity-Related: Permeability and pore size (micro, nano and pico)
 *     c) Drive-Related: TVD/pressure,
 *     d) Well Completion-Related: Well lateral length, No. of stages, proppant per ft, well spacing (for multi-wells)
 *     e) Fluid Type-Related: SG/Density/API, Ro/maturity level,
 *     f) Stress Field-Related: Direction of minimum principal stress (Sm), fracture directional dispersity (90 deg is best, 0 deg is worst);
 *         Note: Hydraulic fractures tend to propagate in direction perpendicular to the directions of minimum principal stress.
 *         Note: Hence, fracture directional dispersity = Sm - Sw (well direction), correct to maximum degree of 90.
 *
 */


const BaseAIML = require('./BaseAIML.js').BaseAIML;

class ShaleReservoirProduction extends BaseAIML
{
    constructor(modelingOption, fileOption, gpuOption, inputFromCSVFileX, inputFromCSVFileY, mongDBCollectionName, mongDBSpecifiedDataX, mongDBSpecifiedDataY)
    {
        super(modelingOption, fileOption, gpuOption, inputFromCSVFileX, inputFromCSVFileY, mongDBCollectionName, mongDBSpecifiedDataX, mongDBSpecifiedDataY);
    }

    shaleReservoirProductionPerformance(batchSize, epochs, validationSplit, verbose, inputDim, inputSize, dropoutRate, unitsPerInputLayer, unitsPerHiddenLayer,
                                        unitsPerOutputLayer, inputLayerActivation, outputLayerActivation, hiddenLayersActivation, numberOfHiddenLayers, optimizer,
                                        loss, lossSummary, existingSavedModel, pathToSaveTrainedModel, pathToExistingSavedTrainedModel)
    {
        //note: the abstraction in this method is simplified and similar to sklearn's MLPRegressor(args),
        //    : such that calling the modelingOption (DNN) is reduced to just 2 lines of statements
        //    : e.g. see testShaleReservoirProductionPerformance() method below - lines 349 and 353
        
        //import module(s) and create model
        const srp = new ShaleReservoirProduction();
        const commonModules = srp.commonModules(this.gpuOption);
        const tf = commonModules.tf;
        const util = commonModules.util;
        const model = commonModules.model;
        
        if(this.modelingOption === "dnn")
        {            
            //configure input tensor
            var x = null;
            var y = null;
                            
            if(this.fileOption === "default" || this.fileOption === null || this.fileOption === undefined)
            {
                console.log("")
                console.log("==================================================>");
                console.log("Using manually or randomly generated dataset.");
                console.log("==================================================>");
                x = tf.truncatedNormal ([inputDim, inputSize], 1, 0.1, "float32", 0.4);
                y = tf.truncatedNormal ([inputDim, 1], 1, 0.1, "float32", 0.4);
                
                //once defined, set tensor names (for identifiation purpose)
                x.name = "Inputs = so-phi-h-toc-depth-and-others"; //several inputs (=input size)
                y.name = "Output = produced_BOE_in_MBarrels";      //1 output
            }
            else
            {
                if(this.fileOption === "csv-disk")
                {
                    console.log("")
                    console.log("============================================================>");
                    console.log("Using dataset from 'csv' file on the computer disk.   ")
                    console.log("============================================================>");
                }
                else if(this.fileOption === "csv-MongoDB")
                {
                    console.log("")
                    console.log("============================================================>");
                    console.log("Using dataset from 'cvs' file in a 'MongoDB' server.")
                    console.log("============================================================>");
                }
                else
                {
                    console.log("")
                    console.log("============================================================>");
                    console.log("No dataset is specified. Select 'csv-disk' or 'csv-MongoDB'  ");
                    console.log("============================================================>");
                    return
                }
                    
                //define tensor
                x = this.inputFromCSVFileX;
                y = this.inputFromCSVFileY;
                
                if(x && y)
                {
                    //once defined, set tensor names (for identifiation purpose)
                    x.name = "Inputs = so-phi-h-toc-depth-and-others"; //several inputs (=input size)
                    y.name = "Output = produced_BOE_in_MBarrels";      //1 output
                }
                else
                {
                    return;
                }
            }
            
            
            if(existingSavedModel === true)
            {
                //predict with saved model
                const srp = new ShaleReservoirProduction();
                srp.predictProductionAndPrintResultsBasedOnExistingSavedModel(x, y, tf, pathToExistingSavedTrainedModel);
            }
            else
            {
                //(a) create, (b) train and (c) predict new model
            
                //-->a. create model (main engine) with IIFE
                //"tf.layers" in JavaScript/Node.js version is equivalent to "tf.keras.layers" in Python version
                const reModel = (function createDNNRegressionModelEngine()
                {
                    //create layers.....
                    const inputLayer = {inputShape: [inputSize], units: unitsPerInputLayer, activation: inputLayerActivation};
                    let hiddenLayers = [];
                    for(let i = 0; i < numberOfHiddenLayers; i ++)
                    {
                        hiddenLayers.push({units: unitsPerHiddenLayer, activation: hiddenLayersActivation})
                    }
                    const outputLayer = {units: unitsPerOutputLayer, activation: outputLayerActivation};
                    
                    //add layers and dropouts......
                    model.add(tf.layers.dense(inputLayer));
                    model.add(tf.layers.dropout(dropoutRate));
                    for(let eachLayer in hiddenLayers)
                    {
                        model.add(tf.layers.dense(hiddenLayers[eachLayer]));
                        model.add(tf.layers.dropout(dropoutRate));
                    }
                    model.add(tf.layers.dense(outputLayer));
                    
                    //specify compilation options....
                    const compileOptions = {optimizer: optimizer, loss: loss};
                    
                    //compile model
                    model.compile(compileOptions);
                    
                    //return model.....
                    return model;
                })();
            
                                   
                //-->b. begin training: train the model using the data and time the training
                const beginTrainingTime = new Date();
                console.log(" ")
                console.log("...............Training Begins.......................................");
                
                reModel.fit(x, y,
                {
                    batchSize: batchSize,
                    epochs: epochs,
                    validationSplit: validationSplit,
                    verbose: verbose,
                    
                    //customized logging verbosity
                    callbacks:
                    {
                        onEpochEnd: async function (epoch, logs)
                        {
                            const loss = Number(logs.loss).toFixed(6);
                            const mem = ((tf.memory().numBytes)/1E+6).toFixed(6);
                            console.log("Epoch =", epoch, "Loss =", loss, "   Allocated Memory (MB) =", mem);
                        }
                    }
                    
                }).then(function(informationHistory)
                {
                    //print loss summary, if desired
                    if(lossSummary === true)
                    {
                        console.log('Array of loss summary at each epoch:', informationHistory.history.loss);
                    }
                    
                    //print training time & signify ending
                    const srp = new ShaleReservoirProduction();
                    srp.runTimeDNN(beginTrainingTime, "Training Time");
                    console.log("........Training Ends................................................");
                    console.log();
                    
                    //-->c. predict and print results
                    srp.predictProductionAndPrintResults(x, y, reModel, existingSavedModel=false);
                    
                    //save model's topology and weights in the specified sub-folder of the current folder
                    //this model can be called later without any need for training again
                    if(srp.fileOption === "csv-disk" || srp.fileOption === "csv-MongoDB")
                    {
                        reModel.save(pathToSaveTrainedModel);    //saved model
                    }
                    
                }).catch(function(error)
                {
                    if(error)
                    {
                        console.log(error, " : TensorFlow error successfully intercepted.");
                    }
                });
            }
        }
    }
    
    testShaleReservoirProductionPerformance()
    {
        //algorithm, file option, and gpu/cpu option
        const modelingOption = "dnn";
        //const fileOption  = "csv-MongoDB"; // or
        //const fileOption  = "csv-disk";    // or
        const fileOption  = "default";
        const gpuOption = false;
        
        //create and import modules
        const commonModules = new ShaleReservoirProduction().commonModules(this.gpuOption);
        const tf = commonModules.tf;
        const fs = commonModules.fs;
        const path = commonModules.path;
        const mongodb = commonModules.mongodb;
        const assert = commonModules.assert;
        
        //training parameters
        const batchSize = 32;
        const epochs = 300;
        const validationSplit = 0;    // for large dataset, set to about 10% (0.1) aside
        const verbose = 0;            // 1 for full logging verbosity, and 0 for none
        
        //model contruction parameters
        let inputSize = 15;           //no. of input parameters (no. of col - so, phi, h, TOC, perm, pore size, well length, etc.)
        let outputSize = 1;           //no. of output parameters (no. of col - cum_oil_Mbbs or cum_boe_MBoe or cum_gas_MMSCF )
        let inputDim = 20;            //no. of datapoint (no. of row for inputSize and outputSize = should be thesame) e.g datapoints of wells/pads/DA/sections
        const dropoutRate = 0.02;
        const unitsPerInputLayer = 100;
        const unitsPerHiddenLayer = 100;
        const unitsPerOutputLayer = 1;
        const inputLayerActivation = "relu";
        const hiddenLayersActivation = "relu";
        const outputLayerActivation = "linear";
        const numberOfHiddenLayers = 5;
        const optimizer = "adam";
        const loss = "meanSquaredError";
        const lossSummary = false;
        const existingSavedModel = false;
        const pathToSaveTrainedModel = "file://myShaleProductionModel-0";
        let pathToExistingSavedTrainedModel = null;
        
        if(existingSavedModel === true)
        {
            pathToExistingSavedTrainedModel = "file://myShaleProductionModel-0/model.json";
        }
        
        const timeStep = 4;           //1, 2, .....n
        // note: generalize to n, timeStep: 1, 2, 3 .....n : says 90, 365, 720, 1095..... n days
        // implies: xInputTensor and yInputTensor contain n, timeStep tensors
        
        //data loading options, array of input tensors, MongoDB options, etc.
        const fileLocation  = path.format({ root: './'});
        const fileNameX = "_z_CLogX.csv"; // or "_eagle_ford_datasets_X.csv" or "duvernay_datasets_X.csv" or "bakken_datasets_X.csv"
        const fileNameY = "_z_CLogY.csv"; // or "_eagle_ford_datasets_Y.csv" or "duvernay_datasets_Y.csv" or "bakken_datasets_Y.csv"
        let inputFromCSVFileXList = [];
        let inputFromCSVFileYList = [];
        let csvDataXList = [];
        let csvDataYList = [];
        let mongoDBDataFileX = "_eagle_ford.csv";
        let mongoDBDataFileY = "_eagle_ford.csv";
        let mongoDBDataFileXList = [];
        let mongoDBDataFileYList = [];
        let mongoDBCollectionName = "mongoDBCollectionName";
        let dbUserName = "dbUserName";
        let dbUserPassword = "dbUserPassword";
        var dbDomainURL = "domain.com";
        let dbName = "dbName";
        let connectedDB = undefined;
        let sslCertOptions  = {ca: fs.readFileSync('/path_to/ca.pem'), key: fs.readFileSync('/path_to/mongodb.pem'),cert: fs.readFileSync('/path_to/mongodb.pem')};
        let enableSSL = true;
        let uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        let xOutput = undefined;
        let yOutput = undefined;
        
        //load/require/import relevant modules
        AccessMongoDBAndMySQL  = require('./AccessMongoDBAndMySQL.js').AccessMongoDBAndMySQL; 
        Communication  = require('./Communication.js').Communication; 
        const mda = new AccessMongoDBAndMySQL();
        const cmm = new Communication();
        const srp = new ShaleReservoirProduction();
        let mongodbOptions = mda.mongoDBConnectionOptions(sslCertOptions, enableSSL);
        
        //run model by timeStep
        for(let i = 0; i < timeStep; i++)
        {
            if(fileOption === "csv-disk" || fileOption === "default")
            {
                //....1. initiliaze model with datasets
                     
                //specify csv file names
                csvDataXList.push(fileNameX);
                csvDataYList.push(fileNameY);
                    
                //assign csv files into pathTofileX and pathTofileY
                var pathTofileX = fileLocation + csvDataXList[i];
                var pathTofileY = fileLocation + csvDataYList[i];
                    
                //read csv files, in pathTofileX and pathTofileY, to JS arrays
                xOutput = cmm.readInputCSVfile(pathTofileX);
                yOutput = cmm.readInputCSVfile(pathTofileY);
                    
                    
                ///....2. then run model  "asynchronously" as IIFE
                (async function runModel()
                {
                    //convert JavaScript's Arrays into TensorFlow's tensors
                    const tensorOutputX = srp.getTensor(xOutput);
                    const tensorOutputY = srp.getTensor(yOutput);
                    inputFromCSVFileXList.push(tensorOutputX.csvFileArrayOutputToTensor);
                    inputFromCSVFileYList.push(tensorOutputY.csvFileArrayOutputToTensor);
                            
                    //over-ride inputSize and inputDim based on created "tensors" from CVS file
                    inputSize = tensorOutputX.inputSize;
                    inputDim = tensorOutputX.inputDim;
                    console.log("inputSize: ", inputSize);
                    console.log("inputDim: ", inputDim);
            
                    //invoke productionPerformance() method on ShaleReservoirProduction() class
                    const srpTwo = new ShaleReservoirProduction(modelingOption, fileOption, gpuOption,
                                                inputFromCSVFileXList[i], inputFromCSVFileYList[i],
                                                mongoDBCollectionName, mongoDBDataFileXList[i],
                                                mongoDBDataFileYList[i]);
                    srpTwo.shaleReservoirProductionPerformance(batchSize, epochs, validationSplit, verbose, inputDim, inputSize,
                                                dropoutRate, unitsPerInputLayer, unitsPerHiddenLayer, unitsPerOutputLayer,
                                                inputLayerActivation, outputLayerActivation, hiddenLayersActivation,
                                                numberOfHiddenLayers, optimizer, loss, lossSummary, existingSavedModel,
                                                pathToSaveTrainedModel, pathToExistingSavedTrainedModel);
                }());
                
            }
            else if(fileOption === "csv-MongoDB")
            {
                //....1. initiliaze model with datasets
                    
                //add csv file names to be downloaded from MongoDB database into a list
                mongoDBDataFileXList.push(mongoDBDataFileX);
                mongoDBDataFileYList.push(mongoDBDataFileY);
                    
                //specify input & output for csv file names to be downloaded from MongoDB database:
                //these are used as arguments into MongoDB GridFS method below (see: bucket.openDownloadStreamByName)
                const inputFilePathX = mongoDBDataFileXList[i];
                const outputFileNameX = mongoDBDataFileXList[i] + "_" + String(i);
                const inputFilePathY = mongoDBDataFileYList[i];
                const outputFileNameY = mongoDBDataFileYList[i] + "_" + String(i);
                
                // ....2. connect to mongoDB server with MongoDB native driver,
                // ...... download  cvs files  with GridFS and process the files
                mongodb.MongoClient.connect(uri, mongodbOptions, function(connectionError, client)
                {
                    if(connectionError)
                    {
                        console.log(connectionError);
                        console.log("Connection error: MongoDB-server is down or refusing connection.");
                        return;
                    }
                    
                    const db = client.db(dbName);
                    const bucket = new mongodb.GridFSBucket(db, {bucketName: mongoDBCollectionName, chunkSizeBytes: 1024});
                
                    //download csv file (X-file) from MongoDB database
                    const downloadX = bucket.openDownloadStreamByName(inputFilePathX).pipe(fs.createWriteStream(outputFileNameX), {'bufferSize': 1024});
                    
                    downloadX.on('finish', function()
                    {
                        console.log('Done downloading ' + outputFileNameX + '!');
                        // assign downloaded csv files into pathTofileX
                        var pathTofileX = mongoDBDataFileXList[i];
                        //read csv files, in pathTofileX, into JS arrays
                        xOutput = cmm.readInputCSVfile(pathTofileX);
                        
                        //download csv file (Y-file) from MongoDB database
                        const downloadY = bucket.openDownloadStreamByName(inputFilePathY).pipe(fs.createWriteStream(outputFileNameY), {'bufferSize': 1024});
                         
                        downloadY.on('error', function(error)
                        {
                            assert.ifError(error);
                        });
                            
                            
                        downloadY.on('finish', function()
                        {
                            console.log('Done downloading ' + outputFileNameY + '!');
                            // assign downloaded csv files into pathTofileY
                            var pathTofileY = mongoDBDataFileYList[i];
                            // read csv files, in pathTofileY, into JS arrays
                            yOutput = cmm.readInputCSVfile(pathTofileY);
                                
                            ///....3. then run model  "asynchronously" as IIFE
                            (async function runModel()
                            {
                                //convert JavaScript's Arrays into TensorFlow's tensors
                                const tensorOutputX = srp.getTensor(xOutput);
                                const tensorOutputY = srp.getTensor(yOutput);
                                inputFromCSVFileXList.push(tensorOutputX.csvFileArrayOutputToTensor);
                                inputFromCSVFileYList.push(tensorOutputY.csvFileArrayOutputToTensor);
                                        
                                //over-ride inputSize and inputDim based on created "tensors" from CVS file
                                inputSize = tensorOutputX.inputSize;
                                inputDim = tensorOutputX.inputDim;
                                console.log("inputSize: ", inputSize);
                                console.log("inputDim: ", inputDim);
                        
                                //invoke productionPerformance() method on ShaleReservoirProduction() class
                                const srpTwo = new ShaleReservoirProduction(modelingOption, fileOption, gpuOption,
                                                            inputFromCSVFileXList[i], inputFromCSVFileYList[i],
                                                            mongoDBCollectionName, mongoDBDataFileXList[i],
                                                            mongoDBDataFileYList[i]);
                                srpTwo.shaleReservoirProductionPerformance(batchSize, epochs, validationSplit, verbose, inputDim, inputSize,
                                                            dropoutRate, unitsPerInputLayer, unitsPerHiddenLayer, unitsPerOutputLayer,
                                                            inputLayerActivation, outputLayerActivation, hiddenLayersActivation,
                                                            numberOfHiddenLayers, optimizer, loss, lossSummary, existingSavedModel,
                                                            pathToSaveTrainedModel, pathToExistingSavedTrainedModel);
                            }());
                            
                            //....4. finally close client
                            client.close()
                        });
                    });
                    
                });
            }
        }
    }
}


module.exports = {ShaleReservoir};

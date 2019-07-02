/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * Shale Reservoir Production Performance with Tensorflow-Based Deep Neural Network (DNN).
 * This module is a Tensorflow-Based DNN Model for hydraulically-fractured-driven production performance prediction of shale reservoirs in the cloud.
 * It is based on Node.js with option to use either gpu or cpu.
 * It can also be adapted for use in the browser with the tfjs-vis library enabled for browser visualization.
 *
 * 1) Obtain a set of hyper-parameters for the DNN architecture per: well, pad and section/DA.
 * 2) Then (a) compare across field-wide production and (b) generate type curves per: well, pad and section/DA.
 * 3) Target output: Cumulative production @ time, t (30 180, 365, 720,...1825 days)
 *     a) BOE in MBoe
 *     b) Gas in MMScf
 *     c) Oil in M barrel
 * 4) Target inputs:
 *     a) Richness/OHIP-Related: so, phi, h, TOC
 *     b) Reservoir Flow Capacity-Related, Permeability and pore size (micro, nano and pico)
 *     c) Drive-Related: TVD/pressure,
 *     d) Well Completion-Related: Well lateral length, No. of stages, proppant per ft, well spacing (for multi-wells)
 *     e) Fluid Type-Related: SG/Density/API, Ro/maturity level,
 *     f) Stress Field-Related: Direction of minimum principal stress (Sm), fracture directional dispersity (90 deg is best, 0 deg is worst);
 *         Note: Hydraulic fractures tend to propagate in direction perpendicular to the directions of minimum principal stress.
 *         Note: Hence, fracture directional dispersity = Sm - Sw (well direction), correct to maximum degree of 90.
 */


class ShaleReservoirProductionPerformance
{
    constructor(modelingOption, fileOption, gpuOption, inputTensorFromCSVFileX, inputTensorFromCSVFileY,
                mongDBCollectionName, mongDBSpecifiedDataArrayX, mongDBSpecifiedDataArrayY)
    {
        this.modelingOption = modelingOption;
        this.fileOption  = fileOption;
        this.gpuOption = gpuOption;
        this.inputTensorFromCSVFileX = inputTensorFromCSVFileX;
        this.inputTensorFromCSVFileY = inputTensorFromCSVFileY;
        this.mongDBCollectionName = mongDBCollectionName;
        this.mongDBSpecifiedDataArrayX = mongDBSpecifiedDataArrayX;
        this.mongDBSpecifiedDataArrayY = mongDBSpecifiedDataArrayY;
    }
    
    static runTimeDNN(beginTime, timeOption)
    {
        console.log("========================================================>")
        console.log(timeOption, " (seconds): ", (new Date() - beginTime)/1000);
        console.log("=========================================================>")
    }
    
    static commonModules()
    {
        const fs = require('fs');
        const util = require('util');
        const tfvis = require('@tensorflow/tfjs-vis');
        const tf = require('@tensorflow/tfjs');
        
        if(this.gpuOption === true)
        {
            require('@tensorflow/tfjs-node-gpu');  //c/c++ binding, gpu option
        }
        else
        {
            require('@tensorflow/tfjs-node');      //c/c++ binding, cpu option
        }
        
        const model = tf.sequential();
        return {tf: tf, tfvis: tfvis, fs:fs,  util: util, model: model};
    }
    
    productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize, dropoutRate,
                         unitsPerHiddenLayer, inputLayerActivation, outputLayerActivation,
                         hiddenLayersActivation, numberOfHiddenLayers, optimizer, loss, metrics)
    {
        
        if(this.modelingOption === "dnn")
        {
            //import module(s) and create model
            const commonModules = ShaleReservoirProductionPerformance.commonModules()
            const tf = commonModules.tf;
            const util = commonModules.util;
            const model = commonModules.model;
                            
            ///configure input tensor
            //option 1: create default, manually or randomly generated dataset
            //option 2: import dataset from external csv file or database (MongoDB)
            var x = null;
            var y = null;
                            
            if(this.fileOption === "default" || this.fileOption === null || this.fileOption === undefined)
            {
                console.log("")
                console.log("=================================================>")
                console.log("Using manually or randomly generated dataset.");
                console.log("=================================================>")
                x = tf.truncatedNormal ([inputDim, inputSize], 1, 0.3, "float32", 0.5);
                y = tf.truncatedNormal ([inputDim, 1], 1, 0.3, "float32", 0.5);
            }
            else
            {
                //use data from (a) "csv" file or (b) data extracted from MongoDB server
                console.log("")
                console.log("=======================================================================>")
                console.log("Using dataset from externally loaded 'csv' file or 'MongoDB' server.")
                console.log("=======================================================================>")
            
                if(this.fileOption === "csv")
                {
          
                    console.log("")
                    console.log("=======================================================================>")
                    console.log("Not using default dataset, but dataset from externally loaded file.")
                    console.log("=======================================================================>")
                    
                    // (1) pass in csv files,
                    // (2) load into arrays and display in console, using readDataInputCSVfile() method
                    // note: readDataInputCSVfile() is a an optimised method for reading CSV data into "Tensor"
                    const fileNameX = this.inputTensorFromCSVFileX;
                    const fileNameY = this.inputTensorFromCSVFileY;
                    //x = readDataInputCSVfile(fileNameX, pathTofileX)
                    //y = readDataInputCSVfile(fileNameY, pathTofileY)
                }
                else if(this.fileOption === "MongoDB")
                {
                    // (1) pass in data extracted (with query/MapReduce) from MongoDB server
                    // (2) load into arrays and display in console, using readDataInputMongoDB() method
                    // note: readDataInputMongoDB() is an optimised method for reading MongoDB data into "Tensor"
                    const collectionName = this.mongDBCollectionName;
                    const specifiedDataArrayX = this.mongDBSpecifiedDataArrayX;
                    const specifiedDataArrayY = this.mongDBSpecifiedDataArrayY;
                    //x = readDataInputMongoDB(collectionName, specifiedDataArrayX)
                    //y = readDataInputMongoDB(collectionName, specifiedDataArrayY)
                }
                
            }
                            
            //create model (main engine) with IIFE
            const reModel = (function createDNNRegressionModel()
            {
                //create layers.....
                const inputLayer = {units: unitsPerHiddenLayer, inputShape: [inputSize], activation: inputLayerActivation};
                let hiddenLayers = [];
                for(let i = 0; i < numberOfHiddenLayers; i ++)
                {
                    hiddenLayers.push({units: unitsPerHiddenLayer, activation: hiddenLayersActivation})
                }
                const outputLayer = {units: 1, activation: outputLayerActivation};
                
                //add layers and dropouts......
                model.add(tf.layers.dense(inputLayer));
                model.add(tf.layers.dropout(dropoutRate));
                for(let eachLayer in hiddenLayers)
                {
                    model.add(tf.layers.dense(hiddenLayers[eachLayer]));
                    model.add(tf.layers.dropout(dropoutRate));
                }
                model.add(tf.layers.dense(outputLayer));
                
                //speficy compilation options....
                const compileOptions = {optimizer: optimizer, loss: loss, metrics: [metrics]};
                
                //compile model
                model.compile(compileOptions);
                
                //return model.....
                return model;
            }());
                            
                        
            // begin training: train the model using the data and time it
            const beginTrainingTime = new Date();
            console.log(" ")
            console.log("...............Training Begins.................................")
            
            reModel.fit(x, y,
            {
                batchSize: batchSize,
                epochs: epochs,
                validationSplit: validationSplit,   // for large dataset, set about 10% (0.1) aside
                verbose: verbose,                   // 1 for full logging verbosity, and 0 for none
                callbacks:                          // customized logging verbosity
                {
                    onEpochEnd: async function (epoch, logs)
                    {
                        console.log("Epoch = ", epoch, " Loss = ",  parseFloat(logs.loss), " Accuracy = ", parseFloat(logs.acc));
                    }
                }
                                
            }).then(function()
            {
                console.log("........Training Ends......................................")
                ShaleReservoirProductionPerformance.runTimeDNN(beginTrainingTime, "Training Time");
                // begin prediction: use the model to do inference on data points
                var beginPredictingTime = new Date();
                var predictions = reModel.predict(x);
                // print outputs
                console.log("Expected result in Tensor format:");
                y.print(true);
                console.log("Actual result in Tensor format :")
                reModel.predict(x).print(true);
                ShaleReservoirProductionPerformance.runTimeDNN(beginPredictingTime, "Predicting Time");
                console.log("Final Model Summary");
                reModel.summary()
            }).catch(function(err)
            {
                if(err) {console.log(err, " : Tensor flow rejection error successfully handled.");};
            });
        }
    }

    testProductionPerformace(xInputTensor, yInputTensor)
    {
        //algorithm type, data loading option and computer processing option
        const modelingOption = "dnn";
        const fileOption  = "default";
        const gpuOption = false;
        
        //training input
        const batchSize = 32;
        const epochs = 100;
        const validationSplit = 0.1;
        const verbose = 0;
        
        //model contruction parameters
        const inputSize = 13;
        const inputDim = 100;
        const dropoutRate = 0.02;
        const unitsPerHiddenLayer = 100;
        const inputLayerActivation = "softmax";
        const outputLayerActivation = "linear";
        const hiddenLayersActivation = "tanh"
        const numberOfHiddenLayers = 5;
        const optimizer = "adam";
        const loss = "meanSquaredError";
        const metrics = "accuracy";
    
        //create a new isntance of ShaleReservoirProductionPerformance() class for testing
        const test = new ShaleReservoirProductionPerformance(modelingOption, fileOption, gpuOption, xInputTensor, yInputTensor);
        
        //invoke dnn  method (productionPerformace()) on test object
        test.productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize,dropoutRate,
                                  unitsPerHiddenLayer, inputLayerActivation, outputLayerActivation,
                                  hiddenLayersActivation, numberOfHiddenLayers, optimizer, loss, metrics)
    }
}


//test with IIFE function
(function testObject()
{
    new ShaleReservoirProductionPerformance("dnn", "csv", true, null, null, null, null, null).testProductionPerformace(null, null)
}());


module.exports = {ShaleReservoirProductionPerformance}

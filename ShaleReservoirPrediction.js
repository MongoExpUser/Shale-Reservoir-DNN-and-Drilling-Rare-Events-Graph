/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * ...Ecotert's ShaleReservoirPrediction.js (released as open-source under MIT License) implements:
 *
 * Shale Reservoir Production Performance with Tensorflow-Based Deep Neural Network (DNN).
 *
 * This module is a Tensorflow-Based DNN Model for hydraulically-fractured-driven production performance prediction of shale reservoirs in the cloud.
 * It is based on Node.js with option to use either gpu or cpu.
 * It can also be adapted for use in the browser with the tfjs-vis library enabled for browser visualization.
 *
 *
 * 1) Obtain a set of hyper-parameters for the DNN architecture per: well, pad and section/DA.
 * 2) Then: (a) compare across field-wide production and (b) generate type curves per: well, pad and section/DA.
 * 3) Target output: Cumulative production @ time, t (30 180, 365, 720, 1095, ...1825 days)
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
    constructor(modelingOption, fileOption, gpuOption, inputFromCSVFileX, inputFromCSVFileY,
                mongDBCollectionName, mongDBSpecifiedDataX, mongDBSpecifiedDataY)
    {
        this.modelingOption = modelingOption;
        this.fileOption  = fileOption;
        this.gpuOption = gpuOption;
        this.inputFromCSVFileX = inputFromCSVFileX;
        this.inputFromCSVFileY = inputFromCSVFileY;
        this.mongDBCollectionName = mongDBCollectionName;
        this.mongDBSpecifiedDataX = mongDBSpecifiedDataX;
        this.mongDBSpecifiedDataY = mongDBSpecifiedDataY;
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
        let tf = require('@tensorflow/tfjs');    //pure JavaScript version
        
        if(this.gpuOption === true)
        {
            tf = require('@tensorflow/tfjs-node-gpu');  //c/c++ binding, gpu option
        }
        else
        {
            tf = require('@tensorflow/tfjs-node');      //c/c++ binding, cpu option
        }

        const model = tf.sequential();
        return {fs:fs, util:util, tf:tf, tfvis:tfvis, model:model};
    }
    
    productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize, dropoutRate, unitsPerInputLayer,
                         unitsPerHiddenLayer, unitsPerOutputLayer, inputLayerActivation, outputLayerActivation,
                         hiddenLayersActivation, numberOfHiddenLayers, optimizer, loss, lossSummary)
    {
        //note: the abstraction in this method is simplified and similar to sklearn's MLPRegressor(args),
        //    : such that calling the modelingOption (DNN) is reduced to just 2 lines of statements
        //    : see testProductionPerformace() method below - lines 312 and 314
        
        if(this.modelingOption === "dnn")
        {
            //import module(s) and create model
            const commonModules = ShaleReservoirProductionPerformance.commonModules()
            const tf = commonModules.tf;
            const util = commonModules.util;
            const model = commonModules.model;
                            
            ///configure input tensor
            var x = null;
            var y = null;
                            
            if(this.fileOption === "default" || this.fileOption === null || this.fileOption === undefined)
            {
                console.log("")
                console.log("==================================================>")
                console.log("Using manually or randomly generated dataset.");
                console.log("==================================================>")
                x = tf.truncatedNormal ([inputDim, inputSize], 1, 0.1, "float32", 0.4);
                y = tf.truncatedNormal ([inputDim, 1], 1, 0.1, "float32", 0.4);
            }
            else
            {
                if(this.fileOption === "csv")
                {
                    console.log("")
                    console.log("==================================================>")
                    console.log("Using dataset from externally 'csv' file.")
                    console.log("==================================================>")
                    x = this.inputFromCSVFileX;
                    y = this.inputFromCSVFileY;
                }
                
                if(this.fileOption === "MongoDB")
                {
                    console.log("")
                    console.log("==================================================>")
                    console.log("Using dataset from externally 'MongoDB' server.")
                    console.log("==================================================>")
                    x = this.mongDBSpecifiedDataX;
                    y = this.mongDBSpecifiedDataY;
                }
            }
                            
            //create model (main engine) with IIFE
            //"tf.layers" in JavaScript/Node.js version is equivalent to "tf.keras.layers" in Python version
            const reModel = (function createDNNRegressionModel()
            {
                //create layers.....
                const inputLayer = {units: unitsPerInputLayer, activation: inputLayerActivation, inputShape: [inputSize], };
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
                                   
            // begin training: train the model using the data and time the training
            const beginTrainingTime = new Date();
            console.log(" ")
            console.log("...............Training Begins.......................................")
            
            
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
                ShaleReservoirProductionPerformance.runTimeDNN(beginTrainingTime, "Training Time");
                console.log("........Training Ends................................................")
                
                //begin prediction: use the model to do inference on data points
                var beginPredictingTime = new Date();
                var predictY = reModel.predict(x);
                
                //print output Expected vs Actual
                console.log("Expected result in Tensor format:");
                y.print(true);
                console.log("Actual result in Tensor format :")
                predictY.print(true);
                
                //print summary & prection time
                ShaleReservoirProductionPerformance.runTimeDNN(beginPredictingTime, "Predicting Time");
                console.log("Final Model Summary");
                reModel.summary();
                
            }).catch(function(error)
            {
                if(error)
                {
                    console.log(error, " : TensorFlow error successfully intercepted and handled.");
                };
            });
        }
    }


    testProductionPerformace(inDevelopment = true)
    {
        //import tf
        const commonModules = ShaleReservoirProductionPerformance.commonModules()
        const tf = commonModules.tf;
        
        //algorithm, gpu/cpu and data loading options
        const modelingOption = "dnn";
        const fileOption  = "MongoDB";
        const gpuOption = true;
        const fileNameX = undefined;
        const fileNameY = undefined;
        const mongDBCollectionName = undefined;
        const mongDBSpecifiedDataX = undefined;
        const mongDBSpecifiedDataY = undefined;

        //training parameters
        const batchSize = 32;
        const epochs = 100;
        const validationSplit = 0.1;  // for large dataset, set to about 10% (0.1) aside
        const verbose = 0;            // 1 for full logging verbosity, and 0 for none
        
        //model contruction parameters
        const inputSize = 13;         //number of parameters (number of col - so, phi, h, TOC, perm, pore size, well length, etc.)
        const inputDim = 100;         //number of datapoint  (number of row)
        const dropoutRate = 0.02;
        const unitsPerInputLayer = 5;
        const unitsPerHiddenLayer = 5;
        const unitsPerOutputLayer = 1;
        const inputLayerActivation = "softmax";
        const outputLayerActivation = "linear";
        const hiddenLayersActivation = "relu"; //"tanh";
        const numberOfHiddenLayers = 3;
        const optimizer = "adam";
        const loss = "meanSquaredError";
        const lossSummary = false;

        // NOTE:generalize to each time step: say  90, 365, 720 and 1095 days
        // ==================================================================
        // implies: xInputTensor and yInputTensor contain 5 Tensors, representing:
        // input tensors for 30, 90, 365, 720 and 1095 days, respectively
        
        //array (list) of input tensors
        let inputFromCSVFileXList = [];
        let inputFromCSVFileYList = [];
        let mongDBSpecifiedDataXList = [];
        let mongDBSpecifiedDataYList = []
        const timeStep = 5;
        
        //run model by timeStep
        for(let i = 0; i < timeStep; i++)
        {
            //first: create tensors at each timeStep: format => (shape, mean, stdDev, dtype, seed)
            if(inDevelopment === true)  //i.e. application still in development phase
            {
                switch(fileOption)
                {
                    case("csv"):
                        inputFromCSVFileXList.push(tf.randomNormal([inputDim, inputSize], 0.0, 1.0, "float32", 0.1));
                        mongDBSpecifiedDataYList.push(tf.truncatedNormal ([inputDim, 1], 1, 0.1, "float32", 0.2));
                        break;
                            
                    case("MongoDB"):
                        mongDBSpecifiedDataXList.push(tf.randomNormal([inputDim, inputSize], 0.0, 1.0, "float32", 0.1));
                        mongDBSpecifiedDataYList.push(tf.truncatedNormal ([inputDim, 1], 1, 0.1, "float32", 0.2));
                        break;
                }
            }
            else
            {
                inDevelopment = false; //i.e. application now in production/deployment phase
                
                switch(fileOption)
                {
                    case("csv"):
                        // (1) pass in csv files,
                        // (2) load into arrays and display/check in console, using readDataInputCSVfile() method
                        // note: readDataInputCSVfile() is a an optimised method for reading CSV data into "Tensor"
                        // note: readDataInputCSVfile() is accessible from a module on the Node.js server hosting the application
                        const pathTofileX = "./";
                        const pathTofileY = "./"
                        //...>inputFromCSVFileXList.push(readDataInputCSVfile(fileNameX, pathTofileX));
                        //...>inputFromCSVFileYList.push(readDataInputCSVfile(fileNameY, pathTofileY));
                        break;
                            
                    case("MongoDB"):
                        // (1) pass in data extracted (with query/MapReduce) from MongoDB server
                        // (2) load into arrays and display/check in console, using readDataInputMongoDB() method
                        // note: readDataInputMongoDB() is an optimised method for reading MongoDB data into "Tensor"
                        // note: readDataInputMongoDB() is accessible from a module on the Node.js server hosting the application
                        //...>mongDBSpecifiedDataXList.push(readDataInputMongoDB(mongDBCollectionName, mongDBSpecifiedDataX));
                        //...>mongDBSpecifiedDataYList.push(readDataInputMongoDB(mongDBCollectionName, mongDBSpecifiedDataY));
                        break;
                }
            }
        
            //2nd: invoke productionPerformance() method on srpp() class
            const srpp = new ShaleReservoirProductionPerformance(modelingOption, fileOption, gpuOption, inputFromCSVFileXList[i], inputFromCSVFileYList[i],
                                                                 mongDBCollectionName, mongDBSpecifiedDataXList[i], mongDBSpecifiedDataYList[i]);
            srpp.productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize,dropoutRate, unitsPerInputLayer, unitsPerHiddenLayer,
                                     unitsPerOutputLayer, inputLayerActivation, outputLayerActivation, hiddenLayersActivation, numberOfHiddenLayers, optimizer,
                                     loss, lossSummary);
        }
    }
}

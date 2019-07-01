/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/EP-Economic-Module/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 *
 * This module is a Tensorflow-Based DNN Models for Hydraulically-Fractures-Driven Production Performance Prediction of Shale Reservoirs in the Cloud.
 *
 * 1) Obtain a set of hyper-parameters for the DNN architecture per: well, pad and section/DA.
 * 2) Then (s) compare across field-wide production and (b) generate type curves per: well, pad and section/DA.
 * 3) Target output: Cumulative production @ time (t, 30, 180, 365, 720,...1825)
 *     a) BOE in MBoe
 *     b) Gas in MMScf
 *     c) Oil in M barrel
 * 4) Target inputs:
 *     a) Richness/OHIP-Related: so, phi, h, TOC
 *     b) Reservoir Flow Capacity-Related, Permeability, pore size (micro, nano,pico)
 *     c) Drive-Related: TVD/pressure,
 *     d) Well Completion-Related: Well lateral length, No. of stages, proppant per ft, well spacing (for multi-wells)
 *     e) Fluid TYpe-Related: SG/Density/API, Ro/maturity level,
 *     f) Stress Field-Related: Direction of minimum principal stress (Sm), fracture directional dispersity (90 deg is best, 0 deg is worst);
 *         Note: Hydraulic fractures tend to propagate in direction perpendicular too the directions of min. principal stress.
 *         Note: Hence, fracture directional dispersity = Sm - Sw (well direction), correct to maximum degree of 90.
 *
 */


class ShaleReservoirProductionPerformance
{
    constructor(modelingOption, fileOption, gpuOption, inputTensorFromCSVFileX, inputTensorFromCSVFileY)
    {
        this.modelingOption = modelingOption;
        this.fileOption  = fileOption;
        this.gpuOption = gpuOption;
        this.inputTensorFromCSVFileX = inputTensorFromCSVFileX;
        this.inputTensorFromCSVFileY = inputTensorFromCSVFileY;
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
    
    
    productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize)
    {
        
        if(this.modelingOption === "dnn")
        {
            //import module(s) and create model
            const commonModules = ShaleReservoirProductionPerformance.commonModules()
            const tf = commonModules.tf;
            const tfvis = commonModules.tfvis;
            const util = commonModules.util;
            const model = commonModules.model;
                            
            ///configure input tensor
            //option 1: create default, manually or randomly generated dataset
            //option 2: import dataset from external file
            var x = null;
            var y = null;
                            
            if(this.fileOption === "default")
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
                this.fileOption  = "csv";
                console.log("")
                console.log("=======================================================================>")
                console.log("Not using default dataset, but dataset from externally loaded file.")
                console.log("=======================================================================>")
                
                //then pass in files, load into arrays and displayed in console to check using readDataInputCSVfile() method
                const fileNameX = this.inputTensorFromCSVFileX;
                const fileNameY = this.inputTensorFromCSVFileY;
                //xx = readDataInputCSVfile(fileNameX, pathTofileX)
                //yy = readDataInputCSVfile(fileNameY, pathTofileY)
     
            }
                            
            //create model
            const reModel = (function createRegressionModel()
            {
                const layerOptionsOne = {units: 100, inputShape: [inputSize], activation: 'softmax'};
                const layerOptionsTwo = {units: 100, activation: 'tanh'};
                const layerOptionsThree = {units: 1, activation: 'linear'};
                const dropoutRate = 0.02;
                // add layers and dropouts
                model.add(tf.layers.dense(layerOptionsOne));
                model.add(tf.layers.dropout(dropoutRate));
                model.add(tf.layers.dense(layerOptionsTwo));
                model.add(tf.layers.dropout(dropoutRate));
                model.add(tf.layers.dense(layerOptionsThree));
                const compileOptions = {optimizer: 'adam', loss: 'meanSquaredError', metrics: ['accuracy']};
                model.compile(compileOptions);
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
                verbose: verbose,                   // 1 full logging verbosity, 0 for none
                callbacks:                          // customized logging verbosity
                {
                    onEpochEnd: async function (epoch, logs)
                    {
                        console.log("Epoch = ", epoch, " Loss = ",  parseFloat(logs.loss), " Accuracy = ", parseFloat(logs.acc));
                    }
                }
                                
            }).then(function()
            {
                ShaleReservoirProductionPerformance.runTimeDNN(beginTrainingTime, "Training Time");
      
                // begin prediction: use the model to do inference on a data point the model hasn't seen before and time it
                var beginPredictingTime = new Date();
                var predictions = reModel.predict(x);
                console.log("Expected result in TF format:");
                y.print(true);
                console.log("Actual result in TF format :")
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
        const modelingOption = "dnn";
        const fileOption  = "default";
        const gpuOption = true;
        const inputTensorFromCSVFileX = xInputTensor;
        const inputTensorFromCSVFileY = yInputTensor;
        const batchSize = 32;
        const epochs = 100;
        const validationSplit = 0.1;
        const verbose = 0;
        const inputSize = 13;
        const inputDim = 100;
        
        //invoke dnn for Shale Reservoir Production Performace
        const test = new ShaleReservoirProductionPerformance(modelingOption, fileOption, gpuOption, xInputTensor, yInputTensor);
        test.productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize);
    }
}

new ShaleReservoirProductionPerformance("dnn", "csv", true, null, null).testProductionPerformace(null, null)

module.exports = {ShaleReservoirProductionPerformance}

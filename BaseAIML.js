//4. BaseAIML option for gitHub
/*
 * Ecotert's BaseAIML.js (released as open-source under MIT License) implements the BASE class for constructing AIML applications.
 *
 * AIML applications (e.g Shale reservoir production prediction, drillinng rear events prediction, rock image classification, etc.)
 *
 * inherits or extends the BASE class (BaseAIML) for their implementations.
 *
 * The BaseAIML class contains implementation of the following foundational functions for classification, regression and graph-based methods:
 *
 * 1) Modules loading
 * 2) Results predictions, based on already saved, newly trained or evolving real-rime model
 * 3) Formatting and printing of results to console in easily readable format
 * 4) Run duration timing
 * 5) etc i.e. other helpers or foundational functions are added as deem necessary
 *
 *
 */

class BaseAIML
{
    constructor(modelingOption, fileOption, gpuOption, inputFromCSVFileX, inputFromCSVFileY, mongDBCollectionName, mongDBSpecifiedDataX, mongDBSpecifiedDataY)
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
    
    commonModules(gpuOption)
    {
        const fs = require('fs');
        const path = require('path');
        const util = require('util');
        const mongodb = require('mongodb');
        const assert = require('assert');
        const tfvis = require('@tensorflow/tfjs-vis');
        let tf = require('@tensorflow/tfjs');                   //pure JavaScript version
        
        //replace pure JavaScript version with c/c++ back-end version, if node.js exist (is installed)
        const cmdExists = require('command-exists').sync;
        const nodeJsExist = cmdExists('node');

        if(nodeJsExist === true)
        {
            console.log("================================================================>");
            console.log("Node.js exists (installed successfully) on this machine.");
            console.log("================================================================>");
               
            switch(gpuOption)
            {
                case(true):
                    tf = require('@tensorflow/tfjs-node-gpu');  //c/c++ binding, gpu option
                    console.log("================================================================>");
                    console.log("Swaping pure JavaScript version with GPU version of TensorFlow");
                    console.log("================================================================>");
                    break;
                            
                case(false || null || undefined):
                    tf = require('@tensorflow/tfjs-node');  //c/c++ binding, cpu option
                    console.log("================================================================>");
                    console.log("Swaping pure JavaScript version with CPU version of TensorFlow");
                    console.log("================================================================>");
                    break;
            }
        }

        return {fs:fs, path:path, util:util, mongodb:mongodb, assert:assert, tf:tf, tfvis:tfvis, model:tf.sequential()};
    }
    
    predictProductionAndPrintResults(_x, _y, _reModel, existingSavedModel=false)
    {
        //begin prediction: use the model to do inference on data points
        var beginPredictingTime = new Date();
        var predictY = _reModel.predict(_x);
                    
        //print "train" input and output tensors summary
        if(existingSavedModel === false || existingSavedModel === null || existingSavedModel === undefined)
        {
            console.log("Input train tensor/data summary in JS and TF formats: ");
            console.log("======================================================");
            console.log("Input Train Properties: ")
            console.log(_x);
            console.log("Input Train Values: ");
            _x.print(false);
            console.log("======================================================");
            //
            console.log("Output train tensor/data summary in JS and TF formats:");
            console.log("======================================================");
            console.log("Output Train Properties: ")
            console.log(_y);
            console.log("Output Train Values: ")
            _y.print(false);
            console.log("======================================================");
            console.log();
        }
           
        //print "test" output: expected vs actual
        if(_y.dtype === "float32")
        {
            
            console.log("Expected 'test' output result in Tensor format: ");
            console.log("======================================================");
            console.log(_y.name);
            console.log("Expected Test Values: ");
            _y.print(false);
            console.log("======================================================");
        }
        //
        console.log("Actual 'test' output result in Tensor format:   ")
        console.log("======================================================");
        if(_y.dtype === "float32")
        {
            predictY.name = _y.name;
            console.log(predictY.name);
        }
        else
        {
            console.log("Output = Check_Assigned_Name_And_Unit");
        }
        //
        console.log("Actual Test Values: ");
        predictY.print(false);
        console.log();
                    
        //print summary & prediction time
        new BaseAIML().runTimeDNN(beginPredictingTime, "Predicting Time");
        console.log("Final Model Summary");
        _reModel.summary();
        console.log();
    }
    
    predictProductionAndPrintResultsBasedOnExistingSavedModel(_x, _y, tf, pathToExistingSavedTrainedModel)
    {
        //load/open saved mode and re-use for predicting without training again
        const loadModel = tf.loadLayersModel(pathToExistingSavedTrainedModel)
        
        //load
        loadModel.then(function(existingModel)
        {
            console.log();
            console.log("........Prediction from loaded model Begins........................");
            
            //then predict and print results
            const bam = new BaseAIML();
            var existingSavedModel = undefined;
            bam.predictProductionAndPrintResults(_x, _y, existingModel, existingSavedModel=true);
            
            console.log("........Prediction from loaded model Ends..........................");
            console.log();
        });
    }
    
    runTimeDNN(beginTime, timeOption)
    {
        console.log("========================================================>")
        console.log(timeOption, " (seconds): ", (new Date() - beginTime)/1000);
        console.log("=========================================================>")
    }
    
    getTensor(csvFileArrayOutput)
    {
        const tf = require('@tensorflow/tfjs');
        require('@tensorflow/tfjs-node');
        const inputDim = csvFileArrayOutput.length;
        const inputSize = csvFileArrayOutput[0].length;
        const csvFileArrayOutputToTensor = tf.tensor2d(csvFileArrayOutput);
        return {csvFileArrayOutputToTensor:csvFileArrayOutputToTensor, inputDim:inputDim, inputSize:inputSize};
    }
}
    
module.exports = {ShaleReservoirProductionPerformance};

/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * ...Ecotert's ShaleReservoirCommuication.js (released as open-source under MIT License) implements:
 *
 *
 * Relevant communications/data transmission methods - e.g.:
 *
 * (1) read/write files on disk
 * (2) connect to MongoDB
 * (3) read read/write files from MongoDB
 * (4) etc.
 *
 *
 */
 
 
class ShaleReservoirCommunication
{
    constructor()
    {
        return null;
    }
    
    static commonLongDateFormat()
    {
        return {
            weekday: "long", year: "numeric",
            month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
            second: "2-digit"
        }
    }
    
    static isFile(filePath, fileName)
    {
        const path = require('path');
        const fileExt = path.extname(filePath + fileName);
        
        if(!fileExt)
        {
            return false;
        }
        
        if(fileExt)
        {
            return true;
        }
    }
    
    readInputCSVfile(pathTofile)
    {
        function loadFile(filetoRead)
        {
            const fs = require('fs');
            return fs.readFileSync(filetoRead).toString();
        }
                        
        function castCSVToArray(inputCsvFile)
        {
            var finalArraydata = [];
            var splitRows = inputCsvFile.split(/\r?\n|\r/);
                            
            for (var i in splitRows)
            {
                finalArraydata.push(splitRows[i].split(','));
            }
                            
            return finalArraydata;
        }
                            
        function castCSVToArrayToNumeric(input, removeHeader=false)
        {
            var output = [];
                            
            for(var i in input)
            {
                var element = input[i];
                var elementOut = [];
                                
                for(var j in element)
                {
                    var value =  parseFloat(element[j])
                    var valid = !isNaN(value);
                                    
                    if(valid === true)
                    {
                        elementOut.push(value);
                    }
                    else
                    {
                        elementOut.push(element[j]);
                    }
                }
                                
                output.push(elementOut);
            }
                            
            if(removeHeader === true)
            {
                output.shift();
            }
            
            return output;
        }
             
        return castCSVToArrayToNumeric(castCSVToArray(loadFile(pathTofile)), true);
    }
    
    getStatisticsOfTensor(csvFileArrayOutput)
    {
        console.log("converted/formatted output");
        console.log(csvFileArrayOutput);
        console.log("inputDim: ", csvFileArrayOutput.length);
        console.log("inputSize: ", csvFileArrayOutput[0].length);
        const tf = require('@tensorflow/tfjs');
        require('@tensorflow/tfjs-node');
        const csvFileArrayOutputToTensor = tf.tensor2d(csvFileArrayOutput);
        csvFileArrayOutputToTensor.print(true);
        return csvFileArrayOutputToTensor;
    }
    
    writeReadFile(filePath, outputFileName, readInputFile, unlink, streamOption)
    {
        const fs  = require('fs');
        const filePathOut = filePath + outputFileName;
            
        if(streamOption === false)
        {
            // option 1: regular "writeFile" and "readFile" in async mode
                
            //write file to folder to get instance to object/file to used (consumed) i.e. to be read
            fs.writeFile(filePathOut, readInputFile, function(writeError)
            {
                if(writeError)
                {
                    console.log(writeError);
                    return;
                }
                    
                console.log('Finished writing/saving with "writeFile" !.....');
                     
                if(!writeError)
                {
                    //read file from written file above for other purposes e.g. downloading from server-to-client or vice versa
                    fs.readFile(filePathOut, function(readError)
                    {
                        if(readError)
                        {
                            console.log(readError);
                            return;
                        }
                            
                        console.log('Finished reading with "readFile" !.....');
                            
                        if(unlink === true)
                        {
                            fs.unlink(filePathOut, function (linkError)
                            {
                                if(linkError && linkError.code === 'ENOENT')
                                {
                                        console.log('File does not exist or already deleted !.....');
                                }
                            });
                        }
                    });
                }
            });
        }
        else
        {
            //option 2: using "WriteStream" and "ReadStream" -> better option, b'cos of better memory management
                
            //write-stream file to folder that can be read later
            const options = {'bufferSize': 2048};
            const ws = fs.createWriteStream(filePathOut, options);  //create file;
            ws.write(Buffer.from(readInputFile));                   //write to file

            ws.on('error', function(writeError)
            {
                console.log(writeError);
                return;
            });
                
            ws.on('finish', function()
            {
                console.log('Finished writing/saving with "WriteStream" !.....');
            });

            ws.end(function ()
            {
                //call end to flush out stream and prevent:
                //"Error: ENOSPC: no space left on device, write"
                console.log('End writing/saving with "WriteStream" !.....');
            });
                
            //read-stream existing written file (fom above) to be downloaded from server-to-client, vice versa, etc.
            var rs = fs.createReadStream(filePathOut, options).pipe(ws);
                
            rs.on('error', function(readError)
            {
                console.log(readError);
                return;
            });
                
            rs.on('finish', function()
            {
                console.log('Finished reading file with "ReadStream" !.....');
                    
                if(unlink === true)
                {
                    fs.unlink(filePathOut, function (linkError)
                    {
                        if(linkError && linkError.code === 'ENOENT')
                        {
                                console.log('File does not exist or already deleted !.....');
                        }
                    });
                }
            });
        }
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
            const load = fs.createReadStream(inputFilePath, {'bufferSize': 1024}).pipe(bucket.openUploadStream(outputFileName));
                
            load.on('error', function(error)
            {
                assert.ifError(error);
            });
                
            load.on('finish', function()
            {
                console.log('Done uploading' + inputFilePath + '!');
                process.exit(0);
            });
        }
                
        if(action === "download")
        {
            const download = bucket.openDownloadStreamByName(outputFileName).pipe(fs.createWriteStream(outputFileName), {'bufferSize': 1024});
                
            download.on('error', function(error)
            {
                assert.ifError(error);
            });
                
            download.on('finish', function()
            {
                console.log('Done downloading ' + outputFileName + '!');
                process.exit(0);
            });
        }
    }
}

module.exports = {ShaleReservoirCommunication};

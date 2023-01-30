/*
# ****************************************************************************************************************
# *                                                                                                              *
# *  @License Starts.                                                                                            *
# *                                                                                                              *
# *  Copyright © 2015 - present. MongoExpUser                                                                    *
# *                                                                                                              *
# *  License: MIT - See: https://github.com/MongoExpUser/EP-Economic-Module/blob/master/LICENSE                  *
# *                                                                                                              *
# *  @License Ends                                                                                               *
# *                                                                                                              *
# *  1) The module implements a Crypto class of:                                                                 *
# *     a) Crytographic functionalities on a nodejs server                                                       *
# *  2) The implementation is done with the following Node.js packages                                           *
# *     (a) nodejs native crypto - https://nodejs.org/api/crypto.html                                            *
# *     (b) bcryptjs  - https://www.npmjs.com/package/bcryptjs                                                   *
# *     (c) uuid - https://www.npmjs.com/package/uuid                                                            *
# *  3) The code was updated and tested with Node 19.x on January 28, 2023                                       *
# ****************************************************************************************************************
# * Note:                                                                                                        *
# * a) SHA-512 Algorithm      : SHA-512   --> based on node.js' crypto.createHmac() - depends on OpenSSL version *
# * b) WHIRLPOOL Algorithm    : WHIRLPOOL --> based on node.js' crypto.createHmac() - depends on OpenSSL version *
# * c) BCrypt Algorithm       : Bcrypt    --> based on "bcryptjs" module (https://github.com/dcodeIO/bcrypt.js)  *
# * d) SCrypt Algorithm       : Scrypt    --> based on  node.js' crypto.scrypt()                                 *
# *                                                                                                              *
# * Node.js' crypo algorithm (for crypto.createHmac()) is dependent on the available algorithms supported by     *
# * the version of OpenSSL on the platform.                                                                      *
# * To check available crypo algorithms (for crypto.createHmac()):                                               *
# *                                                                                                              *
# * Option 1 - Within Node.js application file:                                                                  *
# *   const crypto = require('crypto');                                                                          *
# *   console.log(crypto.getHashes());                                                                           *
# *                                                                                                              *
# * Option 2 - On Ubuntu/Linux. From shell, run:                                                                 *
# *   openssl list -digest-algorithms                                                                            *
# *                                                                                                              *
# *                                                                                                              *
# ****************************************************************************************************************
*/


class Crypto
{
    constructor()
    {
      return null;
    }
    
    static commonModules()
    {
        
        const fs = require('fs');
        const util = require('util');
        const crypto = require('crypto');
        const bcrypt = require('bcryptjs');
        const uuid = require('uuid');

        return {
           fs: fs,
           util: util,
           crypto: crypto,
           bcrypt: bcrypt,
           uuid: uuid
       }
    }
    
    static isCryptoSupported(showAlgorithm)
    {
        try
        {
            let commonModules = Crypto.commonModules();
            let crypto = commonModules.crypto;
        }
        catch(cryptoError)
        {
            console.log('crypto support is disabled or not available!');
            return;
        }
        finally
        {
            // print hash (i.e. digest) algorithms in OpenSSL version bundled  with the current Node.js version
            if(showAlgorithm === true)
            {
              let hashesAlgorithms = crypto.getHashes();
              console.log(hashesAlgorithms);
            }
            
            return true;
        }
    }
    
    static verifyConsensus(compareHashSig, combinedHashSigx)
    {
        let hashSigLen = compareHashSig.length; 
                  
        for(let index = 0; index <  hashSigLen; index ++)
        {
            if( (compareHashSig[index] === combinedHashSigx) === false )
            {
                return false;
            }
        }

        return true;
    }
     
    blockchainHash(sig, hashAlgorithm, compareSig, compareSalt, compareHashSig, compareDateNow)
    {
        let showAlgorithm = false;
        
        if(Crypto.isCryptoSupported(showAlgorithm) === true)
        {
            const crypto = new Crypto();
            let rehash = crypto.isHashConsensus(sig, hashAlgorithm);
            return [rehash];
        }
    }

    isHashConsensus(sig, hashAlgorithm, compareSig, compareSalt, compareHashSig, compareDateNow)
    {
        let showAlgorithm = false;
        let commonModules = Crypto.commonModules();
        let uuid          = commonModules.uuid;
        let bcrypt        = commonModules.bcrypt;
        let crypto        = commonModules.crypto;

      
        if(Crypto.isCryptoSupported(showAlgorithm) === true)
        {
            let dateNow = new Date();
            let allAlgorithms = ["bcrypt", "whirlpool", "sha512", "scrypt"];
            let sigLen = sig.length;

            if(allAlgorithms.includes(hashAlgorithm) === false)
            {
                //set default algorithm
                hashAlgorithm = "whirlpool";
            }
            
            if(sig && hashAlgorithm && !compareSig && !compareSalt && !compareHashSig && !compareDateNow)
            {
                let areSigArray  = Array.isArray(sig);
                let salt;
                let combinedSig = "";
                let combinedHashSig = "";

                if(areSigArray !== true)
                {
                    return console.log('The argument, "sig" should be an array. Check, correct and try again!');
                }
                
                if(hashAlgorithm === "bcrypt")
                {
                    salt = bcrypt.genSaltSync(10);
                    
                    for(let i = 0; i < sigLen; i ++)
                    {
                        combinedSig +=  bcrypt.hashSync(sig[i].toString('hex'), salt);
                    }
                    
                    combinedHashSig = bcrypt.hashSync((combinedSig + dateNow), salt);
                }

                if(hashAlgorithm === "whirlpool" || hashAlgorithm === "sha512")
                {
                    salt = uuid.v4();
                        
                    for(let i = 0; i < sigLen; i ++)
                    {
                        combinedSig +=  (crypto.createHmac(hashAlgorithm, salt)).update(sig[i]).digest('hex');
                    }
                        
                    combinedHashSig = (crypto.createHmac(hashAlgorithm, salt)).update(combinedSig + dateNow).digest('hex');
                }

                if(hashAlgorithm === "scrypt")
                {
                    salt = uuid.v4();
                    
                    for(let i = 0; i < sigLen; i ++)
                    {
                        combinedSig +=  (crypto.scryptSync(sig[i], salt, 64)).toString('hex');
                    }
                        
                    combinedHashSig  = (crypto.scryptSync(combinedSig + dateNow, salt, 64)).toString('hex');
                }

                return { salt: salt, hash: combinedHashSig, date: dateNow };

            }
            else if(sig && hashAlgorithm && compareSig && compareSalt && compareHashSig && compareDateNow)
            {
                let combinedSigx = "";
                let combinedHashSigx = "";
                let sigLen = sig.length;
                let compareSigLen = compareSig.length;

                let areSigArray        = Array.isArray(sig);
                let areCompareSigArray = Array.isArray(compareSig);
                
                let confirm = (areSigArray === areCompareSigArray);
                
                if(confirm !== true)
                {
                     return console.log('The arguments: "sig", and "compareSig" should be Arrays. Check, correct and try again!');
                }


                if(hashAlgorithm === "bcrypt")
                {
                    for(let i = 0; i < compareSigLen; i ++)
                    {
                        combinedSigx +=  bcrypt.hashSync(compareSig[i].toString('hex'), compareSalt);
                    }
                    
                    combinedHashSigx = bcrypt.hashSync((combinedSigx + compareDateNow), compareSalt);
                }
              
                if(hashAlgorithm === "whirlpool" || hashAlgorithm === "sha512")
                {
                    for(let i = 0; i < compareSigLen; i ++)
                    {
                        combinedSigx +=  (crypto.createHmac(hashAlgorithm, compareSalt)).update(compareSig[i]).digest('hex');
                    }
                    
                    combinedHashSigx = (crypto.createHmac(hashAlgorithm, compareSalt)).update(combinedSigx + compareDateNow).digest('hex');
                }
              
                if(hashAlgorithm === "scrypt")
                {
                    for(let i = 0; i < compareSigLen; i ++)
                    {
                        combinedSigx +=  (crypto.scryptSync(compareSig[i], compareSalt, 64)).toString('hex');
                    }
                    
                    combinedHashSigx  = (crypto.scryptSync(combinedSigx + compareDateNow, compareSalt, 64)).toString('hex');
                }
              
            }
            else
            {
                return console.log('Missing or incorrect one or more argument(s). Check, correct and try again!');
            }
        }
    }

    testCrypto()
    {
        const fs               = require('fs');
        const path             = require('path');
        const util             = require('util');
        const crypto           = new Crypto();
            
        console.log();
        console.log('------------Testing Crypto Starts--------------------------');
        const filePath         = "BasicAuthentication.js"
        const sig1             = "MongoExpUser";               //string to hash
        const sig2             = fs.readFileSync(filePath);    //file to hash
        const sigList          = [sig1, sig2];                 //array of items to hash
        
        //hash algorithm
        const hashAlgorithm1   = 'bcrypt';
        const hashAlgorithm2   = 'sha512';
        const hashAlgorithm3   = 'whirlpool';
        const hashAlgorithm4   = 'scrypt';
        
        // prior
        const consensus        = crypto.isHashConsensus(sigList, hashAlgorithm1);    
        //const consensus      = { salt: salt; hash: hash, date: dateNow };          
        const priorConsensus   = consensus;              // store in a database (n = 1)
        const priorHash        = priorConsensus.hash;    // store in n-number of databases (1, 2, .. m) 
        
        // verify now
        const compareSigList   = sigList;                 // new signal List - should be technically the same as prior
        const compareSalt      = priorConsensus.salt;     // salt to compare: retrieve from q database (n=1)
        const compareHashSig   = [priorHash, priorHash];  // hashes to compare: retrieve from n-number of databases, say 2, into a List/Array
        const compareDateNow   = priorConsensus.date;     // date to compare: retrieve from a database (n=1)
        const validate         = crypto.isHashConsensus(sigList, hashAlgorithm1, compareSigList, compareSalt, compareHashSig, compareDateNow);
        
        //show result
        console.log("original :");
        console.log(util.inspect(consensus, { showHidden: true, colors: true, depth: 4 }));
        console.log();
        console.log("validate :");
        console.log(util.inspect(validate, { showHidden: true, colors: true, depth: 4 }));
        console.log()
        console.log('------------Testing Crypto Ends--------------------------');
        console.log();
    }
}

function runTest()
{
   new Crypto().testCrypto(); // Crypto testing
}

// uncomment next line to test
// runTest()


module.exports = { Crypto };

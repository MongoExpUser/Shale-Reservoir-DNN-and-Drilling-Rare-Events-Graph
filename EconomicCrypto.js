/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 *
 * @License Ends
 *
 * ...Ecotert's EconomicCrypto.js (released as open-source under MIT License) implements:
 *
 * Crytographic functionalities on a "Node.js Server".
 *
 * Dependencies are: 
 * 1) Node.js native crypto - https://nodejs.org/api/crypto.html
 * 2) bcryptjs modules      - https://www.npmjs.com/package/bcryptjs
 *
 * Note:
 * a) SHA-512 Algorithm      : SHA-512         -----> based on node.js' crypto.createHmac() - depends on OpenSSL version
 * b) WHIRLPOOL Algorithm    : WHIRLPOOL       -----> based on node.js' crypto.createHmac() - depends on OpenSSL version
 * c) BCrypt Algorithm       : Bcrypt          -----> based on "bcryptjs" module (https://github.com/dcodeIO/bcrypt.js)
 * d) SCrypt Algorithm       : Scrypt          -----> based on  node.js' crypto.scrypt()
 *
 * Node.js' crypo algorithm (for crypto.createHmac()) is dependent on the available algorithms supported by the version of OpenSSL on the platform.
 *
 * To check available crypo algorithms (for crypto.createHmac()):
 *
 * Option 1 - Within Node.js application file:
 *   const crypto = require('crypto');
 *   console.log(crypto.getHashes());
 *
 * Option 2 - On Ubuntu/Linux. From shell, run:
 *   openssl list -digest-algorithms
 *
 */

class  EconomicCrypto
{
    constructor()
    { 
      return null;
    }
    
    static commonModules()
    {
       return {
           globalPromise: require('bluebird'),
           uuidV4: require('uuid/v4'),
           bcrypt: require("bcryptjs"),
           crypto: require('crypto')
       }
    }
    
    static isCryptoSupported(showAlgorithm)
    {
        try
        {
            var commonModules = EconomicCrypto.commonModules();
            var crypto = commonModules.crypto;
        }
        catch(cryptoError)
        {
            console.log('crypto support is disabled or not available!');
            return;
        }
        finally
        {
            // print hash (i.e. digest) algorithms in OpenSSL version bundled  with the current Node.js version
            if(showAlgorithm == true)
            {
              var hashesAlgorithms = crypto.getHashes();
              console.log(hashesAlgorithms);
            }
            
            return true;
        }
    }
    
    static verifyConsensus(compareHashSig, combinedHashSigx)
    {
        var count  = 0;
                    
        for(var i in compareHashSig)
        {
            if((compareHashSig[i] === combinedHashSigx) === false)
            {
                count = count + 1;
            }
        }
                    
        if(count > 0)
        {
            return false;
        }
                    
        return true;
    }
    
    
    blockchainHash(sig, hashAlgorithm, compareSig, compareSalt, compareHashSig, compareDateNow)
    {
        var showAlgorithm = false;
        
        if(EconomicCrypto.isCryptoSupported(showAlgorithm) === true)
        {
            var economicCrypto = new EconomicCrypto();
            var rehash = economicCrypto.isHashConsensus(sig, hashAlgorithm);
            return [rehash];
        }
    }
   
    isHashConsensus(sig, hashAlgorithm, compareSig, compareSalt, compareHashSig, compareDateNow)
    {
        var showAlgorithm = false;
        var commonModules = EconomicCrypto.commonModules();
        global.Promise    = commonModules.globalPromise;
        var uuidV4        = commonModules.uuidV4;
        var bcrypt        = commonModules.bcrypt;
        var crypto        = commonModules.crypto;
        
        if(EconomicCrypto.isCryptoSupported(showAlgorithm) === true)
        {
            var dateNow = new Date();
            var allAlgorithms = ["bcrypt", "whirlpool", "sha512", "scrypt"]

            if(allAlgorithms.includes(hashAlgorithm) === false)
            {
                //set default algorithm
                hashAlgorithm = "whirlpool";
            }
            
            if(sig && hashAlgorithm && !compareSig && !compareSalt && !compareHashSig && !compareDateNow)
            {
                var areSigArray  = Array.isArray(sig);
                
                if(areSigArray === true)
                {
                    var combinedSig = "";
                }
                else
                {
                    console.log('The argument, "sig - i.e. input sig(s)", should be an array. Check, correct and try again!');
                    return;
                }
                
                if(hashAlgorithm === "bcrypt")
                {
                    var salt = bcrypt.genSaltSync(10);
                    
                    for(var i in sig)
                    {
                        combinedSig +=  bcrypt.hashSync(sig[i].toString('hex'), salt);
                    }
                    
                    var combinedHashSig = bcrypt.hashSync((combinedSig + dateNow), salt);
                }

                if(hashAlgorithm === "whirlpool" || hashAlgorithm === "sha512")
                {
                    var salt = uuidV4();
                        
                    for(var i in sig)
                    {
                        combinedSig +=  (crypto.createHmac(hashAlgorithm, salt)).update(sig[i]).digest('hex');
                    }
                        
                    var combinedHashSig = (crypto.createHmac(hashAlgorithm, salt)).update(combinedSig + dateNow).digest('hex');
                }

                if(hashAlgorithm === "scrypt")
                {
                    var salt = uuidV4();
                    
                    for(var i in sig)
                    {
                        combinedSig +=  (crypto.scryptSync(sig[i], salt, 64)).toString('hex');
                    }
                        
                    var combinedHashSig  = (crypto.scryptSync(combinedSig + dateNow, salt, 64)).toString('hex');
                }

                var result = [salt, combinedHashSig, dateNow];
                
                return result;
                
            }
            else if(sig && hashAlgorithm && compareSig && compareSalt && compareHashSig && compareDateNow)
            {
                var areHashesArray     = Array.isArray(compareHashSig);
                var areCompareSigArray = Array.isArray(compareSig);
                var areSigArray        = Array.isArray(sig);
                
                var allTrue = (areHashesArray === areCompareSigArray === areSigArray);
                
                if(allTrue !== true)
                {
                    console.log('The arguments: "sig", "compareSig" and "compareHashSig" should all be Arrays. Check, correct and try again!');
                    return;
                }
                else if(allTrue === true)
                {
                    var combinedSigx = "";
                }
              
                if(hashAlgorithm === "bcrypt")
                {
                    for(var i in compareSig)
                    {
                        combinedSigx +=  bcrypt.hashSync(compareSig[i].toString('hex'), compareSalt);
                    }
                    
                    var combinedHashSigx = bcrypt.hashSync((combinedSigx + compareDateNow), compareSalt);
                }
              
                if(hashAlgorithm === "whirlpool" || hashAlgorithm === "sha512")
                {
                    for(var i in compareSig)
                    {
                        combinedSigx +=  (crypto.createHmac(hashAlgorithm, compareSalt)).update(compareSig[i]).digest('hex');
                    }
                    
                    var combinedHashSigx = (crypto.createHmac(hashAlgorithm, compareSalt)).update(combinedSigx + compareDateNow).digest('hex');
                }
              
                if(hashAlgorithm === "scrypt")
                {
                    for(var i in compareSig)
                    {
                        combinedSigx +=  (crypto.scryptSync(compareSig[i], compareSalt, 64)).toString('hex');
                    }
                    
                    var combinedHashSigx  = (crypto.scryptSync(combinedSigx + compareDateNow, compareSalt, 64)).toString('hex');
                }
              
              
                return EconomicCrypto.verifyConsensus(compareHashSig, combinedHashSigx);
                
            }
            else
            {
                console.log('Missing or incorrect one or more argument(s). Check, correct and try again!');
                return null;
            }
        }
    }
}

module.exports = {EconomicCrypto};


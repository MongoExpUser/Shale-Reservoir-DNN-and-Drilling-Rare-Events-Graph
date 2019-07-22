/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Heavy-Oil-PVT-Simulator/blob/master/LICENSE
 *
 * @License Ends
 *
 * ...Ecotert's test_NAPI.cc (released as open-source under MIT License) implements:
 *
 *  A simple demonstration of NAPI's functions creation that can be called on Node.js server as a simple Addon
 *
 *
 */


// c standard header files
#include <assert.h>
#include <ctype.h>
#include <errno.h>
#include <float.h>
#include <iso646.h>
#include <limits.h>
#include <locale.h>
#include <math.h>
#include <setjmp.h>
#include <signal.h>
#include <stdarg.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <wchar.h>
#include <wctype.h>
#include <fenv.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <tgmath.h>
#include <stdalign.h>
#include <stdnoreturn.h>
#include <uchar.h>
#include <pthread.h>
#define complex _Complex
    
//c++ standard header files
#include <iostream>
#include <istream>
#include <ostream>
#include <new>
#include <complex>
#include <typeinfo>
#include <thread>

//header file related to NAPI and/or v8 C++ codes
#include <node.h>
#include <unistd.h>
#include <node_buffer.h>
#include <uv.h>             // libuv library
#include <node_api.h>       // napi library
#include <v8.h>             // v8 library


//.... simple method creations in pure C (No C++ syntax) ........................ start
double gammaFunction(double a)
{
  /*
    Reference: Nemes, G. (2008). New asymptotic expansion for the Γ(x) function (an update).
             In Stan's Library, Ed.S.Sykora, Vol.II. First released December 28, 2008.
    Link: http://www.ebyte.it/library/docs/math08/GammaApproximationUpdate.html.
          see Nemes' formula & Fig.1 on page 6 of full text: Nemes_6.
  */
  
  const double PI = 3.1415926536;
  const double E  = 2.718281828459045;
  double coefficient6 = pow( ( 1 + 1/(12*a*a) + 1/(1440*pow(a,4)) + 239/(362880*pow(a,6)) ), a);   //Nemes_6 coefficient
  return (  ( pow( (a / E), a ) ) * ( sqrt(2 * PI / a) ) * ( coefficient6 )  );
}

double gammaDistFunction(double a, double x)
{
  //Reference: NIST/SEMATECH e-Handbook of statistical methods,
  //http://www.itl.nist.gov/div898/handbook/eda/section3/eda366b.htm. Retrieved January 5, 2016.
  return (  ( pow(a, (x - 1)) * exp(-a) ) / gammaFunction(x)  );
}

double IRR(double cashFlowArray [], int cashFlowArrayLength)
{
  //a method for calculating internal rate of return (IRR)
  int cfaLength     = cashFlowArrayLength;
  double guess      = 1E-1;
  double increment  = 1E-4;
  double NPVout     = 0;

    do
    {
      guess += increment;

      double NPV = 0;

      for (int i = 0; i < cfaLength ; i++)
      {
        NPV += cashFlowArray[i] / pow((1 + guess), i);
        NPVout = NPV;
      }

    }
    while (NPVout > 0);

   return guess * 100;
}

//.... simple method creations in pure C (No C++ syntax)  ........................ end
        
      
// Now  call above pure C methods within C++ scope and generate NAPI equivalent
namespace urppsAddonNAPI
{
    
    // IRR as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value IRRCall(napi_env env, napi_callback_info info)
    {
        //napi part: call arguments
        size_t argc = 1;                                            // size/length of argument
        napi_value argv[1];                                         // arguments as an array
        napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr); // convert argvs to napi values
        napi_handle_scope scope;                                    // variable to handle scope
       
        //standard C part - 1: convert data types
        unsigned int length;                                        // length of array in C data type
        napi_get_array_length(env, argv[0], &length);               // convert napi value to C value -1 (option b: read length from single array argv[0])
        double cfa[length];                                         // array (for cfa) in C data type
        for(unsigned int i = 0; i < length; i++)                    // convert napi value to C value -2 (array - cfa : argv[0])
        {
            napi_open_handle_scope(env, &scope);                    // open scope
          
            napi_value result;                                      // variable to hold napi type result
            double resultC;                                         // variable to hold C type result
            napi_get_element(env, argv[0], i, &result);             // get element in napi
            napi_get_value_double(env, result, &resultC);           // get element in C type
            
            cfa[i] = resultC;                                       // set element in C type (array)
            
            napi_close_handle_scope(env, scope);                    // close scope
        }
        
        //standard C part - 2: then invoke c function
        double outputData = IRR(cfa, length);                       //call IRR C function

        //convert data type back and return in napi
        napi_value fn;
        napi_create_double(env, outputData, &fn);                   //convert to (create) napi value/double
        return fn;
    }
    
    // gammaFunction  as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value gammaFunctionCall(napi_env env, napi_callback_info info)
    {
        //napi part: call arguments
        size_t argc = 1;
        napi_value argv[1];
        napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr); // convert argvs to napi values
          
        //standard C part - 1: convert data types
        double a;                                                   // 1st arg in C data type
        napi_get_value_double(env, argv[0], &a);                    // convert napi values to C values -1 (argv[0])
       
        //standard C part - 2: then invoke c function
        double outputData = gammaFunction(a);                       // call gammaFunction(a) C function
        
        //convert data type back and return in napi
        napi_value fn;
        napi_create_double(env, outputData, &fn);                   // convert to (create) napi value/double
        return fn;
    }
    
    
    // gammaDistFunction  as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value gammaDistFunctionCall(napi_env env, napi_callback_info info)
    {
        //napi part: call arguments
        size_t argc = 2;
        napi_value argv[2];
        napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);// convert argvs to napi values
           
        //standard C part - 1: convert data types
        double a;                                                   // 1st arg in C data type
        double x;                                                   // 2nd arg in C data type
        napi_get_value_double(env, argv[0], &a);                    // convert napi values to C values -1 (argv[0])
        napi_get_value_double(env, argv[1], &x);                    // convert napi values to C values -2 (argv[1])
        
        //standard C part - 2: then invoke c function
        double outputData = gammaDistFunction(a, x);                // call gammaDistFunction(a, x) C function
      
        //convert data type back and return in napi
        napi_value fn;
        napi_create_double(env, outputData, &fn);                   // convert to (create) napi value/double
        return fn;
    }
    
    
    // export local objects (function arguments) i.e. assemble all methods for export inside initNAPI
    // and export created function(s) on test_NAPI.cc source file
    napi_value initNAPI(napi_env env, napi_value exports)
    {
        // note: plain vanila, no error handle
        
        //define all functions to be exported
        napi_value fn1, fn2, fn2;
        
        //then declare:
        //function 2
        napi_create_function(env, "IRR", NAPI_AUTO_LENGTH, IRRCall, nullptr, &fn1);
        napi_set_named_property(env, exports, "IRR", fn2);
        // "IRR": is the name of the exported function
        
        //function 5
        napi_create_function(env, "gammaFunction", NAPI_AUTO_LENGTH, gammaFunctionCall, nullptr, &fn2);
        napi_set_named_property(env, exports, "gammaFunction", fn2);
        // "gammaFunction": is the name of the exported function

        //function 6
        napi_create_function(env, "gammaDistFunction", NAPI_AUTO_LENGTH, gammaDistFunctionCall, nullptr, &fn3);
        napi_set_named_property(env, exports, "gammaDistFunction", fn3);
        // "gammaDistFunction": is the name of the exported function

        return exports;
    }
    
    
    //export all method on inits
    NAPI_MODULE(addonTest_NAPI, initNAPI)         // "addonTest": is the name of the exported addon in the target "binding.gyp" file
}

/*
 //After generating addon module with "node-gyp" command, to use any of above functions (e.g. IRR) within Node.js file, do these:
 
 //1. required the addon module
 let  addonTest  =  require('bindings')('addonTest.node');
 
 //2. then invoke function on the module
 let Alist = [];
 let IRR = addonTest.IRR(Alist, A.length);
 
*/

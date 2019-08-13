/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 * ...Ecotert's test_addon.cc (released as open-source under MIT License) implements:
 *
 *  A simple demonstration of:
 *
 *  1) NAPI's functions creation,
 *
 *  2) NAPI's function creation to invoke methods on C++ class and
 *
 *  3) NAPI's JavaScript Object creation
 *
 *  All NAPI's creation in items 1, 2 and 3 above can be called on Node.js server as simple Addon.
 *
 */


#include <iostream>
#include <cmath>
#include <node.h>
#include <node_api.h>
#include <node_buffer.h>

using std::cin;
using std::cout;
using std::endl;
using std::string;


//.... simple functions creation in pure C (No C++-related indentifier or syntax) ............................ starts

double gammaFunction(double a)
{
  // a method for calculating gamma function
  // Reference: Nemes, G. (2008). New asymptotic expansion for the Γ(x) function (an update).
  //           In Stan's Library, Ed.S.Sykora, Vol.II. First released December 28, 2008.
  // Link: http://www.ebyte.it/library/docs/math08/GammaApproximationUpdate.html.
  //      See Nemes' formula & Fig.1 on page 6 of full text: Nemes_6.

  const double PI = 3.1415926536;
  const double E  = 2.718281828459045;
  double coefficient6 = pow( ( 1 + 1/(12*a*a) + 1/(1440*pow(a,4)) + 239/(362880*pow(a,6)) ), a);   //Nemes_6 coefficient
  return (( pow( (a / E), a ) ) * ( sqrt(2 * PI / a) ) * ( coefficient6 ));
}

double gammaDistFunction(double a, double x)
{
  // a method for calculating gamma distribution function
  // Reference: NIST/SEMATECH e-Handbook of statistical methods.
  //          : http://www.itl.nist.gov/div898/handbook/eda/section3/eda366b.htm.
  //          : Retrieved January 5, 2016.
    
  return (( pow(a, (x - 1)) * exp(-a) ) / gammaFunction(x));
}

double IRR(double cashFlowArray [], int cashFlowArrayLength)
{
  // a method for calculating internal rate of return (IRR)
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

char *PSD()
{
  // a method for returning  a string
  static char psd [] = "just_a_string_of_non-hashed-password";
  return psd;
}
   
//.... simple functions creation in pure C (No C++-related indentifier or syntax) ............................ ends


//.... implementation of the above pure C functions and other functions within C++ class i.s. as OOP.......... starts
class TestNAPI
{
  
  //constructor(s)
  public:
    TestNAPI(double value)
    {
      valueOne = value;
    }
    
    TestNAPI() { }
    
  protected:
    double valueOne;
    
  public:
    int thisValue;
    
    
    double getValueOne()
    {
      return valueOne;
    }
    
    double gammaFunction(double a)
    {
      const double PI = 3.1415926536;
      const double E  = 2.718281828459045;
      double coefficient6 = pow( ( 1 + 1/(12*a*a) + 1/(1440*pow(a,4)) + 239/(362880*pow(a,6)) ), a);   //Nemes_6 coefficient
      return (( pow( (a / E), a ) ) * ( sqrt(2 * PI / a) ) * ( coefficient6 ));
    }
    
    double gammaDistFunction(double a, double x)
    {
      return ((pow(a, (x - 1)) * exp(-a) ) / gammaFunction(x));
    }
    
    double IRR(double cashFlowArray [], int cashFlowArrayLength)
    {
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
    
    char *PSD()
    {
      static char psd [] = "just_a_string_of_non-hashed-password";
      return psd;
    }
    
};
//.... implementation of the above pure C functions and other functions within C++ class i.s. as OOP.......... ends


//.... implementation of C++ function to invoke methods on the above TestNAPI class .......................... starts
int testNAPIStuff()
{
  cout<< "" << endl;
  cout<<"..........Begin TestNAPI-class call.........................." << endl;
  TestNAPI testnapi = TestNAPI(7.53);
  cout<< "ValueOne test: ";
  cout << testnapi.getValueOne() << endl;
  cout<< "Gamma Dist Function test: ";
  cout << testnapi.gammaFunction(0.23) << endl;
  cout << "Non-hashed password test: ";
  cout << testnapi.PSD() << endl;
	cout<<"..........Ended TestNAPI-class call.........................." << endl;
	cout<< "" << endl;
	return 0;
}
//.... implementation of C++ function to invoke methods on the above TestNAPI class .......................... ends
    


//... now  call above pure C functions and C++ function implementations within C++ scope and generate NAPI equivalent
namespace addonNAPIScope
{
    // IRR function as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value IRRCall(napi_env env, napi_callback_info info)
    {
        // napi part: call arguments
        size_t argc = 1;                                            // size/length of argument
        napi_value argv[1];                                         // arguments as an array
        napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr); // convert argvs to napi values
        napi_handle_scope scope;                                    // variable to handle scope
       
        // standard C part - 1: convert data types
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
        
        // standard C part - 2: then invoke c function
        double outputData = IRR(cfa, length);                       //call IRR C function

        //convert data type back and return in napi
        napi_value fn;
        napi_create_double(env, outputData, &fn);                   //convert to (create) napi value/double
        return fn;
    }
    
  
    // gammaFunction  function as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value gammaFunctionCall(napi_env env, napi_callback_info info)
    {
        // napi part: call arguments
        size_t argc = 1;
        napi_value argv[1];
        napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr); // convert argvs to napi values
          
        // standard C part - 1: convert data types
        double a;                                                   // 1st arg in C data type
        napi_get_value_double(env, argv[0], &a);                    // convert napi values to C values -1 (argv[0])
       
        // standard C part - 2: then invoke c function
        double outputData = gammaFunction(a);                       // call gammaFunction(a) C function
        
        // convert data type back and return in napi
        napi_value fn;
        napi_create_double(env, outputData, &fn);                   // convert to (create) napi value/double
        return fn;
    }
    
    
    // gammaDistFunction function as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value gammaDistFunctionCall(napi_env env, napi_callback_info info)
    {
        // napi part: call arguments
        size_t argc = 2;
        napi_value argv[2];
        napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);// convert argvs to napi values
           
        // standard C part - 1: convert data types
        double a;                                                   // 1st arg in C data type
        double x;                                                   // 2nd arg in C data type
        napi_get_value_double(env, argv[0], &a);                    // convert napi values to C values -1 (argv[0])
        napi_get_value_double(env, argv[1], &x);                    // convert napi values to C values -2 (argv[1])
        
        // standard C part - 2: then invoke c function
        double outputData = gammaDistFunction(a, x);                // call gammaDistFunction(a, x) C function
      
        // convert data type back and return in napi
        napi_value fn;
        napi_create_double(env, outputData, &fn);                   // convert to (create) napi value/double
        return fn;
    }
    
    // PSD function as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value PSDCall(napi_env env, napi_callback_info info)
    {
       // standard C part
       char *psd = PSD();                                           //pointer (array of chars) = string to consume PSD()
       
       // convert data type and return in napi
       napi_value fn;
       napi_create_string_utf8(env, psd, NAPI_AUTO_LENGTH, &fn);    //convert to (create) napi string
       return fn;
    }
    
    
    // testNAPIStuff function as Addon_NAPI: C/C++ implementation within NAPI
    // arguments are passed with "napi_get_cb_info" function
    napi_value testNAPIStuffCall(napi_env env, napi_callback_info info)
    {
       // standard C++ part
       int testnapistuff = testNAPIStuff();                           //testNAPIStuff() C++ function
       
       // convert data type and return in napi
       napi_value fn;
       napi_create_int32(env, testnapistuff, &fn);                    //convert to (create) napi value/int
       return fn;
    }
    
    // export function(s) and JavaScript object(s) => i.e. assemble all for export inside initNAPI
    napi_value initNAPI(napi_env env, napi_value exports)
    {
        // note: plain vanila, no error handle
        
        // declare all functions to be exported
        napi_value fn1, fn2, fn3, fn4, fn5;
        
        // then define the finctions
        // function 1: "IRR" is the name of the exported function
        napi_create_function(env, "IRR", NAPI_AUTO_LENGTH, IRRCall, nullptr, &fn1);
        napi_set_named_property(env, exports, "IRR", fn1);
        
        // function 2: "gammaFunction" is the name of the exported function
        napi_create_function(env, "gammaFunction", NAPI_AUTO_LENGTH, gammaFunctionCall, nullptr, &fn2);
        napi_set_named_property(env, exports, "gammaFunction", fn2);
        
        // function 3: "gammaDistFunction" is the name of the exported function
        napi_create_function(env, "gammaDistFunction", NAPI_AUTO_LENGTH, gammaDistFunctionCall, nullptr, &fn3);
        napi_set_named_property(env, exports, "gammaDistFunction", fn3);
        
        // function 4: "PSD" is the name of the exported function
        napi_create_function(env, "PSD", NAPI_AUTO_LENGTH, PSDCall, nullptr, &fn4);
        napi_set_named_property(env, exports, "PSD", fn4);
        
        // function 5: "testNAPIStuff" is the name of the exported function
        napi_create_function(env, "testNAPIStuff", NAPI_AUTO_LENGTH, testNAPIStuffCall, nullptr, &fn5);
        napi_set_named_property(env, exports, "testNAPIStuff", fn5);
        
        // JavaScript object 1: creating and exporting js objects equivalent
        static char strMessage [] = "test_object_in_JavaScript";              //c/c++ datatype
        int intValue =  789;                                                  //c/c++ datatype
        double doubleSum = double (intValue) + 21;                            //c/c++ datatype
        bool booleanConfirm = true;                                           //c/c++ datatype
        napi_value message, valueOne, valueTwo, confirm, obj;                 //napi data types: string, int32, double, boolean, object & function
        napi_create_string_utf8(env, strMessage, NAPI_AUTO_LENGTH, &message); //create napi_value for message
        napi_create_double(env, doubleSum, &valueOne);                        //create napi_value for valueOne
        napi_create_int32(env, intValue, &valueTwo);                          //create napi_value for valueTwo
        napi_get_boolean(env, booleanConfirm, &confirm);                      //create napi_value for confirm
        napi_create_object(env, &obj);                                        //create napi_value for object => equivalent to-> const obj = {} in JavaScript
        //add properties (napi_values) to object
        napi_set_named_property(env, obj, "myMessage", message);              //obj.myValue   = value    => 793
        napi_set_named_property(env, obj, "myValueOne", valueOne);            //obj.myValue   = value    => 793
        napi_set_named_property(env, obj, "myValueTwo", valueTwo);            //obj.myValue   = value    => 793
        napi_set_named_property(env, obj, "myConfirm", confirm);              //obj.myConfirm = confirm  => true
        
        //export created object as addon
        napi_set_named_property(env, exports, "obj", obj);                    //"obj": is the name of the exported object
        
        return exports;
    }
    
    // export all function(s) and class(es) as Addons on inits.
    // note: "addonTest": is the name of the exported addon module inside the target "binding.gyp" file
    NAPI_MODULE(addonTest_NAPI, initNAPI)
}


/*
    // after generating addon module with "node-gyp" command, to use any of the
    // above functions (e.g. PSD & Gamma Dist Function) within Node.js codes, do these:

    //1. required/import the addon module
    const addonTest = require('bindings')('addonTest.node');

    //2. then invoke functions on the module
    const addonTest = require('bindings')('addonTest.node');
    const psd = addonTest.PSD();
    const gdf = addonTest.gammaDistFunction(0.05, 0.23);
    const obj = addonTest.obj;
            
    //3. show results
    console.log("Non-hashed password : ", psd);
    console.log("Gamma Dist Function : ", gdf);
    console.log("obj structure: ", obj);
    console.log("obj's myMessage : ", obj.myMessage);
    console.log("obj's myValueOne : ", obj.myValueOne);
    console.log("obj's myValueTwo : ", obj.myValueTwo);
    console.log("obj's myconfirm : ", obj.myConfirm);
    
    //4. invoke methods on the class(TestNAPI), developed in C++
    const tns = addonTest.testNAPIStuff();
    
*/

# ***********************************************************************************************************************************
# * @License Starts
# *
# * Copyright © 2015 - present. MongoExpUser
# *
# * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
# *
# * @License Ends
# *
# ***********************************************************************************************************************************
#
#  ...Ecotert's ShaleReservoirApacheSpark.py  (released as open-source under MIT License) implements:
#
#  Two simple classes to demonstate and test usage of Apache Spark with Python API (Pyspark) to:
#
#  1) calculate reservoir STOOIP and
#
#  2) classify images with Tensorflow CNN
#
# ***********************************************************************************************************************************
# ***********************************************************************************************************************************

try:
  """  import commonly used modules; print pyspark, networkx, tensorflow
       and keras version; and then check for import error
  """
  #import
  
  import time
  import pyspark
  import networkx as nx
  from csv import writer
  import tensorflow as tf
  from pprint import pprint
  from json import dumps, loads
  import matplotlib.pyplot as plt
  from random import random, randint
  from unittest import TestCase, main
  from pyspark import SparkConf, SparkContext
  from pyspark.ml.feature import VectorAssembler
  from pyspark.sql import SparkSession, DataFrame, types
  from pandas import read_json, DataFrame as PythonDataFrame
  from ShaleReservoir import ShaleDNN
  #
  #all pyspark sub-modules: commment out - only here for referencing
  #import modules and sub modules, when necesary or required
  #import pyspark.sql
  #import pyspark.streaming
  #import pyspark.ml
  #import pyspark.mllib
  #note: pyspark's graphx API is NOT yet available:
  #    : but can use "networkx" python module for Graph-Based Analysis (see: https://networkx.github.io/)
  #    : On UbuntU Linux: install "networkx" as:
  #      (1) conda: "conda install -c anaconda networkx" or
  #      (2) pip: "sudo python3.7 -m pip install networkx"
  #print version of pyspark, tensorflow, keras and networkx
  print()
  print("------------------------------------------------------------")
  print("Using Pyspark version", pyspark.__version__, "on this system.")
  print("Using TensorFlow version", tf.__version__, "on this system. ")
  print("Using Keras version", tf.keras.__version__, "on this system.")
  print("Using Networkx version", nx.__version__, "on this system.")
  print("------------------------------------------------------------")
  print("")
  #check for error
except(ImportError) as err:
  print(str(err))
  

class ShaleReservoirApacheSpark():
  """ A simple class to demonstate usage of Apache Spark™ with Python API (Pyspark)"""
  
  def __init__(self):
    print()
    print()
    self.separator()
    print("Initiating Pyspike Engine.")
    self.separator()
  # End  __init__() method

  def separator(self):
    print("------------------------------------------------------------")
  # End separator method()
  
  def duration_separator(self):
    print("<===========================================================>")
  # End duration_separator method()
  
  def get_spark_dataframe_shape(self, spark_dataframe_data):
    count = 0
    for index, item in enumerate(spark_dataframe_data):
      count = index
    return (count, len(spark_dataframe_data.columns))
  # End get_spark_dataframe_shape() method
  
  def calculate_stooip(self, total_number_of_reservoirs=None, engine_name=None):
    self.separator()
    print("{}{}".format(engine_name, "-based STOOIP computation started and in progress ....."))
    t0 = time.time()
    for each_number_of_reservoirs in range(total_number_of_reservoirs):
      #note: STOOIP_bbls = 7758 * Area_acres * Net_pay_ft * Porosity_frac * Oil_sat_frac * (1/Bo) * (1/10E+6)
      stooip_bbls = 7758 * (3200 + randint(20, 80)) * (120 + randint(10, 30))  * (0.18*randint(1, 2)) * (0.7681 + random()*0.1) * (1/1.001) * (1/10E+6)
    duration = time.time() - t0
    print("STOOIP value for reservoir no.", each_number_of_reservoirs+1, "(MM bbls) = ", '{0:.4f}'.format(stooip_bbls))
    self.duration_separator()
    print("{}{}{}".format(engine_name, "-based STOOIP computation time (seconds):", '{0:.4f}'.format(duration)))
    self.duration_separator()
    print("STOOIP computation successfully completed.")
    self.separator()
  # End calculate_stooip() method
      
  def sample_one_stooip_calculation(self, total_number_of_reservoirs=None, spark_engine=True):
    #to demo speed-up due to spark engine, calculate reservoir STOOIP (in bbls) in a loop
    #up to nth number of reservoirs across several fields, with or without spark engine and time the results
    if spark_engine:
      #start spark by invoking SparkSession()
      spark = SparkSession.builder.master("local").appName("Reservoir STOOIP Demonstration").getOrCreate()
      #apply spark.parallelize() to the stooip calculation method and time the run: ensure method is supply as a  list of argument
      spark.sparkContext.parallelize([self.calculate_stooip(total_number_of_reservoirs=total_number_of_reservoirs, engine_name="Spark engine")])
      #stop spark
      spark.stop()
    else:
      # invoke stooip calculation without spike engine
      self.calculate_stooip(total_number_of_reservoirs=total_number_of_reservoirs, engine_name="Regular VM engine")
  # End sample_one_stooip_calculation() method
  
  def sample_two_machine_learning_with_tensorflow(self, spark_engine=True):
    #to demo 2nd speed-up due to spark engine, run "TensorFlow" image classification example in "ShaleReservoir.py"
    if spark_engine:
      #invoke "TensorFlow" image classification example in "ShaleReservoir.py" with spike engine
      engine_name = "Spark engine"
      print("")
      print("{}{}".format(engine_name, "-based 'TensorFlow' image classification started and in progress ....."))
      sfc =  ShaleDNN()
      cnn_options = sfc.test_dataset_cnn_images_classification(test=True, data_option="fashion")
      #start spark by invoking SparkSession()
      spark = SparkSession.builder.master("local").appName("Tensorflow-Based Image Classification Demonstration").getOrCreate()
      #apply spark.parallelize() to the classification method and time the run: ensure method is supply as a list of argument
      t0 = time.time()
      spark.sparkContext.parallelize([sfc.cnn_images_classification(cnn_options=cnn_options)])
      duration = time.time() - t0
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based 'TensorFlow' image classification time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("'TensorFlow' image classification successfully completed.")
      #stop spark
      spark.stop()
    else:
      #invoke "TensorFlow" image classification example in "ShaleReservoir.py" without spike engine
      engine_name = "Regular VM engine"
      print("")
      print("{}{}".format(engine_name, "-based 'TensorFlow' image classification started and in progress ....."))
      t0 = time.time()
      sfc =  ShaleDNN()
      cnn_options = sfc.test_dataset_cnn_images_classification(test=True, data_option="fashion")
      sfc.cnn_images_classification(cnn_options=cnn_options)
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based 'TensorFlow' image classification time (seconds):", '{0:.4f}'.format(time.time() - t0)))
      self.duration_separator()
      print("'TensorFlow' image classification successfully completed.")
  # End sample_two_machine_learning_with_tensorflow() method
  
  def sample_three_read_json_reservoir_data_to_dataframe(self, json_data=None, nth_time=10, spark_engine=True):
    
    #define a dictionary/string containing reservoir data
    data = { 'FIELD_NAME' : ['Yoho', 'Salabe', 'Agbabu', 'Owopele-north'],
             'RESERVOIR_DEPTH_FT' : [12000.04, 1489.34, 400, 12567.43],
             'FLUID_TYPE' : ['Light Oil', 'Condensate', 'Bitumen', 'Light oil'],
             'FLUID_API' : [35.1, 45.3, 10.4, 34.4],
             'FIELD_LOCATION' : ['Offshore', 'Swamp', 'Land', 'Land']
    }
    
    #ensure data is in (or convert data to)  json format
    json_data = dumps(data)
   
    print("Printing Contents of the JSON Representation:")
    self.separator()
    pprint(json_data)
    self.separator()
    
    #to demo 3rd speed-up due to spark engine, load "JSON" data in a loop nth_time
    if spark_engine:
      #invoke loading of  'JSON' data in a loop with spike engine
      engine_name = "Spark engine"
      print("")
      print("{}{}".format(engine_name, "-based loading of  'JSON' data in a loop started and in progress ....."))
      sfc =  ShaleDNN()
      #start spark by invoking SparkSession()
      spark = SparkSession.builder.master("local").appName("Parallel and Distributed Data Demonstration").getOrCreate()
      #read and create a spark dataframe from jSON data in a loop nth_times and print/pprint/show afterwards
      t0 = time.time()
      # 2. read and create in loop
      for index in range(nth_time):
        spark_dataframe_data = spark.read.json(spark.sparkContext.parallelize([json_data]))
        #note: if json_file (.json file) is on disk, use: spark_dataframe_data = spark.read.json(../path_to_file/filename.json)
      duration = time.time() - t0
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based loading of  'JSON' data in a loop time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("Printing Contents of the Spark DataFrame Representation:")
      print("Check Data Type .....", type(spark_dataframe_data))
      print("Schema .....")
      spark_dataframe_data.printSchema()
      print("All Data Rows with Shape:", self.get_spark_dataframe_shape(spark_dataframe_data))
      self.separator()
      spark_dataframe_data.show()
      self.separator()
      print("Loading of  'JSON' data in a loop successfully completed.")
      #stop spark
      spark.stop()
    else:
      # #invoke loading of  'JSON' data in a loop without spike engine
      engine_name = "Regular VM engine"
      print("")
      print("{}{}".format(engine_name, "-based loading of  'JSON' data in a loop started and in progress ....."))
      t0 = time.time()
      sfc =  ShaleDNN()
      #read and create a pure python dataframe from jSON data in a loop nth_times and print/pprint/show afterwards
      t0 = time.time()
      for index in range(nth_time):
        python_dataframe_data = PythonDataFrame(read_json(json_data))
      duration = time.time() - t0
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based loading of  'JSON' data in a loop time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("Printing Contents of Pure Python DataFrame Representation:")
      print("Data type .....", type(python_dataframe_data))
      print("All Data Rows with Shape:", python_dataframe_data.head().shape)
      self.separator()
      pprint(python_dataframe_data.head())
      self.separator()
      print("Loading of  'JSON' data in a loop successfully completed.")
  # End test_sample_three_read_json_reservoir_data_to_dataframe() method
#End ShaleReservoirApacheSpark() class

  
class ShaleReservoirApacheSparkTest(TestCase):
  """ Test ShaleReservoirApacheSpark() class """
  
  def setUp(self):
    self.sras_demo = ShaleReservoirApacheSpark()
    self.total_number_of_reservoirs = 3000000
    self.spark_engine_yes = True
    self.spark_engine_non = False
  # End setUp() method
    
  def test_sample_one_stooip_calculation(self):
    print()
    #calculate stooip with and without spark engine
    self.sras_demo.sample_one_stooip_calculation(total_number_of_reservoirs=self.total_number_of_reservoirs, spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_one_stooip_calculation(total_number_of_reservoirs=self.total_number_of_reservoirs, spark_engine=self.spark_engine_non)
  #End test_sample_one_stooip_calculation() method
  
  def test_sample_two_machine_learning_with_tensorflow(self):
    print()
    #run "TensorFlow" image classification example in "ShaleReservoir.py"
    self.sras_demo.sample_two_machine_learning_with_tensorflow(spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_two_machine_learning_with_tensorflow(spark_engine=self.spark_engine_non)
  #End test_sample_two_machine_learning_with_tensorflow() method
  
  def test_sample_three_read_json_reservoir_data_to_dataframe(self):
    print()
    #run read_file
    self.sras_demo.sample_three_read_json_reservoir_data_to_dataframe(json_data=None, nth_time=500, spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_three_read_json_reservoir_data_to_dataframe(json_data=None, nth_time=500, spark_engine=self.spark_engine_non)
  #End test_sample_three_read_json_reservoir_data_to_dataframe() method
  
  def tearDown(self):
    print()
    self.sras_demo = None
    self.total_number_of_reservoirs = None
    self.spark_engine_yes = None
    self.spark_engine_no = None
  # End tearDown() method
#End ShaleReservoirApacheSparkTest() class

# invoke test
main(verbosity=2)

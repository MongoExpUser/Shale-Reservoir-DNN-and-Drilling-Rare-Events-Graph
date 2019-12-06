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
#  3) read and load reservoir data, in json format, into DataFrame
#
#
#
# ***********************************************************************************************************************************
#
# To run and test the speed-up samples/examples (Spark/Pyspark vs. Python) presented in this module, do the followings:
#
#
# 1) Install Ubuntu (minimum of Ubuntu 18.04.1 LTS) on a cluster of VMs (3+ CPUs) using any of the following cloud plaforms:
#
#    Linode, AWS, GPC, Azure, Oracle, DO, Vultr or any other public cloud platform provider.
#
# 2) Install Java 11 - Java-11-openjdk: sudo apt-get install openjdk-11-jdk
#
# 3) Set: JAVA_HOME="path" as JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
#
# 4) Download Apache Spark v2.4.4 from: https://spark.apache.org/downloads.html -  a .tgz file
#
# 5) Install Apache Spark v2.4.4:
#    - transfer .tgz file to home or desired folder/directory and 'cd' to the home or desired directory/folder
#    - extract file to the directory by typing: tar xvf spark-2.4.4-bin-hadoop2.7.tgz
#
# 6) Install Scala: sudo apt-get install scala
#
# 7) Install Python v3.7: sudo apt-get install python3.7
#
# 8) Install PIP3: sudo apt-get install python3-pip
#
# 9) Install relevant Python packages with pip or conda (if using conda/ananconda):
#    python3.7 -m pip install numpy scipy matplotlib pandas scikit-learn scikit-image statsmodels networkx pyspark keras cython jupyter tensorflow==2.0.0b1
#
# 10) Install other python packages -  see import sections on top of this file (ShaleReservoirApacheSike.py) and the 2nd file (ShaleReservoir.py)
#
# 11) Include both files (ShaleReservoirApacheSpark.py andShaleReservoir.py) in the same directory
#
# 12) On Ubuntu Shell invoke 'Python3' by typing: Python3
#
# 13) At Python prompt, invoke the Python script by typing: exec(open("/path_to_file/ShaleReservoirApacheSpark.py").read())
#
# 14) After the computations run: the results will be displayed with run-times for "Pyspark" vs. "Pure Python" implementions
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
  from os import getcwd
  import networkx as nx
  from csv import writer
  import tensorflow as tf
  from os.path import join
  from pprint import pprint
  from json import dumps, loads
  import matplotlib.pyplot as plt
  from random import random, randint
  from unittest import TestCase, main
  from pyspark import SparkConf, SparkContext
  from pyspark.ml.feature import VectorAssembler
  from pyspark.sql import SparkSession, DataFrame, types
  from pandas import read_json, DataFrame as PythonDataFrame
  from EcotertShaleReservoir import ShaleDNN
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
    print("-------------------------------------------------------------------------------")
  # End separator method()
  
  def duration_separator(self):
    print("<==============================================================================>")
  # End duration_separator method()
  
  def get_spark_dataframe_shape(self, spark_dataframe_data):
    count = 0
    for index, item in enumerate(spark_dataframe_data):
      count = index
    return (count+1, len(spark_dataframe_data.columns))
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
  
  def sample_three_read_json_reservoir_data_to_dataframe(self, read_from_file = None, json_data_file=None, nth_time=10, spark_engine=True):
    if not read_from_file:
      #define a dictionary containing reservoir data
      data =  {'FIELD_NAME' : ['Yoho', 'Oso', 'Agbabu', 'Owopele-North', 'Grosmont', 'Wilshire Ellenburger'],
               'RESERVOIR_DEPTH_FT' : [12000.04, 14897.34, 400.04, 16149.56, 1297.43, 12506.89],
               'FLUID_TYPE' : ['Light Oil', 'Condensate', 'Bitumen', 'Light Oil', 'Bitumen', 'Light Oil'],
               'FLUID_API' : [35.1, 46.3, 10.4, 34.4, 5.01, 40.1],
               'FIELD_BASIN' : ['Niger Delta', 'Niger Delta', 'Benin/Dahomey', 'Niger Delta', 'WCSB', 'Permian Midland']
      }
      
    #to demo 3rd speed-up due to spark engine, load "JSON" data in a loop nth_time
    if spark_engine:
      #invoke loading of'JSON' data in a loop with spike engine
      engine_name = "Spark engine"
      print("")
      print("{}{}".format(engine_name, "-based loading of  'JSON' data in a loop started and in progress ....."))
      #
      #start spark by invoking SparkSession()
      spark = SparkSession.builder.master("local").appName("Parallel and Distributed Data Demonstration").getOrCreate()
      #
      # read data and create a spark dataframe from jSON data in a loop nth_times and print/pprint/show afterwards
      t0 = None
      #
      if read_from_file:
        # 1. load
        json_data = join(getcwd(), json_data_file)  # assumed file in CWD - current working directory
        t0 = time.time()
        # 2. read
        for index in range(nth_time):
          spark_dataframe_data = spark.read.json(json_data)
      else:
        #read from created dictionary
        # 1. load: ensure data is in (or convert data to) json format
        json_data = dumps(data)
        t0 = time.time()
        #2. read
        for index in range(nth_time):
          spark_dataframe_data = spark.read.json(spark.sparkContext.parallelize([json_data]))
      duration = time.time() - t0
      #
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based loading of  'JSON' data in a loop time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("Printing Contents of the Spark DataFrame Representation:")
      print("Check Data Type .....", type(spark_dataframe_data))
      print("Schema .....")
      spark_dataframe_data.printSchema()
      print("All Data Rows with Shape:", self.get_spark_dataframe_shape(spark_dataframe_data))
      self.separator()
      print("Pyspark DataFrame Format:")
      print("-------------------------")
      spark_dataframe_data.show()
      self.separator()
      print("Loading of  'JSON' data in a loop successfully completed.")
      #stop spark
      spark.stop()
    else:
      #invoke loading of  'JSON' data in a loop without spike engine
      engine_name = "Regular VM engine"
      print("")
      print("{}{}".format(engine_name, "-based loading of  'JSON' data in a loop started and in progress ....."))
      #
      #read data and create a pure python dataframe from jSON data in a loop nth_times and print/pprint/show afterwards
      t0 = None
      #
      if read_from_file:
        # 1. load
        json_data = join(getcwd(), json_data_file)  # assumed file in CWD - current working directory
        t0 = time.time()
        # 2.read
        for index in range(nth_time):
          python_dataframe_data = PythonDataFrame(read_json(json_data))
      else:
        #read from created dictionary
        # 1. load: ensure data is in (or convert data to) json format
        json_data = dumps(data)
        # 2. read
        t0 = time.time()
        for index in range(nth_time):
          python_dataframe_data = PythonDataFrame(read_json(json_data))
      duration = time.time() - t0
      #
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based loading of  'JSON' data in a loop time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("Printing Contents of Pure Python DataFrame Representation:")
      print("Data type .....", type(python_dataframe_data))
      print("All Data Rows with Shape:", python_dataframe_data.head().shape)
      self.separator()
      print("Pandas DataFrame Format:")
      print("------------------------")
      pprint(python_dataframe_data)
      self.separator()
      print("Loading of  'JSON' data in a loop successfully completed.")
  # End sample_three_read_json_reservoir_data_to_dataframe() method
#End ShaleReservoirApacheSpark() class

  
class ShaleReservoirApacheSparkTest(TestCase):
  """ Test ShaleReservoirApacheSpark() class """
  
  def setUp(self):
    self.sras_demo = ShaleReservoirApacheSpark()
    self.total_number_of_reservoirs = 3000000
    self.spark_engine_yes = True
    self.spark_engine_non = False
  # End setUp() method
    
  def _test_sample_one_stooip_calculation(self):
    print()
    #calculate stooip with and without spark engine
    self.sras_demo.sample_one_stooip_calculation(total_number_of_reservoirs=self.total_number_of_reservoirs, spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_one_stooip_calculation(total_number_of_reservoirs=self.total_number_of_reservoirs, spark_engine=self.spark_engine_non)
  #End test_sample_one_stooip_calculation() method
  
  def _test_sample_two_machine_learning_with_tensorflow(self):
    print()
    #run "TensorFlow" image classification example in "ShaleReservoir.py"
    self.sras_demo.sample_two_machine_learning_with_tensorflow(spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_two_machine_learning_with_tensorflow(spark_engine=self.spark_engine_non)
  #End test_sample_two_machine_learning_with_tensorflow() method
  
  def test_sample_three_read_json_reservoir_data_to_dataframe(self):
    print()
    #run read_json_reservoir_data
    file = True
    if file:
      read_from_file = True
      json_file_name = "reservoir_data.json"
    else:
      read_from_file = False
      json_file_name = None
    self.sras_demo.sample_three_read_json_reservoir_data_to_dataframe(read_from_file=read_from_file, json_data_file=json_file_name, nth_time=50, spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_three_read_json_reservoir_data_to_dataframe(read_from_file=read_from_file, json_data_file=json_file_name, nth_time=50, spark_engine=self.spark_engine_non)
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

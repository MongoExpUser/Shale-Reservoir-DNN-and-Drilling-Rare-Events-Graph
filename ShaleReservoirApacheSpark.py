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
#
#  Two simple classes to demonstate and test usage of Apache Spark with Python API (Pyspark) to calculate reservoir STOOIP
#
# ***********************************************************************************************************************************
# ***********************************************************************************************************************************


try:
  """  import commonly used modules, print Pyspark version, tensorflow version
       and keras version, and then check for import error
  """
  #import
  
  import time
  import pyspark
  from csv import writer
  import tensorflow as tf
  from pprint import pprint
  from json import dumps, loads
  import matplotlib.pyplot as plt
  from unittest import TestCase, main
  from random import random, randint, randrange
  from pyspark.sql import SparkSession, DataFrame, types
  #
  #all pyspark sub-modules: commment out - only here for referencing
  #import sub-sub modules when necesary
  #import pyspark.sql
  #import pyspark.streaming
  #import pyspark.ml
  #import pyspark.mllib
  #
  #print version of tensorflow and keras
  print()
  print("------------------------------------------------------------")
  print("Using Pyspark version", pyspark.__version__, "on this system.")
  print("Using TensorFlow version", tf.__version__, "on this system. ")
  print("Using Keras version", tf.keras.__version__, "on this system.")
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
    print("----------------------------")
    print("Initiating Pyspike Engine.")
    print("----------------------------")
  # End  __init__() method
  
  def calculate_stooip(self, total_number_of_reservoirs=None, engine_name=None):
    print("------------------------------------------------------------")
    print("{}{}".format(engine_name, "-based STOOIP computation started and in progress ....."))
    t0 = time.time()
    for each_number_of_reservoirs in range(total_number_of_reservoirs):
      #note: STOOIP_bbls = 7758 * Area_acres * Net_pay_ft * Porosity_frac * Oil_sat_frac * (1/Bo) * (1/10E+6)
      stooip_bbls = 7758 * (3200 + randint(20, 80)) * (120 + randint(10, 30))  * (0.18*randint(1, 2)) * (0.7681 + random()*0.1) * (1/1.001) * (1/10E+6)
    print("STOOIP value for reservoir no.", each_number_of_reservoirs+1, "(MM bbls) = ", '{0:.4f}'.format(stooip_bbls))
    print("{}{}{}".format(engine_name, "-based STOOIP computation time (seconds):", '{0:.4f}'.format(time.time() - t0)))
    print("STOOIP computation successfully completed.")
    print("------------------------------------------------------------")
  # End calculate_stooip() method
      
  def sample_one(self, total_number_of_reservoirs=None, spark_engine=True):
    #to demo speed-up due to spark engine, calculate and print simple reservoir STOOIP (in bbls) in a loop
    #up to nth number of reservoirs across several fields, with or without spark engine and time the results
    if spark_engine:
      #start spark
      spark = SparkSession.builder.appName("Reservoir STOOIP Demonstration").getOrCreate()
      #invoke stooip calculation on/with spike engine
      self.calculate_stooip(total_number_of_reservoirs=total_number_of_reservoirs, engine_name="Spark engine")
      #stop spark
      spark.stop()
    else:
        #invoke stooip calculation on without spike engine
        self.calculate_stooip(total_number_of_reservoirs=total_number_of_reservoirs, engine_name="Regular VM engine")
  # End sample_one() method
#End ShaleReservoirApacheSpark() class
  
  
class ShaleReservoirApacheSparkTest(TestCase):
  """ Test ShaleReservoirApacheSparkDemo() class """
  
  def setUp(self):
    self.sras_demo = ShaleReservoirApacheSpark()
    self.total_number_of_reservoirs = 1000000
    self.spark_engine_yes = True
    self.spark_engine_no = False
  # End setUp() method
    
  def test_sample_one(self):
    print()
    #calculate stooip with and without spark engine
    self.sras_demo.sample_one(total_number_of_reservoirs=self.total_number_of_reservoirs, spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_one(total_number_of_reservoirs=self.total_number_of_reservoirs, spark_engine=self.spark_engine_no)
  #End test_sample_one() method
  
  def tearDown(self):
    print()
    self.sras_demo = None
  # End tearDown() method
#End ShaleReservoirApacheSparkTest() class
    
# invoke test
main(verbosity=2)

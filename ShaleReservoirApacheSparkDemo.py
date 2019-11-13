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
#  ...Ecotert's ShaleReservoirApacheSparkDemo.py  (released as open-source under MIT License) implements:
#
#
#  Two simple classes to demonstate and test usage of Apache Spike with Python API (PySpark) to calculate STOOIP
#
# ***********************************************************************************************************************************
# ***********************************************************************************************************************************


try:
  """  import commonly used modules, print PySpark version, tensorflow version
       and keras version, and then check for import error
  """
  #import
  import time
  import pyspark
  import numpy as np
  import pymysql.err
  import pymysql.cursors
  from csv import writer
  import tensorflow as tf
  from pprint import pprint
  from json import dumps, loads
  import matplotlib.pyplot as plt
  from unittest import TestCase, main
  from pyspark.sql import SparkSession
  from random import random, randint, randrange
  from tensorflow.keras import backend, optimizers, Sequential
  from tensorflow.keras.utils import plot_model, to_categorical
  from tensorflow.keras.models import load_model, model_from_json
  from tensorflow.keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D
  #print version of tensorflow and keras
  print()
  print("------------------------------------------------------------")
  print("Using TensorFlow version", tf.__version__, "on this system. ")
  print("Using Keras version", tf.keras.__version__, "on this system.")
  print("Using PySpar version", pyspark.__version__, "on this system.")
  print("------------------------------------------------------------")
  print("")
  #check for error
except(ImportError) as err:
  print(str(err))

class ShaleReservoirApacheSparkDemo():
  
  """ A simple class to demonstate usage of Apache Spike with Python API (PySpark)"""
  
  def __init__(self):
    print()
    print()
    print("Initiating PySpike Engine.")
  # End  __init__() method

  def sample_one(self, total_number_of_reservoirs=0):
    #start spark
    spark = SparkSession.builder.appName("ShaleReservoirApacheSparkDemo").getOrCreate()
    
    #to demo speed-up due to spark engine, calculate and print simple reservoir STOOIP (in bbls) in a loop
    #up to nth number of reservoirs across several fields), and time the results: time can be compared with
    #the same run on non-spark engine machine
    t0 = time.time()
    for each_number_of_reservoirs in range(total_number_of_reservoirs):
      #note: STOOIP_bbls = 7758 * Area_acres * Net_pay_ft * Porosity_frac * Oil_sat_frac * (1/Bo) * (1/10E+6)
      stooip = 7758 * (1280 + randint(20, 80)) * (120 + randint(10, 30))  * (0.15*randint(1, 2)) * (0.7561 + random()*0.1) * (1/1.001) * (1/10E+6)
      print("STOOIP Value (MM bbls): ",  '{0:.4f}'.format(stooip))
    print("STOOIP computation and printing time (seconds):", '{0:.4f}'.format(time.time()  - t0))
    print("STOOIP computation successfully completed ...")
    
    #stop spark
    spark.stop()
  # End sample_one() method
  
  
class ShaleReservoirApacheSparkDemoTest(TestCase):
  """ Test ShaleReservoirApacheSparkDemo() class """
  
  def setUp(self):
    self.sras_demo = ShaleReservoirApacheSparkDemo()
  # End setUp() method
    
  def test_sample_one(self):
    print()
    self.sras_demo.sample_one(total_number_of_reservoirs=100000)
  #End test_sample_one() method
  
  def tearDown(self):
    print()
    self.sras_demo = None
  # End tearDown() method
    
    
# invoke test
main(verbosity=2)

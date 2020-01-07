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
#  Two classes to demonstate and test usage of Apache Spark with Python API (Pyspark) to:
#
#  1) calculate reservoir STOOIP and
#
#  2) classify images with Tensorflow CNN
#
#  3) read and load reservoir data, in json format, into DataFrame
#
#  4) read and load drilling event data, from sqlite3 database, into DataFrame
#
#  5) read and show current weather or forecasted weather (for 5-day and 3-hrs interval)
#
#
#
# ***********************************************************************************************************************************
#
# To run and test the speed-up samples/examples (Spark/Pyspark vs. Python) presented in this module, do the followings:
#
#
# 1) Install Ubuntu (minimum of Ubuntu 18.04.3 LTS) on a cluster of VMs (3+ CPUs) using any of the following cloud plaforms:
#
#    Linode, AWS, GPC, Azure, Oracle, DO, Vultr or any other public cloud platform provider.
#
# 2) Install Java 8  - Java-8-openjdk:  sudo apt-get install openjdk-8-jdk (preferable)
#
#         or Java 11 - Java-11-openjdk: sudo apt-get install openjdk-11-jdk
#
# 3) Set: JAVA_HOME="path" as JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64" (preferable)
#
#      or JAVA_HOME="path" as JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
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
#    python3.7 -m pip install numpy scipy matplotlib pandas scikit-learn scikit-image statsmodels networkx graphframes pyspark keras cython jupyter tensorflow==2.0.0b1
#
# 10) Install other python packages -  see import sections on top of this file (ShaleReservoirApacheSike.py) and the 2nd file (ShaleReservoir.py)
#
# 11) Include both files (ShaleReservoirApacheSpark.py and ShaleReservoir.py) in the same directory
#
# 12) On Ubuntu Shell invoke 'Python3' by typing: Python3
#
# 13) At Python prompt, invoke the Python script by typing: exec(open("/path_to_file/ShaleReservoirApacheSpark.py").read())
#
# 14) After the computations run: the results will be displayed with run-times for "Pyspark" vs. "Pure Python" implementations
#
# ***********************************************************************************************************************************
# ***********************************************************************************************************************************


try:
  """  import commonly used modules; print pyspark, networkx, tensorflow
       and keras version; and then check for import error
  """
  #import
  import time
  import sqlite3
  import pyspark
  from os import getcwd
  import networkx as nx
  import tensorflow as tf
  from requests import get
  from os.path import join
  from pprint import pprint
  from pandas import read_csv
  from json import dumps, loads
  from csv import writer, reader
  import matplotlib.pyplot as plt
  from random import random, randint
  from unittest import TestCase, main
  from pyspark import SparkConf, SparkContext
  from pyspark.ml.feature import VectorAssembler
  from pyspark.sql import SparkSession, DataFrame, types
  from pyspark.sql.functions import struct, to_json, when
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
  #    : but can use one of the following python module for Graph-Based Analysis:
  #    : (1) "graphframes" (https://graphframes.github.io/graphframes/docs/_site/index.html)
  #          "graphframes" is tightly integrated with spark/pyspark DataFrame
  #    : (2) "networkx" (see: https://networkx.github.io) or
  #print version of pyspark, tensorflow and networkx
  print()
  print("-------------------------------------------------------------")
  print("Using Pyspark version", pyspark.__version__, "on this system.")
  print("Using TensorFlow version", tf.__version__, "on this system.  ")
  print("Using Keras version", tf.keras.__version__, "on this system. ")
  print("Using Networkx version", nx.__version__, "on this system.    ")
  print("------------------------------------------------------------ ")
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
    print("                 Initiating Pyspark Engine                 ")
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
  
  def create_spark_session(self, app_name=None, config_options=None):
    #start spark by invoking SparkSession()
    return SparkSession.builder.master("local").appName(app_name).config("spark.some.config.option", config_options).getOrCreate()
  # End create_spark_session() method
  
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
  
  def show_weather_result(self, loaded_data):
    if loaded_data:
      response = get(loaded_data)
      response.raise_for_status()
      json_output = response.text
      # convert "json_output" of weather forecast to "python_values" and show with pprint
      python_values = loads(json_output)
      print()
      print("----------------------------------------------------------")
      pprint(python_values)
      print("----------------------------------------------------------")
      print()
  # End show_weather_result() method
  
  def current_or_forecated_5day_3hr_weather_in_metric_unit(self, json_mode="JSON", forecast_type=None, option=None, app_id=None):
    """ see: https://openweathermap.org/forecast5  """
    
    # zip code
    zip_code1 = "77494,US"  # zip code in Katy, US
    zip_code2 = "77002,US"  # zip code in Houston, US
    zip_codes = [zip_code1, zip_code2]
    # city id
    city_id1 = 2346734   #Brass, Nigeria
    city_id2 = 4699066   #Houston, US
    city_ids = [city_id1, city_id2]
    # city name
    city_names = [
                  "Houston,US", "San Antonio,US", "Akure,NG", "Katy,US", "Delhi,IN", "Sydney,AU", "San Rafael,AR",
                  "Austin,US", "New York,US", "Los Angeles,US", "London,GB", "Cape Town,ZA", "Taipei,TW", "Helsinki,FI",
                  "Abuja,NG", "Edmonton,CA", "Lagos,NG", "Gaborone,BW", "Cairo,EG", "Moscow,RU", "Muscat,OM", "Beijing,CN"
                  "Bahir Dar,ET", "Casablanca,MA", "Toronto,CA", "Dubai,AE", "Dhaka,BD", "Rijswijk,NL", "Tokyo,JP", "Bangui,CF"
                 ]
    # geographic coordinates
    lat_1 = 4; lon_1 = 5     #location in Brass, Nigeria
    lat_2 = 50; lon_2 = 130  #location in Novobureyskiy, Russia
    coords = [[lat_1, lon_1], [lat_2, lon_2]]
    
    if forecast_type == "current":
      # current weather
      data_source = "http://api.openweathermap.org/data/2.5/weather?"
    else:
      # 5-day, 3-hour weather forecast data
      data_source =  "http://api.openweathermap.org/data/2.5/forecast?"

    if app_id and option == "zip_code":
      for index, zip_code in enumerate(zip_codes):
        load_data = "{}{}{}{}{}{}{}{}".format(data_source, "zip=", zip_code, "&APPID=", app_id, "&mode=", json_mode, "&units=metric")
        self.show_weather_result(load_data)
    elif app_id and option == "city_id":
      for index, city_id in enumerate(city_ids):
        load_data = "{}{}{}{}{}{}{}{}".format(data_source, "id=", city_id, "&APPID=", app_id, "&mode=", json_mode, "&units=metric")
        self.show_weather_result(load_data)
    elif app_id and option == "city_name":
      for index, city_name in enumerate(city_names):
        load_data = "{}{}{}{}{}{}{}{}".format(data_source, "q=", city_name, "&APPID=", app_id, "&mode=", json_mode, "&units=metric")
        self.show_weather_result(load_data)
    elif app_id and option == "geographic_coordinates":
      for index, coord in enumerate(coords):
        load_data = "{}{}{}{}{}{}{}{}{}{}".format(data_source, "lat=", coord[0], "&lon=", coord[1], "&APPID=", app_id, "&mode=", json_mode, "&units=metric")
        self.show_weather_result(load_data)
    
    
      """
      (1) Reference: https://openweathermap.org/forecast5  - parameters - cited December 29 2019.
      -------------------------------------------------------------------------------------------
      Parameters:
        code - Internal parameter
        message - Internal parameter
        city
        city.id City ID
        city.name City name
        city.coord
        city.coord.lat City geo location, latitude
        city.coord.lon City geo location, longitude
        city.country Country code (GB, JP etc.)
        city.timezone Shift in seconds from UTC
        cnt Number of lines returned by this API call
        list
        list.dt Time of data forecasted, unix, UTC
        list.main
        list.main.temp Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
        list.main.temp_min Minimum temperature at the moment of calculation. This is deviation from 'temp' that is possible for large cities and megalopolises geographically expanded (use these parameter optionally). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
        list.main.temp_max Maximum temperature at the moment of calculation. This is deviation from 'temp' that is possible for large cities and megalopolises geographically expanded (use these parameter optionally). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
        list.main.pressure Atmospheric pressure on the sea level by default, hPa
        list.main.sea_level Atmospheric pressure on the sea level, hPa
        list.main.grnd_level Atmospheric pressure on the ground level, hPa
        list.main.humidity Humidity, %
        list.main.temp_kf Internal parameter
        list.weather (more info Weather condition codes)
        list.weather.id Weather condition id
        list.weather.main Group of weather parameters (Rain, Snow, Extreme etc.)
        list.weather.description Weather condition within the group
        list.weather.icon Weather icon id
        list.clouds
        list.clouds.all Cloudiness, %
        list.wind
        list.wind.speed Wind speed. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.
        list.wind.deg Wind direction, degrees (meteorological)
        list.rain
        list.rain.3h Rain volume for last 3 hours, mm
        list.snow
        list.snow.3h Snow volume for last 3 hours
        list.dt_txt Data/time of calculation, UTC
        
        
        2) Reference: https://openweathermap.org/weather-data  - units -  cited December 29 2019.
        ----------------------------------------------------------------------------------------
        List of all API parameters with units.
      """
  # End current_or_forecated_5day_3hr_weather_in_metric_unit() method
      
  def sample_one_stooip_calculation(self, total_number_of_reservoirs=None, number_of_cpus=None, spark_engine=True):
    #to demo 1st speed-up due to spark engine, calculate reservoir STOOIP (in bbls) in a loop
    #up to nth number of reservoirs across several fields, with or without spark engine and time the results
    if spark_engine:
      #
      #start spark by invoking SparkSession()
      session_app_name = "Reservoir STOOIP Demonstration"
      spark = self.create_spark_session(app_name=session_app_name, config_options=None)
      #
      #apply spark.parallelize() to the calculate_stooip() method and time the run: ensure method is supply as a  list of argument
      spark.sparkContext.parallelize([self.calculate_stooip(total_number_of_reservoirs=total_number_of_reservoirs, engine_name="Spark engine")])
      #stop spark
      spark.stop()
    else:
      # invoke stooip calculation without spark engine
      self.calculate_stooip(total_number_of_reservoirs=total_number_of_reservoirs, engine_name="Regular VM engine")
  # End sample_one_stooip_calculation() method
  
  def sample_two_machine_learning_with_tensorflow(self, number_of_cpus=None, spark_engine=True):
    #to demo 2nd speed-up due to spark engine, run "TensorFlow" image classification example in "ShaleReservoir.py"
    if spark_engine:
      #invoke "TensorFlow" image classification example in "ShaleReservoir.py" with spark engine
      engine_name = "Spark engine"
      print("")
      print("{}{}".format(engine_name, "-based 'TensorFlow' image classification started and in progress ....."))
      sfc =  ShaleDNN()
      cnn_options = sfc.test_dataset_cnn_images_classification(test=True, data_option="fashion")
      #
      #start spark by invoking SparkSession()
      session_app_name = "Reservoir STOOIP Demonstration"
      spark = self.create_spark_session(app_name=session_app_name, config_options=None)
      #
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
      #invoke "TensorFlow" image classification example in "ShaleReservoir.py" without spark engine
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
  
  def sample_three_read_json_reservoir_data_to_dataframe(self, read_from_file = None, json_data_file=None, nth_time=10, number_of_cpus=None, spark_engine=True):
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
      #invoke loading of'JSON' data in a loop with spark engine
      engine_name = "Spark engine"
      print("")
      print("{}{}".format(engine_name, "-based loading of  'JSON' data in a loop started and in progress ....."))
      #
      #start spark by invoking SparkSession()
      session_app_name = "Reservoir Data Demonstration"
      spark = self.create_spark_session(app_name=session_app_name, config_options=None)
      #
      #read data and create a spark dataframe from jSON data in a loop nth_times and print/pprint/show afterwards
      t0 = None
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
      print("{}{}{}".format(engine_name, "-based loading of  'JSON' data in a loop time (seconds):", '{0:.4f}'.format(time.time() - t0)))
      self.duration_separator()
      #
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
      #
      # ..................................  testing some SQL operation starts   .......................................................
      #
      #issue SQL queries against the last "spark_dataframe_data" in the range: the data_frame 1s equivalent to a RDBMS TABLE in Spark SQL
      sql_query_result_df1 = spark_dataframe_data.select("FIELD_BASIN", "FLUID_TYPE")
      sql_query_result_df2 = spark_dataframe_data.select("FLUID_TYPE")
      sql_query_result_df3 = spark_dataframe_data.select("FLUID_API", "RESERVOIR_DEPTH_FT")
      print("-----------------------------------------------------------")
      print("Printing Pyspark QUERIES' Result Against DataFrame/TABLE:  ")
      print("-----------------------------------------------------------")
      print("Data type of sql_query_result_df1 i.e. - basin and fluid info  .....", type(sql_query_result_df1))
      print("Data type of sql_query_result_df i.e. - only fluid info .....", type(sql_query_result_df2))
      print("Data type of sql_query_result_df i.e. - fluid api and reservoir depth .....", type(sql_query_result_df3))
      sql_query_result_df1.show(truncate=False)
      sql_query_result_df2.show(truncate=False)
      sql_query_result_df3.show(truncate=False)
      
      print("-------------------------------------------------------------------------")
      print("Printing Pyspark QUERIES Result Against DataFrame/TABLE in JSON Format  :")
      print("-------------------------------------------------------------------------")
      #convert the entire row of data frame into one new column in "JSON Format",
      result_in_json1 = sql_query_result_df1.withColumn("JSON_FORMAT", to_json(struct([sql_query_result_df1[item] for item in sql_query_result_df1.columns])))
      result_in_json2 = sql_query_result_df2.withColumn("JSON_FORMAT", to_json(struct([sql_query_result_df2[item] for item in sql_query_result_df2.columns])))
      result_in_json3 = sql_query_result_df3.withColumn("JSON_FORMAT", to_json(struct([sql_query_result_df3[item] for item in sql_query_result_df3.columns])))
      result_in_json1.show(truncate=False)
      result_in_json2.show(truncate=False)
      result_in_json3.show(truncate=False)
      print("Loading of  'JSON' data in a loop successfully completed.")
      self.separator()
      #
      print()
      print("------------------------------------------------------------------------------------")
      print("Printing Pyspark QUERIES Result Against DataFrame/TABLE Created From PARQUET File:  ")
      print("------------------------------------------------------------------------------------")
      #save the last "spark_dataframe_data" as parquet file: this ensures that the schema information is maintained
      #note 1: overwrite, if name exist
      #note 2: file is saved in folder (reservoir_data.parquet) in the CWD on:
      #      : SSD/HDD/BV/EBS or bucket/block storage/S3 --> "s3://path-to-location-within-bucket/"
      #note 3: advantage of DataFrame/TABLE read or created from PARQUET File is that once read into
      #      : "distributed memory", it can be queried with Spark-SQL like regular TABLE in a RDBMS
      #      : within the spark session anytime without re-loading from disk, making query and/or any
      #      : associated streaming operation faster, but more memory is required, especially if TABLE
      #      : is too large or big
      saved_path = "reservoir_data.parquet"
      mode = "overwrite"
      compression = "gzip"
      spark_dataframe_data.write.parquet(saved_path, mode=mode, compression=compression) # or spark_dataframe_data.write.mode("overwrite").parquet(saved_path)
      #read the parquet file: loaded file is now a data_frame and a table
      parquet_dataframe_table = spark.read.parquet(saved_path)
      #create a temporary view/table of the  "parquet_dataframe_table"
      parquet_dataframe_table.createTempView("parquet_dataframe_temp_table_view")
      #issue standard SQL query against the "parquet_dataframe_temp_table_view"
      sql_query_result_fluid_api_and_fluid_type_df = spark.sql("SELECT FLUID_API, FLUID_TYPE FROM parquet_dataframe_temp_table_view")
      print()
      print("Fluid API and Fluid Type")
      sql_query_result_fluid_api_and_fluid_type_df.show()
      #
      print()
      print("----------------------------------------------------------------")
      print("Printing Pyspark QUERIES Result Against PARQUET File Directly:  ")
      print("----------------------------------------------------------------")
      #issue standard SQL query against the "parquet file" directly, instead of using read API to load a file into data_frame/table/view
      #note: the disadvantage of standard SQL query against the "parquet file" directly is that data is not available in "distributed memory",
      #    : data has to be read everytime query is issued by Spark-SQL, making query and/or any associated streaming operation slower,
      #    : but less memory is required: this is like reading data from regular RDBMS TABLE
      sql_query = "{}{}{}{}".format("SELECT FLUID_API FROM parquet.", "`", saved_path, "`")
      sql_query_result_fluid_api_df = spark.sql(sql_query)
      print()
      print("Fluid API")
      sql_query_result_fluid_api_df.show()
      self.separator()
      self.separator()
      print()
      #
      # ..................................  testing some SQL operation ends   .........................................................
      #stop spark
      spark.stop()
    else:
      #invoke loading of  'JSON' data in a loop without spark engine
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
      #
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based loading of  'JSON' data in a loop time (seconds):", '{0:.4f}'.format(time.time()-t0)))
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
  
  def sample_four_read_sqlite3_drilling_event_data_to_dataframe(self, spark_engine=True):

    def connect_to_sqlite_db(db_name):
      conn = None
      try:
        dbn = str(db_name)
        conn = sqlite3.connect(dbn)
        print()
        print()
        print("{}{}{}".format("Connection to database (", dbn, ") is established."))
      except(sqlite3.Error) as err:
        print(str(err))
      return conn
    # End connect_to_sqlite_db() method
        
    def sqlite3_query_result_table_as_dict(record, row):
      data_dict = {}
      for index, col in enumerate(record.description):
        data_dict[col[0]] = row[index]
      return data_dict
    # End sqlite3_query_result_table_as_dict() method
      
    #connect to data source (sqlite database): contains a TABLE with drilling and formation parameters
    table_name = "Drilling_and_Formation_Parameters"
    database_name = 'drilling_events.db'
    connection = connect_to_sqlite_db(database_name)
    connection.row_factory = sqlite3_query_result_table_as_dict
    cursor = connection.cursor()
    #
    #query the database located in SSD/HDD/BV/EBS or bucket/block storage/S3 --> "s3://path-to-location-within-bucket/"
    print("Both headers + record values")
    print("=================================================================================")
    cursor.execute("""SELECT ROWID, ROP_fph, RPM_rpm, MUD_WEIGHT_sg, MUD_PLASTIC_VISC_cp,
                      MUD_FLOW_RATE_gpm, GR_api, SHOCK_g, IS_VIBRATION_boolean_0_or_1 FROM """ +
                      table_name
                  )
    # this query result and is thesame as view/table in dictionary format
    sql_query_result = cursor.fetchall()
    print("=================================================================================")
    print("Results in DICT/STRING Format")
    pprint(sql_query_result)
    print("=================================================================================")
    #
    #close sqlite database
    connection.close()
    
    #read the created dictionary into dataFrames
    #1. load: ensure data is in (or convert data to) json format
    json_data = dumps(sql_query_result)
    print("=================================================================================")
    print("Results in JSON Format")
    pprint(json_data)
    print("=================================================================================")
    print()
    
    #2. read into pandas DataFrame or spark dataFrame and view/print result
    if spark_engine:
      #b. spark DataFrame
      #start spark by invoking SparkSession()
      engine_name = "Spark engine"
      session_app_name = "Drilling Data Demonstration"
      spark = self.create_spark_session(app_name=session_app_name, config_options=None)
      print("")
      print("{}{}".format(engine_name, "-based reading of sqlite3 drilling event data started and in progress ....."))
      #apply spark.parallelize() to load json_data: ensure method is supply as a list of argument
      t0 = time.time()
      spark_dataframe_data = spark.read.json(spark.sparkContext.parallelize([json_data]))
      duration = time.time() - t0
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based reading of sqlite3 drilling event data time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("'Reading' of sqlite3 drilling event data successfully completed.")
      print()
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
      #
      #stop spark
      spark.stop()
    else:
      engine_name = "Regular VM engine"
      print("")
      print("{}{}".format(engine_name, "-based reading of sqlite3 drilling event data started and in progress ....."))
      #a. pandas DataFrame
      t0 = time.time()
      python_dataframe_data = PythonDataFrame(read_json(json_data))
      duration = time.time() - t0
      self.duration_separator()
      print("{}{}{}".format(engine_name, "-based reading of sqlite3 drilling event data time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("'Reading' of sqlite3 drilling event data successfully completed.")
      print()
      print("=================================================================================")
      print("Results in Pandas/Python Data Frame Format")
      pprint(python_dataframe_data)
      print("=================================================================================")
      print()
  # End sample_four_read_sqlite3_drilling_event_data_to_dataframe() method
  
  def sample_five_read_and_show_current_or_forecated_5day_3hr_weather_in_metric_unit(self, json_mode="JSON", forecast_type=None, option=None, app_id=None, spark_engine=True):
    #to demo 4th speed-up due to spark engine, show current or forecasted weather (for 5-day and 3-hrs interval)
    duration = None
    if spark_engine:
      #invoke "current_or_forecated_5day_3hr_weather_in_metric_unit" method with spark engine
      engine_name = "Spark engine"
      print("")
      print("{}{}".format(engine_name, "-based current or forecasted weather (for 5-day and 3-hrs interval) started and in progress ....."))
      #
      #start spark by invoking SparkSession()
      session_app_name = "Current or Forecasted weather Demonstration"
      spark = self.create_spark_session(app_name=session_app_name, config_options=None)
      #
      #apply spark.parallelize() to the current_or_forecated_5day_3hr_weather_in_metric_unit() method and time the run: ensure method is supply as a  list of argument
      t0 = time.time()
      spark.sparkContext.parallelize([self.current_or_forecated_5day_3hr_weather_in_metric_unit(json_mode=json_mode, forecast_type=forecast_type, option=option, app_id=app_id)])
      duration = time.time()-t0
      print("{}{}{}".format(engine_name, "-based current or forecasted weather (for 5-day and 3-hrs interval) time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("'Current or forecasted weather (for 5-day and 3-hrs interval)' successfully completed.")
      #stop spark
      spark.stop()
    else:
      #invoke "current_or_forecated_5day_3hr_weather_in_metric_unit" method without spark engine
      engine_name = "Regular VM engine"
      print("")
      print("{}{}".format(engine_name, "-based current or forecasted weather (for 5-day and 3-hrs interval) started and in progress ....."))
      self.duration_separator()
      t0 = time.time()
      self.current_or_forecated_5day_3hr_weather_in_metric_unit(json_mode=json_mode, forecast_type=forecast_type, option=option, app_id=app_id)
      duration = time.time()-t0
      print("{}{}{}".format(engine_name, "-based current or forecasted weather (for 5-day and 3-hrs interval) time (seconds):", '{0:.4f}'.format(duration)))
      self.duration_separator()
      print("'Current or forecasted weather (for 5-day and 3-hrs interval)' successfully completed.")
    return duration
  # End sample_five_read_and_show_current_or_forecated_5day_3hr_weather_in_metric_unit() method
 
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
    #run "TensorFlow" image classification example in "ShaleReservoir.py" with and without spark engine
    self.sras_demo.sample_two_machine_learning_with_tensorflow(spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_two_machine_learning_with_tensorflow(spark_engine=self.spark_engine_non)
  #End test_sample_two_machine_learning_with_tensorflow() method
  
  def test_sample_three_read_json_reservoir_data_to_dataframe(self):
    print()
    #run read_json_reservoir_data with and without spark engine
    file = True
    if file:
      read_from_file = True
      json_file_name = "reservoir_data.json"
    else:
      read_from_file = False
      json_file_name = None
    self.sras_demo.sample_three_read_json_reservoir_data_to_dataframe(read_from_file=read_from_file, json_data_file=json_file_name, nth_time=70, spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_three_read_json_reservoir_data_to_dataframe(read_from_file=read_from_file, json_data_file=json_file_name, nth_time=70, spark_engine=self.spark_engine_non)
  #End test_sample_three_read_json_reservoir_data_to_dataframe() method
  
  def test_sample_four_read_sqlite3_drilling_event_data_to_dataframe(self):
    #run read_sqlite3_drilling_event_data with and without spark engine
    self.sras_demo.sample_four_read_sqlite3_drilling_event_data_to_dataframe(spark_engine=self.spark_engine_yes)
    self.sras_demo.sample_four_read_sqlite3_drilling_event_data_to_dataframe(spark_engine=self.spark_engine_non)
  # End test_sample_four_read_sqlite3_drilling_event_data_to_dataframe() method
  
  def test_sample_five_read_and_show_current_or_forecated_5day_3hr_weather_in_metric_unit(self):
    json_mode = "JSON"
    #
    #forecast_type = "current"
    forecast_type = None
    #
    #option = "zip_code"
    #option = "city_id"
    option = "city_name"
    #option = "geographic_coordinates"
    #
    #note: app_id = app_key - https://home.openweathermap.org/api_keys
    app_id = "register_to_get_app_id_from_https://home.openweathermap.org/users/sign_up"
    
    with_spark = self.sras_demo.sample_five_read_and_show_current_or_forecated_5day_3hr_weather_in_metric_unit(json_mode=json_mode, forecast_type=forecast_type, option=option, app_id=app_id, spark_engine=self.spark_engine_yes)
    without_spark = self.sras_demo.sample_five_read_and_show_current_or_forecated_5day_3hr_weather_in_metric_unit(json_mode=json_mode, forecast_type=forecast_type, option=option, app_id=app_id, spark_engine=self.spark_engine_non)
    
    #print("Current or forecasted weather duration with spark: ", with_spark)
    #print("Current or forecasted weather duration without spark: ", without_spark)
    print()
    self.sras_demo.separator()
    print("{}{}".format("Current or forecasted weather duration with spark (seconds): ", '{0:.4f}'.format(with_spark)))
    print("{}{}".format("Current or forecasted weather duration without spark (seconds): ", '{0:.4f}'.format(without_spark)))
    self.sras_demo.separator()
  # End test_sample_five_read_and_show_current_or_forecated_5day_3hr_weather_in_metric_unit() method

  def _test_drilling_rare_events(self, input_csv_file=None):
    """
      Simple prelimianry demo of drilling rare events with graph/network analysis -
      
      Under Active Development
      ------------------------
      Code samples below are just test codes: to test internal mapping is consistent and okay...
    """
    
    def drilling_event_key_value_pair():
      key_value_pair = {}
      #data from regular drilling operation (drillstring-related)
      key_value_pair["ROP_fph"] = "ROP_fph"
      key_value_pair["RPM_rpm"] = "RPM_rpm"
      key_value_pair["SPP_psi"] = "SPP_psi"
      key_value_pair["DWOB_lb"] = "DWOB_lb"
      key_value_pair["SWOB_lb"] = "SWOB_lb"
      key_value_pair["TQR_Ibft"] = "TQR_Ibft"
      key_value_pair["BHA_TYPE_no_unit"] = "BHA_TYPE_no_unit"
      #data from regular drilling operation (mud-related)
      key_value_pair["MUD_WEIGHT_sg"] = "MUD_WEIGHT_sg"
      key_value_pair["MUD_PLASTIC_VISC_cp"] = "MUD_PLASTIC_VISC_cp"
      key_value_pair["MUD_YIELD_POINT_lb_per_100ft_sq"] = "MUD_YIELD_POINT_lb_per_100ft_sq"
      key_value_pair["MUD_FLOW_RATE_gpm"] = "MUD_FLOW_RATE_gpm"
      #data (measured or calculated) from downhole MWD/LWD tool measurements
      key_value_pair["TVD_ft"] = "TVD_ft"
      key_value_pair["MD_ft"] = "MD_ft"
      key_value_pair["INC_deg"] = "INC_deg"
      key_value_pair["AZIM_deg"] = "AZIM_deg"
      key_value_pair["Dogleg_deg_per_100ft"] = "Dogleg_deg_per_100ft"
      key_value_pair["CALIPER_HOLE_SIZE_inches"] = "CALIPER_HOLE_SIZE_inches"
      key_value_pair["GR_api"] = "GR_api"
      key_value_pair["DEEP_RESISTIVITY_ohm_m"] = "DEEP_RESISTIVITY_ohm_m"
      key_value_pair["SHOCK_g"] = ["SHOCK_g"]
      #event data from MWD/LWD tool measurements and other sources
      key_value_pair["IS_VIBRATION_boolean_0_or_1"] = "IS_VIBRATION_boolean_0_or_1"
      key_value_pair["IS_KICK_boolean_0_or_1"] = "IS_KICK_boolean_0_or_1"
      key_value_pair["IS_STUCKPIPE_boolean_0_or_1"] = "IS_STUCKPIPE_boolean_0_or_1"
      #time data
      key_value_pair["TIME_ymd_hms"] = "TIME_ymd_hms"
      #
      return key_value_pair
    #End drilling_event_key_value_pair() method
      
    input_csv_file = "drg_pp_re_dataset.csv" 
    
    #read a csv file into pandas DataFrame
    data = read_csv(input_csv_file)
    
    #source/target pairing test
    key_value = drilling_event_key_value_pair()
    
    source = key_value["DEEP_RESISTIVITY_ohm_m"]
    target = key_value["GR_api"]
      
    source = key_value["MUD_WEIGHT_sg"]
    target = key_value["GR_api"]
      
    source = key_value["MUD_WEIGHT_sg"]
    target = key_value["MD_ft"]
      
    source = key_value["MUD_WEIGHT_sg"]
    target = key_value["DEEP_RESISTIVITY_ohm_m"]
      
    source = key_value["SPP_psi"]
    target = key_value["IS_STUCKPIPE_boolean_0_or_1"]
      
    print("")
    print("............................................")
    print("data shape")
    print(data.shape)
    print("............................................")
    print("data dtypes")
    print(data.dtypes)
    print("............................................")
    print("")
      
     #import the dataset using the networkx function that ingest a pandas DataFrame directly.
    #there are multiple ways data can be ingested into a Graph from multiple formats: this is just one of them
    FG = nx.from_pandas_edgelist(data, source=source, target=target, edge_attr=True)
      
    #view data
    print("")
    print("............................................")
    print("FG.nodes()")
    pprint(FG.nodes())
    print("............................................")
    print("FG.edges()")
    pprint(FG.edges())
    print("............................................")
    print("")
      
    #draw/plot
    print("............................................")
    nx.draw_networkx(FG, with_labels=True)                                      # quick view of graph
    plt.savefig("fg.png", format="PNG")                                         # save the graph as image
    
    # analyze
    print("degree_centrality", nx.algorithms.degree_centrality(FG))
    print("density", nx.density(FG))                                            # average edge density of the Graphs
    print("average_degree_connectivity", nx.average_degree_connectivity(FG))    # for a node of degree k - the avg of its neighbours' degree?
    # find all the paths available
    try:
      for path in nx.all_simple_paths(FG, source=source, target=target):
        print(path)
    except(nx.exception.NodeNotFound) as err:
      print(str(err))
    # find the dijkstra path
    try:
      dijpath = nx.dijkstra_path(FG, source=source, target=target)
      print("dijpath", dijpath)
    except(nx.exception.NodeNotFound) as err:
      print(str(err))
        
    print("............................................")
    print("")
  # End test_drilling_rare_events() method
  #End test_sample_five_spark_connect_to_sqlite() method
  
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

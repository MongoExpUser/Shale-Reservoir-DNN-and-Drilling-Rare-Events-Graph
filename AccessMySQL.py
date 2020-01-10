# ***********************************************************************************************************************************
# * @License Starts
# *
# * Copyright © 2015 - present. MongoExpUser
# *
# * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
# *
# * @License Ends
# *
# ******************************************************************************************************************************************
#
#  ...Ecotert's AccessMySQL.py  (released as open-source under MIT License) implements:
#
#
#  1) AccessMySQL() class for:
#
#    a) Connecting/disconnecting to a MySQL data store with'pymysql' connector/driver library.
#
#    b) Populating/(inserting into) a MySQL data store  with 'pymysql' connector/driver library.
#
#    c) Running queries against MySQL data store with 'pymysql' connector/driver library.
#
#  2) AccessMySQLTest() class for testing AccessMySQL() class.
#
#
# *******************************************************************************************************************************************
# *******************************************************************************************************************************************

try:
  """  import commonly used modules and check for import error
  """
  #import
  import pymysql.err
  import pymysql.cursors
  from csv import writer
  from pprint import pprint
  from json import dumps, loads
  from random import random, randint
  from unittest import TestCase, main
  #check for error
except(ImportError) as err:
  print(str(err))


class AccessMySQL():
  
  """
    A class for connectin to, populating, and quering MySQL database:

  """
  
  def __init__(self):
    print()
    print("Initiating AccessMySQL Engine.")
  # End  __init__() method
  
  def create_csv_file_from_json(self, data, filename):
    parsed_data = loads(data)
    write_file = open(filename, 'w') # save in CWD
    csv_writer = writer(write_file)
    counter = 0
    for each_row in parsed_data:
      if counter == 0:
        header = each_row.keys()
        csv_writer.writerow(header)
        counter = counter + 1
      csv_writer.writerow(each_row.values())
    write_file.close()
  # End create_csv_file_from_json() method
  
  def view_output_data(self, output_data=None, cursor=None, save_output_data_as_csv=None, filename=None):
    # note: output_data is a list of dictionaries-> each dictionary represents each row
    print("----------------------------------------")
    print("Fetched Data: As a List of Dictionaries.")
    print("   The Dictionaries are TABLES Rows.    ")
    print("----------------------------------------")
    pprint(output_data)
    # convert to and view as JSON objects
    print("----------------------------------------")
    print("JSON Objects Equivalent of Dictionaries.")
    print("----------------------------------------")
    output_data_as_json = dumps(output_data, sort_keys=True)
    print(output_data_as_json)
    # save as csv, if desired
    if save_output_data_as_csv:
      self.create_csv_file_from_json(output_data_as_json, filename)
      print("----------------------------------------")
      print("{}{}{}".format("Data successfully saved into ",  filename, " in the CWD."))
      print()
  # End view_output_data() method
      
  def connect_to_mysql_from_python(self, mysql_connection_options=None, ssl_certificates=None, required_ssl=True):
    if required_ssl:
      ca_file = ssl_certificates["ssl-ca"]
      key_file = ssl_certificates["ssl-key"]
      cert_file = ssl_certificates["ssl-cert"]
    else:
      ca_file  = None
      key_file = None
      cert_file = None
      
    # define connection options
    host = mysql_connection_options["host"]
    user = mysql_connection_options["user"]
    port = mysql_connection_options["port"]
    password = mysql_connection_options["password"]
    db = mysql_connection_options["db"]
    ssl = "ssl"
    ca = "ssl-ca"
    key = "ssl-key"
    cert = "ssl-cert"
    ssl_all = {ssl : {ca: ca_file, key: key_file, cert: cert_file}}
    
    # connect to database
    try:
      charset='utf8mb4'
      cursorclass = pymysql.cursors.DictCursor
      connection = pymysql.connect(host=host, user=user, port=port, password=password, db=db, ssl=ssl_all, charset=charset, cursorclass=cursorclass)
      print()
      print("{}{}{}".format("Connection to database (", db, ") is established."))
      return connection
    except(pymysql.err.MySQLError) as sql_connection_err:
      print(str(sql_connection_err))
  #End connect_to_mysql_from_python() method
  
  def execute_some_queries_for_data_pipeline(self, connection=None, db=None):
    try:
      cursor = connection.cursor()
      # a.
      option = "prolific_reservoir_zones"
      sql_query = self.reservoir_data_pipeline_for_analytics(nth_limit=20, reservoir_zone="Upper-Yoho", option=option)
      cursor.execute(sql_query)
      output_data = cursor.fetchall()
      self.view_output_data(output_data, cursor, save_output_data_as_csv=True, filename=option + ".csv")
      # b.
      option = "thickest_reservoir_zones"
      sql_query = self.reservoir_data_pipeline_for_analytics(nth_limit=10, reservoir_zone=None, option=option)
      cursor.execute(sql_query)
      output_data = cursor.fetchall()
      self.view_output_data(output_data, cursor, save_output_data_as_csv=True, filename=option + ".csv")
      # c.
      option = "all_reservoir_zones_and_volume_indicators"
      sql_query = self.reservoir_data_pipeline_for_analytics(nth_limit=None, reservoir_zone=None, option=option)
      cursor.execute(sql_query)
      output_data = cursor.fetchall()
      self.view_output_data(output_data, cursor, save_output_data_as_csv=True, filename=option + ".csv")
      # d.
      option = "all"
      sql_query = self.reservoir_data_pipeline_for_analytics(nth_limit=None, reservoir_zone=None, option=option)
      cursor.execute(sql_query)
      output_data = cursor.fetchall()
      self.view_output_data(output_data, cursor, save_output_data_as_csv=True, filename=option + ".csv")
    except(pymysql.err.MySQLError) as sql_queries_err:
      print(str(sql_queries_err))
    finally:
      cursor.close()
      connection.close()
      print("{}{}{}".format("Connection to database (", db, ") is closed."))
  # End execute_some_queries_for_data_pipeline() method
  
  def combined_keys(self, input_keys=None):
    #define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
    keys = ""
    seperator =  ", "
    open_bracket = " ("
    close_bracket = ")"
    #then concatenate opening bracket, all keys, spaces, commas and close bracket
    keys = keys + open_bracket
    for index in range(len(input_keys)):
      if index < len(input_keys)-1:
        keys = keys + input_keys[index] + seperator
      else:
        keys = keys + input_keys[index]
    keys = keys + close_bracket
    return keys
  # End combined_keys() method
  
  def insert_data_to_reservoir_table(self, number_of_datapoints=None, table_name=None, connection=None, db=None):
    # define keys
    reservoir_keys =  ["Reservoir_ID", "Reservoir_Zone", "Avg_Deep_Resis_ohm_m", "Avg_GR_api", "Top_MD_ft", "Top_TVD_ft"]
    
    # define datasets values
    # the dataset values define below map directly, sequentially, to keys in reservoir_keys list above
    reservoir_dataset = self.reservoir_datasets(number_of_datapoints=number_of_datapoints)
    reservoir_values_one = reservoir_dataset[0]
    reservoir_values_two = reservoir_dataset[1]
    
    # insert the two sets of values into the "table_name" TABLE
    confirm = (table_name and connection and db)
    if confirm:
      try:
        cursor = connection.cursor()
        keys = self.combined_keys(input_keys=reservoir_keys)
        sql_query = "{}{}{}{}".format("INSERT INTO " , table_name, keys, " VALUES (%s, %s, %s, %s, %s, %s)")
        # a. values_one
        for index, item in enumerate(reservoir_values_one):
          cursor.execute(sql_query, reservoir_values_one[index])
          connection.commit()
        print("{}{}{}{}{}".format("Data successfully inserted into ", table_name, " TABLE in the ", db, " database."))
        # b. values_two
        for index, item in enumerate(reservoir_values_two):
          cursor.execute(sql_query, reservoir_values_two[index])
          connection.commit()
        print("{}{}{}{}{}".format("Data successfully inserted into ", table_name, " TABLE in the ", db, " database."))
      except(pymysql.err.MySQLError) as mysql_insert_err:
        print(str(mysql_insert_err))
      finally:
        cursor.close()
        connection.close()
        print("{}{}{}".format("Connection to database (", db, ") is closed."))
  # End insert_data_to_reservoir_table() method
  
  def reservoir_datasets(self, number_of_datapoints=None):
      reservoir_values_one = []
      reservoir_values_two = []
      numbers = number_of_datapoints
      decm_places = 4
      
      for index in range(numbers):
        if index == 0:
          if index %2 == 0:
            values_one = [1201+0, "{}{}".format('Upper-Yoho', '-0'), 540.7945, 25.2207, 3446.9001, 3001.8945]
            values_two = [1401+0, "{}{}".format('Middle-Salabe', '-0'), 345.6645, 20.5612, 8000.001, 7609.8963]
          elif index %2 != 0:
            values_one = [1201+1, "{}{}".format('Upper-Yoho', '-1'), round(540.79+randint(1, 5),dec_places), round(25.22+randint(1, 2),dec_places), 3446.90, 3001.45]
            values_two = [1401+1, "{}{}".format('Middle-Salabe', '-2'), round(345.66+random()*3,dec_places), round(20.12+random()*4,dec_places), 8000.01, 7609.63]
          reservoir_values_one.append(values_one)
          reservoir_values_two.append(values_two)
        elif index > 0:
          if index %2 == 0:
            values_one = [1201+0, "{}{}".format('Upper-Yoho', '-0'), round(reservoir_values_one[index-1][2]+randint(5, 10),decm_places),
                          round(reservoir_values_one[index-1][3]+randint(2, 3),decm_places), round(reservoir_values_one[index-1][4]+randint(4, 8),decm_places),
                          round(reservoir_values_one[index-1][5]+randint(2, 4),decm_places)]
            values_two = [1401+0, "{}{}".format('Middle-Salabe', '-0'), round(reservoir_values_two[index-1][2]+random()*6,decm_places),
                          round(reservoir_values_two[index-1][3]+random()*2.5,decm_places), round(reservoir_values_two[index-1][4]+random()*8,decm_places),
                          round(reservoir_values_two[index-1][5]+random()*3,decm_places)]
          elif index %2 != 0:
            values_one = [1201+0, "{}{}".format('Upper-Yoho', '-1'), round(reservoir_values_one[index-1][2]+randint(5, 10),decm_places),
                          round(reservoir_values_one[index-1][3]+randint(2, 3),decm_places), round(reservoir_values_one[index-1][4]+randint(4, 8),decm_places),
                          round(reservoir_values_one[index-1][5]+randint(2, 4),decm_places)]
            values_two = [1401+0, "{}{}".format('Middle-Salabe', '-2'), round(reservoir_values_two[index-1][2]+random()*6,decm_places),
                          round(reservoir_values_two[index-1][3]+random()*2.5,decm_places), round(reservoir_values_two[index-1][4]+random()*8,decm_places),
                          round(reservoir_values_two[index-1][5]+random()*3,decm_places)]
          reservoir_values_one.append(values_one)
          reservoir_values_two.append(values_two)
  
      return [reservoir_values_one, reservoir_values_two]
  # End reservoir_datasets() method

  def reservoir_data_pipeline_for_analytics(self, nth_limit=None, reservoir_zone=None, option=None):
    sql_query = "";
        
    if not nth_limit:
      #default nth_limit to 5, if not given or undefined as argument
      nth_limit = 5;
    if option == "prolific_reservoir_zones":
      # 1. nth top-most prolific very-sandy SPECIFIED "reservoir_zone"
      sql_query = """
                    SELECT rsp.Reservoir_ID, rsp.Cum_prod_mm_bbls, rsp.Prod_Rate_m_bopd, rsp.Days
                    FROM ReservoirProduction rsp
                    INNER JOIN Reservoir rs ON rsp.Reservoir_ID=rs.Reservoir_ID
                    WHERE rs.Reservoir_Zone=""" + 'reservoir_zone' + "{}{}{}".format(""" AND rs.Avg_GR_api<30
                    ORDER BY rsp.Cum_prod_mm_bbls
                    LIMIT
                   """, str(nth_limit), ";")
    elif option == "thickest_reservoir_zones":
      # 2. nth top-most thick SPECIFIED "reservoir_zone", with Reservoir_ID, Cum_prod and Days
      sql_query = "{}{}{}".format(
                   """
                    SELECT rs.Reservoir_Zone, rso.Net_pay_ft, rs.Reservoir_ID, rsp.Cum_prod_mm_bbls, rsp.Days
                    FROM Reservoir rs
                    INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID
                    INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID
                    ORDER BY rsp.Cum_prod_mm_bbls
                    LIMIT
                   """, str(nth_limit), ";"
                  )
    elif option == "all_reservoir_zones_and_volume_indicators":
      # 3. all "reservoir_zone"(s), with Reservoir_ID, Top_TVD_ft, STOOIP_mm_bbls, Net_pay_ft, Cum_prod and Days
      sql_query = """
                    SELECT rs.Reservoir_Zone, rs.Reservoir_ID, rs.Top_TVD_ft, rso.STOOIP_mm_bbls, rso.Net_pay_ft, rsp.Cum_prod_mm_bbls, rsp.Days
                    FROM Reservoir rs
                    INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID
                    INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID
                    ORDER BY rsp.Days;
                  """
    elif option == "all":
      # 4. "all" properties ON all TABLES (Reservoir, ReservoirSTOOIP & ReservoirProduction)
      sql_query = """
                   SELECT *
                   FROM Reservoir rs
                   INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID
                   INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID;
                  """
    else:
      # 5. default
      # do nothing: just confirm "No" option is specified
      print("No option is specified....")
      return
      # add more data pipelines option(s) as deem necessary ....
    return sql_query
  #End reservoir_data_pipeline_for_analytics() method
# End AccessMySQL() Class

  
class AccessMySQLTest(TestCase):
  """ Test ShaleDNN() class """
  
  def setUp(self):
    self.count = 0
    self.access_mysql = AccessMySQL()
  # End setUp() method
    
  def test_access_mysql(self):
    print()
    # defaults mysql ssl certificates, for testing
    ssl_certificates = {}
    ca_filee = 'path_to_/ca.pem'
    key_filee = 'path_to_/client-key.pem'
    cert_filee = 'path_to_/client-cert.pem'
    ssl_certificates["ssl-ca"] = ca_filee
    ssl_certificates["ssl-key"] = key_filee
    ssl_certificates["ssl-cert"] = cert_filee
    # default connection options, for testing
    mysql_connection_options = {}
    mysql_connection_options["host"] = 'host'
    mysql_connection_options["user"] = 'user'
    mysql_connection_options["port"] = 'port'
    mysql_connection_options["password"] = 'password'
    mysql_connection_options["db"] = 'database_name'
    db = mysql_connection_options["db"]
    #other default values, for testing
    table_name = "Reservoir"
    required_ssl = False
    number_of_datapoints = 20
    # connect to mysql, add data to Reservoir table , and disconnect (within a single method)
    connection_for_insert = self.access_mysql.connect_to_mysql_from_python(mysql_connection_options=mysql_connection_options, ssl_certificates=ssl_certificates, required_ssl=required_ssl)
    inserted_reservoir_data = self.access_mysql.insert_data_to_reservoir_table(number_of_datapoints=number_of_datapoints, table_name=table_name, connection=connection_for_insert, db=db)
    # connect to mysql, execute queries, against Reservoir table and disconnect (within a single method)
    connection_for_query = self.access_mysql.connect_to_mysql_from_python(mysql_connection_options=mysql_connection_options, ssl_certificates=ssl_certificates, required_ssl=required_ssl)
    executed_query = self.access_mysql.execute_some_queries_for_data_pipeline(connection=connection_for_query, db=db)
    self.count = "{}{}".format("accessing mysql : ",  1)
  #End test_acccess_mysql() method
  
  def tearDown(self):
    print("Successfully tested", self.count, ".....ok")
    self.count = None
    self.access_mysql = None
  # End tearDown() method
# End AccessMySQLTest() Class()

# invoke test
main(verbosity=2)

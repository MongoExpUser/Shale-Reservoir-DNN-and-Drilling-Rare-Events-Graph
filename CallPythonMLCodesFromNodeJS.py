# ****************************************************************************************
# ****************************************************************************************************************************
# * @License Starts
# *
# * Copyright © 2015 - present. MongoExpUser
# *
# * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
# *
# * @License Ends
# *
# *
# * ...Ecotert's CallPythonMLCodesFromNodeJS.py  (released as open-source under MIT License) implements:
#
#  Demonstration of 4 ML codes that can be called from Node.js, namely:
#
#  1) Simple classifications with sklearn's LogisticRegression, GaussianNB & SVC (linear & sigmoidal).
#
#  2) Simple DNN regression with keras (contained inside TensorFlow).
#
#  3) Simple creation and transformation of tensor data type with TensorFlow (Python version).
#
#  4) Creation of sqlite db for modeling drilling rare events (vibration, kick and stuck pipe) detection and prevention.
#
#  The motivation, for calling of machine learning codes written in Python from Node.js,
#  is to prevent re-inventing/re-creating of existing codes in Python.
#  This way, existing machine learning codes written in Python can easily be used within
#  asynchronous Node.js server and integrated with TensorFlow.js codes.
#
#
# ****************************************************************************************************************************
# ****************************************************************************************************************************

try:
    """ import commonly used modules and check for import error """
    import sqlite3
    import sys, cython
    import numpy as np
    import scipy, pandas
    import networkx as nx
    import sklearn, skimage
    import tensorflow as tf
    import pygraphviz as pgv
    from pprint import pprint
    from sklearn.base import clone
    import matplotlib.pyplot as plt
    import tensorflow.keras as keras
    from scipy.ndimage import convolve
    from unittest import TestCase, main
    from sklearn.pipeline import Pipeline
    from sklearn.svm import SVC, LinearSVC
    from sklearn.naive_bayes import GaussianNB
    from datetime import date, datetime, timedelta
    from sklearn.ensemble import ExtraTreesRegressor
    from sklearn.datasets import make_classification
    from sklearn.neighbors import KNeighborsRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.utils.validation import check_random_state
    from sklearn.neural_network import MLPClassifier, MLPRegressor, BernoulliRBM
    from sklearn.linear_model import LinearRegression, LogisticRegression, RidgeCV
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
    from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, export_graphviz, plot_tree
    from sklearn.cluster import AgglomerativeClustering, Birch, DBSCAN, KMeans, FeatureAgglomeration, SpectralClustering
    import statsmodels as sm, statsmodels.api as smbase, statsmodels.formula.api as smform, statsmodels.graphics.api as smgraph
except(ImportError) as err:
    print(str(err))


class CallPythonMLCodesFromNodeJS(TestCase):
    """ Machine learning tests """
    
    def setUp(self):
        self.count = 0
    # End setUp() method
    
    def print_separator(self):
      print("......................................................")
    # End print_separator() method
    
    def test_check_all_installed_packages_and_version(self):
      from pip._internal.utils.misc import get_installed_distributions
      packages = get_installed_distributions()
      sorted(packages)
      packages_len = len(packages)
      print()
      self.print_separator()
      for index, item in enumerate(packages):
          print(index+1,".", packages[packages_len-1-index])
      self.print_separator()
    # End test_check_all_installed_packages_and_version() method
        
    def test_sklearn_classification_with_log_regression_gnb_svm_demo(self):
      
      #create training dataset
      x_train, y_train = make_classification(n_samples=20, n_features=6)
      
      #create test datasets of same n_samples and n_features as training datasets
      x_test, y_test = make_classification(n_samples=20, n_features=6)
      
      #1) use Logistic Regression to train and predict
      tolerance = 1e-8
      classifier_one = LogisticRegression(tol=tolerance)
      classifier_one.fit(x_train, y_train)
      predictions_one_y = classifier_one.predict(x_test)
      score_one = accuracy_score(y_test, predictions_one_y)
      print("................................")
      print("Prediction for Logistic Regression: ", predictions_one_y)
      print("{}{:.4f}".format("Accuracy of Logistic Regression: ", score_one))
      print("................................")
 
      # 2) use Gaussian NB to train and predict data
      classifier_two = GaussianNB()
      classifier_two.fit(x_train, y_train)
      predictions_two_y = classifier_two.predict(x_test)
      score_two = accuracy_score(y_test, predictions_two_y)
      print("................................")
      print("Prediction for Gaussian NB: ", predictions_two_y)
      print("{}{:.4f}".format("Accuracy of Gaussian NB: ", score_two))
      print("................................")

      # 3) use sigmoidal support vector (SVC) to train data and predict
      classifier_three = SVC(kernel="sigmoid", probability=True, tol=tolerance)
      classifier_three.fit(x_train, y_train)
      predictions_three_y = classifier_three.predict(x_test)
      score_three = accuracy_score(y_test, predictions_three_y)
      print("................................")
      print("Prediction for Sigmoidal Support Vector: ", predictions_three_y)
      print("{}{:.4f}".format("Accuracy of Sigmoidal Support Vector: ", score_three))
      print("................................")

      # 4) use linear support vector (SVC) to train data and predict predict
      classifier_four = LinearSVC(random_state=0, tol=tolerance)
      classifier_four.fit(x_train, y_train)
      predictions_four_y = classifier_four.predict(x_test)
      score_four = classifier_four.score(x_test, y_test)
      print("Prediction for Linear Support Vector: ", predictions_four_y)
      print("{}{:.4f}".format("Accuracy of Linear Support Vector: ", score_four))

      # print training datasets
      print("................................")
      print("input", x_train)
      print("................................")
      print("target/output", y_train)
      print("................................")
      
      self.count = 0
    # End test_sklearn_classification_with_log_regression_gnb_svm_demo() method
    
    def test_keras_tf_demo_regression(self, input_dimension="one_dimension"):
      """
         Simple keras (with tf) DNN demo for regression problem
         Topolopgy    : 5-10-10-10-1 units as 5-layers (3 hidden).
         Input Layer  : 5 units (Infer from input matrix).
         Output Layer : 1 unit  (Infer from last Dense layer).
      """
      
      # build and compile model
      model = keras.Sequential()
      model.add(keras.layers.Dense(units=10, input_shape=[1]))
      model.add(keras.layers.Dense(units=10, activation='sigmoid'))
      model.add(keras.layers.Dropout(0.02, noise_shape=None, seed=None))
      model.add(keras.layers.Dense(units=10, activation='relu')) #tanh
      model.add(keras.layers.Dropout(0.02, noise_shape=None, seed=None))
      model.add(keras.layers.Dense(units=1, activation='linear'))
      model.compile(loss='mean_squared_error', optimizer='rmsprop')
      
      # print topology sumary
      print("Topology Summary")
      model.summary()
      
      # generate some synthetic data for training
      if input_dimension == "one_dimension":
        xs = np.array([1, 2, 3, 4, 6])
        ys = np.array([1, 3, 5, 7, 9])
        xs_test = np.array([1, 2, 3, 4, 6])
        ys_test = np.array([1, 3, 5, 7, 9])
      else:
        xs = np.array([[1], [2], [3], [4], [6]])
        ys = np.array([[1], [3], [5], [7], [9]])
        xs_test = np.array([[1], [2], [3], [4], [6]])
        ys_test = np.array([[1], [3], [5], [7], [9]])
      
      # train model with fit().
      verbose = 1
      epochs = 100
      batch_size = 128
      #fit_model = model.fit(xs, ys, epochs=epochs)
      fit_model = model.fit(xs, ys, epochs=epochs, batch_size=batch_size,  verbose=verbose, validation_data=(xs_test, ys_test))
      score = model.evaluate(xs_test, ys_test)
      print()
      print('Test loss:', score*100, " %")
      
      # print train and test input data
      print(" Train data - y: ")
      print(ys)
      print()
      print(" Train data - x: ")
      print(xs)
      print()
      
      # run inference with predict() and print results.
      if input_dimension == "one_dimension":
        print("prediction of xs_test[3] -> should give 7 : ", model.predict(np.array([4])))  # should give 7
        print()
        print("prediction of xs_test[1] -> should give 3 : " , model.predict(np.array([2])))  # -> should give 3
        print()
        print("prediction of xs_test[4] -> should give 9 : ", model.predict(np.array([6])))  # -> should give 9
        print()
        print("prediction of [6] -> should give 9 : ", model.predict(np.array([6])))  # -> should give 9
        print()
        print("prediction of [5] -> should give btw 7 & 9: ", model.predict(np.array([5])))  # -> should interploate below 7 and 9
        print()
      else:
        print("prediction of [[3]] -> should give 5 : ", model.predict(np.array([[3]])))  # should give 5
        print()
        print("prediction of [[1]] -> should give 1 : " , model.predict(np.array([[1]])))  # -> should give 1
        print()
        print("prediction of [[4]] -> should give 7 : ", model.predict(np.array([[4]])))  # -> should give 7
        print()
        print("prediction of [[6]] -> should give 9 : ", model.predict(np.array([[6]])))  # -> should give 9
        print()
        print("prediction of [[5]] -> should give btw 7 & 9: ", model.predict(np.array([[5]])))  # -> should interploate below 7 and 9
        print()
      
      print('.........................................................................')
      
      self.count = 1
    # End test_keras_tf_demo_regression() method
    
    def test_tensorflow_model(self, printing=False):
      """
      Simple tensorflow demo: create and transform TensorFlow's tensor data types
      """

      # create
      l = n = m = 3
      # 1. multi-dimensional tensors of shape, l x m x n (with constant) and print
      const_tenso1 = tf.constant(value=[[0.8, 0.90, 0.6], [0.77, 0.87, 0.9]], shape=[2, 3], name="gas_saturation", verify_shape=True, dtype=tf.float64)
      const_tenso2 = tf.constant(value=0.87, shape=[], name="oil_saturation", verify_shape=True, dtype=tf.float64,) #scalar
      
      # 2. multi-dimensional tensors of shape, l x m x n (with zeros/ones and fill) and print
      zero_tensor = tf.zeros(shape=[l, m, n ], name="net_pay_thickness", dtype=tf.float64)
      fill_tensor = tf.fill(dims=[l, m, n ], value=5.0, name="porosity")
      
      # 3. one-dimensional tensors of shape, 1 x m (with sequence) and print
      line_tensor = tf.linspace(start=1., stop=10., num=10, name="fracture_length")
      rang_tensor = tf.range(start=10., limit=101., delta=10, name="fracture_orientation", dtype=tf.float64)
      
      # 3. multi-dimensional tensors of shape, l x m x n (with random number) and print
      rand_norm_tensor = tf.random.normal(shape=[l, m, n ], mean=5, stddev=1, name="TOC", seed=tf.compat.v1.set_random_seed(2), dtype=tf.float64)
      trun_norm_tensor = tf.random.truncated_normal #(shape=[l, m, n ], mean=5, stddev=1, name="permeability_x", seed=tf.set_random_seed(2), dtype=tf.float64)
      rand_unif_tensor = tf.random.uniform(shape=[l, m, n ], minval=0, maxval=1, name="permeability_y", seed=tf.compat.v1.set_random_seed(0.2), dtype=tf.float64)
      
      # print all tensor data types and formats
      if printing:
        pprint(const_tenso1)
        pprint(const_tenso2)
        pprint(zero_tensor)
        pprint(fill_tensor)
        pprint(line_tensor)
        pprint(rang_tensor)
        print(".......................")
      
      # print all elements in all the tensors
      sess_option = True
      created_tensor = [const_tenso1, const_tenso2,zero_tensor, fill_tensor, line_tensor, rang_tensor,
                        rand_norm_tensor, trun_norm_tensor, rand_unif_tensor]
         #
      def print_tensor(list_of_tensor):
          for tensor in list_of_tensor:
            if sess_option:
              pprint(tensor)
              print(" ")
            else:
              pprint(tensor)
              print(" ")
       
      if printing:
        print_tensor(created_tensor)
      
      #transform tensors
      reverse_tensor = tf.reverse(rand_unif_tensor, axis=[0], name="permeability_z_reverse")
      transformed_tensor = [reverse_tensor]
      if printing:
        print_tensor(transformed_tensor)
        
      self.count = 2
    # End test_ensorflow_model(printing=False) method
    
    def test_check_packages_versions(self):
      print("Python", sys.version, "is properly set up with miniconda3.")
      print()
      print("Using TensorFlow version", tf.__version__, "on this system.")
      print()
      print("Using Keras version", tf.keras.__version__, "on this system.")
      print()
      print("Using SQLite3 version", sqlite3.version, "on this system.")
      print()
      print("Using Networkx version", nx.__version__, "on this system.")
      print()
      
      self.count = 3
    # End test_check_packages_versions() method
    
    def test_sqlite_drilling_rare_events_database(self, database_name=None):
      
      # 1. define helper functions
      # .........................helper functions start................................
      # a. connect to database
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
            
      # b. count and print record
      def count_and_print_record(record, show=True):
        count = 0
        for row in record:
          count = count + 1
          if show == True:
            print(row)
            print()
        return count
      
      # c. error handler for insert statement
      def handle_non_unique_error_for_insert(err):
        confirm = "UNIQUE constraint failed: Drilling_Parameters.ROWID"
        if (str(err) == confirm) is True:
          msg = "non-unique SERIAL_NO, cannot INSERT a new row of data."
          print(msg)
          
      # d. retrieve and store all extrated data, with header, in a table as a list/array
      def retrieve_and_stored_all_data_in_a_table_as_list(record):
        all_data_as_list = []
        header = [row[0] for row in record.description]
        all_data_as_list.append(list(header))
        for row in record:
          all_data_as_list.append(list(row))
        return all_data_as_list
      # .........................helper functions end......................................
      
      # 2. connect to a temporary "drilling_events.db" or create a new
      # "drilling_events.db, if it does not exit and point to cursor
      database_name = 'drilling_events.db'
      connection = connect_to_sqlite_db(database_name)
      py_connection = connection.cursor()
      
      # 3. create Drilling_and_Formation_Parameters TABLE, if it does not exist and save (commit) the changes
      py_connection.execute("""CREATE TABLE IF NOT EXISTS Drilling_and_Formation_Parameters (ROP_fph real, RPM_rpm real, SPP_psi real, DWOB_lb real, SWOB_lb real,
                               TQR_Ibft real, BHA_TYPE_no_unit text, MUD_WEIGHT_sg real, MUD_PLASTIC_VISC_cp real, MUD_YIELD_POINT_lb_per_100ft_sq real,
                               MUD_FLOW_RATE_gpm real, TVD_ft real, MD_ft real, INC_deg real, AZIM_deg real, Dogleg_deg_per_100ft real, CALIPER_HOLE_SIZE_inches real,
                               GR_api real, DEEP_RESISTIVITY_ohm_m real,  SHOCK_g real, IS_VIBRATION_boolean_0_or_1 integer, IS_KICK_boolean_0_or_1 integer,
                               IS_STUCKPIPE_boolean_0_or_1 integer, TIME_ymd_hms text, CHECK (0>=GR_api<= 150), CHECK (0>=DEEP_RESISTIVITY_ohm_m<= 2000),
                               CHECK (IS_VIBRATION_boolean_0_or_1=1 OR IS_VIBRATION_boolean_0_or_1=0), CHECK (IS_KICK_boolean_0_or_1=1 OR IS_KICK_boolean_0_or_1=0),
                               CHECK (IS_STUCKPIPE_boolean_0_or_1=1 OR IS_STUCKPIPE_boolean_0_or_1=0))
                            """)
      connection.commit()
      
      # 4. insert a row of data for all columns
      try:
        py_connection.execute("""INSERT INTO Drilling_and_Formation_Parameters (ROP_fph, RPM_rpm, SPP_psi, DWOB_lb, SWOB_lb, TQR_Ibft,BHA_TYPE_no_unit, MUD_WEIGHT_sg, MUD_PLASTIC_VISC_cp,
                                 MUD_YIELD_POINT_lb_per_100ft_sq,  MUD_FLOW_RATE_gpm, TVD_ft, MD_ft, INC_deg, AZIM_deg, Dogleg_deg_per_100ft, CALIPER_HOLE_SIZE_inches,
                                 GR_api, DEEP_RESISTIVITY_ohm_m, SHOCK_g, IS_VIBRATION_boolean_0_or_1, IS_KICK_boolean_0_or_1, IS_STUCKPIPE_boolean_0_or_1, TIME_ymd_hms)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", (35, 65, 235, 20000, 10000, 800, 'slick', 1.18, 18.01, 16, 98.14,
                                 8000, 12000, 67.2, 110.5, 1.1, 6, 20, 303.3, 26, 0, 0, 0, str(datetime.utcnow()))
                              )
        connection.commit()
      except(sqlite3.IntegrityError) as err:
        handle_non_unique_error_for_insert(err)
      
      # 5. insert new rows of data, for the indicated columns, note that other columns are null/None, expect where DEFAULT and NOT NULL are specfied
      try:
        py_connection.execute("INSERT INTO Drilling_and_Formation_Parameters (MUD_FLOW_RATE_gpm, MUD_WEIGHT_sg, GR_api, BHA_TYPE_no_unit) VALUES (?, ?, ?, ?)", (90.20, 1.18, 22, 'packed'))
        py_connection.execute("INSERT INTO Drilling_and_Formation_Parameters (MUD_FLOW_RATE_gpm, MUD_WEIGHT_sg, GR_api, BHA_TYPE_no_unit) VALUES (?, ?, ?, ?)", (104.5, 1.17, 25, 'packed'))
        py_connection.execute("INSERT INTO Drilling_and_Formation_Parameters (MUD_FLOW_RATE_gpm, MUD_WEIGHT_sg, GR_api, BHA_TYPE_no_unit) VALUES (?, ?, ?, ?)", (97.44, 1.16, 18, 'packed'))
        py_connection.execute("INSERT INTO Drilling_and_Formation_Parameters (MUD_FLOW_RATE_gpm, MUD_WEIGHT_sg, GR_api, BHA_TYPE_no_unit) VALUES (?, ?, ?, ?)", (120.1, 1.18, 27, 'packed'))
        py_connection.execute("INSERT INTO Drilling_and_Formation_Parameters (MUD_FLOW_RATE_gpm, MUD_WEIGHT_sg, GR_api, BHA_TYPE_no_unit) VALUES (?, ?, ?, ?)", (101.2, 1.17, 29, 'packed'))
        py_connection.execute("INSERT INTO Drilling_and_Formation_Parameters (DEEP_RESISTIVITY_ohm_m, BHA_TYPE_no_unit, TIME_ymd_hms) VALUES (?, ?, ?)", (222.2, 'slick', str(datetime.utcnow())))
        connection.commit()
      except(sqlite3.IntegrityError) as err:
        handle_non_unique_error_for_insert(err)
      
      # 6. update selected columns of the table at specified row
      py_connection.execute("UPDATE Drilling_and_Formation_Parameters SET MUD_WEIGHT_sg=?, IS_KICK_boolean_0_or_1=?, IS_STUCKPIPE_boolean_0_or_1=? WHERE ROWID=?", (1.15, 1, 1,2))
      py_connection.execute("UPDATE Drilling_and_Formation_Parameters SET ROP_fph=?, RPM_rpm=?, MD_ft=?, INC_deg=? WHERE ROWID=?", (48.7, 68.1, 11002, 65.1, 5))
      py_connection.execute("UPDATE Drilling_and_Formation_Parameters SET ROP_fph=?, IS_KICK_boolean_0_or_1=?, IS_STUCKPIPE_boolean_0_or_1=? WHERE ROWID=?", (43.3, 1, 1, 6))
      connection.commit()
    
      # 7. show/view all record values in the table with "HEADER"
      print()
      print("All Records in the Drilling_and_Formation_Parameters TABLE")
      print("==========================================================")
      executed_sqlite_query = py_connection.execute("SELECT * FROM Drilling_and_Formation_Parameters")
      header = [row[0] for row in py_connection.description]
      print(header)
      count_and_print_record(executed_sqlite_query)
      
      # 8. show/view some record values in the table with "HEADER", including ROWID (the default primary key)
      print()
      print("Some Records in the Drilling_and_Formation_Parameters TABLE")
      print("===========================================================")
      executed_sqlite_query = py_connection.execute("""SELECT ROWID, ROP_fph, RPM_rpm, MUD_WEIGHT_sg, MUD_PLASTIC_VISC_cp, MUD_FLOW_RATE_gpm, GR_api,
                                                    SHOCK_g, IS_VIBRATION_boolean_0_or_1 FROM Drilling_and_Formation_Parameters
                                                    """)
      connection.commit()
      header = [row[0] for row in py_connection.description]
      print(header)
      count_and_print_record(executed_sqlite_query)
      
      # 9. show/view all table names is the databases
      print()
      print("All TABLE names in the 'drilling_events.db' DATABASE")
      print("=========================================================")
      executed_sqlite_query = py_connection.execute("SELECT name FROM sqlite_master WHERE type='table';")
      count_and_print_record(executed_sqlite_query)
      
      # 10. show/view all COLUMNS or HEADER of the "Drilling_and_Formation_Parameters" TABLE
      print("A Listing of COLUMN or HEADER names of the 'Drilling_and_Formation_Parameters' TABLE")
      print("=================================================================================")
      py_connection.execute("SELECT * FROM Drilling_and_Formation_Parameters")
      names  = [row[0] for row in py_connection.description]
      for name in names:
        print(name)
      print()
      
      # 11. store all record values in the table, with "HEADER", into a list/array that can be converted
      # into TensorFlow's tensor data type and used as input into AIML algorithms, and print to check
      print("All Data in the TABLE stored as a List/Array")
      print("==============================================")
      executed_sqlite_query = py_connection.execute("SELECT * FROM Drilling_and_Formation_Parameters")
      extracted_data = retrieve_and_stored_all_data_in_a_table_as_list(executed_sqlite_query)
      print(extracted_data)
      
      # 12. delete the temporary TABLE(S) in the database
      executed_sqlite_query = py_connection.execute("DROP TABLE IF EXISTS Drilling_and_Formation_Parameters")
      connection.commit()
      executed_sqlite_query  = py_connection.execute("SELECT name FROM sqlite_master WHERE type='table';")
      number_of_table = count_and_print_record(executed_sqlite_query, show=False)
      if executed_sqlite_query == 0:
        print()
        print("TABLE(S) in the 'drilling_events.db' DATABASE is/are now DELETED.")
        print()
      
      # 13 finally, close connection to the database
      py_connection.close()
      connection.close()
      
      self.count = 4
      return extracted_data
    # End test_sqlite_drilling_rare_events_database() method
      
    def tearDown(self):
      print("Successful test", self.count + 1, ".....ok")
    # End tearDown() method
# End CallPythonMLCodesFromNodeJS() class

main(verbosity=2)

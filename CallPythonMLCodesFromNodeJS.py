
# ****************************************************************************************
# ****************************************************************************************
# * @License Starts
# *
# * Copyright © 2015 - present. MongoExpUser
# *
# * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
# *
# * @License Ends
# *
# *
# * ...Ecotert's CallPythonMLCodesFromNodeJS.py  (released as open-source under MIT License) implements:
#
#  Demonstration of 3 simple ML codes that can be called from Node.js, namely:
#
#  1) Simple classifications with sklearn's LogisticRegression, GaussianNB & SVC (linear & sigmoidal).
#
#  2) Simple DNN regression with keras (contained inside TensorFlow).
#
#  3) Simple creation and transformation of tensor data type with TensorFlow (Python version).
#
#
#  The motivation, for calling of machine learning codes written in Python from Node.js,
#  is to prevent re-inventing/re-creating of existing codes in Python.
#  This way, existing machine learning codes written in Python can easily be used within
#  asynchronous Node.js server and integrated with TensorFlow.js codes.
#
#
# ****************************************************************************************
# ****************************************************************************************


try:
    """ import commonly used modules and check for import error """
    
    import sys
    import sklearn
    import unittest
    import numpy as np
    import tensorflow as tf
    from pprint import pprint
    from unittest import TestCase
    from sklearn.base import clone
    import matplotlib.pyplot as plt
    import tensorflow.keras as keras
    from scipy.ndimage import convolve
    from sklearn.pipeline import Pipeline
    from sklearn.svm import SVC, LinearSVC
    from sklearn.naive_bayes import GaussianNB
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
except(ImportError) as err:
    print(str(err))

class CallPythonMLCodesFromNodeJS(unittest.TestCase):
    """ Machine learning tests """
    
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
    # End test_sklearn_classification_with_log_regression_gnb_svm_demo() method
    
    def test_keras_tf_demo_regression(self, input_dimension="one_dimension"):
      """
         Simple keras (with tf) DNN demo for regression problem
         Topolopgy    : 5-10-10-10-1 units as 5-layers (3 hidden).
         Input Layer  : 5 units (Infer from input matrix).
         Output Layer : 1 unit  (Infer from last Dense layer).
      """
    
      print("TensorFlow Version: ", tf.__version__)
      
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
    # End test_ensorflow_model(printing=False) method
    
    def test_check_packages_versions(self):
      print("Python", sys.version, "is properly set up with miniconda3.")
      print()
      print("Using TensorFlow version", tf.__version__, "on this system.")
      print()
      print("Using Keras version", tf.keras.__version__, "on this system.")
      print()
    # End test_check_packages_version() method
      
# End CallPythonMLCodesFromNodeJS() class

unittest.main();

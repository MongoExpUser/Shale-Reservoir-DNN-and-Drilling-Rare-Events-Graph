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
# * ...Ecotert's ShaleDNNImageClassification.py  (released as open-source under MIT License) implements:
#
#  1) ShaleFFNNAndCNN() class for:
#
#    a) Feed-forward Deep Neural Network (FFNN) classification with TensorFlow library.
#
#    b) Convolutional Deep Neural Network (CNN) classification with TensorFlow library.
#
#  2) A class (ShaleFFNNAndCNN_Test()) to test ShaleFFNNAndCNN() class
#
#
#  Application: shale reservoir images classification
#
#
# ****************************************************************************************************************************
# ****************************************************************************************************************************

try:
    """ import commonly used modules and check for import error """
    import numpy as np
    import tensorflow as tf
    import matplotlib.pyplot as plt
    from unittest import TestCase, main
    from tensorflow.keras.models import load_model, model_from_json
    from tensorflow.keras import backend, optimizers, Sequential
    from tensorflow.keras.utils import plot_model, to_categorical
    from tensorflow.keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D
except(ImportError) as err:
    print(str(err))

class ShaleFFNNAndCNN():
  
  """Shale reservoir images classification"""
  
  #class constructor
  def __init__(self):
    #print version of tensorflow and keras
    print("")
    print("")
    print("Using TensorFlow version", tf.__version__, "on this system.")
    print("Using Keras version", tf.keras.__version__, "on this system.")
    print("")
    
  def predict_with_existing_saved_model(self, saved_model_name=None, optimizer=None, loss=None,
                                        test_images=None, test_labels=None, verbose=None):
    # 1. load existing saved model
    filename = open(saved_model_name + ".json", 'r')
    loaded_saved_model = model_from_json(filename.read())
    filename.close()
    loaded_saved_model.load_weights(saved_model_name + ".h5")
    print("Saved model is successfully loaded from the disk in the CWD")
    # 2.  evaluate loaded saved model
    loaded_saved_model.compile(optimizer=optimizer, loss=loss, metrics=['accuracy'])
    print("Now evaluating loaded saved model on test data ")
    score = loaded_saved_model.evaluate(test_images, test_labels, verbose=verbose)
    #3. print loss and accuracy of evaluation
    print(loaded_saved_model.metrics_names[0], "{:0.4f}".format(score[0]))
    print(loaded_saved_model.metrics_names[1], "{:0.4f}%".format(score[1]*100))
  # End predict_with_existing_saved_model() method
  
  def save_model_in_current_working_directory(self, saved_model_name=None, model=None):
    with open(saved_model_name + ".json", "w") as filename:
      filename.write(model.to_json())
    # serialize weights to HDF5 (binary format)
    model.save_weights(saved_model_name + ".h5")
    print("Model is successfully saved to disk in the CWD")
  # End save_model_in_current_working_directory() method
    
  def FFNN_classification(self, ffnn_options=None):
    """Feed-forward Deep Neural Network (FFNN) for shale "images"  classification.
       The abstraction in this method is simplified and similar to sklearn's MLPClassifier(args),
       such that calling the method is reduced to just 1 line of statement with the properly defined
       input "image data", hyper-parameters and other inputs as arguments
    """
    
    # pass in arguments (dataset, hyper-parameters and other inputs)
    if ffnn_options:
      # load data
      data_set = ffnn_options.data
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      train_images, test_images = train_images / 255.0, test_images / 255.0
      
      # define hyper-parameters and other inputs
      shape_x = ffnn_options.shape_x
      shape_y = ffnn_options.shape_y
      input_layer_activation =  ffnn_options.input_layer_activation
      hidden_layers_activation =  ffnn_options.hidden_layers_activation
      output_layer_activation =  ffnn_options.output_layer_activation
      unit_per_input_layer = ffnn_options.unit_per_input_layer
      unit_per_hidden_layer = ffnn_options.unit_per_hidden_layer
      unit_per_output_layer = ffnn_options.unit_per_output_layer
      dropout = ffnn_options.dropout
      number_of_hidden_layers = ffnn_options.ffnn_options.number_of_hidden_layers
      optimizer = ffnn_options.optimizer
      loss = ffnn_options.loss
      verbose = ffnn_options.verbose
      epochs = ffnn_options.epochs
      batch_size = ffnn_options.batch_size
      existing_saved_model = ffnn_options.existing_saved_model
      save_model = ffnn_options.save_model
      saved_model_name =  ffnn_options.saved_model_name
      
    # defined default dataset, hyper-parameters and other inputs, if not defined in the argument
    if not ffnn_options:
      print("------------------------------------------------------------------------------------------")
      print("No argument is provided for FFNN image classification model: using default mnist dataset. ")
      print("------------------------------------------------------------------------------------------")
      # load data from MNIST data
      data_set = tf.keras.datasets.mnist
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      train_images, test_images = train_images / 255.0, test_images / 255.0
      
      # define hyper-parameters and other inputs
      shape_x = 28
      shape_y = 28
      input_layer_activation = 'relu'
      hidden_layers_activation = 'relu'
      output_layer_activation = 'softmax'
      unit_per_input_layer = 50
      unit_per_hidden_layer = 100
      unit_per_output_layer = 10
      dropout = 0.2
      number_of_hidden_layers = 10
      optimizer = 'adam'
      loss = 'sparse_categorical_crossentropy'
      verbose = 1
      epochs = 50
      batch_size = 64
      existing_saved_model = False
      save_model = True
      saved_model_name = "shale_classification_model"
      
    # create, fit/train, evaluate and save new model
    if not existing_saved_model:
      # compose/create model with loop to generalise number of hidden layers
      model = Sequential()
      # reformat data: transforms  format of images from 2d-array (of shape_x by shape_y pixels), to a 1d-array of shape_x * shape_y pixels.
      model.add(Flatten(input_shape=(shape_x, shape_y)))
      # add dense and dropout layers for input layer
      model.add(Dense(units=unit_per_input_layer, activation=input_layer_activation))
      model.add(Dropout(dropout, noise_shape=None, seed=None))
      # add dense and dropout layers for hidden layers
      for layer_index in range(number_of_hidden_layers):
        model.add(Dense(units=unit_per_hidden_layer, activation=hidden_layers_activation))
        model.add(Dropout(dropout, noise_shape=None, seed=None))
      # add dense layers and dropouts for output layer
      model.add(Dense(unit_per_output_layer, activation=output_layer_activation))
      
      # compile the model
      model.compile(optimizer=optimizer, loss=loss, metrics=['accuracy'])
      
      # fit/train the model
      model.fit(train_images, train_labels, epochs=epochs, batch_size=batch_size,  verbose=verbose)
      
      # evaluate the model
      score = model.evaluate(test_images, test_labels, verbose=verbose)
      
      #print loss and accuracy of evaluation
      print(model.metrics_names[0], "{:0.4f}%".format(score[0]))
      print(model.metrics_names[1], "{:0.4f}%".format(score[1]*100))
      
      # save model in the current working directory (CWD), if desired
      if save_model:
        self.save_model_in_current_working_directory(saved_model_name, model)
      
    # predict with existing saved model
    if existing_saved_model:
      self.predict_with_existing_saved_model(saved_model_name, optimizer, loss, test_images, test_labels, verbose)
  #End FFNN_classification() method
  
  def CNN_classification(self, cnn_options=None):
    """Convolutional Deep Neural Network (CNN) for shale "images" classification.
       The abstraction in this method is simplified and similar to sklearn's MLPClassifier(args),
       such that calling the method is reduced to just 1 line of statement with the properly defined
       input "image data", hyper-parameters and other inputs as arguments
    """
    
    # pass in arguments (dataset, hyper-parameters  and other inputs)
    if cnn_options:
      # load data
      data_set = ffnn_options.data
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      
      # define channel, images height and widths
      channels = cnn.channels
      image_height = cnn.channels
      image_width = cnn.channels
    
      # re-shape train and test images data into the given channel, image height and imge width
      train_images = train_images.reshape(train_images.shape[0], channels, image_height,image_width)
      test_images = test_images.reshape(test_images.shape[0], channels, image_height, image_width)
  
      # re-scale pixel intensity to between 0 and 1
      train_images = train_images / 255
      test_images = test_images / 255
      
      # encode labels
      train_labels = to_categorical( train_labels)
      test_labels = to_categorical(test_labels)
      number_of_labels = test_labels.shape[1]
      
      # defined hyper-parameters and other inputs
      input_layer_activation =  cnn_options.input_layer_activation
      hidden_layers_activation =  ffnn_options.hidden_layers_activation
      output_layer_activation =  ffnn_options.output_layer_activation
      dropout = cnn_options.dropout
      optimizer = cnn_options.optimizer
      loss = cnn_options.loss
      verbose = cnn_options.verbose
      epochs = cnn_options.epochs
      batch_size = cnn_options.batch_size
      existing_saved_model = cnn_options.existing_saved_model
      save_model = cnn_options.save_model
      saved_model_name =  cnn_options.saved_model_name
      filters = cnn_options.filters
      pool_size = cnn_options.pool_size
      kernel_size = cnn_options.kernel_size
      strides = cnn_options.strides
      number_of_hidden_layers = 1     # fix this value (i.e. not required in the argument)
      data_format = "channels_first"  # fix this value (i.e. not required in the argument)
      
    # defined default dataset, hyper-parameters and other inputs, if not defined in the argument
    if not cnn_options:
      print("-----------------------------------------------------------------------------------------")
      print("No argument is provided for CNN image classification model: using default mnist dataset. ")
      print("-----------------------------------------------------------------------------------------")
      # load data from MNIST data
      data_set = tf.keras.datasets.mnist
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      
      # define channel, image height and imge width
      channels = 1
      image_height = 28
      image_width = 28
      
      # re-shape train and test images data into the given channel, image height and imge width
      train_images = train_images.reshape(train_images.shape[0], channels, image_height,image_width)
      test_images = test_images.reshape(test_images.shape[0], channels, image_height, image_width)
  
      # re-scale pixel intensity to between 0 and 1
      train_images = train_images / 255
      test_images = test_images / 255
      
      # encode labels
      train_labels = to_categorical( train_labels)
      test_labels = to_categorical(test_labels)
      number_of_labels = test_labels.shape[1]
      
      # defined hyper-parameters and other inputs
      input_layer_activation = 'relu'
      hidden_layers_activation = 'relu'
      output_layer_activation = 'softmax'
      dropout = 0.2
      optimizer = 'adam'
      loss = 'categorical_crossentropy'
      verbose = 1
      epochs = 30
      batch_size = 256
      existing_saved_model = False
      save_model = True
      saved_model_name = "shale_classification_model_cnn"
      filters = 32
      pool_size = 2
      kernel_size = 5
      strides = 1
      number_of_hidden_layers = 1     # fix this value
      data_format = "channels_first"  # fix this value
      
    # create, fit/train, evaluate and save new model
    if not existing_saved_model:
      # compose/create model with loop to generalise number of hidden layers
      model = Sequential()
      # set data_format value
      backend.set_image_data_format(data_format)
      # add convolutional layer with input_shape, filters, kernel_size, strides, and activation function; pooling layer and dropout layer
      model.add(Conv2D(input_shape=(channels, image_width, image_height), filters=filters, kernel_size=(kernel_size, kernel_size), strides=(strides, strides), activation=input_layer_activation))
      # add 2 pooling layers and dropout layers, with a sandwiched Conv2D layer
      for layer_index in range(number_of_hidden_layers):
        model.add(MaxPooling2D(pool_size=(pool_size, pool_size), name="max_pooling_after_input_layer"))
        model.add(Dropout(dropout))
        model.add(Conv2D(filters=filters, kernel_size=(kernel_size, kernel_size), strides=(strides, strides), activation=hidden_layers_activation))
        model.add(MaxPooling2D(pool_size=(pool_size, pool_size), name="max_pooling_before_output_fully_connected_layer"))
        model.add(Dropout(dropout))
      #flatten output from the 2D filters into a 1D vector before feeding into fully-connected classification output layer
      model.add(Flatten())
      model.add(Dense(number_of_labels, activation=output_layer_activation))

      # compile the model
      model.compile(optimizer=optimizer, loss=loss, metrics=['accuracy'])
      
      # fit/train the model
      model.fit(train_images, train_labels, epochs=epochs, verbose=verbose, batch_size=batch_size)
      
      # evaluate the model
      score = model.evaluate(test_images, test_labels, verbose=verbose)
      
      #print loss and accuracy of evaluation
      print(model.metrics_names[0], "{:0.4f}".format(score[0]))
      print(model.metrics_names[1], "{:0.4f}%".format(score[1]*100))
      
      # save model in the current working directory (CWD), if desired
      if save_model:
        self.save_model_in_current_working_directory(saved_model_name, model)
    
    # predict with existing saved model
    if existing_saved_model:
      self.predict_with_existing_saved_model(saved_model_name, optimizer, loss, test_images, test_labels, verbose)
  #End CNN_classification() method
  
class ShaleFFNNAndCNN_Test(TestCase):
  """ Test FFNN and CNN """
  
  def setUp(self):
    self.count = 0
  # End setUp() method
    
  def test_FFNN_classification(self):
    self.count = "{}{}".format("FFNN_classification : ",  1)
    sfc = ShaleFFNNAndCNN()
    sfc.FFNN_classification()
  #End test_FFNN_classification() method()
    
  def test_CNN_classification(self):
    self.count = "{}{}".format("CNN_classification : ",  2)
    sfc = ShaleFFNNAndCNN()
    sfc.CNN_classification()
  #End test_CNN_classification() method
  
  def tearDown(self):
    # do nothing but confirm success
    print("Successful tested", self.count, ".....ok")
  # End tearDown() method

# invoke test
main(verbosity=2)

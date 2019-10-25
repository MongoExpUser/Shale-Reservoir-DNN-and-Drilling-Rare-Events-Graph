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
  # End  __init__() method
    
  def save_model_in_current_working_directory(self, saved_model_name=None, model=None):
    with open(saved_model_name + ".json", "w") as filename:
      filename.write(model.to_json())
    model.save_weights(saved_model_name + ".h5") # serialize weights to HDF5 (binary format)
    print("Model is successfully saved to disk in the CWD")
  # End save_model_in_current_working_directory() method
    
  def evaluate_with_existing_saved_model(self, saved_model_name=None, optimizer=None, loss=None, test_images=None, test_labels=None, verbose=None):
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
  # End evaluate_with_existing_saved_model() method
  
  def view_train_images_and_train_labels_option_one(self, train_images=None, train_labels=None, label_names=None, image_filename=None):
    plt.figure(figsize=(10,10)) # figure size in inches
    for index in range(25):
      plt.subplot(5,5, index+1) # each data in a 5x5 (25 images)
      plt.xticks([])
      plt.yticks([])
      plt.grid(True)
      plt.imshow(train_images[index], cmap=plt.cm.binary)
      plt.xlabel(train_labels[index])
      plt.xlabel(label_names[train_labels[index]])
    plt.savefig(image_filename + "_all_labels.png", dpi=300) # save figure in the CWD
  # End view_train_images_and_train_labels_option_one() method

  def view_train_images_and_train_labels_option_two(self, train_images=None, train_labels=None, label_names=None, image_filename=None):
    fig = plt.figure(figsize=(6,6))  # figure size in inches
    fig.subplots_adjust(left=0, right=1, bottom=0, top=1, hspace=0.05, wspace=0.05)
    for index in range(64):
        ax = fig.add_subplot(8,8, index+1, xticks=[], yticks=[]) # each data in a 8x8 (64 images)
        ax.imshow(train_images[index], cmap=plt.cm.binary, interpolation='nearest')
        label_offset = 7
        ax.text(0, label_offset, str(label_names[train_labels[index]]))   #label the image with the target value
    plt.savefig(image_filename + "_all.png", dpi=300) # save figure in the CWD
  # End view_train_images_and_train_labels_option_two() method
  
  def predict_and_view_with_new_or_existing_saved_model(self, option=None, model=None, input_images_to_predict=None, input_labels_expected_prediction=None, label_names=None, image_filename=None):
    # predict labels unseen images" with coded color (green=correct, red=incorrect)
    
    # a. define correct, incorrect and neutral colors
    correct_color = 'green'
    incorrect_color = 'red'
    neutral_color = 'gray'

    #.b define predictions and expectations
    predictions = model.predict(input_images_to_predict)
    expectations = input_labels_expected_prediction
    
    # c. image plot
    def image(index=None, predictions_array=None, actual_label=None, img=None):
      predictions_array, actual_label, img = predictions_array, actual_label[index], img[index]
      plt.grid(False)
      plt.xticks([])
      plt.yticks([])
      label_prediction = np.argmax(predictions_array)
      if option == "ffnn":
        plt.imshow(img, cmap=plt.cm.binary)
        confirm = (label_prediction == actual_label)
      elif option == "cnn":
        plt.imshow(img.squeeze(), cmap=plt.cm.binary)
        confirm = (label_prediction == list(actual_label).index(1))
      if confirm:
        color = correct_color
      else:
        color = incorrect_color
      plt.xlabel("{} {:0.1f}% {}".format(label_names[label_prediction] + " @ ", 100*np.max(predictions_array), "conf."), color=color)
          
    # d. value plot
    def value(index=None, predictions_list=None, actual_label=None):
      predictions_list, actual_label = predictions_list, actual_label[index]
      plt.grid(False)
      plt.xticks(range(10))
      plt.yticks([])
      thisplot = plt.bar(range(10), predictions_list, color=neutral_color)
      plt.ylim([0, 1])
      label_prediction = np.argmax(predictions_list)
      if option == "ffnn":
        thisplot[label_prediction].set_color(incorrect_color)
        thisplot[actual_label].set_color(correct_color)
      if option == "cnn":
        thisplot[label_prediction].set_color(incorrect_color)
        thisplot[list(actual_label).index(1)].set_color(correct_color)
    
    # e. final/combined plot
    def final_plot(number_of_rows=None, number_of_columns=None):
      number_of_images = number_of_rows * number_of_columns
      plt.figure(figsize=(2 * 2 * number_of_columns, 2 * number_of_rows))
      for index in range(number_of_images):
        plt.subplot(number_of_rows, 2 * number_of_columns, (2*index + 1))
        image(index, predictions[index], input_labels_expected_prediction, input_images_to_predict)
        plt.subplot(number_of_rows, 2 * number_of_columns, (2*index + 2))
        value(index, predictions[index], input_labels_expected_prediction)
      plt.tight_layout()
      plt.savefig(image_filename + "_pred_vs_expect_all_labels.png", dpi=300)  # save figure in the CWD
      
    # f. invoke final plot
    final_plot(number_of_rows=5, number_of_columns=3)
  # End predict_and_view_with_new_or_existing_saved_model() method
  
  def ffnn_classification(self, ffnn_options=None):
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
      label_names = ffnn.label_names
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
      image_filename = ffnn_options.image_filename
      make_predictions = ffnn_options.make_predictions
      input_images_to_predict = ffnn_options.input_images_to_predict
      input_labels_expected_prediction = ffnn_options.input_labels_expected_prediction
      
    # defined default dataset, hyper-parameters and other inputs, if not defined in the argument
    if not ffnn_options:
      print("------------------------------------------------------------------------------------------")
      print("No argument is provided for FFNN image classification model: using default mnist dataset. ")
      print("------------------------------------------------------------------------------------------")
      # load data from MNIST data
      data_set = tf.keras.datasets.mnist
      #
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      train_images, test_images = train_images / 255.0, test_images / 255.0

      # define hyper-parameters and other inputs
      label_names = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
      #
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
      batch_size = 500
      existing_saved_model = False
      save_model = True
      saved_model_name = "classification_model_ffnn"
      image_filename = "ffnn_image"
      make_predictions = True
      input_images_to_predict = test_images
      input_labels_expected_prediction = test_labels
      
    #display all images with class names and verify data format
    self.view_train_images_and_train_labels_option_one(train_images, train_labels, label_names, image_filename)
      
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
      
      # print model summary
      print("Model Topology.")
      print("===============")
      model.summary()
      
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
      
    # evaluate with existing saved model
    if existing_saved_model:
      self.evaluate_with_existing_saved_model(saved_model_name, optimizer, loss, test_images, test_labels, verbose)
      
    # if desired, finally make prediction with test_images or other images, plot predictionss
    if make_predictions:
      option="ffnn"
      self.predict_and_view_with_new_or_existing_saved_model(option, model, input_images_to_predict, input_labels_expected_prediction, label_names, image_filename)
  # End ffnn_classification() method
  
  def cnn_classification(self, cnn_options=None):
    """Convolutional Deep Neural Network (CNN) for shale "images" classification.
       The abstraction in this method is simplified and similar to sklearn's MLPClassifier(args),
       such that calling the method is reduced to just 1 line of statement with the properly defined
       input "image data", hyper-parameters and other inputs as arguments
    """
    
    # pass in arguments (dataset, hyper-parameters  and other inputs)
    if cnn_options:
      # load data
      data_set = cnn_options.data
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      
      #make copies of original image before processing/re-shaping (to be used for image view/plot/display)
      original_train_images =  train_images
      original_train_labels = train_labels
      original_test_images = test_images
      original_test_labels = test_labels
      
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
      label_names = cnn.label_names
      input_layer_activation =  cnn_options.input_layer_activation
      hidden_layers_activation =  cnn_options.hidden_layers_activation
      output_layer_activation =  cnn_options.output_layer_activation
      dropout = cnn_options.dropout
      optimizer = cnn_options.optimizer
      loss = cnn_options.loss
      verbose = cnn_options.verbose
      epochs = cnn_options.epochs
      batch_size = cnn_options.batch_size
      existing_saved_model = cnn_options.existing_saved_model
      save_model = cnn_options.save_model
      saved_model_name =  cnn_options.saved_model_name
      image_filename = cnn_options.image_filename
      filters = cnn_options.filters
      pool_size = cnn_options.pool_size
      kernel_size = cnn_options.kernel_size
      strides = cnn_options.strides
      number_of_hidden_layers = 1     # fix this value (i.e. not required in the argument)
      data_format = "channels_first"  # fix this value (i.e. not required in the argument)
      #
      make_predictions = cnn_options.make_predictions
      input_images_to_predict = test_images 
      input_labels_expected_prediction = test_labels 
     
    # defined default dataset, hyper-parameters and other inputs, if not defined in the argument
    if not cnn_options:
      print("-----------------------------------------------------------------------------------------")
      print("No argument is provided for CNN image classification model: using default mnist dataset. ")
      print("-----------------------------------------------------------------------------------------")
      # load data from MNIST data
      data_set = tf.keras.datasets.mnist
      #
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      
      #make copies of original image before processing/re-shaping (to be used for image view/plot/display)
      original_train_images =  train_images
      original_train_labels = train_labels
      original_test_images = test_images
      original_test_labels = test_labels
      
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
      label_names = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
      #
      input_layer_activation = 'relu'
      hidden_layers_activation = 'relu'
      output_layer_activation = 'softmax'
      dropout = 0.2
      optimizer = 'adam'
      loss = 'categorical_crossentropy'
      verbose = 1
      epochs = 50
      batch_size = 500
      existing_saved_model = False
      save_model = True
      saved_model_name = "classification_model_cnn"
      image_filename = "cnn_image"
      filters = 32
      pool_size = 2
      kernel_size = 5
      strides = 1
      number_of_hidden_layers = 1     # fix this value (i.e. not required in the argument)
      data_format = "channels_first"  # fix this value (i.e. not required in the argument)
      #
      make_predictions = True
      input_images_to_predict = test_images 
      input_labels_expected_prediction = test_labels 
      
    #display all images with class names and verify data format
    self.view_train_images_and_train_labels_option_one(original_train_images, original_train_labels, label_names, image_filename)
    
    # create, fit/train, evaluate and save new model
    if not existing_saved_model:
      # compose/create model with loop to generalise number of hidden layers
      model = Sequential()
      # a. set data_format value
      backend.set_image_data_format(data_format)
      # b. input: add convolutional layer with input_shape, filters, kernel_size, strides, and activation function
      model.add(Conv2D(input_shape=(channels, image_width, image_height), filters=filters, kernel_size=(kernel_size, kernel_size), strides=(strides, strides), activation=input_layer_activation))
      # c. hidden: in a loop, add 1 Conv2D layer; sandwiched in between max_pooling and dropout layers
      # note = number_of_hidden_layers = 1"
      for index in range(number_of_hidden_layers):
        model.add(MaxPooling2D(pool_size=(pool_size, pool_size)))
        model.add(Dropout(dropout))
        model.add(Conv2D(filters=filters, kernel_size=(kernel_size, kernel_size), strides=(strides, strides), activation=hidden_layers_activation))
        model.add(MaxPooling2D(pool_size=(pool_size, pool_size)))
        model.add(Dropout(dropout))
      #d. output: flatten output from the 2D filters into a 1D vector before feeding into fully-connected classification output layer
      model.add(Flatten())
      model.add(Dense(number_of_labels, activation=output_layer_activation))
      
      # compile the model
      model.compile(optimizer=optimizer, loss=loss, metrics=['accuracy'])
      
      # print model summary
      print("Model Topology.")
      print("===============")
      model.summary()
      
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
    
    # evaluate with existing saved model
    if existing_saved_model:
      self.evaluate_with_existing_saved_model(saved_model_name, optimizer, loss, test_images, test_labels, verbose)
      
    # if desired, finally make prediction with test_images or other images, plot predictions
    if make_predictions:
      option="cnn"
      self.predict_and_view_with_new_or_existing_saved_model(option, model, input_images_to_predict, input_labels_expected_prediction, label_names, image_filename)
  #End cnn_classification() method
  
  
class ShaleFFNNAndCNN_Test(TestCase):
  """ Test FFNN and CNN """
  
  def setUp(self):
    self.count = 0
  # End setUp() method
    
  def test_ffnn_classification(self):
    self.count = "{}{}".format("FFNN_classification : ",  1)
    sfc = ShaleFFNNAndCNN()
    sfc.ffnn_classification()
  #End test_ffnn_classification() method()
    
  def test_cnn_classification(self):
    self.count = "{}{}".format("CNN_classification : ",  2)
    sfc = ShaleFFNNAndCNN()
    sfc.cnn_classification()
  #End test_cnn_classification() method
  
  def tearDown(self):
    # do nothing but confirm success
    print("Successfully tested", self.count, ".....ok")
  # End tearDown() method

# invoke test
main(verbosity=2)

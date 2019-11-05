# **********************************************************************************************************************************
# * @License Starts
# *
# * Copyright © 2015 - present. MongoExpUser
# *
# * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
# *
# * @License Ends
# *
# *
# * ...Ecotert's ShaleReservoir.py  (released as open-source under MIT License) implements:
#
#  1) ShaleDNN() class for:
#
#    a) Standard Feed-forward Deep Neural Network (Standard-FFNN) images classification.
#
#    b) Convolutional Deep Neural Network (CNN) images classification.
#
#    c) Standard Feed-forward Deep Neural Network (Standard-FFNN) non-image properties classification.
#
#    d) Standard Feed-forward Deep Neural Network (Standard-FFNN) production volumes/rates regresssion.
#
#    e) ELT/Data pipelining
#
#  2) ShaleDNNTest() class testing ShaleDNN() class
#
#
#  Applications:
#
#  i)   Shale reservoir images classification
#  ii)  Shale reservoir non-image properties classification (rock-types/formations/facies/zones/geo-bodies/any-discrete-property)
#  iii) Shale reservoir production regression (continuous cumulative production volumes or rates)
#
# **********************************************************************************************************************************
# **********************************************************************************************************************************


try:
  """  import commonly used modules, print tensorflow version
       and keras version, and then check for import error
  """
  #import
  import numpy as np
  import tensorflow as tf
  from random import randint
  import matplotlib.pyplot as plt
  from unittest import TestCase, main
  from tensorflow.keras.models import load_model, model_from_json
  from tensorflow.keras import backend, optimizers, Sequential
  from tensorflow.keras.utils import plot_model, to_categorical
  from tensorflow.keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D
  #print version of tensorflow and keras
  print()
  print("------------------------------------------------------------")
  print("Using TensorFlow version", tf.__version__, "on this system. ")
  print("Using Keras version", tf.keras.__version__, "on this system.")
  print("------------------------------------------------------------")
  print("")
  #check for error
except(ImportError) as err:
  print(str(err))


class ShaleDNN():
  
  """
    A class for shale reservoirs':
    
      (1) images classification with standard-ffnn and cnn
      
      (2) images classification with cnn
      
      (3) non-image properties classification with standard-ffnn and
      
      (4) production volumes/rates regression with standard-ffnn
      
      (5) ELT/Data pipelining
  """
  
  def __init__(self):
    print()
    print("Initiating Shale AIML Engine.")
  # End  __init__() method
  
  def reservoir_data_pipeline_for_analytics(nth_limit=None, reservoir_zone=None, option=None):
    sql_query = "";
        
    if not nth_limit:
      #default nthLimit to 5, if not given or undefined as argument
      nth_limit = 5;

    if option == "prolific_reservoir_zones":
      # 1. nth top-most prolific very-sandy SPECIFIED "reservoirZone"
      sql_query = "" + \
        "SELECT rsp.Reservoir_ID, rsp.Cum_prod_mm_bbls, rsp.Prod_Rate_m_bopd, rsp.Days " + \
        "FROM ReservoirProduction rsp " + \
        "INNER JOIN Reservoir rs ON rsp.Reservoir_ID=rs.Reservoir_ID " + \
        "WHERE rs.Reservoir_Zone=" + "'" + reservoir_zone  + "'" + " AND rs.Avg_GR_api<30 " + \
        "ORDER BY rsp.Cum_prod_mm_bbls " + \
        "LIMIT " + String(nthLimit) + ";"
        
    elif option == "thickest_reservoir_zones":
      # 2. nth top-most thick SPECIFIED "reservoirZone", with Reservoir_ID, Cum_prod and Days
      sql_query = "" + \
        "SELECT rs.Reservoir_Zone, rso.Net_pay_ft, rs.Reservoir_ID, rsp.Cum_prod_mm_bbls, rsp.Days " + \
        "FROM Reservoir rs " + \
        "INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID " + \
        "INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID " + \
        "ORDER BY rsp.Cum_prod_mm_bbls " + \
        "LIMIT " + String(nthLimit) + ";"
        
    elif option == "all_reservoir_zones_and_volume_indicators":
      # 3. all Reservoir_Zone(s), with Reservoir_ID, Top_TVD_ft, STOOIP_mm_bbls, Net_pay_ft, Cum_prod and Days
      sql_query = "" + \
        "SELECT rs.Reservoir_Zone, rs.Reservoir_ID, rs.Top_TVD_ft, rso.STOOIP_mm_bbls, rso.Net_pay_ft, rsp.Cum_prod_mm_bbls, rsp.Days " + \
        "FROM Reservoir rs " + \
        "INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID " + \
        "INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID " + \
        "ORDER BY rsp.Days;"
        
    elif option == "all":
      # 4. all properties ON all TABLES (Reservoir, ReservoirSTOOIP & ReservoirProduction)
      sql_query = "" + \
        "SELECT * " + \
        "FROM Reservoir rs " + \
        "INNER JOIN ReservoirSTOOIP rso ON rs.Reservoir_ID=rso.Reservoir_ID " + \
        "INNER JOIN ReservoirProduction rsp ON rs.Reservoir_ID=rsp.Reservoir_ID;"
        
    else:
      # 5. default
      # do nothing: just confirm "No" option is specified
      print("No option is specified....")
      return
      # add more data pipelines option(s) as deem necessary ....
      
    #confirm query syntax is okay
    print("SQL query is okay....")

    return sql_query;
  #End reservoir_data_pipeline_for_analytics() method
    
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
  
  def ffnn_images_classification(self, ffnn_options=None):
    """Standard Feed-forward Deep Neural Network (Standard-FFNN) for shale "images"  classification.
       The abstraction in this method is simplified and similar to sklearn's MLPClassifier(args),
       such that calling the method is reduced to just 1 line of statement with the properly defined
       input "image data", hyper-parameters and other inputs as arguments
    """
    
    if ffnn_options:
      # load data
      data_set = ffnn_options["data"]
      
      # define train's and test's images & labels
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      train_images, test_images = train_images / 255.0, test_images / 255.0
      
      # define hyper-parameters and other inputs
      label_names = ffnn_options.get("label_names")
      shape_x = ffnn_options.get("shape_x")
      shape_y = ffnn_options.get("shape_y")
      input_layer_activation =  ffnn_options.get("input_layer_activation")
      hidden_layers_activation =  ffnn_options.get("hidden_layers_activation")
      output_layer_activation =  ffnn_options.get("output_layer_activation")
      unit_per_input_layer = ffnn_options.get("unit_per_input_layer")
      unit_per_hidden_layer = ffnn_options.get("unit_per_hidden_layer")
      unit_per_output_layer = ffnn_options.get("unit_per_output_layer")
      dropout = ffnn_options.get("dropout")
      number_of_hidden_layers = ffnn_options.get("number_of_hidden_layers")
      optimizer = ffnn_options.get("optimizer")
      loss = ffnn_options.get("loss")
      verbose = ffnn_options.get("verbose")
      epochs = ffnn_options.get("epochs")
      batch_size = ffnn_options.get("batch_size")
      existing_saved_model = ffnn_options.get("existing_saved_model")
      save_model = ffnn_options.get("save_model")
      saved_model_name =  ffnn_options.get("saved_model_name")
      image_filename = ffnn_options.get("image_filename")
      make_predictions = ffnn_options.get("make_predictions")
      # define images and labels to predict, if prediction is desired
      if make_predictions:
        if ffnn_options.get("input_images_to_predict") == None:
          input_images_to_predict = test_images
        if ffnn_options.get("input_labels_expected_prediction") == None:
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
        
      # if desired, finally make prediction with test_images or other images and plot predictions
      if make_predictions:
        option="ffnn"
        self.predict_and_view_with_new_or_existing_saved_model(option, model, input_images_to_predict, input_labels_expected_prediction, label_names, image_filename)
  # End ffnn_images_classification() method
  
  def cnn_images_classification(self, cnn_options=None):
    """Convolutional Deep Neural Network (CNN) for shale "images" classification.
       The abstraction in this method is simplified and similar to sklearn's MLPClassifier(args),
       such that calling the method is reduced to just 1 line of statement with the properly defined
       input "image data", hyper-parameters and other inputs as arguments
    """
    
    if cnn_options:
      # load data
      data_set = cnn_options["data"]
      
      # define train's and test's images & labels
      (train_images, train_labels), (test_images, test_labels) = data_set.load_data()
      train_images, test_images = train_images / 255.0, test_images / 255.0
      
      #make copies of original image before processing/re-shaping (to be used for image view/plot/display)
      original_train_images =  train_images
      original_train_labels = train_labels
      original_test_images = test_images
      original_test_labels = test_labels
      
      # define channels, images height and widths
      channels = cnn_options.get("channels")
      image_height = cnn_options.get("image_height")
      image_width = cnn_options.get("image_width")
    
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
      
      # define hyper-parameters and other inputs
      label_names = cnn_options.get("label_names")
      input_layer_activation =  cnn_options.get("input_layer_activation")
      hidden_layers_activation =  cnn_options.get("hidden_layers_activation")
      output_layer_activation =  cnn_options.get("output_layer_activation")
      dropout = cnn_options.get("dropout")
      optimizer = cnn_options.get("optimizer")
      loss = cnn_options.get("loss")
      verbose = cnn_options.get("verbose")
      epochs = cnn_options.get("epochs")
      batch_size = cnn_options.get("batch_size")
      existing_saved_model = cnn_options.get("existing_saved_model")
      save_model = cnn_options.get("save_model")
      saved_model_name =  cnn_options.get("saved_model_name")
      image_filename = cnn_options.get("image_filename")
      filters = cnn_options.get("filters")
      pool_size = cnn_options.get("pool_size")
      kernel_size = cnn_options.get("kernel_size")
      strides = cnn_options.get("strides")
      make_predictions = cnn_options.get("make_predictions")
      # define images and labels to predict, if prediction is desired
      if make_predictions:
        if cnn_options.get("input_images_to_predict") == None:
          input_images_to_predict = test_images
        if cnn_options.get("input_labels_expected_prediction") == None:
          input_labels_expected_prediction = test_labels
      #
      number_of_hidden_layers = 1     # fix this value (i.e. not required in the argument)
      data_format = "channels_first"  # fix this value (i.e. not required in the argument)
      
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
        
      # if desired, finally make prediction with test_images or other images and plot predictions
      if make_predictions:
        option="cnn"
        self.predict_and_view_with_new_or_existing_saved_model(option, model, input_images_to_predict, input_labels_expected_prediction, label_names, image_filename)
  #End cnn_images_classification() method
     
  def ffnn_non_images_classification(self, ffnn_options=None):
    print("Implementation of ffnn_non_images_classification() method is pending: add later")
  # End ffnn_non_images_classification() method
  
  def ffnn_production_regression(self, ffnn_options=None):
    print("Implementation of ffnn_production_regression() method is pending: add later")
  #End ffnn_production_regression() method
  
  def test_dataset_ffnn_images_classification(self, test=True, data_option="digits"):
    # defined default dataset, hyper-parameters and other inputs
    if test:
      print("-------------------------------------------------------------")
      print("Using MNIST dataset to test FFNN image classification model. ")
      print("-------------------------------------------------------------")
      
      # load data from MNIST datasets
      if data_option == "digits":
        # hand-written digits dataset
        data_set = tf.keras.datasets.mnist
        label_names = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
        print("The dataset is hand-written digits dataset")
      else:
        # fashion dataset
        data_set = tf.keras.datasets.fashion_mnist
        label_names = ['T-shirt/top', 'Trouser','Pullover', 'Dress', 'Coat', 'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']
        print("The dataset is fashion dataset")
        
      # define and return dataset, hyper-parameters and other inputs
      return  { "data": data_set,
                "label_names": label_names,
                "shape_x": 28,
                "shape_y": 28,
                "input_layer_activation": 'relu',
                "hidden_layers_activation": 'relu',
                "output_layer_activation": 'softmax',
                "unit_per_input_layer": 50,
                "unit_per_hidden_layer": 100,
                "unit_per_output_layer": 10,
                "dropout": 0.2,
                "number_of_hidden_layers": 5,
                "optimizer": 'adam',
                "loss": 'sparse_categorical_crossentropy',
                "verbose": 1,
                "epochs": 5,
                "batch_size": 500,
                "existing_saved_model": False,
                "save_model": True,
                "saved_model_name": 'classification_model_ffnn',
                "image_filename": 'ffnn_image',
                "make_predictions": True,
                "input_images_to_predict": None,
                "input_labels_expected_prediction": None
      }
  # End test_dataset_ffnn_images_classification() method
  
  def test_dataset_cnn_images_classification(self, test=True, data_option="digits"):
    # defined default dataset, hyper-parameters and other inputs
    if test:
      print("------------------------------------------------------------")
      print("Using MNIST dataset to test CNN image classification model. ")
      print("------------------------------------------------------------")
      
      # load data from MNIST datasets
      if data_option == "digits":
        # hand-written digits dataset
        data_set = tf.keras.datasets.mnist
        label_names = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
        print("The dataset is hand-written digits dataset")
      else:
        # fashion dataset
        data_set = tf.keras.datasets.fashion_mnist
        label_names = ['T-shirt/top', 'Trouser','Pullover', 'Dress', 'Coat', 'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']
        print("The dataset is fashion dataset")
        
      # define and return dataset, hyper-parameters and other inputs
      return  { "data": data_set,
                "label_names": label_names,
                "channels": 1,
                "image_height": 28,
                "image_width": 28,
                "input_layer_activation": 'relu',
                "hidden_layers_activation": 'relu',
                "output_layer_activation": 'softmax',
                "dropout": 0.2,
                "optimizer": 'adam',
                "loss": 'categorical_crossentropy',
                "verbose": 1,
                "epochs": 5,
                "batch_size": 500,
                "existing_saved_model": False,
                "save_model": True,
                "saved_model_name": 'classification_model_cnn',
                "image_filename": 'cnn_image',
                "filters": 16,
                "pool_size": 2,
                "kernel_size": 5,
                "strides": 1,
                "make_predictions": True,
                "input_images_to_predict": None,
                "input_labels_expected_prediction": None
      }
  # End test_dataset_cnn_images_classification() method
  
  def test_dataset_ffnn_non_images_classification(self, test=True, data_option=None):
    print("Implementation of test_dataset_ffnn_non_images_classification() method is pending: add later")
  # End test_dataset_ffnn_non_images_classification() method
  
  def test_dataset_ffnn_production_regression(self, test=True, data_option=None):
     print("Implementation of test_dataset_ffnn_production_regression() method is pending: add later")
  #End test_dataset_ffnn_production_regression() method
# End ShaleDNN() Class

  
class ShaleDNNTest(TestCase):
  """ Test ShaleDNN() class """
  
  def setUp(self):
    self.count = 0
    self.sfc = ShaleDNN()
    # random int number in the range 0 to 1
    self.random_number = randint(0, 1)
  # End setUp() method
    
  def test_ffnn_images_classification(self):
    print()
    self.count = "{}{}".format("Standard-FFNN Images Classification : ",  1)
    # define dataset based on random number (mnist's hand-written digits or fashion dataset)
    if self.random_number == 0:
      ffnn_options = self.sfc.test_dataset_ffnn_images_classification(test=True, data_option="digits")
    if self.random_number == 1:
      ffnn_options = self.sfc.test_dataset_ffnn_images_classification(test=True, data_option="fashion")
    self.sfc.ffnn_images_classification(ffnn_options=ffnn_options)
    print()
  #End test_ffnn_images_classification() method()
    
  def test_cnn_images_classification(self):
    print()
    self.count = "{}{}".format("CNN Images Classification : ",  2)
    # define dataset based on random number (mnist's hand-written digits or fashion dataset)
    if self.random_number == 0:
      cnn_options = self.sfc.test_dataset_cnn_images_classification(test=True, data_option="digits")
    if self.random_number == 1:
      cnn_options = self.sfc.test_dataset_cnn_images_classification(test=True, data_option="fashion")
    self.sfc.cnn_images_classification(cnn_options=cnn_options)
    print()
  #End test_cnn_images_classification() method
  
  def no_test_ffnn_images_classification(self):
    print()
    self.count = "{}{}".format("Standard-FFNN Non-Images Classification : ",  3)
    self.sfc.ffnn_non_images_classification()
  #End no_test_ffnn_non_images_classification() method()
  
  def no_test_ffnn_production_regression(self):
    print()
    self.count = "{}{}".format("Standard-FFNN Production Volumes/Rates Regression: ",  4)
    self.sfc.ffnn_production_regression()
    print()
  #End no_test_ffnn_production_regression() method()
  
  def tearDown(self):
    self.sfc = None
    print("Successfully tested", self.count, ".....ok")
  # End tearDown() method
# End ShaleDNNTest() Class()

# invoke test
main(verbosity=2)

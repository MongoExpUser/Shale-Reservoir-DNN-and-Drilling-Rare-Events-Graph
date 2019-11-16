/*
 * @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 * @License Ends
 *
 * ...Ecotert's ShaleReservoirApacheDrill.java  (released as open-source under MIT License) implements:
 *
 *  A class (ShaleReservoirApacheDrill()) that uses Apache Drill (schema-free SQL engine) for:
 *
 *  a) Accessing reservoir data from MongoDB using SQL
 *  a) Writing SQL queries against MongoDB document store
 *  b) ETL/building data pipeline from MongoDB with SQL
 *
 *  Note: The actions in (a), (b) and (c) above can be carried out interactively on an active (i.e. running or deployed):
 *       (1) Apache Drill Shell  - see: https://drill.apache.org/docs/configuring-the-drill-shell/
 *       (2) Apache Drill Web UI - see: https://drill.apache.org/docs/starting-the-web-ui/
 *
 *     The advantage of implementing the above actions in this Java class is that they allow interaction
 *     with MongoDB data store programmatically from within an application.
 */
       
import java.sql.*;
import java.sql.Time;
import java.sql.Date;
import java.util.List;
import java.sql.Types;
import java.util.Arrays;
import java.util.Random;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.sql.Connection;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.util.Collection;
import java.sql.SQLException;
import java.sql.DriverManager;
import java.sql.ResultSetMetaData;


public class ShaleReservoirApacheDrill
{
  //constructor
  public void ShaleReservoirApacheDrill()
  {

  }
  
  public void viewOutputData()
  {
    // in progress ... add remaining codes later ....
  }
  
  public void createCsvFileFromJson()
  {
    // in progress ... add remaining codes later ....
  }
  
  public Connection connectToMongoDB(String user, String password, String url, int port, String databasebName)
  {
    Connection connection = null;
    
    //connect
    try
    {
      // load mongodb JDBC driver and connect
      Class.forName("mongodb.jdbc.MongoDriver");
      String connectionString = "jdbc:mongodb://" + user + ":" + password + "@" + url + ":" + String.valueOf(port) + "/" + databasebName;
      connection = DriverManager.getConnection(connectionString);
      
      if(connection != null)
      {
        System.out.println("Successfully connected to MongoDB data store...");
      }
    }
    catch(Exception connectionError)
    {
        connectionError.printStackTrace();
    }

    return connection;
  }
  
  public void executeQueriesForDataPipeline()
  {
    // in progress ... add remaining codes later ....
  }
  
  public String combinedKeys(String [] inputKeys)
  {
    //define key variable, opening brackets, closing brackets and separators, with correct spaces & commas
    String  keys = "";
    String  separator =  ", ";
    String  openBracket = " (";
    String  closeBracket = ")";
        
    //then concatenate opening bracket, all keys, spaces, commas and close bracket
    keys = keys + openBracket;
        
    for(int index = 0; index < inputKeys.length; index++)
    {
      if(index < (inputKeys.length-1))
      {
                keys = keys + inputKeys[index] + separator;
      }
      else
      {
        keys = keys + inputKeys[index];
      }
    }
        
    keys = keys + closeBracket;
    
    return keys;
  }
  
  public double [][] reservoirDatasets(int numberOfDatapoints)
  {
    // in progress ... add remaining codes later ....
    double [] reservoirValuesOne = new double[numberOfDatapoints];
    double [] reservoirValuesTwo = new double[numberOfDatapoints];
    double [][] dataSet = {reservoirValuesOne, reservoirValuesTwo};
    return dataSet;
  }
  
  public String reservoirDataPipelineForAnalytics()
  {
    // in progress ... add remaining codes later ....
    String sQLQuery = "Query is okay..!";
    return sQLQuery;
  }
  
  public static void separator()
  {
    System.out.println(".....................................................................");
  }

  public static void main(String[] args) throws SQLException, ClassNotFoundException
  {
    //testing
    
    // in progress ... add remaining codes later ....
    
    String [] keys = new String[10];
    int keysLength =  keys.length;
    
    for(int index = 0; index < keysLength; index++)
    {
      keys[index] = "reservoir-key_" + String.valueOf(index);
    }
    
    //instantiate class and define all input and arguement variables
    ShaleReservoirApacheDrill reservoirDrill = new  ShaleReservoirApacheDrill();
    String user = "user";
    String password = "password";
    String url = "url";
    int port = 27017;
    String databasebName = "dbName";
        
    //start test
    System.out.println();
    separator();
    //connect to mongodb store
    Connection connection = reservoirDrill.connectToMongoDB(user, password, url, port, databasebName);
    separator();
    //confirm beginning of test
    System.out.println("Start drilling Reservoir 'Table/Collection' with Apache Drill....");
    reservoirDrill.executeQueriesForDataPipeline();
    separator();
    //close connection after drilling
    System.out.println("Stopped drilling Reservoir 'Table/Collection' with Apache Drill....");
    separator();
    
    try
    {
      if(connection != null)
      {
        connection.close();
        System.out.println("Connection closed....");
        separator();
      }
    }
    catch(Exception closeConnectionCError)
    {
        closeConnectionCError.printStackTrace();
    }
    
    //confirm reservoir keys
    System.out.print("Reservoir keys: ");
    System.out.println(Arrays.toString(keys));
    System.out.print("Confirm reservoir keys: ");
    System.out.println(reservoirDrill.combinedKeys(keys));
    separator();
    //build data pipeline
    System.out.println(reservoirDrill.reservoirDataPipelineForAnalytics());
    separator();
    System.out.println();
  }
}

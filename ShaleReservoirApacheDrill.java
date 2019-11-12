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
 *  Note: The actions in (a), (b) and (c) above can directly we carried out on a running/active/deployed:
 *       (1) Apache Drill Shell  - see: https://drill.apache.org/docs/configuring-the-drill-shell/
 *       (2) Apache Drill Web UI - see: https://drill.apache.org/docs/starting-the-web-ui/
 *
 *     The advantage of implementing the above actions in this Java class is that they allow interaction
 *     with MongoDB programmatically from within an application.
 */

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
  
  public void connectToMongoDB(String user, String password, String url, int port, String databasebName)
  {
    try
    {
      // load mongodb JDBC driver and connect
      Class.forName("mongodb.jdbc.MongoDriver");
      String connectionString = "jdbc:mongodb://" + user + ":" + password + "@" + url + ":" + String.valueOf(port) + "/" + databasebName;
      Connection connection = DriverManager.getConnection(connectionString);
      System.out.println("Successfully connected to MongoDB data store...");
      
    } catch(Exception connectionError)
    {
        connectionError.printStackTrace();
    }
  }
  
  public void executeQueriesForDataPipeline()
  {
    // in progress ... add remaining codes later ....
  }
  
  public String combinedKeys(String [] inputKeys)
  {
    //define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
    String  keys = "";
    String  seperator =  ", ";
    String  openBracket = " (";
    String  closeBracket = ")";
        
    //then concatenate opening bracket, all keys, spaces, commas and close bracket
    keys = keys + openBracket;
        
    for(int index = 0; index < inputKeys.length; index++)
    {
      if(index < (inputKeys.length-1))
      {
        keys = keys + inputKeys[index] + seperator;
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

  public static void main(String[] args) throws SQLException, ClassNotFoundException
  {
    //testing
    
    // in progress ... add remaining codes later ....
    
    //instantiate class and define all input and arguement variables
    ShaleReservoirApacheDrill reservoirDrill = new  ShaleReservoirApacheDrill();
    String user = "user";
    String password = "password";
    String url = "url";
    int port = 27017;
    String databasebName = "dbName";
    String connectionString = "jdbc:mongodb://" + user + ":" + password + "@" + url + ":" + String.valueOf(port) + "/" + databasebName;
    
    //start test
    System.out.println();
    System.out.println("..............................................");
    //connect to mongodb store
    reservoirDrill.connectToMongoDB(user, password, url, port, databasebName);
    System.out.print("Connected as: ");
    System.out.println(connectionString);
    System.out.println("..............................................");
    //confirm beginning of test
    System.out.println("Start drilling reservoir with Apache Drill....");
    System.out.println("..............................................");
    //confirm reservoir keys
    System.out.print("Reservoir keys: ");
    System.out.println(Arrays.toString(keys));
    System.out.print("Confirm reservoir keys: ");
    System.out.println(reservoirDrill.combinedKeys(keys));
    System.out.println("..............................................");
    //build data pipeline
    System.out.println(reservoirDrill.reservoirDataPipelineForAnalytics());
    System.out.println("..............................................");
    System.out.println();
  }
}

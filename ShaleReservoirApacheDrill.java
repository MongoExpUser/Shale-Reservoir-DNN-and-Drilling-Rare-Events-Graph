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
  
  public void connectToMongoDB(String url, String user, String password)
  {
    try
    {
      // load mongodb JDBC driver and connect
      Class.forName("mongodb.jdbc.MongoDriver");
      Connection connection = DriverManager.getConnection(url, user, password);
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
    // in progress ... add remaining codes later ....
    ShaleReservoirApacheDrill reservoirDrill = new  ShaleReservoirApacheDrill();
    
    //testing
    System.out.println();
    System.out.println("..............................................");
    System.out.println("Start drilling reservoir with Apache Drill....");
    System.out.println(reservoirDrill.reservoirDataPipelineForAnalytics());
    System.out.println("..............................................");
    System.out.println();
  }
}

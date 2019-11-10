/*/
 * @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 * @License Ends
 *
 *
 * ...Ecotert's ReservoirApacheDrill.java  (released as open-source under MIT License) implements:
 *
 *
 *  A class, ReservoirApacheDrill(), with Apache Drill (schema-free SQL engine) library for:
 *
 *  a) Accessing reservoir data from MySQL datastore,
 *  a) Writing queries against MySQL
 *  b) ETL and building data pipeline from MySQL
 *
 *
 */

import java.sql.*;
import java.lang.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Random;



public class ReservoirApacheDrill
{
  //constructor
  public void ReservoirApacheDrill()
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
  
  
  public Object connectToMysqlFromPython()
  {
    // in progress ... add remaining codes later ....
    
    Object obj = new Object();
    return obj;
  }
  
  public void executeSomeQueriesForDataPipeline()
  {
    // in progress ... add remaining codes later ....
  }
  
  
  public String combinedKeys()
  {
    // in progress ... add remaining codes later ....
    
    return "combinedKeys";
  }
  
  
  public void insertDataToReservoirTable()
  {
    // in progress ... add remaining codes later ....
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
    
    String sQLQuery = "Query is okay";
    return sQLQuery;
  }


  public static void main(String[] args) throws SQLException, ClassNotFoundException
  {
    ReservoirApacheDrill reservoirDrill = new  ReservoirApacheDrill();
    //testing
    System.out.println("Start drilling reservoir with Apache Drill....");
    System.out.println(reservoirDrill.reservoirDataPipelineForAnalytics());
    
    // in progress ... add remaining codes later ....
  }


}

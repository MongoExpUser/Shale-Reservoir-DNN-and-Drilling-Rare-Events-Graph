DROP PROCEDURE IF EXISTS PopulateReservoirTable;
CREATE PROCEDURE PopulateReservoirTable(IN loop_limit INT)
BEGIN
  DECLARE counter INT DEFAULT 0;
  DECLARE counter_limit INT DEFAULT loop_limit;
  SET @initial_time = NOW();
  -- --
  WHILE (counter < counter_limit) DO
  -- --
    INSERT INTO reservoir (Reservoir_ID,
                           Reservoir_Zone,
                           Avg_Deep_Resis_ohm_m,
                           Avg_GR_api,
                           Top_MD_ft,
                           Top_TVD_ft
                          )
    VALUES (1201 + counter,
            CONCAT("Upper-Yoho-", CAST(counter AS CHAR(22))),
            540.79 + FLOOR(RAND()*(10 - 5 + 1) + 5),
            25.22 + FLOOR( RAND()*(10 - 5 + 1) + 5),
            3446.90 + FLOOR(RAND()) ,
            3001.45 + FLOOR(RAND())
           );
    SET counter = counter + 1;
  -- --
  END WHILE;
  -- --
  SELECT CONCAT("Run Duration: ", CAST( ROUND(TIMESTAMPDIFF(SECOND, @initial_time, NOW()), 2 ) AS CHAR(22)), " seconds") AS run_duration;
END;

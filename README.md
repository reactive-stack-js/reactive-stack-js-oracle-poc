![reactive-stack-js](https://avatars0.githubusercontent.com/u/72337471?s=75)
## reactive-stack-js-oracle-poc

See [reactive-stack-js](https://github.com/reactive-stack-js) for more info.

This is an attempt at Oracle Change Data Capture (CDC) POC for those who may want to use Oracle instead of MongoDB, which is used in all reactive-stack-js packages.

In this POC, I am using [Docker](https://www.docker.com/) to run Oracle because... well, why not?

You can, of course, still use your own Oracle installation instead. Just skip all the Docker stuff below.

## Problem
__I am still unable to get this to work!__ :(

### Requirements
Well, [Docker](https://www.docker.com/).

And [NodeJS](https://nodejs.org/)

### Docker stuff

Go to [Oracle Database Enterprise Edition](https://hub.docker.com/_/oracle-database-enterprise-edition) and complete the "checkout". It's just a registration, it's free.

```cmd
docker pull store/oracle/database-enterprise:12.2.0.1
docker run -p 1521:1521 -v C:/git/github/reactive-stack-js-oracle-poc/oraclevolume:/ORCL -d -it --name oracle store/oracle/database-enterprise:12.2.0.1
```

Default pwd is: Oradoc_db1

```cmd
docker exec -it oracle bash
/u01/app/oracle/product/12.2.0/dbhome_1/bin/sqlplus / as sysdba
```

Follow the [Oracle CDC Client](https://streamsets.com/documentation/controlhub/latest/help/datacollector/UserGuide/Origins/OracleCDC.html) instructions.

```oracle
select name, open_mode from v$database;
```

If the command returns NOARCHIVELOG, continue with the following steps:
```oracle
shutdown immediate;
```
wait...

```oracle
startup mount;
```
wait...

```oracle
alter database archivelog;
alter database open read write;
```

Then:
```oracle
SELECT supplemental_log_data_min, supplemental_log_data_pk, supplemental_log_data_all FROM v$database;
```

If the command returns Yes or Implicit for all three columns, then supplemental logging is enabled.
Otherwise:
```oracle
ALTER SESSION SET CONTAINER=cdb$root;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
ALTER SYSTEM ARCHIVE LOG CURRENT;
```

Then:
```oracle
alter session set "_ORACLE_SCRIPT"=true;
CREATE USER root IDENTIFIED BY root;
GRANT create session, alter session, logmining, execute_catalog_role TO root;
GRANT select on GV_$DATABASE to root;
GRANT select on V_$LOGMNR_CONTENTS to root;
GRANT select on GV_$ARCHIVED_LOG to root;
GRANT select on "ROOT"."GLOB_LOCKS" TO root;

EXECUTE DBMS_LOGMNR_D.BUILD(OPTIONS=> DBMS_LOGMNR_D.STORE_IN_REDO_LOGS);

ALTER SESSION SET CONTAINER=cdb$root;
EXECUTE DBMS_LOGMNR_D.BUILD(OPTIONS=> DBMS_LOGMNR_D.STORE_IN_REDO_LOGS);

GRANT CONNECT, RESOURCE, DBA TO root;
GRANT CREATE SESSION TO root;
GRANT UNLIMITED TABLESPACE TO root;
GRANT CHANGE NOTIFICATION TO root;

GRANT SELECT ANY TRANSACTION TO root;
GRANT SELECT ANY DICTIONARY TO root;
GRANT CREATE SESSION TO root;
GRANT EXECUTE_CATALOG_ROLE TO root;

ALTER SYSTEM SET JOB_QUEUE_PROCESSES = 20;

CREATE TABLE "GLOB_LOCKS" (
	"GLOB_LOCK_ID" NUMBER NOT NULL ENABLE,
	"RES_NAME" VARCHAR2(40 BYTE),
	"MESSAGE" VARCHAR2(128 BYTE),
	CONSTRAINT "GLOB_LOCKS_PK" PRIMARY KEY ("GLOB_LOCK_ID")
);
INSERT INTO GLOB_LOCKS VALUES (1, 'yei', 'msg' );
```

### Oracle CDC
```cmd
yarn cdc
```
or
```cmd
node oracle.js
```
Then do something in your MySQL instance, create, modify or delete a row and you _should_ see messages describing those changes.

_But I still cannot get it to work!_ :(
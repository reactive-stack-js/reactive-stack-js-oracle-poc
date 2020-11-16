![reactive-stack-js](https://avatars0.githubusercontent.com/u/72337471?s=75)
## reactive-stack-js-oracle-poc

See [reactive-stack-js](https://github.com/reactive-stack-js) for more info.

This is an attempt at Oracle Change Data Capture (CDC) POC for those who may want to use Oracle instead of MongoDB, which is used in all reactive-stack-js packages.

In this POC, I am using [Docker](https://www.docker.com/) to run Oracle because... well, why not?

You can, of course, still use your own Oracle installation instead. Just skip all the Docker stuff below.

### Requirements
Well, [Docker](https://www.docker.com/).

And [NodeJS](https://nodejs.org/)

### Docker stuff

Go to [Oracle Database Enterprise Edition](https://hub.docker.com/_/oracle-database-enterprise-edition) and complete the "checkout". It's just a registration, it's free.

docker pull store/oracle/database-enterprise:12.2.0.1
docker run -p 1521:1521 -v C:/git/systools/fiddles/dbmirror/oraclevolume:/ORCL -d -it --name oracle store/oracle/database-enterprise:12.2.0.1

sys
Oradoc_db1

console:
docker exec -it oracle bash
PATH=$ORACLE_HOME/bin:$PATH
export PATH
source /home/oracle/.bashrc; sqlplus /nolog

or:
docker exec -it oracle bash
/u01/app/oracle/product/12.2.0/dbhome_1/bin/sqlplus / as sysdba

alter session set "_ORACLE_SCRIPT"=true;
CREATE USER root IDENTIFIED BY root;
GRANT CONNECT, RESOURCE, DBA TO root;
GRANT CREATE SESSION TO root;
GRANT UNLIMITED TABLESPACE TO root;
GRANT CHANGE NOTIFICATION TO root;

ALTER SYSTEM SET JOB_QUEUE_PROCESSES = 20;

CREATE TABLE "GLOB_LOCKS" (
	"GLOB_LOCK_ID" NUMBER NOT NULL ENABLE,
	"RES_NAME" VARCHAR2(40 BYTE),
	"MESSAGE" VARCHAR2(128 BYTE),
	CONSTRAINT "GLOB_LOCKS_PK" PRIMARY KEY ("GLOB_LOCK_ID")
);
INSERT INTO GLOB_LOCKS VALUES (1, 'yei', 'msg' );
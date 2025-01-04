# Overview

- This project explores two interconnected studies focused on database systems and their applications in healthcare data management. The first study investigates query processing in a data warehouse, while the second delves into transaction management in a distributed database management system (DDBMS). Both projects utilized datasets from SeriousMD, a telemedicine company, to design and optimize systems for real-world scenarios.

- This also includes technical report on each project. These technical reports details every aspect of the projects.
  - [Project 1 Report](/STADVDB_MCO1.pdf)
  - [Project 2 Report](/STADVDB-MCO2.pdf)

# Project 1: Data Warehouse

## Objectives

- Design and implement a data warehouse using a star schema.
- Perform Extract, Transform, Load (ETL) processes for data cleaning and preparation.
- Optimize query performance through partitioning and indexing.
- Utilize Tableau for Online Analytical Processing (OLAP) and data visualization.

## Implementation

1. Data Warehouse Design
   ![Database Model of the Warehouse](/DB-Model.png)
2. Extract, Transform, and Load (ETL) processes for data cleaning and preparation
   ![ETL Script](/ETL-Script.png)
3. Optimize query performance
   - Partitioning
     ![Partitioning](/Partitioning.png)
   - Indexing
     ![Indexing](/Indexing.png)
4. Data Visualization through online analytical processing (OLAP) approach using Tableau
   - ![Visualization](/Visualization.png)

# Project 2: Transaction Management in a Distributed Database Management System

## Objectives

- Develop a distributed database across three nodes with partial replication.
- Ensure consistency and concurrency control in a multi-user environment.
- Implement recovery mechanisms for node failures and crashes.

## Implementation

1. Distributed Database Design

   - Three-node architecture hosted on virtual machines.
   - Partial replication: A central node (Node 1) fully replicates data, while Nodes 2 and 3 handle regional data.
   - Schema: Denormalized for efficient operations.
     ![DBMS Setup](/DBMS-Setup.png)

2. Concurrency Control

   - Master-slave setup for write consistency.
   - Serializable isolation using locking mechanisms.
   - Asynchronous replication of changes to slave nodes.
     ![Concurrency Control](/Concurrency-Control.png)

3. Global Recovery Mechanism

   - Logs maintained for transactions across all nodes.
   - Recovery manager to replicate missed transactions and ensure consistency upon node recovery.
     ![Replication](/Replication.png)

4. Web Application
   - Node.js-based app for CRUD operations and transaction testing.
   - Simulated node failures and redirection of queries to active nodes.
     ![Application](/Application.png)

# Tools and Technologies

- Programming Languages: Python, SQL, JavaScript (Node.js).
- Database Management Systems: MySQL.
- Data Visualization: Tableau.
- Frameworks: Pandas, SQLAlchemy.
- Infrastructure: Virtual Machines on DLSU CCS Cloud.

# Authors

- Sealtiel B. Dy
- Kyle Carlo C. Lasala
- Maria Monica Manlises
- Camron Evan C. Ong

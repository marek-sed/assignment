# Assignement Full Stack

Interview assignment

## Getting Started

 * solution is split into two parts
 * first is server/initData.js which fetches parses and stores data
 * second is Express backend which loads the tree and stores it

### Prerequisites

  * Node 9.5.0 (used for development)
  * Postgresql DB, set your credentials in .env

### Installing

  * git clone https://github.com/marek-sed/assignment.git
  * npm i && cd client npm i
  * node server/initData.js (loads data to db)

## Running
  * create .env file 
     PGUSER=
     PGHOST=
     PGPASSWORD=
     PGDATABASE=
     PGPORT=

  * development version - npm start 
  * production - cd client && npm run build && cd .. && npm run serve

## Authors

* **Marek Sedlacek**

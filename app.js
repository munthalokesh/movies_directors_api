const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());

const intializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server started successfull");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
intializeServer();
//get movie name
app.get("/movies/", async (request, response) => {
  const query = `SELECT movie_name FROM movie ORDER BY movie_id;`;
  let dbResponse = await db.all(query);
  response.send(
    dbResponse.map((eachMovie) => {
      return { movieName: eachMovie.movie_name };
    })
  );
});

//post a movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const query = `INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES(${directorId},"${movieName}","${leadActor}")`;
  await db.run(query);
  response.send("Movie Successfully Added");
});

//get a particular movie api

let convertToObject = (responseObj) => {
  return {
    movieId: responseObj.movie_id,
    directorId: responseObj.director_id,
    movieName: responseObj.movie_name,
    leadActor: responseObj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `SELECT * FROM movie
    WHERE movie_id=${movieId};`;
  const dbResponse = await db.get(query);

  response.send(convertToObject(dbResponse));
});

//updating moviedetails

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const query = `UPDATE movie SET 
  director_id=${directorId},
  movie_name="${movieName}",
  lead_actor="${leadActor}"
  WHERE movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Details Updated");
});

//removing movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(query);
  response.send("Movie Removed");
});

//get all directors from director table

app.get("/directors/", async (request, response) => {
  const query = "SELECT * FROM director ORDER BY director_id";
  let dbResponse = await db.all(query);
  response.send(
    dbResponse.map((details) => {
      return {
        directorId: details.director_id,
        directorName: details.director_name,
      };
    })
  );
});

//get movies directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  let dbResponse = await db.all(query);
  console.log(dbResponse);
  response.send(
    dbResponse.map((details) => {
      return {
        movieName: details.movie_name,
      };
    })
  );
});

module.exports = app;

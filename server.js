const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

const DB_FILE = "./db.json";
const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.get("/movies", (req, res) => {
  const db = loadDB();
  res.json(db.movies);
});

app.get("/events", (req, res) => {
  const db = loadDB();
  res.json(db.events);
});

app.get("/premieres", (req, res) => {
  const db = loadDB();
  res.json(db.premieres);
});

app.post("/book", (req, res) => {
  const { movieId, theatreId, showId, seats } = req.body;
  const db = loadDB();

  const movie = db.movies.find((m) => m.id === movieId);
  if (!movie) return res.status(404).json({ message: "Movie not found" });

  const theatre = movie.theatres.find((t) => t.id === theatreId);
  if (!theatre) return res.status(404).json({ message: "Theatre not found" });

  const show = theatre.shows.find((s) => s.showId === showId);
  if (!show) return res.status(404).json({ message: "Show not found" });

  seats.forEach((s) => {
    if (!show.seats[s.type].bookedSeats.includes(s.seat)) {
      show.seats[s.type].bookedSeats.push(s.seat);
    }
  });

  saveDB(db);

  const bookingId = Math.floor(Math.random() * 900000) + 100000;
  res.json({ message: "Booking successful", bookingId });
});

app.get("/image-proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ message: "URL missing" });

  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const base64 =
      "data:" +
      response.headers.get("content-type") +
      ";base64," +
      buffer.toString("base64");

    res.json({ base64 });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch image" });
  }
});
app.get("/movies/:id", (req, res) => {
  const db = loadDB();
  const movieId = parseInt(req.params.id);
  const movie = db.movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }
  res.json(movie);
});


app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

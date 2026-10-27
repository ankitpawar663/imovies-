require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Movie, Cinema, Show, Booking } = require('../src/models');

const M = (title, genre, language, duration, rating, status, director, description) => ({ title, genre, language, duration, rating, status, director, description, cast: ['Lead Actor', 'Supporting Actor'], releaseDate: new Date(status === 'comingSoon' ? Date.now() + 30 * 864e5 : Date.now() - 20 * 864e5) });
const movies = [
  M('Midnight Express', ['Thriller', 'Action'], 'English', 118, 8.1, 'nowShowing', 'A. Rao', 'A night train, a stolen ledger and one hour to stop it.'),
  M('Monsoon Letters', ['Romance', 'Drama'], 'Hindi', 132, 7.8, 'nowShowing', 'S. Iyer', 'Two strangers exchange letters across one rainy season.'),
  M('Orbit Zero', ['Sci-Fi', 'Adventure'], 'English', 142, 8.6, 'nowShowing', 'J. Clarke', 'A crew drifting past the edge of the map.'),
  M('The Last Bazaar', ['Comedy'], 'Hindi', 124, 7.2, 'nowShowing', 'P. Mehta', 'A family market faces its funniest crisis yet.'),
  M('Iron Delta', ['Action'], 'English', 126, 7.5, 'nowShowing', 'K. Novak', 'A river-port heist goes wrong.'),
  M('Lantern Hill', ['Horror', 'Mystery'], 'English', 105, 7.0, 'nowShowing', 'E. Frost', 'The village lights go out one by one.'),
  M('Kaveri', ['Drama'], 'Tamil', 150, 8.3, 'nowShowing', 'R. Nair', 'A farmer, a river and a promise.'),
  M('Neon Harbor', ['Sci-Fi', 'Thriller'], 'English', 112, 7.9, 'comingSoon', 'L. Park', 'A detective in a flooded future city.'),
  M('Summer of Kites', ['Family', 'Comedy'], 'Hindi', 110, 7.4, 'comingSoon', 'D. Shah', 'One summer, one rooftop, one kite contest.'),
  M('Echo Valley', ['Adventure'], 'Telugu', 138, 8.0, 'comingSoon', 'V. Reddy', 'A map found in an old radio.'),
];
const cinemas = [
  { name: 'IMovies Central', location: 'Bhopal', address: 'MP Nagar Zone 1', screens: [{ name: 'Screen 1', rows: 8, seatsPerRow: 12 }, { name: 'Screen 2', rows: 6, seatsPerRow: 10 }] },
  { name: 'IMovies Lakeview', location: 'Bhopal', address: 'Upper Lake Road', screens: [{ name: 'Screen 1', rows: 7, seatsPerRow: 10 }, { name: 'Gold', rows: 5, seatsPerRow: 8 }] },
  { name: 'IMovies Metro', location: 'Indore', address: 'Vijay Nagar', screens: [{ name: 'Screen 1', rows: 8, seatsPerRow: 14 }] },
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies');
  await Promise.all([User, Movie, Cinema, Show, Booking].map((m) => m.deleteMany({})));
  await User.create([
    { name: 'Admin', email: 'admin@imovies.com', role: 'admin', passwordHash: await bcrypt.hash('Admin@123', 10) },
    { name: 'Demo User', email: 'user@imovies.com', passwordHash: await bcrypt.hash('User@1234', 10) },
  ]);
  const ms = await Movie.create(movies), cs = await Cinema.create(cinemas), shows = [];
  ms.filter((m) => m.status === 'nowShowing').forEach((m, i) => { for (let d = 0; d < 5; d++) cs.forEach((c, ci) => { const sc = c.screens[(i + d) % c.screens.length]; [11, 15, 20].forEach((h, hi) => {
    const t = new Date(); t.setDate(t.getDate() + d); t.setHours(h, 30, 0, 0);
    if ((i + ci + hi) % 2 === 0) shows.push({ movieId: m._id, cinemaId: c._id, screenName: sc.name, rows: sc.rows, seatsPerRow: sc.seatsPerRow, showDate: t, ticketPrice: [150, 200, 250, 350][(hi + ci) % 4] }); }); }); });
  await Show.create(shows);
  console.log(`Seeded ${ms.length} movies, ${cs.length} cinemas, ${shows.length} shows, 2 users`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

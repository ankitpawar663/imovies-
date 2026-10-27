const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
process.env.JWT_SECRET = 'test-secret'; process.env.NODE_ENV = 'test';
const app = require('../src/app');
const { Movie, Cinema, Show } = require('../src/models');
let mongod, show, tokenA, tokenB;
const reg = async (n) => (await request(app).post('/api/auth/register').send({ name: n, email: n + '@t.com', password: 'password1' })).body.data.token;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create(); await mongoose.connect(mongod.getUri());
  const m = await Movie.create({ title: 'T', duration: 100 }); const c = await Cinema.create({ name: 'C', location: 'L' });
  show = await Show.create({ movieId: m._id, cinemaId: c._id, screenName: 'S1', rows: 5, seatsPerRow: 10, ticketPrice: 100, showDate: new Date(Date.now() + 864e5) });
  tokenA = await reg('a'); tokenB = await reg('b');
});
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });
const book = (t, seats) => request(app).post('/api/bookings').set('Authorization', 'Bearer ' + t).send({ showId: show._id, seats });

test('rejects bad login and unauthenticated booking', async () => {
  expect((await request(app).post('/api/auth/login').send({ email: 'a@t.com', password: 'wrong' })).status).toBe(401);
  expect((await request(app).post('/api/bookings').send({})).status).toBe(401);
});
test('non-admin cannot access admin routes', async () => { expect((await request(app).get('/api/admin/stats').set('Authorization', 'Bearer ' + tokenA)).status).toBe(403); });
test('register ignores client-supplied role', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'x', email: 'x@t.com', password: 'password1', role: 'admin' }); expect(r.body.data.user.role).toBe('user');
});
test('concurrent bookings of the same seat: exactly one succeeds', async () => {
  const [r1, r2] = await Promise.all([book(tokenA, ['A1', 'A2']), book(tokenB, ['A2', 'A3'])]);
  expect([r1.status, r2.status].sort()).toEqual([201, 409]);
});
test('invalid seat rejected; cancel releases seats', async () => {
  expect((await book(tokenA, ['Z99'])).status).toBe(400);
  const ok = await book(tokenA, ['B1']); expect(ok.status).toBe(201);
  expect((await book(tokenB, ['B1'])).status).toBe(409);
  const ref = ok.body.data.bookingReference;
  expect((await request(app).get('/api/bookings/' + ref).set('Authorization', 'Bearer ' + tokenB)).status).toBe(404); // ownership
  expect((await request(app).post(`/api/bookings/${ref}/cancel`).set('Authorization', 'Bearer ' + tokenA)).status).toBe(200);
  expect((await book(tokenB, ['B1'])).status).toBe(201);
});

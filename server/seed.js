require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Movie, Theatre, Show, Seat } = require('./models');

const art = (title, width, height, firstColor, secondColor) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${firstColor}'/><stop offset='1' stop-color='${secondColor}'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' fill='white' font-family='sans-serif' font-size='${Math.round(width / 12)}' font-weight='700' text-anchor='middle'>${title}</text></svg>`,
  );

const movie = (title, colors, details) => ({
  title,
  poster: art(title, 400, 600, ...colors),
  cover: art(title, 1400, 500, ...colors),
  releaseDate: new Date(),
  ...details,
});

const movies = [
  movie('Midnight Express Road', ['#1b1b3a', '#d9402b'], {
    genre: ['Thriller'], language: 'English', duration: 118, rating: 8.1, ageRating: 'U/A 16+',
    director: 'Maya Fernandes', cast: ['Arjun Rao', 'Jade Miles', 'Tom Hale'],
    description: 'A night-shift cab driver takes one late call, and by sunrise he is the only person who knows where a missing train went.',
  }),
  movie('Monsoon Letters', ['#2a5d77', '#f5a935'], {
    genre: ['Drama', 'Romance'], language: 'Hindi', duration: 132, rating: 7.8, ageRating: 'U',
    director: 'Pooja Sen', cast: ['Priya Sen', 'Karan Verma', 'Asha Nair'],
    description: 'Two strangers swap letters through one long rainy season, unaware they live on the same lane.',
  }),
  movie('Robot Kitchen', ['#3b1d5c', '#4cb782'], {
    genre: ['Comedy', 'Family'], language: 'English', duration: 96, rating: 7.2, ageRating: 'U',
    director: 'Leo Park', cast: ['Lena Ortiz', 'Sam Wu'],
    description: 'A restaurant run by machines learns to improvise when its head chef unit goes offline on opening night.',
  }),
  movie('Last Bench Gang', ['#7a1f3d', '#f5a935'], {
    genre: ['Comedy', 'Drama'], language: 'Hindi', duration: 140, rating: 6.9, ageRating: 'A',
    director: 'Imran Qadri', cast: ['Vikas Jain', 'Rohit Soni'],
    description: 'Old college friends reunite for a wedding and unpack ten years of unsaid things.',
  }),
  movie('Sitaare Zameen Par', ['#176b87', '#f4a340'], {
    genre: ['Comedy', 'Drama'], language: 'Hindi', duration: 155, rating: 7.5, ageRating: 'U',
    director: 'R. S. Prasanna', cast: ['Aamir Khan', 'Genelia Deshmukh'],
    description: 'A basketball coach discovers a new sense of purpose while guiding a team of determined players.',
  }),
  movie('Chhaava', ['#8c2d22', '#d79b43'], {
    genre: ['Action', 'Drama'], language: 'Hindi', duration: 161, rating: 7.4, ageRating: 'U/A 16+',
    director: 'Laxman Utekar', cast: ['Vicky Kaushal', 'Rashmika Mandanna'],
    description: 'A historical action drama following the courage and legacy of Chhatrapati Sambhaji Maharaj.',
  }),
  movie('Pushpa 2: The Rule', ['#6c261e', '#cf7128'], {
    genre: ['Action', 'Crime'], language: 'Telugu', duration: 200, rating: 7.2, ageRating: 'U/A 16+',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    description: 'Pushpa returns to face new rivals as his influence expands beyond the forest.',
  }),
  movie('Kalki 2898 AD', ['#13253c', '#a94f45'], {
    genre: ['Action', 'Science Fiction'], language: 'Telugu', duration: 181, rating: 7.1, ageRating: 'U/A 13+',
    director: 'Nag Ashwin', cast: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan'],
    description: 'A bounty hunter is drawn into a journey tied to a child who could change a distant future.',
  }),
  movie('Stree 2', ['#184c43', '#a33a58'], {
    genre: ['Comedy', 'Horror'], language: 'Hindi', duration: 149, rating: 7.0, ageRating: 'U/A 16+',
    director: 'Amar Kaushik', cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    description: 'The people of Chanderi face a new supernatural threat and reunite to protect their town.',
  }),
  movie('Jawan', ['#752f35', '#d39048'], {
    genre: ['Action', 'Thriller'], language: 'Hindi', duration: 169, rating: 7.0, ageRating: 'U/A 16+',
    director: 'Atlee', cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi'],
    description: 'A determined vigilante leads a crew through a series of high-stakes missions.',
  }),
  movie('12th Fail', ['#24503f', '#c58a48'], {
    genre: ['Biography', 'Drama'], language: 'Hindi', duration: 147, rating: 8.7, ageRating: 'U/A 13+',
    director: 'Vidhu Vinod Chopra', cast: ['Vikrant Massey', 'Medha Shankar'],
    description: 'A young student rebuilds his life and pursues a place in the civil services.',
  }),
  movie('Laapataa Ladies', ['#547345', '#d8a455'], {
    genre: ['Comedy', 'Drama'], language: 'Hindi', duration: 122, rating: 8.1, ageRating: 'U/A 13+',
    director: 'Kiran Rao', cast: ['Nitanshi Goel', 'Pratibha Ranta', 'Sparsh Shrivastava'],
    description: 'A mistaken identity on a train sends two young brides onto unexpected new paths.',
  }),
  movie('RRR', ['#752c1d', '#d49d45'], {
    genre: ['Action', 'Drama'], language: 'Telugu', duration: 187, rating: 7.8, ageRating: 'U/A 16+',
    director: 'S. S. Rajamouli', cast: ['N. T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt'],
    description: 'Two fierce revolutionaries form an unexpected bond during the struggle for independence.',
  }),
  movie('K.G.F: Chapter 2', ['#363334', '#b77c40'], {
    genre: ['Action', 'Crime'], language: 'Kannada', duration: 168, rating: 8.2, ageRating: 'U/A 16+',
    director: 'Prashanth Neel', cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon'],
    description: 'Rocky faces powerful enemies as he fights to hold on to the Kolar Gold Fields.',
  }),
  movie('Baahubali 2: The Conclusion', ['#304b48', '#c78a45'], {
    genre: ['Action', 'Fantasy'], language: 'Telugu', duration: 167, rating: 8.2, ageRating: 'U/A 13+',
    director: 'S. S. Rajamouli', cast: ['Prabhas', 'Rana Daggubati', 'Anushka Shetty'],
    description: 'A warrior uncovers the truth behind a kingdom, a family betrayal, and a legendary question.',
  }),
  movie('Animal', ['#49353b', '#a64c35'], {
    genre: ['Action', 'Crime'], language: 'Hindi', duration: 201, rating: 6.2, ageRating: 'A',
    director: 'Sandeep Reddy Vanga', cast: ['Ranbir Kapoor', 'Anil Kapoor', 'Rashmika Mandanna'],
    description: 'A volatile family reunion spirals into a sprawling story of loyalty and revenge.',
  }),
  movie('Devara: Part 1', ['#124f5d', '#ad593a'], {
    genre: ['Action', 'Drama'], language: 'Telugu', duration: 178, rating: 6.4, ageRating: 'U/A 16+',
    director: 'Koratala Siva', cast: ['N. T. Rama Rao Jr.', 'Saif Ali Khan', 'Janhvi Kapoor'],
    description: 'A coastal community is shaken by a conflict that tests one family across generations.',
  }),
  movie('Salaar: Part 1 - Ceasefire', ['#243346', '#9c453c'], {
    genre: ['Action', 'Thriller'], language: 'Telugu', duration: 175, rating: 6.5, ageRating: 'A',
    director: 'Prashanth Neel', cast: ['Prabhas', 'Prithviraj Sukumaran', 'Shruti Haasan'],
    description: 'Two friends are pulled into a violent power struggle in a city ruled by rival factions.',
  }),
  movie('Bhool Bhulaiyaa 3', ['#3d2850', '#c07d36'], {
    genre: ['Comedy', 'Horror'], language: 'Hindi', duration: 158, rating: 5.8, ageRating: 'U/A 13+',
    director: 'Anees Bazmee', cast: ['Kartik Aaryan', 'Vidya Balan', 'Madhuri Dixit'],
    description: 'A haunted palace, a disputed inheritance, and two mysterious spirits fuel a new comedy of errors.',
  }),
];

const theatres = [
  { name: 'Galaxy Cinemas', city: 'Raipur', location: 'Civil Lines', screens: 3 },
  { name: 'Starlight Multiplex', city: 'Raipur', location: 'Telibandha', screens: 2 },
  { name: 'Lake View Cinemas', city: 'Bhopal', location: 'MP Nagar', screens: 3 },
  { name: 'City Screens', city: 'Bhopal', location: 'New Market', screens: 2 },
];

async function ensureShow(movieRecord, theatreRecord, movieIndex, theatreIndex) {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1 + (movieIndex % 3));
  startsAt.setHours([13, 18, 21][movieIndex % 3], 0, 0, 0);

  const existingShow = await Show.findOne({
    movie: movieRecord._id,
    theatre: theatreRecord._id,
    startsAt,
  });

  if (existingShow) return false;

  const show = await Show.create({
    movie: movieRecord._id,
    theatre: theatreRecord._id,
    screen: (theatreIndex % theatreRecord.screens) + 1,
    startsAt,
    price: 180 + (theatreIndex % 2) * 40,
  });
  const seats = 'ABCDEFGH'.split('').flatMap((row) =>
    Array.from({ length: 10 }, (_, index) => ({ show: show._id, label: `${row}${index + 1}` })),
  );
  await Seat.insertMany(seats);
  return true;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  await User.updateOne(
    { email: 'admin@imovies.com' },
    { $setOnInsert: { name: 'Admin', email: 'admin@imovies.com', password: adminPassword, role: 'admin' } },
    { upsert: true },
  );
  await User.updateOne(
    { email: 'user@imovies.com' },
    { $setOnInsert: { name: 'Sarah', email: 'user@imovies.com', password: userPassword } },
    { upsert: true },
  );

  const movieRecords = await Promise.all(
    movies.map((details) =>
      Movie.findOneAndUpdate(
        { title: details.title },
        { $setOnInsert: details },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );
  const theatreRecords = await Promise.all(
    theatres.map((details) =>
      Theatre.findOneAndUpdate(
        { name: details.name, city: details.city },
        { $setOnInsert: details },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  let addedShows = 0;
  for (const [movieIndex, movieRecord] of movieRecords.entries()) {
    for (const [theatreIndex, theatreRecord] of theatreRecords.entries()) {
      if (await ensureShow(movieRecord, theatreRecord, movieIndex, theatreIndex)) addedShows += 1;
    }
  }

  console.log(`Seeded ${movies.length} movies and ${addedShows} future shows; existing records were preserved.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
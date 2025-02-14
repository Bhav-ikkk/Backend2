// scripts/insertEvents.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/event.model.js'; // Corrected path

dotenv.config(); // Loads environment variables

// Log MongoDB URI to verify it's being loaded correctly
console.log("MongoDB URI:", process.env.MONGO_URI);

// Events data to be inserted
const events = [
  { name: "Dance (Solo)", description: "A solo dance competition.", price: 200, category: "Dance", isFeatured: false, date: new Date(), location: "Auditorium", tags: ["dance"], organizer: "Event Org" },
  { name: "Dance (Duo)", description: "A duo dance competition.", price: 300, category: "Dance", isFeatured: false, date: new Date(), location: "Auditorium", tags: ["dance"], organizer: "Event Org" },
  { name: "Dance (Group)", description: "A group dance competition.", price: 500, category: "Dance", isFeatured: false, date: new Date(), location: "Auditorium", tags: ["dance"], organizer: "Event Org" },
  { name: "Defeat the Defect", description: "Solve the given challenges.", price: 100, category: "Competition", isFeatured: false, date: new Date(), location: "Room 101", tags: ["competition"], organizer: "Event Org" },
  { name: "Master Chef", description: "Showcase your cooking skills.", price: 200, category: "Cooking", isFeatured: false, date: new Date(), location: "Cafeteria", tags: ["cooking"], organizer: "Event Org" },
  { name: "Project Competition (S/W)", description: "Software project competition.", price: 500, category: "Technology", isFeatured: false, date: new Date(), location: "Lab A", tags: ["technology"], organizer: "Event Org" },
  { name: "Project Competition (H/W)", description: "Hardware project competition.", price: 500, category: "Technology", isFeatured: false, date: new Date(), location: "Lab B", tags: ["technology"], organizer: "Event Org" },
  { name: "Poster Making Competition", description: "Create posters on given topics.", price: 200, category: "Art", isFeatured: false, date: new Date(), location: "Art Room", tags: ["art"], organizer: "Event Org" },
  { name: "Debate Competition", description: "Engage in debates on various topics.", price: 100, category: "Debate", isFeatured: false, date: new Date(), location: "Debate Hall", tags: ["debate"], organizer: "Event Org" },
  { name: "Pharm - Model & Poster Competition", description: "Pharmacy model and poster competition.", price: 250, category: "Pharmacy", isFeatured: false, date: new Date(), location: "Pharmacy Room", tags: ["pharmacy"], organizer: "Event Org" },
  { name: "Codeology", description: "Coding competition for enthusiasts.", price: 100, category: "Coding", isFeatured: false, date: new Date(), location: "Coding Lab", tags: ["coding"], organizer: "Event Org" },
  { name: "Tic Tac Toe", description: "Play and compete in Tic Tac Toe.", price: 50, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "Blind Coding", description: "Coding competition without screen display.", price: 100, category: "Coding", isFeatured: false, date: new Date(), location: "Coding Lab", tags: ["coding"], organizer: "Event Org" },
  { name: "Bollywood Bonanza", description: "Bollywood-themed event.", price: 200, category: "Entertainment", isFeatured: false, date: new Date(), location: "Main Hall", tags: ["entertainment"], organizer: "Event Org" },
  { name: "Science Model Competition (School)", description: "Science model competition for school students.", price: 100, category: "Science", isFeatured: false, date: new Date(), location: "Science Lab", tags: ["science"], organizer: "Event Org" },
  { name: "Brand Quiz", description: "Quiz competition on branding.", price: 200, category: "Quiz", isFeatured: false, date: new Date(), location: "Quiz Room", tags: ["quiz"], organizer: "Event Org" },
  { name: "Go-Cart", description: "Go-cart racing event.", price: 100, category: "Racing", isFeatured: false, date: new Date(), location: "Race Track", tags: ["racing"], organizer: "Event Org" },
  { name: "Football 7-a-side", description: "7-a-side football tournament.", price: 500, category: "Sports", isFeatured: false, date: new Date(), location: "Football Field", tags: ["sports"], organizer: "Event Org" },
  { name: "Scavenger Hunt", description: "Engage in a fun scavenger hunt.", price: 150, category: "Adventure", isFeatured: false, date: new Date(), location: "Outdoor", tags: ["adventure"], organizer: "Event Org" },
  { name: "Snake & Ladder", description: "Play and compete in Snake & Ladder.", price: 50, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "RoboRace", description: "Race your robots.", price: 500, category: "Technology", isFeatured: false, date: new Date(), location: "Technology Lab", tags: ["technology"], organizer: "Event Org" },
  { name: "Kabaddi", description: "Kabaddi tournament.", price: 1100, category: "Sports", isFeatured: false, date: new Date(), location: "Sports Ground", tags: ["sports"], organizer: "Event Org" },
  { name: "Volleyball", description: "Volleyball tournament.", price: 700, category: "Sports", isFeatured: false, date: new Date(), location: "Volleyball Court", tags: ["sports"], organizer: "Event Org" },
  { name: "Arm Wrestling", description: "Arm wrestling competition.", price: 500, category: "Sports", isFeatured: false, date: new Date(), location: "Sports Room", tags: ["sports"], organizer: "Event Org" },
  { name: "10 Hours Hackathon", description: "10-hour coding hackathon.", price: 500, category: "Coding", isFeatured: false, date: new Date(), location: "Coding Lab", tags: ["coding"], organizer: "Event Org" },
  { name: "Beat the Streat (Rock Band)", description: "Rock band competition.", price: 1000, category: "Music", isFeatured: false, date: new Date(), location: "Main Stage", tags: ["music"], organizer: "Event Org" },
  { name: "Beat the Streat (Singing)", description: "Singing competition.", price: 200, category: "Music", isFeatured: false, date: new Date(), location: "Main Stage", tags: ["music"], organizer: "Event Org" },
  { name: "Rangmanch (Cyber Sentinel)", description: "Cyber security-themed event.", price: 500, category: "Technology", isFeatured: false, date: new Date(), location: "Auditorium", tags: ["technology"], organizer: "Event Org" },
  { name: "Open Mic", description: "Open mic for talents.", price: 200, category: "Entertainment", isFeatured: false, date: new Date(), location: "Main Hall", tags: ["entertainment"], organizer: "Event Org" },
  { name: "Sketch Your Imagination", description: "Sketching competition.", price: 100, category: "Art", isFeatured: false, date: new Date(), location: "Art Room", tags: ["art"], organizer: "Event Org" },
  { name: "Nutraceutical Food Exhibition", description: "Exhibition on nutraceutical foods.", price: 500, category: "Exhibition", isFeatured: false, date: new Date(), location: "Exhibition Hall", tags: ["exhibition"], organizer: "Event Org" },
  { name: "Case Writing Competition", description: "Case writing competition.", price: 200, category: "Writing", isFeatured: false, date: new Date(), location: "Writing Room", tags: ["writing"], organizer: "Event Org" },
  { name: "Mehandi Making", description: "Mehandi making competition.", price: 100, category: "Art", isFeatured: false, date: new Date(), location: "Art Room", tags: ["art"], organizer: "Event Org" },
  { name: "Jenga Block", description: "Play and compete in Jenga.", price: 50, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "Antakshri Competition", description: "Sing in the Antakshri competition.", price: 250, category: "Entertainment", isFeatured: false, date: new Date(), location: "Main Hall", tags: ["entertainment"], organizer: "Event Org" },
  { name: "Chess", description: "Chess competition.", price: 600, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "Linefollower", description: "Robot line-following competition.", price: 500, category: "Technology", isFeatured: false, date: new Date(), location: "Tech Lab", tags: ["technology"], organizer: "Event Org" },
  { name: "RoboSoccer", description: "Soccer game with robots.", price: 500, category: "Technology", isFeatured: false, date: new Date(), location: "Tech Lab", tags: ["technology"], organizer: "Event Org" },
  { name: "Tech Escape Room", description: "Solve tech-based puzzles.", price: 100, category: "Game", isFeatured: false, date: new Date(), location: "Room 102", tags: ["game"], organizer: "Event Org" },
  { name: "Best Out of Waste", description: "Create something useful from waste materials.", price: 100, category: "Art", isFeatured: false, date: new Date(), location: "Art Room", tags: ["art"], organizer: "Event Org" },
  { name: "Ad Mad Show", description: "Ad making competition.", price: 500, category: "Entertainment", isFeatured: false, date: new Date(), location: "Main Stage", tags: ["entertainment"], organizer: "Event Org" },
  { name: "CAD Camp", description: "CAD design competition.", price: 100, category: "Technology", isFeatured: false, date: new Date(), location: "Tech Lab", tags: ["technology"], organizer: "Event Org" },
  { name: "Ramp Walk (Solo)", description: "Solo ramp walk competition.", price: 250, category: "Fashion", isFeatured: false, date: new Date(), location: "Main Stage", tags: ["fashion"], organizer: "Event Org" },
  { name: "Ramp Walk (Duo)", description: "Duo ramp walk competition.", price: 500, category: "Fashion", isFeatured: false, date: new Date(), location: "Main Stage", tags: ["fashion"], organizer: "Event Org" },
  { name: "Live Painting & Exhibition", description: "Live painting session and exhibition.", price: 200, category: "Art", isFeatured: false, date: new Date(), location: "Art Room", tags: ["art"], organizer: "Event Org" },
  { name: "Think Tank", description: "Innovative thinking competition.", price: 200, category: "Technology", isFeatured: false, date: new Date(), location: "Room 103", tags: ["technology"], organizer: "Event Org" },
  { name: "HackTrail", description: "Trail-based hacking competition.", price: 200, category: "Coding", isFeatured: false, date: new Date(), location: "Coding Lab", tags: ["coding"], organizer: "Event Org" },
  { name: "Urban Planning", description: "Urban planning competition.", price: 200, category: "Competition", isFeatured: false, date: new Date(), location: "Room 104", tags: ["competition"], organizer: "Event Org" },
  { name: "Code Algo", description: "Algorithm coding competition.", price: 200, category: "Coding", isFeatured: false, date: new Date(), location: "Coding Lab", tags: ["coding"], organizer: "Event Org" },
  { name: "Cricket", description: "Cricket tournament.", price: 1100, category: "Sports", isFeatured: false, date: new Date(), location: "Cricket Ground", tags: ["sports"], organizer: "Event Org" },
  { name: "Rifle Shooting", description: "Rifle shooting competition.", price: 50, category: "Sports", isFeatured: false, date: new Date(), location: "Shooting Range", tags: ["sports"], organizer: "Event Org" },
  { name: "CITRONICS Reel Making", description: "Create a reel for CITRONICS.", price: 150, category: "Film", isFeatured: false, date: new Date(), location: "Media Room", tags: ["film"], organizer: "Event Org" },
  { name: "CITRONICS Photography", description: "Photography competition for CITRONICS.", price: 150, category: "Photography", isFeatured: false, date: new Date(), location: "Photography Room", tags: ["photography"], organizer: "Event Org" },
  { name: "Gully Cricket", description: "Gully cricket tournament.", price: 250, category: "Sports", isFeatured: false, date: new Date(), location: "Sports Ground", tags: ["sports"], organizer: "Event Org" },
  { name: "DJ Evening", description: "DJ performance event.", price: 100, category: "Entertainment", isFeatured: false, date: new Date(), location: "Main Hall", tags: ["entertainment"], organizer: "Event Org" },
  { name: "Balloon Game", description: "A fun balloon game.", price: 30, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "1 Minute Game", description: "Play quick challenges in one minute.", price: 30, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "Roll the Ball", description: "A ball rolling competition.", price: 30, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
  { name: "Hand Leg Challenge", description: "Compete in the hand-leg challenge.", price: 100, category: "Game", isFeatured: false, date: new Date(), location: "Game Room", tags: ["game"], organizer: "Event Org" },
];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await Event.insertMany(events);
    console.log('Events inserted successfully!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error inserting events:', err);
    mongoose.connection.close();
  });

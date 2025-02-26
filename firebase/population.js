import { db } from "./firebase";
import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, arrayUnion, writeBatch, increment } from "firebase/firestore";
import { Club, Team, Player} from "@/constants/Types";

const tournamentsRef = collection(db, "tournaments");
const stagesRef = collection(db, "stages");
const clubsRef = collection(db, "clubs");
const playersRef = collection(db, "players");
const teamsRef = collection(db, "teams");
const matchesRef = collection(db, "matches");
const postsRef = collection(db, "posts");
const getCollectionRef = (name) => collection(db, name);

const resetPlayers = async () => {
  try {
    const snapshot = await getDocs(teamsRef);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { rank: 'A' });
    });

    await batch.commit();
    console.log('All teams have been updated to rank A');
  } catch (error) {
    console.error('Error updating teams rank:', error);
  }
};

async function createTeam(clubId, sport, type) {

  const playerIds = await getPlayerIdsForAgeGroup(type);

  const team = {
    clubId,
    sport,
    type,
    playerIds,
    rank: getRandomRank(),
  };

  await addDoc(teamsRef, team);
  console.log(`Team created for club ${clubId}, sport ${sport}, type ${type}`);
}

async function getPlayerIdsForAgeGroup(type) {
  const currentYear = new Date().getFullYear();
  let minBirthYear, maxBirthYear;

  switch (type) {
    case 'U19':
      minBirthYear = currentYear - 19;
      maxBirthYear = currentYear - 17;
      break;
    case 'U17':
      minBirthYear = currentYear - 17;
      maxBirthYear = currentYear - 15;
      break;
    case 'U15':
      minBirthYear = currentYear - 15;
      maxBirthYear = currentYear - 13;
      break;
    default:
      throw new Error('Invalid team type');
  }

  const q = query(playersRef, where('dob', '>=', `${minBirthYear}-01-01`), where('dob', '<=', `${maxBirthYear}-12-31`));
  const snapshot = await getDocs(q);

  const playerIds = [];
  snapshot.forEach((doc) => {
    playerIds.push(doc.id);
  });

  return playerIds;
}

function getRandomRank() {
  const ranks = ['A', 'B', 'C', 'D'];
  return ranks[Math.floor(Math.random() * ranks.length)];
}

const Populate = {
    resetPlayers
}

export default Populate;

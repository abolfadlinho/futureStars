import { db } from "./firebase";
import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, arrayUnion, writeBatch, increment } from "firebase/firestore";
import { Club, Team, Player} from "@/constants/Types";

// Collection references
const tournamentsRef = collection(db, "tournaments");
const stagesRef = collection(db, "stages");
const clubsRef = collection(db, "clubs");
const playersRef = collection(db, "players");
const teamsRef = collection(db, "teams");
const matchesRef = collection(db, "matches");
const postsRef = collection(db, "posts");
const getCollectionRef = (name) => collection(db, name);

const populate = () => {
    const dummy = [];
    const promises = dummy.map(async (post) => {
      await addDoc(matchesRef, post);
    });
    return Promise.all(promises);
}

const getPosts = async () => {
  const posts = [];
  const querySnapshot = await getDocs(postsRef);
  querySnapshot.forEach((doc) => {
    posts.push({ postId: doc.id, ...doc.data() });
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

const deleteUnmatchedMatches = async () => {
  const matchesRef = collection(db, 'matches'); // Reference to the matches collection
  const docIdsToKeep = [
    '04GQPBntRTECiJ6INouT',
    '1TEmPXfhphrmTEusRyrq',
    '3CdHEnqujYc5qnJWtvMT',
    '3YlXr9OMqbGGXue6F2ZK',
    '5lhn3f8VuktRu8DDZGtg',
    '7LGPGaHUt2h8NJunBcnV',
    '7ORneh3V8w5Ag8Nmuk6G',
    '9B7ZC5gjACl5clxmij59',
    'B5BMXL4hYFkeSEj5jOdV',
    'HV8f4NAkgewU561puLk1'
  ];

  // Query to get matches that do not have the specified docIds
  const q = query(matchesRef, where('__name__', 'not-in', docIdsToKeep));

  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      const docRef = doc(db, 'matches', docSnap.id); // Use docRef for deletion
      await deleteDoc(docRef); // Delete the document
      console.log(`Deleted match with id: ${docSnap.id}`);
    });
  } catch (error) {
    console.error('Error deleting unmatched matches:', error);
  }
};

const getClubs = async () => {
  const clubs = [];
  const querySnapshot = await getDocs(clubsRef);
  querySnapshot.forEach((doc) => {
    clubs.push({ clubId: doc.id, ...doc.data() });
  });
  clubs.sort((a, b) => a.city.localeCompare(b.city));
  return clubs;
}

const getTournamentPage = async (tournamentId) => {
  try {

    const stagesSnapshot = await getDocs(query(stagesRef, where('tournamentId', '==', tournamentId)));
    const stages = [];
    await Promise.all(stagesSnapshot.docs.map(async (stageDoc) => {
      const stageData = stageDoc.data();
      const stage = {
        stageId: stageDoc.id,
        name: stageData.name,
        group: stageData.group,
        tables: stageData.tables,
        matches: [],
        pointSystem: stageData.pointSystem,
        notes: stageData.notes
      };
      const matchesSnapshot = await getDocs(query(matchesRef, where('stageId', '==', stageDoc.id)));
      await Promise.all(matchesSnapshot.docs.map(async (matchDoc) => {
        const teamA = await getClubNameLogo(matchDoc.data().teamAId);
        const teamB = await getClubNameLogo(matchDoc.data().teamBId);
        stage.matches.push({ matchId: matchDoc.id, teamAName: teamA?.name, teamBName: teamB?.name, teamALogo: teamA?.logo, teamBLogo: teamB?.logo,  ...matchDoc.data() });
      }));
      if (stageData.group) {
        await Promise.all(stage.tables.map(async (table) => {
          await Promise.all(table.table.map(async (team) => {
            team.points = getPoints(stage.matches, team.teamId, stage.pointSystem);
            const teamData = await getClubNameLogo(team.teamId);
            team.clubName = teamData.name;
            team.clubLogo = teamData.logo;
          }))
        }))
      }
      stages.push(stage);
    }));
    return stages;
  } catch (error) {
    console.error('Error fetching tournament page:', error);
    throw error;
  }
}

const getPoints = (matches, teamId, pointSystem) => {
  return 1;
}

const getChampion = async (clubId) => {
  try {
    const clubDoc = await getDoc(doc(clubsRef, clubId));
    if (clubDoc.exists()) {
      const ret = {
        name: clubDoc.data().name,
        logo: clubDoc.data().logo
      }
      return ret;
    } else {
      throw new Error('Club not found');
    }
  } catch (error) {
    console.error('Error fetching champion:', error);
    throw error;
  }
}

const getHomeMatches = async () => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 2);

    const todayString = today.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    const q = query(matchesRef, where('date', '>=', todayString), where('date', '<', tomorrowString));

    const querySnapshot = await getDocs(q);

    const matchesWithDetails = await Promise.all(querySnapshot.docs.map(async (matchDoc) => {
      const matchData = matchDoc.data();
      const teamA = await getClubNameLogo(matchData.teamAId);
      const teamB = await getClubNameLogo(matchData.teamBId);
      const tournament = await getTournament(matchData.stageId);

      return {
        matchId: matchDoc.id,
        teamAId: matchData.teamAId,
        teamAName: teamA.name,
        teamALogo: teamA.logo,
        teamBId: matchData.teamBId,
        teamBName: teamB.name,
        teamBLogo: teamB.logo,
        stageId: matchData.stageId,
        location: matchData.location,
        players: matchData.players,
        finalScore: matchData.finalScore,
        date: matchData.date,
        motm: matchData.motm,
        sport: tournament.sport,
        tournamentString: tournament.tournamentStageString,
      };
    }));

    matchesWithDetails.sort((a, b) => a.tournamentString.localeCompare(b.tournamentString));

    const handballMatches = matchesWithDetails.filter(match => match.sport === 'Handball');
    const footballMatches = matchesWithDetails.filter(match => match.sport === 'Football');
    const volleyballMatches = matchesWithDetails.filter(match => match.sport === 'Volleyball');
    const basketballMatches = matchesWithDetails.filter(match => match.sport === 'Basketball');

    return { handballMatches, footballMatches, volleyballMatches, basketballMatches };
  } catch (error) {
    console.error('Error fetching matches with details:', error);
    throw error;
  }
}

const getYesterdayMatches = async () => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayString = yesterday.toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];

    const q = query(matchesRef, where('date', '>=', yesterdayString), where('date', '<', todayString));

    const querySnapshot = await getDocs(q);

    const matchesWithDetails = await Promise.all(querySnapshot.docs.map(async (matchDoc) => {
      const matchData = matchDoc.data();
      const teamA = await getClubNameLogo(matchData.teamAId);
      const teamB = await getClubNameLogo(matchData.teamBId);
      const tournament = await getTournament(matchData.stageId);

      return {
        matchId: matchDoc.id,
        teamAId: matchData.teamAId,
        teamAName: teamA.name,
        teamALogo: teamA.logo,
        teamBId: matchData.teamBId,
        teamBName: teamB.name,
        teamBLogo: teamB.logo,
        stageId: matchData.stageId,
        location: matchData.location,
        players: matchData.players,
        finalScore: matchData.finalScore,
        date: matchData.date,
        motm: matchData.motm,
        sport: tournament.sport,
        tournamentString: tournament.tournamentStageString,
      };
    }));

    matchesWithDetails.sort((a, b) => a.tournamentString.localeCompare(b.tournamentString));

    const handballMatches = matchesWithDetails.filter(match => match.sport === 'Handball');
    const footballMatches = matchesWithDetails.filter(match => match.sport === 'Football');
    const volleyballMatches = matchesWithDetails.filter(match => match.sport === 'Volleyball');
    const basketballMatches = matchesWithDetails.filter(match => match.sport === 'Basketball');

    return { handballMatches, footballMatches, volleyballMatches, basketballMatches };
  } catch (error) {
    console.error('Error fetching matches with details:', error);
    throw error;
  }
}

const getTomorrowMatches = async () => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tomorrowString = tomorrow.toISOString().split('T')[0];
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrowString = dayAfterTomorrow.toISOString().split('T')[0];

    const q = query(matchesRef, where('date', '>=', tomorrowString), where('date', '<', dayAfterTomorrowString));

    const querySnapshot = await getDocs(q);

    const matchesWithDetails = await Promise.all(querySnapshot.docs.map(async (matchDoc) => {
      const matchData = matchDoc.data();
      const teamA = await getClubNameLogo(matchData.teamAId);
      const teamB = await getClubNameLogo(matchData.teamBId);
      const tournament = await getTournament(matchData.stageId);

      return {
        matchId: matchDoc.id,
        teamAId: matchData.teamAId,
        teamAName: teamA.name,
        teamALogo: teamA.logo,
        teamBId: matchData.teamBId,
        teamBName: teamB.name,
        teamBLogo: teamB.logo,
        stageId: matchData.stageId,
        location: matchData.location,
        players: matchData.players,
        finalScore: matchData.finalScore,
        date: matchData.date,
        motm: matchData.motm,
        sport: tournament.sport,
        tournamentString: tournament.tournamentStageString,
      };
    }));

    matchesWithDetails.sort((a, b) => a.tournamentString.localeCompare(b.tournamentString));

    const handballMatches = matchesWithDetails.filter(match => match.sport === 'Handball');
    const footballMatches = matchesWithDetails.filter(match => match.sport === 'Football');
    const volleyballMatches = matchesWithDetails.filter(match => match.sport === 'Volleyball');
    const basketballMatches = matchesWithDetails.filter(match => match.sport === 'Basketball');

    return { handballMatches, footballMatches, volleyballMatches, basketballMatches };
  } catch (error) {
    console.error('Error fetching matches with details:', error);
    throw error;
  }
}

async function getForm(teamId) {
  try {
    const matchesSnapshotA = await getDocs(query(matchesRef, where('teamAId', '==', teamId)));
    const matchesSnapshotB = await getDocs(query(matchesRef, where('teamBId', '==', teamId)));

    const matches = [...matchesSnapshotA.docs, ...matchesSnapshotB.docs];

    const now = new Date();
    const pastMatches = matches.filter(match => new Date(match.data().date) < now);
    pastMatches.sort((a, b) => new Date(b.data().date) - new Date(a.data().date));

    const recentMatches = pastMatches.slice(0, 5);

    //console.log("entered");
    if(recentMatches.length === 0) {
      return ["U", "U", "U", "U", "U"];
    }
    const form = recentMatches.map(match => {
      const matchData = match.data();
      const isTeamA = matchData.teamAId === teamId;
      if (matchData.finalScore.A === matchData.finalScore.B) {
        return 'D';
      } else if (
        (isTeamA && matchData.finalScore.A > matchData.finalScore.B) ||
        (!isTeamA && matchData.finalScore.B > matchData.finalScore.A)
      ) {
        return 'W';
      } else {
        return 'L';
      }
    });
    while (form.length < 5) {
      form.push('U');
    }
    return form;
  } catch (error) {
    console.error('Error fetching form:', error);
    throw error;
  }
};

const getClub = async (clubId) => {
  try {
    const teamsSnapshot = await getDocs(query(teamsRef, where('clubId', '==', clubId)));

    // Fetch forms for all teams
    const teamsData = await Promise.all(
      teamsSnapshot.docs.map(async (teamDoc) => {
        const teamData = teamDoc.data();
        const form = await getForm(teamDoc.id); // Fetch form for each team
        return { teamId: teamDoc.id, form, ...teamData };
      })
    );

    // Categorize teams by sport
    const handballTeams = teamsData.filter((team) => team.sport === 'Handball').sort((a, b) => b.type.localeCompare(a.type));
    const footballTeams = teamsData.filter((team) => team.sport === 'Football').sort((a, b) => b.type.localeCompare(a.type));
    const volleyballTeams = teamsData.filter((team) => team.sport === 'Volleyball').sort((a, b) => b.type.localeCompare(a.type));
    const basketballTeams = teamsData.filter((team) => team.sport === 'Basketball').sort((a, b) => b.type.localeCompare(a.type));

    return { handballTeams, footballTeams, volleyballTeams, basketballTeams };
  } catch (error) {
    console.error('Error fetching club details:', error);
    throw error;
  }
};

const getClubNameLogo = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(teamsRef, teamId));
    if (teamDoc.exists()) {
      const teamData = teamDoc.data();
      const clubDoc = await getDoc(doc(clubsRef, teamData.clubId));
      return { name: clubDoc.data()?.name, logo: clubDoc.data()?.logo };
    } else {
      console.error('Team not found');
      return { name: 'Unknown', logo: '' }
    }
  } catch (error) {
    console.error('Error fetching club details:', error);
    return { name: 'Unknown', logo: '' }
  }
}

const getTeamMatches = async (teamId) => {
  try {
    const matchesSnapshotA = await getDocs(query(matchesRef, where('teamAId', '==', teamId)));
    const matchesSnapshotB = await getDocs(query(matchesRef, where('teamBId', '==', teamId)));

    const matches = [...matchesSnapshotA.docs, ...matchesSnapshotB.docs];

    const matchesWithDetails = await Promise.all(matches.map(async (matchDoc) => {
      const matchData = matchDoc.data();
      const isTeamA = matchData.teamAId === teamId;

      let opponent;
      let opponentId;
      if(isTeamA) {
        opponent = await getClubNameLogo(matchData.teamBId);
        opponentId = matchData.teamBId;
      } else {
        opponent = await getClubNameLogo(matchData.teamAId);
        opponentId = matchData.teamAId;
      }

      return {
        matchId: matchDoc.id,
        opponentId: opponentId,
        opponentName: opponent.name,
        opponentLogo: opponent.logo,
        stageId: matchData.stageId,
        location: matchData.location,
        players: matchData.players,
        finalScore: matchData.finalScore,
        date: matchData.date,
        motm: matchData.motm,
        isTeamA
      };
    }));

    matchesWithDetails.sort((a, b) => new Date(a.date) - new Date(b.date));
    return matchesWithDetails;
  } catch (error) {
    console.error('Error fetching team matches:', error);
    throw error;
  }
}

const getPlayers = async (playerIds) => {
  try {
    const players = await Promise.all(playerIds.map(async (playerId) => {
      const playerDoc = await getDoc(doc(playersRef, playerId));
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const player = {
          playerId: playerDoc.id,
          name: playerData.name,
          number: playerData.number,
          dob: playerData.dob
        }
        return player;
      }
    }));
    return players.filter(player => player !== undefined).sort((a, b) => a.number - b.number);
  } catch (error) {
    console.error('Error fetching player details:', error);
    throw error;
  }
}

const getPlayer = async (playerId) => {
  try {
    const playerDoc = await getDoc(doc(playersRef, playerId));
    if (playerDoc.exists()) {
      const playerData = playerDoc.data();
      const player = {
        playerId: playerDoc.id,
        name: playerData.name,
        number: playerData.number,
        dob: playerData.dob
      }
      return player;
    } else {
      console.log("Player not found");
      return null;
    }
  } catch (error) {
    console.error('Error fetching player details:', error);
    throw error;
  }
}

const getTeam = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(teamsRef, teamId));

    if (teamDoc.exists()) {
      const teamData = teamDoc.data();
      const team = {
        teamId,
        clubId: teamData.clubId,
        sport: teamData.sport,
        type: teamData.type,
        playerIds: teamData.playerIds,
        rank: teamData.rank,
      }
      const players = await getPlayers(teamData.playerIds);
      const matches = await getTeamMatches(teamId);
      return { team, players, matches};
    } else {
      throw new Error('Team not found');
    }
  } catch (error) {
    console.error('Error fetching club details:', error);
    throw error;
  }
}

const getAllPlayerMatches = async (playerId) => {
  try {
    const matchesSnapshot = await getDocs(matchesRef);
    const playerMatches = [];

    const matchPromises = matchesSnapshot.docs.map(async (matchDoc) => {
      const matchData = matchDoc.data();
      const isPlayerInMatch = matchData.players.A.some(player => player.playerId === playerId) || matchData.players.B.some(player => player.playerId === playerId);

      if (isPlayerInMatch) {
        const isTeamA = matchData.players.A.some(player => player.playerId === playerId);

        let opponent;
        let opponentId;
        let playerTeam;
        let playerTeamId;
        if (isTeamA) {
          opponent = await getClubNameLogo(matchData.teamBId);
          opponentId = matchData.teamBId;
          playerTeam = await getClubNameLogo(matchData.teamAId);
          playerTeamId = matchData.teamAId;
        } else {
          opponent = await getClubNameLogo(matchData.teamAId);
          opponentId = matchData.teamAId;
          playerTeam = await getClubNameLogo(matchData.teamBId);
          playerTeamId = matchData.teamBId;
        }

        playerMatches.push({
          opponentName: opponent.name,
          opponentLogo: opponent.logo,
          playerTeamLogo: playerTeam.logo,
          playerTeamName: playerTeam.name,
          stageId: matchData.stageId,
          finalScore: matchData.finalScore,
          date: matchData.date,
          isTeamA,
          points: matchData.players.A.find(player => player.playerId === playerId)?.points || matchData.players.B.find(player => player.playerId === playerId)?.points,
          isMotm: matchData.motm === playerId
        });
      }
    });

    await Promise.all(matchPromises);
    return playerMatches;
  } catch (error) {
    console.error('Error fetching player matches:', error);
    throw error;
  }
}

const getTournament = async (stageId) => {
  try {
    const stageSnapshot = await getDoc(doc(stagesRef, stageId));

    if (!stageSnapshot.exists()) {
      throw new Error("Stage not found");
    }

    const { tournamentId } = stageSnapshot.data();
    if (!tournamentId) {
      throw new Error("Tournament ID not found in stage");
    }

    const tournamentSnapshot = await getDoc(doc(tournamentsRef,tournamentId));

    if (!tournamentSnapshot.exists()) {
      throw new Error("Tournament not found");
    }

    let sportEmoji = tournamentSnapshot.data().sport === "Handball"
      ? " 🤾"
      : tournamentSnapshot.data().sport === "Football"
      ? " ⚽"
      : tournamentSnapshot.data().sport === "Basketball"
      ? " 🏀"
      : tournamentSnapshot.data().sport === "Volleyball"
      ? " 🏐"
      : "";

    const tournament = {
      tournamentId, 
      name:tournamentSnapshot.data().name, 
      tournamentStageString: tournamentSnapshot.data().name + " - " + tournamentSnapshot.data().teamsType + ", " + stageSnapshot.data().name + sportEmoji,
      notes: tournamentSnapshot.data().notes, 
      season: tournamentSnapshot.data().season, 
      champion: tournamentSnapshot.data().champion, 
      sport: tournamentSnapshot.data().sport, 
      teamsType: tournamentSnapshot.data().teamsType
    }
    return tournament;
  } catch (error) {
    console.error("Error fetching tournament:", error);
    throw error;
  }
};

const getTournaments = async () => {
  try {
    const tournamentsSnapshot = await getDocs(tournamentsRef);
    let handballTournaments = [];
    let footballTournaments = [];
    let volleyballTournaments = [];
    let basketballTournaments = [];

    const tournamentMap = new Map();

    tournamentsSnapshot.forEach((doc) => {
      const tournamentData = doc.data();
      const tournament = {
        tournamentId: doc.id,
        ...tournamentData
      };

      const key = `${tournamentData.name}-${tournamentData.sport}`;
      if (!tournamentMap.has(key) || tournamentData.season > tournamentMap.get(key).season) {
        tournamentMap.set(key, tournament);
      }
    });

    tournamentMap.forEach((tournament) => {
      switch (tournament.sport) {
        case 'Handball':
          handballTournaments.push(tournament);
          break;
        case 'Football':
          footballTournaments.push(tournament);
          break;
        case 'Volleyball':
          volleyballTournaments.push(tournament);
          break;
        case 'Basketball':
          basketballTournaments.push(tournament);
          break;
        default:
          break;
      }
    });

    const sortByTeamsType = (a, b) => a.teamsType.localeCompare(b.teamsType);

    handballTournaments.sort(sortByTeamsType);
    footballTournaments.sort(sortByTeamsType);
    volleyballTournaments.sort(sortByTeamsType);
    basketballTournaments.sort(sortByTeamsType);

    return { handballTournaments, footballTournaments, volleyballTournaments, basketballTournaments };
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    throw error;
  }
}


// FirebaseAPI object with all necessary functions
const FirebaseAPI = {
  populate,
  getPosts,
  getClubs,
  getHomeMatches,
  getTomorrowMatches,
  getYesterdayMatches,
  getClub,
  getTeam,
  getPlayers,
  getPlayer,
  getAllPlayerMatches,
  getTournament,
  getTournaments,
  getChampion,
  getTournamentPage,
};

export default FirebaseAPI;

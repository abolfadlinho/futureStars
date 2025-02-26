
  export type RootStackParamList = {
    Home: undefined;
    Clubs: undefined;
    Feed: undefined;
    Settings: undefined;
    Club: { id: string, name: string, logo: string, desc: string, city: string };
    Match: { id: string, 
      teamAName: string,
      teamBName: string,
      teamALogo: string,
      teamBLogo: string,
      teamAId: string,
      teamBId: string,
      finalScore: { A: number; B: number },
      players: { A: { playerId: string; points: number }[]; B: { playerId: string; points: number }[] },
      date: string,
      location: string,
      motm: string,
      stageId: string };
    Player: { id: string, name: string, age: string, number: number, sport?: string };
    Team: { id: string, clubName: string, logo: string, teamFullName: string};
    Tournament: { id: string, name: string, champion: string, notes: string, season: string, sport: string, teamsType: string };
  };

  export interface Tournament {
    tournamentId: string; // AutoID
    name: string;
    season: string;
    champion: string; // reference to clubs doc
    sport: 'Handball' | 'Football' | 'Volleyball' | 'Basketball' | string; // ENUM
    notes: string;
    teamsType: string;
    tournamentStageString?: string;
  }

  export interface Stage {
    stageId: string; // AutoID
    tournamentId: string; // reference to tournament doc
    tables: { name: string; table: { teamId:string, points:number, clubName?:string, clubLogo?:string }[] }[];
    group: boolean; // false = knockouts
    pointSystem: { W: number; D: number; L: number };
    notes: string;
    matches?: Match[];
    name: string;
  }

  export interface Club {
    clubId: string; // AutoID
    name: string;
    logo: string;
    city: string;
    desc: string;
  }

  export interface Team {
    teamId: string; // AutoID
    clubId: string; // reference to clubs
    sport: 'Handball' | 'Football' | 'Volleyball' | 'Basketball' | string, // ENUM
    type: string; //U19 or U17 or U15
    playerIds: string[];
    rank: string; //A or B or C or D
    form?: [string];
  }

  export interface Player {
    playerId: string; // AutoID
    name: string;
    number: number;
    dob: string;
    points?: number;
  }

  export interface Match {
    matchId: string; // AutoID
    stageId: string; // reference to stage doc
    teamAId: string; // reference to team doc
    teamBId: string; // reference to team doc
    date: string;
    location: string;
    finalScore: { A: number; B: number };
    motm: string; // reference to player
    players: { A: { playerId: string; points: number }[]; B: { playerId: string; points: number }[] };
    points?: number;
    teamAName?: string;
    teamBName?: string;
    teamALogo?: string;
    teamBLogo?: string;
    tournamentString?: string;
  }

  export interface Post {
    postId: string; // AutoID
    title: string;
    text: string;
    author: string;
    date: string;
    expanded?: boolean;
  }

  export interface MatchDetails {
      matchId: string,
      teamAClubName: string,
      teamBClubName: string,
      finalScore: {A:number, B:number},
      tournamentName: string,
      stageName: string,
      date: string,
      location: string,
      tournamentTeamsType: string,
      tournamentString?: string;
  }

  export interface PlayerMatch {
    matchId: string,
    opponentName: string,
    opponentLogo: string,
    finalScore: {A:number, B:number},
    date: string,
    isTeamA: boolean,
    location: string,
    motm: string,
    players: { A: { playerId: string; points: number }[]; B: { playerId: string; points: number }[] };
    stageId: string,
    opponentId: string,
    points?: number,
    isMotm?: boolean,
    playerTeamName: string,
    playerTeamLogo: string,
    playerTeamId: string,
  }

  export interface TeamMatch {
    matchId: string,
    opponentName: string,
    opponentLogo: string,
    finalScore: {A:number, B:number},
    date: string,
    isTeamA: boolean,
    location: string,
    motm: string,
    players: { A: { playerId: string; points: number }[]; B: { playerId: string; points: number }[] };
    stageId: string,
    opponentId: string,
  }

const apiKey = "insert API Key Here";
let summoner = {};
let [flex = {}, tft = {}, solo = {}] = [];
let matchID = {};
let matches = [];
const amountMatches = 10;
const championsPlayed = [];

const lowerCase = (player) => player.toLowerCase().split(" ").join("");

const getJSON = async function (url) {
  return fetch(url).then((res) => {
    return res.json();
  });
};

const pickHighest = (obj, num = 1) => {
  const requiredObj = {};
  if (num > Object.keys(obj).length) {
    return false;
  }
  Object.keys(obj)
    .sort((a, b) => obj[b] - obj[a])
    .forEach((key, ind) => {
      if (ind < num) {
        requiredObj[key] = obj[key];
      }
    });
  return requiredObj;
};

const getPlayerData = async function (player) {
  getJSON(
    `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${lowerCase(
      player
    )}?api_key=${apiKey}`
  )
    .then((data) => {
      summoner = data;

      return data;
    })
    .then(async (data) => {
      return Promise.all([
        getJSON(
          `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.id}?api_key=${apiKey}`
        ),
        getJSON(
          `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${data.puuid}/ids?start=0&count=${amountMatches}&api_key=${apiKey}`
        ),
      ]);
    })
    .then(async (data) => {
      [solo, tft, flex] = data[0];
      data[1].map(async (match) => {
        getJSON(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${match}?api_key=${apiKey}`
        ).then((d) => {
          d.info.participants.map((d) => {
            if (d.puuid === `${summoner.puuid}`) {
              matches.push(d);
              matches.length === amountMatches ? matches : null;
            }
          });
        });
      });
    })
    .then(async () => {
      setTimeout(() => {
        matches.forEach((d) => {
          championsPlayed[d.championName] ??= 0;
          championsPlayed[d.championName] === championsPlayed[d.championName]
            ? championsPlayed[d.championName]++
            : championsPlayed[d.championName];
        });

        console.log(summoner, flex, tft, solo, matches);
        console.log(
          `Summoner: ${summoner.name}\nLevel: ${
            summoner.summonerLevel
          }\nRank: ${
            solo.tier + " " + solo.rank + " " + solo.leaguePoints
          } LP\nWinrate: ${Math.trunc(
            (solo.wins / (solo.wins + solo.losses)) * 100
          )}%\nWins: ${solo.wins}\nLosses: ${
            solo.losses
          }\n\n_______GAME HISTORY_______\n\nYour top 3 champs played are: ${String(
            Object.entries(pickHighest(championsPlayed, 3))
          )
            .split(",")
            .join(", ")}\n `
        );

        matches.forEach((d) =>
          console.log(
            `${d.win === true ? `VICTORY` : `DEFEAT`}\n\nChampion: ${
              d.championName
            }\nK/D/A: ${
              d.kills + "/" + d.deaths + "/" + d.assists
            }\nVision score: ${d.visionScore}\nCS: ${d.totalMinionsKilled}`
          )
        );
      }, 1100);
    })
    .catch((err) => console.log(err));
};

getPlayerData(prompt("Enter the player you are looking for!"));

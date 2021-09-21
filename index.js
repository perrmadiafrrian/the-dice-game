const readline = require("readline");

class Dice {
  constructor() {
    this.possible_number = [1, 2, 3, 4, 5, 6];
    this.last_roll = null;
  }

  roll() {
    let number =
      this.possible_number[
        Math.floor(Math.random() * this.possible_number.length)
      ];
    this.last_roll = number;
    return number;
  }
}

class Person {
  constructor(dice_count) {
    let dices = [];
    for (let i = 0; i < dice_count; i++) {
      const dice = new Dice();
      dices[i] = dice;
    }
    this.dices = dices;
    this.still_playing = true;
    this.point = 0;
  }

  hasDice() {
    return this.dices.length > 0;
  }

  rollDices() {
    this.dices.forEach((v) => {
      try {
        v.roll();
      } catch (err) {
        console.log(err);
      }
    });

    return this.getLastRollString();
  }

  getLastRollString() {
    return this.getLastRoll()
      .filter((v) => v !== null)
      .join(", ");
  }

  getLastRoll() {
    return this.dices.map((v) => v.last_roll);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let persons = [];

console.log("Dice game");

async function ask_player() {
  rl.question("How many players will play this game? ", (player_count) => {
    if (
      player_count === "" ||
      isNaN(player_count) ||
      parseInt(player_count) < 2
    ) {
      console.log("To play this game you need at least 2 players");
      ask_player();
    } else {
      ask_dice(player_count);
    }
  });
}

async function ask_dice(player_count) {
  rl.question(
    "How many dices each player should have? ",
    async (dice_count) => {
      if (dice_count === "" || isNaN(dice_count) || parseInt(dice_count) < 1) {
        console.log("To play this game you need at least 1 dice");
        ask_dice(player_count);
      } else {
        for (let i = 0; i < player_count; i++) {
          persons[i] = new Person(dice_count);
        }
        await game_start();
      }
    }
  );
}

const getPlayerWithDices = () => {
  return persons.filter((v, i) => {
    return v.hasDice();
  }).length;
};

const game_start = async () => {
  if (getPlayerWithDices() > 1) {
    const index = 0;
    const player = persons[index];
    await rollTheDice(player, index);
  } else {
    result();
  }
};

const rollTheDice = async (player, index) => {
  if (player.hasDice())
    rl.question(
      `Player ${index + 1} turn. Press "ENTER" to roll dices `,
      async (r) => {
        console.log(`Player ${index + 1} rolling: ${player.rollDices()}`);
        checkRound(index);
      }
    );
  else {
    checkRound(index);
  }
};

const checkRound = (index) => {
  index++;
  if (index >= persons.length) {
    evaluate();
  } else {
    const next_player = persons[index];
    rollTheDice(next_player, index);
  }
};

const evaluate = async () => {
  console.log("");
  console.log("");
  console.log("");
  console.log("-------------EVALUATE--------------");
  for (let i = 0; i < persons.length; i++) {
    const player = persons[i];
    if (!player.still_playing) continue;
    const p_dices = player.dices;
    console.log(`Player ${i + 1} last roll: ${player.getLastRollString()}`);
    // Calculate POINT
    const point = p_dices.filter((v) => v.last_roll === 6).length;
    player.point += point;

    // Find Removed Dice
    const removed = p_dices.filter(
      (v) => v.last_roll !== 6 && v.last_roll !== 1
    );

    // Move 1 to next player
    const one = p_dices.filter((v) => v.last_roll === 1);
    if (one.length > 0) {
      one.forEach((v) => (v.last_roll = null));
      const next_player = getNextPlayer(i);
      next_player.dices.push(...one);
    }
    player.dices = removed;
    player.still_playing = player.dices.length > 0;
    console.log(`Current player ${i + 1} point : ${player.point}`);
  }
  console.log("");
  console.log("");
  console.log("");
  await game_start();
};

const getNextPlayer = (index) => {
  const idx = index + 1 >= persons.length ? 0 : index + 1;
  const next_player = persons[idx];
  if (!next_player.still_playing) {
    return getNextPlayer(idx);
  }

  return next_player;
};

const result = () => {
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("Final Points:");
  for (let i = 0; i < persons.length; i++) {
    const player = persons[i];
    console.log(`Player ${i + 1} has ${player.point} point`);
  }
  const points = persons.map((v) => v.point);
  const winner_point = Math.max.apply(Math, points);
  const winner = points.indexOf(winner_point);
  console.log("---------------WINNER------------------");
  console.log("");
  console.log("");
  console.log(`The winner is player ${winner + 1}`);
  console.log("");
  console.log("");
  console.log("---------------WINNER------------------");
  rl.close();
};

ask_player();

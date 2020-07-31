const CONSTANTS = {};

//use classIndex.Warrior instead of "mouse" for enemies
CONSTANTS.classes = {
    Warrior: {
        name: "Warrior",
        icon: "ra ra-sword",
    },
    Mage: {
        name: "Mage",
        icon: "ra ra-crystal-wand",
    },
    Cleric: {
        name: "Cleric",
        icon: "fas fa-cross",
    }
};

CONSTANTS.items = {
    Whisker: {
        name: 'Whisker',
        value: 1,
        icon: "ra ra-aquarius",
    },
    Tooth: {
        name: 'Tooth',
        value: 2,
        icon: "ra ra-tooth",
    },
    Gel: {
        name: 'Gel',
        value: 5,
        icon: "ra ra-turd",
    }
};

CONSTANTS.enemies = {
    Mouse: {
        name: "Mouse",
        level: 1,
        health: 5,
        currentHealth: 5,
        attacks: ["Bite", "Chomp"],
        attackProbabilities: [4, 1],
        attackDamages: [1, 3],
        attackSpeeds: [1000, 500],
        items: [CONSTANTS.items.Whisker, CONSTANTS.items.Tooth],
        itemProbabilities: [3, 1],
    },
    Rat: {
        name: "Rat",
        level: 2,
        health: 10,
        currentHealth: 10,
        attacks: ["Bite", "Chomp"],
        attackProbabilities: [4, 1],
        attackDamages: [1, 3],
        attackSpeeds: [1000, 500],
        items: [CONSTANTS.items.Whisker, CONSTANTS.items.Tooth],
        itemProbabilities: [1, 2],
    },
    Slime: {
        name: "Slime",
        level: 3,
        health: 8,
        currentHealth: 8,
        attacks: ["Bounce"],
        attackProbabilities: [1],
        attackDamages: [5],
        attackSpeeds: [2000],
        items: [CONSTANTS.items.Gel],
        itemProbabilities: [1],
    },
    Balrog: {
        name: "Balrog",
        level: 72,
        health: 896,
        currentHealth: 896,
        attacks: ["poop"],
        attackProbabilities: [1],
        attackDamages: [1],
        attackSpeeds: [10],
        itemIndexes: [],
        itemProbabilities: [],
    }
};

CONSTANTS.dungeonFloors = [{
    name: "Crypt",
    theme: "undead",
    possibleEnemies: [CONSTANTS.enemies.Mouse],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 10,
    maxCharacters: 2,
}, {
    name: "",
    theme: "undead",
    possibleEnemies: [CONSTANTS.enemies.Rat],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "undead",
    possibleEnemies: [CONSTANTS.enemies.Slime],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "undead",
    possibleEnemies: [CONSTANTS.enemies.Mouse, CONSTANTS.enemies.Rat],
    enemyProbabilities: [1, 1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "undead",
    possibleEnemies: [CONSTANTS.enemies.Mouse],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 1,
    maxCharacters: 2,
}, {
    name: "Caves",
    theme: "caves",
    possibleEnemies: [CONSTANTS.enemies.Mouse, CONSTANTS.enemies.Rat, CONSTANTS.enemies.Slime],
    enemyProbabilities: [1, 2, 1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "caves",
    possibleEnemies: [CONSTANTS.enemies.Mouse, CONSTANTS.enemies.Rat],
    enemyProbabilities: [90, 1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "caves",
    possibleEnemies: [CONSTANTS.enemies.Mouse],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "caves",
    possibleEnemies: [CONSTANTS.enemies.Mouse],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 10,
    maxCharacters: 1,
}, {
    name: "",
    theme: "caves",
    possibleEnemies: [CONSTANTS.enemies.Mouse],
    enemyProbabilities: [1],
    enemiesRequiredToPass: 1,
    maxCharacters: 1,
}];

CONSTANTS.performance = {
    tickDuration: 50,
};
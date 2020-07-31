const CONSTANTS = {
    classIndex: {
        Warrior: 0,
        Mage: 1,
        Cleric: 2,
    },
    classes: [{
        name: "Warrior",
        icon: "ra ra-sword",
    }, {
        name: "Mage",
        icon: "ra ra-crystal-wand",
    }, {
        name: "Cleric",
        icon: "fas fa-cross",
    }],
    dungeonFloors: [{
        name: "Crypt",
        theme: "undead",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
        maxCharacters: 2,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Rat"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Slime"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Mouse", "Rat"],
        enemyProbabilities: [1, 1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 1,
        maxCharacters: 2,
    }, {
        name: "Caves",
        theme: "caves",
        possibleEnemies: ["Mouse", "Rat", "Slime"],
        enemyProbabilities: [1, 1, 1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse", "Rat"],
        enemyProbabilities: [90, 1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
        maxCharacters: 1,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 1,
        maxCharacters: 1,
    }],
    enemyIndex: {
        Mouse: 0,
        Rat: 1,
        Slime: 2,
    },
    enemies: [{
        name: "Mouse",
        level: 1,
        health: 5,
        currentHealth: 5,
        attacks: ["Bite", "Chomp"],
        attackProbabilities: [4, 1],
        attackDamages: [1, 3],
        attackSpeeds: [1000, 500],
    }, {
        name: "Rat",
        level: 2,
        health: 10,
        currentHealth: 10,
        attacks: ["Bite", "Chomp"],
        attackProbabilities: [4, 1],
        attackDamages: [1, 3],
        attackSpeeds: [1000, 500]
    }, {
        name: "Slime",
        level: 3,
        health: 8,
        currentHealth: 8,
        attacks: ["Bounce"],
        attackProbabilities: [1],
        attackDamages: [5],
        attackSpeeds: [2000]
    }, ],
    performance: {
        tickDuration: 50,
    }
};
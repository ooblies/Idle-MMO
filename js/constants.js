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
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Rat"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Slime"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Mouse", "Rat"],
        enemyProbabilities: [1, 1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "undead",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 1,
    }, {
        name: "Caves",
        theme: "caves",
        possibleEnemies: ["Mouse", "Rat", "Slime"],
        enemyProbabilities: [1, 1, 1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse", "Rat"],
        enemyProbabilities: [90, 1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 10,
    }, {
        name: "",
        theme: "caves",
        possibleEnemies: ["Mouse"],
        enemyProbabilities: [1],
        enemiesRequiredToPass: 1,
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
        attackSpeed: 1000,
        attackDamage: 1,
    }, {
        name: "Rat",
        level: 2,
        health: 10,
        currentHealth: 10,
        attackSpeed: 1000,
        attackDamage: 1,
    }, {
        name: "Slime",
        level: 3,
        health: 8,
        currentHealth: 8,
        attackSpeed: 2000,
        attackDamage: 4,
    }, ],
    performance: {
        tickRate: 20,
    }
};
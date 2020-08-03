const CONSTANTS = {};


CONSTANTS.levels = [0 //0
    , 1, 8, 17, 28, 39, 51, 65, 80, 97, 115 //1-10
    , 136, 158, 183, 211, 241, 275, 312, 352, 397, 447 //11-20
    , 502, 562, 629, 703, 784, 874, 973, 1082, 1203, 1336 //21-30
    , 1483, 1646, 1825, 2022, 2241, 2482, 2747, 3041, 3365, 3722 //31-40
    , 4117, 4553, 5034, 5565, 6151, 6798, 7513, 8301, 9172, 10133 //41-50
    , 11195, 12366, 13659, 15087, 16664, 18404, 20325, 22447, 24789, 27374 //51-60
    , 30229, 33380, 36860, 40702, 44943, 49625, 54795, 60503, 66805, 73763 //61-70
    , 81445, 89926, 99290, 109628, 121042, 133644, 147558, 162920, 179881, 198607 //71-80
    , 219282, 242109, 267311, 295137, 325859, 359779, 397229, 438578, 484230, 534633 //81-90
    , 590283, 651725, 719563, 794461, 877156, 968458, 1069263, 1180561, 1303443 //91-99
];

CONSTANTS.classes = {
    Warrior: {
        name: "Warrior",
        icon: "ra ra-sword",
        attackSpeed: 2000,
        abilities: [Abilities.BigSmash,Abilities.BiggerSmash,Abilities.BiggestSmash,Abilities.Guard,Abilities.Strength],
        //stats
        startingStr: 10,
        startingAgi: 6,
        startingCon: 8,
        startingInt: 4,
        increasePerLevelStr: 3,
        increasePerLevelCon: 2,
        increasePerLevelAgi: 1,
        increasePerLevelInt :0,

    },
    Mage: {
        name: "Mage",
        icon: "ra ra-crystal-wand",
        attackSpeed: 1500,
        abilities: [Abilities.Firebolt,Abilities.Firewave,Abilities.Firestorm,Abilities.Quicken,Abilities.Smarterizer],
        //stats
        startingStr :4,
        startingAgi: 8,
        startingCon :6,
        startingInt: 10,
        increasePerLevelInt: 3,
        increasePerLevelAgi: 2,
        increasePerLevelCon: 1,
        increasePerLevelStr: 0,
    },
    Cleric: {
        name: "Cleric",
        icon: "fas fa-cross",
        attackSpeed: 1000,
        abilities: [Abilities.HealFirst,Abilities.HealAll,Abilities.HealLowest,Abilities.Fortify,Abilities.Regenerate],
        //stats
        startingStr: 6,
        startingAgi :4,
        startingCon : 10,
        startingInt : 8,
        increasePerLevelCon : 3,
        increasePerLevelInt : 2,
        increasePerLevelStr : 1,
        increasePerLevelAgi : 0,
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
        attacks: ["Bite", "Chomp","Munch"],
        attackProbabilities: [10, 5, 1],
        attackDamages: [1, 3, 5],
        attackSpeeds: [1000, 500, 100],
        goldDroppedMin: 1,
        goldDroppedMax: 1,
        lootTable: [
            {
                item: CONSTANTS.items.Whisker,
                chance: 90, // %
                quantityMin: 1,
                quantityMax: 2,
            }, {
                item: CONSTANTS.items.Tooth,
                chance: 10, // %
                quantityMin: 1,
                quantityMax: 1,
            }
        ], 
    },
    Rat: {
        name: "Rat",
        level: 2,
        health: 10,
        currentHealth: 10,
        attacks: ["Bite", "Chomp","Munch"],
        attackProbabilities: [10, 5, 1],
        attackDamages: [1, 3, 5],
        attackSpeeds: [1000, 500, 100],
        goldDroppedMin: 0,
        goldDroppedMax: 0,
        lootTable: [
            {
                item: CONSTANTS.items.Whisker,
                chance: 90, // %
                quantityMin: 1,
                quantityMax: 4,
            }, {
                item: CONSTANTS.items.Tooth,
                chance: 50, // %
                quantityMin: 1,
                quantityMax: 1,
            }
        ],        
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
        goldDroppedMin: 0,
        goldDroppedMax: 5,
        lootTable: [
            {
                item: CONSTANTS.items.Gel,
                chance: 100, // %
                quantityMin: 1,
                quantityMax: 2,
            }
        ],     
    },
    Cryptlord: {        
        name: "Crypt Lord",
        level: 5,
        health: 50,
        currentHealth: 50,
        attacks: ["Attack"],
        attackProbabilities: [1],
        attackDamages: [10],
        attackSpeeds: [2000],
        goldDroppedMin: 10,
        goldDroppedMax: 20,
        lootTable: [
        ],     
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
        goldDroppedMin: 0,
        goldDroppedMax: 0,
        lootTable: [
        ],     
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

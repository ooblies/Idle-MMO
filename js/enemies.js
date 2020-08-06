const enemies = {
    Mouse: {
        id: "Mouse",
        name: "Mouse",
        level: 1,
        health: 50000,
        attacks: ["Bite", "Chomp","Munch"],
        attackProbabilities: [10, 5, 1],
        attackDamages: [1, 3, 5],
        attackSpeeds: [1000, 500, 100],
        goldDroppedMin: 1,
        goldDroppedMax: 1,
        lootTable: [
            {
                item: items.Whisker,
                chance: 90, // %
                quantityMin: 1,
                quantityMax: 2,
            }, {
                item: items.Tooth,
                chance: 10, // %
                quantityMin: 1,
                quantityMax: 1,
            }
        ], 
    },
    Rat: {
        id: "Rat",
        name: "Rat",
        level: 2,
        health: 100,
        attacks: ["Bite", "Chomp","Munch"],
        attackProbabilities: [10, 5, 1],
        attackDamages: [1, 3, 5],
        attackSpeeds: [1000, 500, 100],
        goldDroppedMin: 0,
        goldDroppedMax: 0,
        lootTable: [
            {
                item: items.Whisker,
                chance: 90, // %
                quantityMin: 1,
                quantityMax: 4,
            }, {
                item: items.Tooth,
                chance: 50, // %
                quantityMin: 1,
                quantityMax: 1,
            }
        ],        
    },
    Slime: {
        id: "Slime",
        name: "Slime",
        level: 3,
        health: 80,
        attacks: ["Bounce"],
        attackProbabilities: [1],
        attackDamages: [5],
        attackSpeeds: [2000],
        goldDroppedMin: 0,
        goldDroppedMax: 5,
        lootTable: [
            {
                item: items.Gel,
                chance: 100, // %
                quantityMin: 1,
                quantityMax: 2,
            }
        ],     
    },
    Cryptlord: {        
        id: "Cryptlord",
        name: "Crypt Lord",
        level: 5,
        health: 500,
        attacks: ["Attack"],
        attackProbabilities: [1],
        attackDamages: [25],
        attackSpeeds: [2000],
        goldDroppedMin: 10,
        goldDroppedMax: 20,
        lootTable: [
        ],     
    },
};
const classes = {
    Warrior: {
        name: "Warrior",
        icon: "ra ra-sword",
        attackSpeed: 2000,
        abilities: [abilities.BigSmash,abilities.BiggerSmash,abilities.BiggestSmash,abilities.Guard,abilities.Strength],
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
        abilities: [abilities.Firebolt,abilities.Firewave,abilities.Firestorm,abilities.Quicken,abilities.Smarterizer],
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
        abilities: [abilities.HealFirst,abilities.HealAll,abilities.HealLowest,abilities.Fortify,abilities.Regenerate],
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
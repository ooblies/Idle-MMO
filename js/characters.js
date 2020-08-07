//character class
console.log('creating character class');

class Character {
    constructor(id, name, characterClass) {
        this.id = id;
        this.name = name;
        this.class = characterClass;
        this.experience = 1;
        this.maxFloor = 1;
        this.location = locations.town;
        this.equipment = {};
        this.groupId = null;
        this.currentHealth = this.maxHealth;
    }

    //Static Conastructor from JSON string
    static createFromSave(saveObject){
        var char = new Character(saveObject.id, saveObject.name, saveObject.class);
        char.experience = saveObject.experience;
        char.maxFloor = saveObject.maxFloor;
        char.location = saveObject.location;
        char.equipment = saveObject.equipment;
        char.groupId = saveObject.groupId;
        char.currentHealth = saveObject.currentHealth;

        return char;        
    }

    //Getters

    get maxHealth() {        
        return this.constitution * 10;
    }
    
    get level() {
        if (!this.experience) {
            this.experience = 1;
        }

        for (var l = 0; l < levels.length; l++) {
            if (levels[l] <= this.experience && levels[l + 1] > this.experience) {
                return l;
            }
        }
    }

    get strength() {
        return this._getEffectiveStat(Stats.Strength);
    }

    get agility() {
        return this._getEffectiveStat(Stats.Agility);
    }

    get intelligence() {
        return this._getEffectiveStat(Stats.Intelligence);
    }

    get constitution() {
        return this._getEffectiveStat(Stats.Constitution);
    }

    get attackSpeed() {
        return this.class.attackSpeed;
    }

    get attackDamage() {
        return (this.strength * 2) + (this.agility);
    }

    get experienceMin() {
        return levels[this.level];
    }
    get experienceMax() {
        return levels[this.level + 1];
    }

    // Private Functions

    _getEffectiveStat(stat) {
 
        var effectiveStat = 0;

        switch (stat) {
            case Stats.Strength:
                effectiveStat = this.class.startingStr + (this.level * this.class.increasePerLevelStr);
                break;
            case Stats.Agility:
                effectiveStat = this.class.startingAgi + (this.level * this.class.increasePerLevelAgi);
                break;
            case Stats.Intelligence:
                effectiveStat = this.class.startingInt + (this.level * this.class.increasePerLevelInt);
                break;
            case Stats.Constitution:
                effectiveStat = this.class.startingCon + (this.level * this.class.increasePerLevelCon);
                break;
            default:                
        }

        return effectiveStat;
    }

    // Public Functions 

    fullHeal() {
        this.currentHealth = this.maxHealth;
    }

    adjustHealth(adjustment) {
        this.currentHealth += adjustment;

        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }

    gainExperience(exp) {
        this.experience += exp;
    }
}

console.log('creating test character');

var test = new Character(1,'Test',classes.Warrior);

console.log('character ' + test.name + ' has ');
console.log('id: ' + test.id);
console.log('name: ' + test.name);
console.log('class: ' + test.class.name);
console.log('xpMin: ' + test.experienceMin);
console.log('xp: ' + test.experience);
console.log('xpMax: ' + test.experienceMax);
console.log('level: ' + test.level);
console.log('maxFloor: ' + test.maxFloor);
console.log('currentHP: ' + test.currentHealth);
console.log('maxHP: ' + test.maxHealth);
console.log('str: ' + test.strength);
console.log('agi: ' + test.agility);
console.log('int: ' + test.intelligence);
console.log('con: ' + test.constitution);
console.log('aSpeed: ' + test.attackSpeed);
console.log('aDamage: ' + test.attackDamage);
console.log('location: ' + test.location);

console.log('dealing 1dmg');
test.adjustHealth(-1);
console.log('hp = ' + test.currentHealth)

console.log('gaining 135982 exp');
test.gainExperience(135982);
console.log('exp: ' + test.experience);
console.log('level: ' + test.level);

console.log('moving up 5 floors');
test.maxFloor += 5;
console.log('maxFloor: ' + test.maxFloor);






                            









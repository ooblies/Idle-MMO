class Character {
    constructor(id, name, characterClass) {        
        this._scope = angular.element(document.body).scope();

        this.id = id;
        this.name = name;
        this.class = characterClass;
        this.experience = 1;
        this.maxFloor = 1;
        this.currentFloor = null;
        this.location = locations.town;
        this.equipment = {};
        this.groupId = null;
        this.currentHealth = this.maxHealth;
        this.activeAbilities = [
            //this.class.abilities[0],
            //this.class.abilities[1],
            //this.class.abilities[2],
            //this.class.abilities[3],
            //this.class.abilities[4],
        ];

        
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
        var strBase = this._getEffectiveStat(Stats.Strength);
        var strFlat = this._scope.getStatIncreaseFromBuffs(Stats.Strength, this.id);
        var strMultiplier = this._scope.getStatMultiplierFromBuffs(Stats.Strength, this.id);;

        var totalStr = (strBase + strFlat) * strMultiplier;
        return totalStr;
    }

    get agility() {
        var agiBase = this._getEffectiveStat(Stats.Agility);
        var agiFlat = this._scope.getStatIncreaseFromBuffs(Stats.Agility, this.id);
        var agiMultiplier = this._scope.getStatMultiplierFromBuffs(Stats.Agility, this.id);;

        var agiTotal = (agiBase + agiFlat) * agiMultiplier;
        return agiTotal;
    }

    get intelligence() {
        var intBase = this._getEffectiveStat(Stats.Intelligence);
        var intFlat = this._scope.getStatIncreaseFromBuffs(Stats.Intelligence, this.id);
        var intMultiplier = this._scope.getStatMultiplierFromBuffs(Stats.Intelligence, this.id);;

        var intTotal = (intBase + intFlat) * intMultiplier;
        return intTotal;
    }

    get constitution() {
        var conBase = this._getEffectiveStat(Stats.Constitution);
        var conFlat = this._scope.getStatIncreaseFromBuffs(Stats.Constitution, this.id);
        //
        var conMultiplier = this._scope.getStatMultiplierFromBuffs(Stats.Constitution, this.id);;

        var conTotal = (conBase + conFlat) * conMultiplier;
        return conTotal;
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

    get ability1Cooldown() {
        if (this.activeAbilities[0]) {
            return this.activeAbilities[0].cooldown;
        }
        return null;        
    }
    get ability2Cooldown() {
        if (this.activeAbilities[1]) {
            return this.activeAbilities[1].cooldown;
        }
        return null;
    }
    get ability3Cooldown() {
        if (this.activeAbilities[2]) {
            return this.activeAbilities[2].cooldown;
        }
        return null;
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
                break;             
        }

        return effectiveStat;
    }

    _getTargetFriendlyIndexes(targetType) {
        var group = this._scope.data.dungeon.floors[this.currentFloor - 1].group;

        var targetFriendlyIndexes = [];

        switch (targetType) {
            case TargetType.FriendlyFirst:
                var firstFriendlyIndex = -1;
                group.characterIds.forEach(function(c, i) {
                    if (this._scope.getCharacterById(c).currentHealth > 0 && firstFriendlyIndex == -1) {
                        firstFriendlyIndex = i;
                    }
                }, this);

                targetFriendlyIndexes.push(firstFriendlyIndex);
                break;
            case TargetType.FriendlyAll:                
                group.characterIds.forEach(function(c, i) {
                    if (this._scope.getCharacterById(c).currentHealth > 0) {
                        targetFriendlyIndexes.push(i);
                    }
                }, this);
                break;
            case TargetType.FriendlyLowestHP:                
                var health = 1.1;
                var lowestFriendlyIndex = -1;

                group.characterIds.forEach(function(c, i) {
                    var char = this._scope.getCharacterById(c);
                    if (char.currentHealth > 0) {
                        if (char.currentHealth / char.maxHealth < health) {
                            health = char.currentHealth / char.maxHealth;
                            lowestFriendlyIndex = i;
                        }                    
                    }                    
                } ,this);

                targetFriendlyIndexes.push(lowestFriendlyIndex);
                break;
            case TargetType.Self:
                var selfIndex = -1;

                group.characterIds.forEach(function(c, i) {
                    if (c == this.id) {
                        selfIndex = i;
                    }
                }, this);

                targetFriendlyIndexes.push(selfIndex);
                break;
            default:
                debugger;
                console.log("Incorrect Target Type");
                break;
        }

        return targetFriendlyIndexes;
    }

    _getTargetEnemyIndexes(targetType) {        
        var wave = this._scope.data.dungeon.floors[this.currentFloor -1].enemyWaves[0];
        
        var targetEnemyIndexes = [];

        switch (targetType) {
            case TargetType.EnemyAll:
                wave.forEach(function(e, i) {
                    if (e.currentHealth > 0) {
                        targetEnemyIndexes.push(i);
                    }
                });
                break;
            case TargetType.EnemyFirst:                
                var firstEnemyIndex = -1;
                wave.forEach(function(e, i) {
                    if (e.currentHealth > 0 && firstEnemyIndex == -1) {
                        firstEnemyIndex = i;
                    }
                });

                targetEnemyIndexes.push(firstEnemyIndex);
                break;
            default:
                console.log("Incorrect Target Type");
                debugger;
                break;
        } 

        return targetEnemyIndexes;
    }

    _updateScope() {        
        this._scope = angular.element(document.body).scope(); 
    }

    _healFriendlyRepeating(floorIndex, friendlyIndex, healAmount, abilityName) {
        var scope = angular.element(document.body).scope();
        var group = scope.data.dungeon.floors[floorIndex].group;
        //if group still on floor
        if (group) {
            var charId = group.characterIds[friendlyIndex];
            //if char still in group
            if (charId) {
                var char = scope.getCharacterById(charId);
                //if char is still alive
                if (char.currentHealth > 0) {
                    char.adjustHealth(healAmount);
                    console.log(abilityName + ' heals ' + char.name + ' for ' + healAmount);
                }            else {
                    scope.cancelCharacterPromises(charId);
                } 
            }        
        }        
    }

    _healFriendly(friendlyIndex, healAmount) {
        var floorIndex = this.currentFloor - 1;
        var floor = this._scope.data.dungeon.floors[floorIndex];
        var group = floor.group;
        
        if (!group) {
            return;
        }
        var char = this._scope.getCharacterById(group.characterIds[friendlyIndex]);

        console.log(this.name + ' heals ' + char.name + ' for ' + healAmount);
        char.adjustHealth(healAmount);        
    }

    _dealDamageToEnemyRepeating(floorIndex, enemyIndex, damage, abilityName) {
        var scope = angular.element(document.body).scope();
        var floor = scope.data.dungeon.floors[floorIndex];
        var group = floor.group;   
        var targetEnemy = floor.enemyWaves[0][enemyIndex];
        
      
        if (!group) {  //if no group 
            //cancel promises for floor
            scope.cancelFloorPromises(floorIndex);
            return;
        }
        if (!targetEnemy) { // if no enemy 
            //cancel promises for enemy
            scope.cancelEnemyPromises(floorIndex, enemyIndex);

            return;
        } 
        if (targetEnemy.currentHealth <= 0) { //if already dead
            //cancel promsies for enemy
            scope.cancelEnemyPromises(floorIndex, enemyIndex);

            return;
        }

        targetEnemy.currentHealth -= damage;
        console.log(abilityName + ' hits ' + targetEnemy.name + ' for ' + damage);

        //to-do merge with _dealDamageToEnemy
        if (targetEnemy.currentHealth <= 0) {
            //kill enemy
            console.log(targetEnemy.name + ' dies.');
            scope.cancelEnemyPromises(floorIndex, enemyIndex);

            //give enemy.level xp to all characters
            group.characterIds.forEach(c => {
                var floorChar = scope.getCharacterById(c);                    
                if (floorChar.currentHealth > 0) {
                    floorChar.gainExperience(targetEnemy.level);                
                }
            });

            scope.lootItemsFromEnemy(targetEnemy);
            scope.lootGoldFromEnemy(targetEnemy);

            //if no enemies left in wave - remove wave
            if (scope.getNumberOfLivingEnemiesInFloorWave(floorIndex) == 0) {
                floor.enemyWaves.shift();
                scope.cancelFloorPromises(floorIndex);

                //reset character attack bars between waves
                scope.resetCharacterAttacksByFloor(floorIndex);

                //if no waves left
                if (floor.enemyWaves.length == 0) {
                    //if characters alive
                    if (group) {
                        //if at max floor
                        if (!CONSTANTS.dungeonFloors[floorIndex + 1]) {
                            floor.group = null;
                            floor.resetting = true;
                            
                            group.characterIds.forEach(cId => {
                                scope.getCharacterById(cId).currentFloor = null;
                            });

                            //start floor bar to regen mobs
                            $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');

                            return;
                        }
                        //add new floor if necessary
                        if (scope.data.dungeon.maxFloor == scope.getCharacterById(group[0]).currentFloor) {
                            scope.data.dungeon.maxFloor++;
                            
                            scope.data.dungeon.floors.push({
                                enemyWaves: scope.generateEnemiesByFloor(floorIndex + 1),
                            });
                        }
                        //move characters up a floor                
                        
                        scope.data.dungeon.floors[floorIndex+1].group = group;
                        floor.group = null;

                        group.characterIds.forEach(c => {
                            var increaseChar = scope.getCharacterById(c);
                            if (increaseChar.maxFloor < increaseChar.currentFloor + 1) {
                                increaseChar.maxFloor = increaseChar.currentFloor + 1;
                            }                                
                            increaseChar.currentFloor = increaseChar.currentFloor + 1;
                        });
                    }

                    //start floor bar to regen mobs
                    $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');
                    floor.resetting = true;
                }            
            }
        }
    }


    _dealDamageToEnemy(enemyIndex, damage) {
        this._updateScope();

        var floorIndex = this.currentFloor - 1;
        var floor = this._scope.data.dungeon.floors[floorIndex];
        var group = floor.group;

        var targetEnemy = floor.enemyWaves[0][enemyIndex];

        targetEnemy.currentHealth -= damage;    
        console.log(this.name + ' hits ' + targetEnemy.name + ' for ' + damage);    

        if (targetEnemy.currentHealth <= 0) {
            //kill enemy
            console.log(targetEnemy.name + ' dies.');
            this._scope.cancelEnemyPromises(floorIndex, enemyIndex);

            //give enemy.level xp to all characters
            group.characterIds.forEach(c => {
                var floorChar = this._scope.getCharacterById(c);                    
                if (floorChar.currentHealth > 0) {
                    floorChar.gainExperience(targetEnemy.level);                
                }
            });

            this._scope.lootItemsFromEnemy(targetEnemy);
            this._scope.lootGoldFromEnemy(targetEnemy);

            //if no enemies left in wave - remove wave
            if (this._scope.getNumberOfLivingEnemiesInFloorWave(floorIndex) == 0) {
                floor.enemyWaves.shift();
                this._scope.cancelFloorPromises(floorIndex);

                //reset character attack bars between waves
                this._scope.resetCharacterAttacksByFloor(floorIndex);

                //if no waves left
                if (floor.enemyWaves.length == 0) {
                    //if characters alive
                    if (group) {
                        //if at max floor
                        if (!CONSTANTS.dungeonFloors[floorIndex + 1]) {
                            floor.group = null;
                            floor.resetting = true;
                            
                            group.characterIds.forEach(cId => {
                                this._scope.getCharacterById(cId).currentFloor = null;
                            });

                            //start floor bar to regen mobs
                            $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');

                            return;
                        }
                        //add new floor if necessary
                        if (this._scope.data.dungeon.maxFloor == this.currentFloor) {
                            this._scope.data.dungeon.maxFloor++;
                            
                            this._scope.data.dungeon.floors.push({
                                enemyWaves: this._scope.generateEnemiesByFloor(floorIndex + 1),
                            });
                        }
                        //move characters up a floor                
                        
                        this._scope.data.dungeon.floors[floorIndex+1].group = group;
                        floor.group = null;

                        group.characterIds.forEach(c => {
                            var increaseChar = this._scope.getCharacterById(c);
                            if (increaseChar.maxFloor < this.currentFloor + 1) {
                                increaseChar.maxFloor = this.currentFloor + 1;
                            }                                
                            increaseChar.currentFloor = this.currentFloor + 1;
                        });
                    }

                    //start floor bar to regen mobs
                    $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');
                    floor.resetting = true;
                }            
            }
        }
    }

    _triggerAbility(abilityIndex) {
        //do the things
        var ability = this.activeAbilities[abilityIndex];
        console.log(this.name + ' uses ' + ability.name);
        
        switch (ability.abilityType) {
            case AbilityType.Damage:                

                //get target(s)
                var targetEnemyIndexes = this._getTargetEnemyIndexes(ability.targetType);
                //calcuate damage done
                var totalDamage = 0;
                
                totalDamage = ability.baseDamage 
                            //+ (ability.weaponDamage * this.attackDamage) //use actual item
                            + (ability.strengthDamage * this.strength)
                            + (ability.intelligenceDamage * this.intelligence)
                            + (ability.agilityDamage * this.agility);

                //deal damage to each target    
                targetEnemyIndexes.forEach(eI => {
                    //do damage
                    this._dealDamageToEnemy(eI, totalDamage);
                });
                
                break;        
            case AbilityType.Heal:
                //get target(s)
                var targetFriendlyIndexes = this._getTargetFriendlyIndexes(ability.targetType);
                //calculate heal amount
                var healAmount = 0;

                healAmount = ability.baseHeal
                           + (ability.intelligenceHeal * this.intelligence);

                //heal                
                targetFriendlyIndexes.forEach(fI => {
                    this._healFriendly(fI, healAmount);
                });
                break;                        
            case AbilityType.Effect:
                //yikes

                switch(ability.targetType) {
                    case TargetType.EnemyFirst:
                    case TargetType.EnemyAll:
                        //DoT
                        var targetEnemyIndexes = this._getTargetEnemyIndexes(ability.targetType);
                        //calcuulate damage
                        var totalDamage = 0;
                        
                        totalDamage = ability.baseDamage 
                                    //+ (ability.weaponDamage * this.attackDamage) //use actual item
                                    + (ability.strengthDamage * this.strength)
                                    + (ability.intelligenceDamage * this.intelligence)
                                    + (ability.agilityDamage * this.agility);

                        targetEnemyIndexes.forEach(eI => {
                            var promise = this._scope.$interval(this._dealDamageToEnemyRepeating, ability.effectFrequency, effectCount, true, this.currentFloor -1, eI, totalDamage, ability.name);
                            this._scope.abilityPromises.push({
                                promise: promise,
                                floorIndex: this.currentFloor - 1,
                                enemyIndex: eI,
                                characterId: null,
                            })                                
                        }, this); 
                        break;
                    case TargetType.FriendlyLowestHP:
                    case TargetType.FriendlyFirst:
                    case TargetType.FriendlyAll:
                    case TargetType.Self:
                        if (ability.baseHeal > 0 || ability.intelligenceHeal > 0) {
                            //HoT                            
                            var targetFriendlyIndexes = this._getTargetFriendlyIndexes(ability.targetType);
                            //calculate heal amount
                            var healAmount = 0;

                            healAmount = ability.baseHeal
                                    + (ability.intelligenceHeal * this.intelligence);

                            var effectCount = parseInt(ability.effectDuration / ability.effectFrequency);

                            targetFriendlyIndexes.forEach(fI => {                                
                                var promise = this._scope.$interval(this._healFriendlyRepeating, ability.effectFrequency, effectCount, true, this.currentFloor -1, fI, healAmount, ability.name);
                                this._scope.abilityPromises.push({
                                    promise: promise,
                                    floorIndex: this.currentFloor - 1,
                                    enemyIndex: null,
                                    characterId: this._scope.getCharacterIdFromIndex(this.currentFloor - 1, fI),
                                });
                            }, this);                            
                        } else if (ability.effectStat != Stats.None || ability.blockPercent > 0 || ability.blockFlat > 0) {
                            //buff
                            var targetFriendlyIndexes = this._getTargetFriendlyIndexes(ability.targetType);                                                     
                            targetFriendlyIndexes.forEach(fI => {
                                this._scope.applyOrUpdateBuff(this._scope.getCharacterIdFromIndex(this.currentFloor - 1, fI), ability)                            
                            }, this);
                        }
                        break;                    
                    default:                        
                        console.log("Incorrect Target Type");
                        debugger;
                        break;
                }               
                break;        
            default:
                console.log("Incorrect Ability Type");
                debugger;
                break;
        }
        
        ability.resetCooldown();
    }

    

    // Public Functions     

    fullHeal() {
        this.currentHealth = this.maxHealth;
    }

    adjustHealthWithoutDR(adjustment) {
        this.currentHealth += adjustment;

        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }

    adjustHealthWithDR(adjustment) {
        var originalAdjustment = adjustment;
        this._updateScope();
        
        var blockedFlat = this._scope.getBlockFlatFromBuffs(this.id);
        var blockedP = this._scope.getBlockPercentFromBuffs(this.id);

        adjustment = adjustment * (1 - (blockedP / 100));
        adjustment = adjustment - blockedFlat;
        adjustment = Math.round(adjustment);

        this.currentHealth += adjustment;

        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }

        console.log(this.name + ' takes ' + (adjustment * -1) + ' damage. (' + ((originalAdjustment - adjustment) * -1) + ' blocked)');
    }

    gainExperience(exp) {
        this.experience += exp;
    }

    attack() {
        this._updateScope();

        var ability1Ready = false;    
        var ability2Ready = false;
        var ability3Ready = false;
        if (this.activeAbilities[0]) {
            var ability1Ready = this.activeAbilities[0].isReady();        
        }
        if (this.activeAbilities[1]) {
            var ability2Ready = this.activeAbilities[1].isReady();
        }
        if (this.activeAbilities[2]) {
            var ability3Ready = this.activeAbilities[2].isReady();
        }
        
        //console.log('Ability1-' + ability1Ready + '| Ability2-' + ability2Ready + '| Ability3-' + ability3Ready);

        if (ability1Ready) {
            //do ability 1
            this._triggerAbility(0);
        } else if (ability2Ready) {
            // do ability 2          
            this._triggerAbility(1);
        } else if (ability3Ready) {
            // do ability 3
            this._triggerAbility(2);
        } else {
            //auto attack

            //get firstEnemy
            var targetIndexes = this._getTargetEnemyIndexes(TargetType.EnemyFirst);      
            
            targetIndexes.forEach(tI => {
                this._dealDamageToEnemy(tI, this.attackDamage);
            })            
        }
    }

    setActiveAbility(index, ability) {
        this.activeAbilities[index] = ability;
    }

    setActiveAbilityByName(index, name) {
        this.class.abilities.forEach(a => {
            if (a.name == name) {
                this.setActiveAbility(index, a);
            }
        });
    }
}

/*

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


*/



                            









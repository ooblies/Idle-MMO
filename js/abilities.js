//Abilities
//single target
// damage, heal
//aoe
//dot, hot
//buff

const TargetType = {
    EnemyAll: 'EnemyAll',
    EnemyFirst: 'EnemyFirst',
    FriendlyAll: 'FriendlyAll',
    FriendlyFirst: 'FriendlyFirst',
    FriendlyLowestHP: 'FriendlyLowestHP',
    Self: 'Self',

}

//Ability type may not be necessary, could probably deduce from parameters
const AbilityType = {
    Damage: 'Damage',
    Heal: 'Heal',
    Effect: 'Effect', //buff,debuff,block    
}

class Ability {
    constructor(name, abilityType, targetType, cooldown,
                baseDamage, weaponDamage, strDamage, intDamage, agiDamage,
                baseHeal, intHeal,
                effectDuration, effectFrequency, blockFlat, blockPercent, 
                effectStat, effectStatIncreaseMultiplier, effectStatIncreaseAmount) {
        this.name = name;
        this.abilityType = abilityType;
        this.targetType = targetType        
        this.cooldown = cooldown; //ms
        
        this.baseDamage = baseDamage;        
        this.weaponDamage = weaponDamage;        //multiplier
        this.strengthDamage = strDamage;        
        this.intelligenceDamage = intDamage;        
        this.agilityDamage = agiDamage;        

        //heal
        this.baseHeal = baseHeal; //flat heal 
        this.intelligenceHeal = intHeal; //scales with int

        //effect
        this.effectDuration = effectDuration; //ms
        this.effectFrequency = effectFrequency; //ms
        this.blockFlat = blockFlat;
        this.blockPercent = blockPercent; //1-100 %

        //stats 
        this.effectStat = effectStat;
        this.effectStatIncreaseMultiplier = effectStatIncreaseMultiplier;
        this.effectStatIncreaseAmount = effectStatIncreaseAmount;

        this.lastUsed = window.performance.now() - this.cooldown;

    }
    
    // Getter

    get cooldownNow() {
        return window.performance.now() - this.lastUsed;
    }

    // Private Functions

    // Public Functions

    isReady() {
        if (this.lastUsed + this.cooldown > window.performance.now()) {
            return false;
        } else {
            return true;
        }
    }

    

    resetCooldown() {
        this.lastUsed = window.performance.now();
    }
}

const abilities = {
    //Warrior    
    BigSmash: new Ability("Big Smash", AbilityType.Damage, TargetType.EnemyAll, 6000, //generic
    0,0,2,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    BiggerSmash: new Ability("Bigger Smash", AbilityType.Damage, TargetType.EnemyFirst, 12000, //generic
    0,0,4,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    BiggestSmash: new Ability("Biggest Smash", AbilityType.Damage, TargetType.EnemyFirst, 24000, //generic
    50,0,5,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    Guard: new Ability('Guard', AbilityType.Effect, TargetType.Self, 5000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    5000,0,0,99,    //effect
    Stats.None,0,0),   //stats
    Strength: new Ability('Strength', AbilityType.Effect, TargetType.Self, 5000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    5000,0,0,0,    //effect
    Stats.Strength,2,5),   //stats
                            
    //Mage
    Firebolt: new Ability("Firebolt", AbilityType.Damage, TargetType.EnemyFirst, 5000, //generic
    1,0,0,1,0,       //base, weapon, str, int, agi
    0,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    Firewave: new Ability("Firewave", AbilityType.Damage, TargetType.EnemyAll, 15000, //generic
    1,0,0,1,0,       //base, weapon, str, int, agi
    0,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    Firestorm: new Ability("Firestorm", AbilityType.Effect, TargetType.EnemyAll, 5000, //generic
    10,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    5000,1000,0,0,    //effect
    Stats.None,0,0),   //stats
    Quicken: new Ability("Quicken", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    5000,0,0,0,    //effect
    Stats.Agility,0,5),   //stats
    Smarterizer: new Ability("Smarterizer", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    5000,0,0,0,    //effect
    Stats.Intelligence,0,5),   //stats


    //Cleric
    HealFirst: new Ability("Heal", AbilityType.Heal, TargetType.FriendlyFirst, 100000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,       //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    HealAll: new Ability("Group Heal", AbilityType.Heal, TargetType.FriendlyAll, 100000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    HealLowest: new Ability("Emergency Heal", AbilityType.Heal, TargetType.FriendlyLowestHP, 15000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    10,0,        //heal
    0,0,0,0,    //effect
    Stats.None,0,0),   //stats
    Fortify: new Ability("Fortify", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    0,0,        //heal
    5000,0,0,0,    //effect
    Stats.Constitution,0,3),   //stats
    Regenerate: new Ability("Regenerate", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    0,0,0,0,0,       //base, weapon, str, int, agi
    1,0,        //heal
    5000,1000,0,0,    //effect
    Stats.None,0,0),   //stat
    
}





//Abilities
//single target
//damage, heal
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
                damageMultiplier, damageAmount,
                healAmount,
                effectDuration, effectFrequency, blockAmount, 
                effectStat, effectStatIncreaseMultiplier, effectStatIncreaseAmount) {
        this.Name = name;
        this.AbilityType = abilityType;
        this.TargetType = targetType        
        this.Cooldown = cooldown; //ms

        //damage
        this.DamageMultiplier = damageMultiplier; //ability damage is a calculated from auto-attack damage
        this.DamageAmount = damageAmount; //ability damage is flat (scales with int)

        //heal
        this.HealAmount = healAmount; //flat heal amount (scales with... a stat)

        //effect
        this.EffectDuration = effectDuration; //ms
        this.EffectFrequency = effectFrequency; //ms
        this.BlockAmount = blockAmount; //1-100 %

        //stats 
        this.EffectStat = effectStat;
        this.EffectStatIncreaseMultiplier = effectStatIncreaseMultiplier;
        this.EffectStatIncreaseAmount = effectStatIncreaseAmount;

    }
}


const Abilities = {
    //Warrior    
    BigSmash: new Ability("Big Smash", AbilityType.Damage, TargetType.EnemyFirst, 6000, //generic
                            4,0,      //damage
                            0,        //heal
                            0,0,0,    //effect
                            Stats.None,0,0),   //stats
    BiggerSmash: new Ability("Bigger Smash", AbilityType.Damage, TargetType.EnemyFirst, 12000, //generic
                            8,0,      //damage
                            0,        //heal
                            0,0,0,    //effect
                            Stats.None,0,0),   //stats
    BiggestSmash: new Ability("Biggest Smash", AbilityType.Damage, TargetType.EnemyFirst, 24000, //generic
                            0,1000,   //damage
                            0,        //heal
                            0,0,0,    //effect
                            Stats.None,0,0),   //stats
    Guard: new Ability('Guard', AbilityType.Effect, TargetType.Self, 5000, //generic
                            0,0,      //damage
                            0,        //heal
                            5000,0,25,    //effect
                            Stats.None,0,0),   //stats
    Strength: new Ability('Strength', AbilityType.Effect, TargetType.Self, 5000, //generic
                            0,0,      //damage
                            0,        //heal
                            5000,0,0,    //effect
                            Stats.Strength,0,5),   //stats
                            
    //Mage
    Firebolt: new Ability("Firebolt", AbilityType.Damage, TargetType.EnemyFirst, 5000, //generic
    0,5,      //damage
    0,        //heal
    0,0,0,    //effect
    Stats.None,0,0),   //stats
    Firewave: new Ability("Firewave", AbilityType.Damage, TargetType.EnemyAll, 15000, //generic
    0,3,      //damage
    0,        //heal
    0,0,0,    //effect
    Stats.None,0,0),   //stats
    Firestorm: new Ability("Firestorm", AbilityType.Damage, TargetType.EnemyAll, 5000, //generic
    0,3,      //damage
    0,        //heal
    5000,1000,0,    //effect
    Stats.None,0,0),   //stats
    Quicken: new Ability("Quicken", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    4,0,      //damage
    0,        //heal
    0,0,0,    //effect
    Stats.Agility,0,5),   //stats
    Smarterizer: new Ability("Smarterizer", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    4,0,      //damage
    0,        //heal
    0,0,0,    //effect
    Stats.Intelligence,0,5),   //stats


    //Cleric
    HealFirst: new Ability("Heal", AbilityType.Heal, TargetType.FriendlyFirst, 5000, //generic
    0,0,      //damage
    5,        //heal
    0,0,0,    //effect
    Stats.None,0,0),   //stats
    HealAll: new Ability("Group Heal", AbilityType.Heal, TargetType.FriendlyAll, 10000, //generic
    0,0,      //damage
    2,        //heal
    0,0,0,    //effect
    Stats.None,0,0),   //stats
    HealLowest: new Ability("Emergency Heal", AbilityType.Heal, TargetType.FriendlyLowestHP, 15000, //generic
    0,0,      //damage
    10,        //heal
    0,0,0,    //effect
    Stats.None,0,0),   //stats
    Regenerate: new Ability("Regenerate", AbilityType.Effect, TargetType.FriendlyFirst, 5000, //generic
    0,0,      //damage
    1,        //heal
    5000,1000,0,    //effect
    Stats.None,0,0),   //stats
    Fortify: new Ability("Fortify", AbilityType.Effect, TargetType.FriendlyAll, 5000, //generic
    0,0,      //damage
    0,        //heal
    5000,0,0,    //effect
    Stats.Constitution,0,3),   //stats
}



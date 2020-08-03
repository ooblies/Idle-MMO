var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope, $timeout, $interval) {    
    $scope.CONSTANTS = CONSTANTS;
    $scope.performance = {};
    $scope.performance.timeSinceSave = 0;
    $scope.data = {};
    $scope.createCharacter = {};    

    $scope.saveGame = function saveGame() {
        var saveString = JSON.stringify($scope.data);
        localStorage.setItem('idleMMOSave',saveString);
    };
    $scope.loadGame = function loadGame() {
        var saveString = localStorage.getItem("idleMMOSave");
        if (saveString) {
            var saveObject = JSON.parse(saveString);
            $scope.data = saveObject;
        } else {
            $scope.startNewGame();
        }        
    };
    $scope.deleteSave = function deleteSave() {
        localStorage.removeItem('idleMMOSave');
        $scope.startNewGame();
    }
    $scope.startNewGame = function startNewGame() {
        $scope.data = {};
        $scope.data.gold = 0;
        $scope.data.characters = [];
        $scope.data.dungeon = {};
        $scope.data.dungeon.floors = [];
        //temp characters
        $scope.createCharacterObject(1,'Ooblies',CONSTANTS.classes.Warrior);

        $scope.data.sharedInventory = [];
        
        $scope.data.dungeon.maxFloor = 1;
        $scope.data.dungeon.maxFloor = $scope.data.characters.reduce(function(prev, current) {
            return (prev.maxFloor > current.maxFloor) ? prev : current
        }).maxFloor;
    
        $scope.generateDungeonEnemies();
        //create character spots
        $scope.data.dungeon.floors.forEach(f => {
            f.characters = [];
        });
    };

    //STATS
    $scope.getEffectiveStat = function getEffectiveStat(stat, charId) {
        var char = $scope.getCharacterById(charId);
        var level = $scope.getCharacterLevel(char.experience);
        
        var effectiveStat = 0;

        switch (stat) {
            case Stats.Strength:
                effectiveStat = char.class.startingStr + (level * char.class.increasePerLevelStr);
                break;
            case Stats.Agility:
                effectiveStat = char.class.startingAgi + (level * char.class.increasePerLevelAgi);
                break;
            case Stats.Intelligence:
                effectiveStat = char.class.startingInt + (level * char.class.increasePerLevelInt);
                break;
            case Stats.Constitution:
                effectiveStat = char.class.startingCon + (level * char.class.increasePerLevelCon);
                break;
            default:                
        }

        return effectiveStat;
    }

    $scope.getEffectiveAttackSpeed = function getEffectiveAttackSpeed(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveAgility = $scope.getEffectiveStat(Stats.Agility, charId);

        var effectiveMultiplier = 1 - (effectiveAgility/200);
        var effectiveSpeed = char.class.attackSpeed * effectiveMultiplier;
        //to-do: add weapon speed

        return effectiveSpeed;
    }

    $scope.getEffectiveAttackDamage = function getEffectiveAttackDamage(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveStrength = $scope.getEffectiveStat(Stats.Strength, charId);
        //to-do: add weapon damage

        return effectiveStrength * 2;

    }

    $scope.getEffectiveMaxHealth = function getEffectiveMaxHealth(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveConstitution = $scope.getEffectiveStat(Stats.Constitution, charId);
        
        return effectiveConstitution * 10;
    }

    $scope.getEffectiveAbilityMultiplier = function getEffectiveAbilityMultiplier(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveIntelligence = $scope.getEffectiveStat(Stats.Intelligence, charId);
        
        return 1 + (effectiveIntelligence/200);
    }

    $scope.getCharacterLevelById = function getCharacterLevelById(charId) {
        var char = $scope.getCharacterById(charId);
        return $scope.getCharacterLevel(char.experience);
    };

    $scope.getCharacterLevel = function(experience) {
        for (l = 0; l < CONSTANTS.levels.length; l++) {
            if (CONSTANTS.levels[l] <= experience && CONSTANTS.levels[l + 1] > experience) {
                return l;
            }
        }
    };
    $scope.getExperienceMin = function(experience) {
        return CONSTANTS.levels[$scope.getCharacterLevel(experience)];
    };
    $scope.getExperienceMax = function(experience) {
        return CONSTANTS.levels[$scope.getCharacterLevel(experience) + 1];
    }

    $scope.popover = function() {
        $("[data-toggle=popover]").popover();
    };

    //Send a character to the first floor of the dungeon
    $scope.enterDungeon = function enterDungeon(characterId) {
        var char = $scope.getCharacterById(characterId);

        //if next floor character count < floor max characters
        if ($scope.data.dungeon.floors[0].characters.length == 0) {
            //add character
            $scope.data.dungeon.floors[0].characters.push(char);
            //activate first enemy
            $scope.data.dungeon.floors[0].enemies[0].isAttacking = true;
        }

    };

    $scope.getCharacterById = function(characterId) {
        return $scope.data.characters.find(c => {
            return c.id == characterId
        });
    };

    $scope.getCharacterCurrentHealth = function(characterId) {
        var char = $scope.getCharacterById(characterId);
        
        return char.currentHealth;
    }

    $scope.triggerEnemyAttack = function triggerEnemyAttack(enemy) {
        var floorIndex = enemy.getAttribute('floor-index');
        var enemyIndex = enemy.getAttribute('enemy-index');
        var attackDamage = enemy.getAttribute('attack-damage');

        $scope.data.dungeon.floors[floorIndex].characters[0].currentHealth -= attackDamage;

        var enemyObject = $scope.data.dungeon.floors[floorIndex].enemies[enemyIndex];

        var possibleAttacks = [];
        enemyObject.attackProbabilities.forEach(function(a, index) {
            for (ai = 0; ai < a; ai++) {
                possibleAttacks.push(index);
            }
        });

        var randIndex = Math.floor(Math.random() * possibleAttacks.length);
        enemyObject.currentAttackIndex = possibleAttacks[randIndex];
    }

    //generate a list of enemies for each floor of the dungeon
    $scope.generateDungeonEnemies = function generateDungeonEnemies() {
        for (iFloor = 0; iFloor < $scope.data.dungeon.maxFloor; iFloor++) {
            var floorEnemies = $scope.generateEnemiesByFloor(iFloor);
            $scope.data.dungeon.floors.push({ enemies: floorEnemies });
        }
    };

    //generate a list of enemies for a single floor
    $scope.generateEnemiesByFloor = function generateEnemiesByFloor(floorIndex) {
        var floor = CONSTANTS.dungeonFloors[floorIndex];
        var possibleEnemies = floor.possibleEnemies;
        var enemyProbabilities = floor.enemyProbabilities;
        var enemyList = [];

        possibleEnemies.forEach(function(value, index) {
            for (i = 0; i < enemyProbabilities[index]; i++) {
                enemyList.push(CONSTANTS.enemies[value.name]);
            };
        });
        var generatedEnemies = [];

        for (i = 0; i < floor.enemiesRequiredToPass; i++) {
            generatedEnemies.push(JSON.parse(JSON.stringify(enemyList[Math.floor(Math.random() * enemyList.length)])));
        }

        //generate attacks
        generatedEnemies.forEach(function(enemy, index) {
            enemy.currentAttackIndex = 0;

            var possibleAttacks = [];
            enemy.attackProbabilities.forEach(function(a, index) {
                for (ai = 0; ai < a; ai++) {
                    possibleAttacks.push(index);
                }
            });

            var randIndex = Math.floor(Math.random() * possibleAttacks.length);
            enemy.currentAttackIndex = possibleAttacks[randIndex];

            enemy.isAttacking = false;
        });


        return generatedEnemies;
    };


    $scope.createCharacterObject = function createCharacterObject(id, name, newClass) {
        char = {
            name: name,
            class: newClass,
            id: id,
            experience: 1,
            maxFloor: 1,
            strength: newClass.startingStr,
            agility: newClass.startingAgi,
            intelligence: newClass.startingInt,
            constitution: newClass.startingCon,
        };

        $scope.data.characters.push(char);

        char.currentHealth = $scope.getEffectiveMaxHealth(id);
    }

    $scope.createCharacter = function createCharacter() {
        //if form is valid
        if ($('#formCreateCharacter')[0].checkValidity() === true) {

            var newName = $('#createCharacterFormName')[0].value;
            var newClass = CONSTANTS.classes[$('#createCharacterFormClass')[0].value];
            var newId = $scope.data.characters.length + 1;

            $scope.createCharacterObject(newId, newName, newClass);

            $('#formCreateCharacter')[0].classList.remove('was-validated');
            $('#formCreateCharacter')[0].reset();

            $('#createCharacterModal').modal('toggle');
        }

    };
    $scope.attack = function attack(character) {
        var char = $scope.getCharacterById(character.getAttribute('character-id'));        
        var floor = $scope.data.dungeon.floors[character.getAttribute('floor-index')];

        var effectiveDamage = $scope.getEffectiveAttackDamage(char.id);
        //first enemy
        var nextEnemy = floor.enemies[0];

        nextEnemy.currentHealth -= effectiveDamage;
    };

    $scope.killCharacter = function killCharacter(character) {
        var char = $scope.getCharacterById(character.getAttribute('character-id'));
        var floorIndex = parseInt(character.getAttribute('floor-index'));

        //To-do : send to heal somewhere
        char.currentHealth = $scope.getEffectiveMaxHealth(char.id);

        //Remove character from floor.characters
        $scope.data.dungeon.floors[floorIndex].characters = $scope.data.dungeon.floors[floorIndex].characters.filter(c => {
            return char.id != c.id;
        });

        //if floor has no characters, reset enemies
        if ($scope.data.dungeon.floors[floorIndex].characters.length == 0) {

            //start floor bar to regen mobs
            $('#floor' + floorIndex + 'bar')[0].classList.add('progress-bar-increasing');
        }
    };


    $scope.lootItemsFromEnemy = function lootItemsFromEnemy(enemy) {
        
        enemy.lootTable.forEach(i => {
            var rand = Math.floor(Math.random() * 100) + 1; //random from 1-100

            if (i.chance > rand) {
                var randQ = Math.floor(Math.random() * (i.quantityMax - i.quantityMin + 1)) + i.quantityMin;
                $scope.addItemToInventory(i.item, randQ);
            }
        });        
    };

    $scope.lootGoldFromEnemy = function lootGoldFromEnemy(enemy) {
        var randG = Math.floor(Math.random() * (enemy.goldDroppedMax - enemy.goldDroppedMin + 1)) + enemy.goldDroppedMin;
        $scope.data.gold += randG;
        
    };

    $scope.addItemToInventory = function addItemToInventory(item, quantity) {
        if ($scope.data.sharedInventory.filter(f => { return f.name == item.name }).length == 1) {
            $scope.data.sharedInventory.filter(f => { return f.name == item.name })[0].count += quantity;
        } else {
            item.count = quantity;
            $scope.data.sharedInventory.push(item);
        }
    };

    $scope.killEnemy = function killEnemy(enemy) {
        var floorIndex = parseInt(enemy.getAttribute('floor-index'));
        var enemyIndex = parseInt(enemy.getAttribute('enemy-index'));
        var enemyName = enemy.getAttribute('enemy-name');

        var enemy = CONSTANTS.enemies[enemyName];

        $scope.data.dungeon.floors[floorIndex].enemies.splice(enemyIndex, 1);

        //give enemy.level xp to all characters
        $scope.data.dungeon.floors[floorIndex].characters.forEach(c => {
            //here
            c.experience += enemy.level;
        });

        //give item to first character
        $scope.lootItemsFromEnemy(enemy);
        $scope.lootGoldFromEnemy(enemy);

        if ($scope.data.dungeon.floors[floorIndex].enemies.length > 0) {
            //if enemies left
            $scope.data.dungeon.floors[floorIndex].enemies[0].isAttacking = true;
        } else {
            //if no enemies left
            //if characters
            if ($scope.data.dungeon.floors[floorIndex].characters.length > 0) {
                //add new floor if necessary
                if ($scope.data.dungeon.maxFloor == floorIndex + 1) {
                    $scope.data.dungeon.maxFloor++;
                    
                    $scope.data.dungeon.floors.push({
                        enemies: $scope.generateEnemiesByFloor(floorIndex + 1),
                        characters: [],
                    });
                }
                //move characters up a floor
                $scope.data.dungeon.floors[floorIndex + 1].characters = $scope.data.dungeon.floors[floorIndex].characters;
                $scope.data.dungeon.floors[floorIndex].characters = [];
                $scope.data.dungeon.floors[floorIndex + 1].enemies[0].isAttacking = true;
            }

            //start floor bar to regen mobs
            $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');
        }
    };

    $scope.regenerateFloorEnemies = function regenerateFloorEnemies(floor) {
        var floorIndex = parseInt(floor.getAttribute('floor-index'));
        floor.classList.remove('progress-bar-increasing');
        floor.ariaValueNow = 0;
        $scope.data.dungeon.floors[floorIndex].enemies = $scope.generateEnemiesByFloor(floorIndex);
    };

    $scope.tick = function tick() {
        //run 20/s - all progress bars are updated here
        $scope.performance.timeSinceSave += CONSTANTS.performance.tickDuration;
        if ($scope.performance.timeSinceSave > 5000) {
            $scope.saveGame();
            $scope.performance.timeSinceSave = 0;
        }

        var start = window.performance.now();
        //code goes here

        var progressBars = document.getElementsByClassName("progress-bar-increasing");
        var toAdd = CONSTANTS.performance.tickDuration;


        //all progressBars with progress-bar-increasing will auto-increment
        Array.from(progressBars).forEach((element) => {
            //if not disabled
            if (element.getAttribute('is-enabled') != 'false') {
                element.classList.remove("no-transition");
                element.classList.add("progress-bar-transition");

                if (parseInt(element.ariaValueMax) <= 50) {
                    element.style.width = "100%";
                    element.classList.add("progress-bar-striped");
                    element.classList.add("progress-bar-animated");

                    if (element.onsubmit) {
                        element.onsubmit();
                    }   
                    return;
                }
                if (parseInt(element.ariaValueNow) > parseInt(element.ariaValueMax)) {
                    element.classList.add("no-transition");
                    element.classList.remove("progress-bar-transition");
                    element.ariaValueNow = 0;
                    element.style.width = "0%";

                    if (element.onsubmit) {
                        element.onsubmit();
                    }   
                    return;
                }

                element.ariaValueNow = parseInt(element.ariaValueNow) + toAdd;

                var progress = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
                element.style.width = progress * 100 + "%";
            }
        });

        //all health-bar will submit on empty
        var healthBars = document.getElementsByClassName("health-bar");

        Array.from(healthBars).forEach((element) => {
            var p = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = p * 100 + "%";

            if (parseInt(element.ariaValueNow) <= 0) {
                if (element.onsubmit) {
                    element.onsubmit();
                }   
            }
        });

        //all attack bars will disable with no target
        var attackBars = document.getElementsByClassName("attack-bar");

        Array.from(attackBars).forEach((element) => {
            var floorIndex = parseInt(element.getAttribute('floor-index'));
            var enemyIndex = parseInt(element.getAttribute('enemy-index'));
            var characterId = element.getAttribute('character-id');

            if (enemyIndex >= 0) {
                if (element.getAttribute('is-enabled') != 'false') {
                    //check if no characters on floor
                    if ($scope.data.dungeon.floors[floorIndex].characters.length == 0) {
                        if ($scope.data.dungeon.floors[floorIndex].enemies[enemyIndex]) {
                            $scope.data.dungeon.floors[floorIndex].enemies[enemyIndex].isAttacking = false;
                            element.ariaValueNow = 0;
                        }                        
                    }
                }
            }

            if (characterId) {
                //To-do: disable when no enemies
            }
        });

        //all experience bars will submit on full
        var xpBars = document.getElementsByClassName("xp-bar");

        Array.from(xpBars).forEach((element) => {
            var p = (parseInt(element.ariaValueNow) - parseInt(element.ariaValueMin)) / parseInt(element.ariaValueMax);
            element.style.width = p * 100 + "%";

            if (element.ariaValueNow >= element.ariaValueMax) {
                if (element.onsubmit) {
                    element.onsubmit();
                }                
            }
        });

        var stop = window.performance.now();
        $scope.performance.timePerTick = (stop - start).toFixed(0);
    };
    
    $('#characterModal').on('show.bs.modal', function (event) {
        var triggeredBy = $(event.relatedTarget);
        var charId = triggeredBy.data('character-id');
        var char = $scope.getCharacterById(charId);

        var modal = $(this);
        modal.find('.modal-title').text(char.name);
        modal.find('#lblCharacterModalClass')[0].innerText = char.class.name;
        modal.find('#lblCharacterModalHealth')[0].innerText = $scope.getEffectiveMaxHealth(charId);
        modal.find('#lblCharacterModalLevel')[0].innerText = $scope.getCharacterLevelById(charId);
        modal.find('#lblCharacterModalAttackSpeed')[0].innerText = $scope.getEffectiveAttackSpeed(charId);
        modal.find('#lblCharacterModalMaxFloor')[0].innerText = char.maxFloor;
        modal.find('#lblCharacterModalAttackDamage')[0].innerText = $scope.getEffectiveAttackDamage(charId);

        modal.find('#lblCharacterModalStrength')[0].innerText = char.strength;
        modal.find('#lblCharacterModalAgility')[0].innerText = char.agility;
        modal.find('#lblCharacterModalIntelligence')[0].innerText = char.intelligence;
        modal.find('#lblCharacterModalConstitution')[0].innerText = char.constitution;

        if (char.class.abilities[0]) {
            modal.find('#lblCharacterModalAbility1')[0].innerText = char.class.abilities[0].Name;
        }
        
        if (char.class.abilities[1]) {
            modal.find('#lblCharacterModalAbility2')[0].innerText = char.class.abilities[1].Name;
        }
        
        if (char.class.abilities[2]) {
            modal.find('#lblCharacterModalAbility3')[0].innerText = char.class.abilities[2].Name;
        }
        
    })

    //setup for initial load
    $interval($scope.tick, CONSTANTS.performance.tickDuration);
    $scope.loadGame();
});

(function() {
    'use strict';
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();


//call scoped function from outside scope.
function ngFire(fName, p1, p2) {
    var $scope = angular.element(document.body).scope()
    if (p2) {
        $scope[fName](p1, p2);
    } else if (p1) {
        $scope[fName](p1);
    } else {
        $scope[fName]();
    }

}
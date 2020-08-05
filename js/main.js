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
        
            $scope.data.dungeon.maxFloor = 1;
            $scope.data.dungeon.maxFloor = $scope.data.characters.reduce(function(prev, current) {
            return (prev.maxFloor > current.maxFloor) ? prev : current
        }).maxFloor;
    
        } else {
            $scope.startNewGame();
        }        
    };
    $scope.deleteSave = function deleteSave() {
        localStorage.removeItem('idleMMOSave');
        location.reload(true);
        $scope.startNewGame();
    }
    $scope.startNewGame = function startNewGame() {
        $scope.data = {};
        $scope.data.gold = 0;
        $scope.data.characters = [];
        $scope.data.groups = [];
        $scope.data.dungeon = {};
        $scope.data.dungeon.floors = [];
        //temp characters
        $scope.createCharacterObject(1,'Ooblies',CONSTANTS.classes.Warrior);
        $scope.createCharacterObject(2,'Rohnjudes',CONSTANTS.classes.Mage);
        $scope.createGroupObject(1,'TestGroup',$scope.data.characters[0].id, $scope.data.characters[1].id);

        $scope.data.sharedInventory = [];
        
        $scope.data.dungeon.maxFloor = 1;
        $scope.data.dungeon.maxFloor = $scope.data.characters.reduce(function(prev, current) {
            return (prev.maxFloor > current.maxFloor) ? prev : current
        }).maxFloor;
    
        $scope.generateDungeonEnemies();        
    };

    //STATS
    $scope.getEffectiveStat = function getEffectiveStat(stat, charId) {
        var char = $scope.getCharacterById(charId);
        var level = $scope.getCharacterLevel(char.experience);
        
        var effectiveStat = 0;

        switch (stat) {
            case CONSTANTS.stats.Strength:
                effectiveStat = char.class.startingStr + (level * char.class.increasePerLevelStr);
                break;
            case CONSTANTS.stats.Agility:
                effectiveStat = char.class.startingAgi + (level * char.class.increasePerLevelAgi);
                break;
            case CONSTANTS.stats.Intelligence:
                effectiveStat = char.class.startingInt + (level * char.class.increasePerLevelInt);
                break;
            case CONSTANTS.stats.Constitution:
                effectiveStat = char.class.startingCon + (level * char.class.increasePerLevelCon);
                break;
            default:                
        }

        return effectiveStat;
    }

    $scope.getEffectiveAttackSpeed = function getEffectiveAttackSpeed(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveAgility = $scope.getEffectiveStat(CONSTANTS.stats.Agility, charId);

        var effectiveMultiplier = 1 - (effectiveAgility/200);
        var effectiveSpeed = char.class.attackSpeed * effectiveMultiplier;
        //to-do: add weapon speed

        return effectiveSpeed;
    }

    $scope.getEffectiveAttackDamage = function getEffectiveAttackDamage(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveStrength = $scope.getEffectiveStat(CONSTANTS.stats.Strength, charId);
        //to-do: add weapon damage

        return effectiveStrength * 2;

    }

    $scope.getEffectiveMaxHealth = function getEffectiveMaxHealth(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveConstitution = $scope.getEffectiveStat(CONSTANTS.stats.Constitution, charId);
        
        return effectiveConstitution * 10;
    }

    $scope.getEffectiveAbilityMultiplier = function getEffectiveAbilityMultiplier(charId) {
        var char = $scope.getCharacterById(charId);
        var effectiveIntelligence = $scope.getEffectiveStat(CONSTANTS.stats.Intelligence, charId);
        
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

    $scope.getCharactersByGroupId = function getCharactersByGroupId(groupId) {
        if (groupId) {
            var group = $scope.getGroupById(groupId) ;
            var characters = [];
            group.characterIds.forEach(c => {
                characters.push($scope.getCharacterById(c));
            });

            return characters;            
        }
        else {
            return [];
        }
    }

    $scope.healGroup = function healGroup(groupId) {
        var group = $scope.getGroupById(groupId);
        group.characterIds.forEach(c => {
            $scope.healCharacter(c);
        });
    }



    //Send a character to the first floor of the dungeon
    $scope.sendGroupToDungeon = function sendGroupToDungeon(groupId) {
        var group = $scope.getGroupById(groupId);
        $scope.healGroup(groupId);

        //if floor is empty, add group
        if (!$scope.data.dungeon.floors[0].group && !$scope.data.dungeon.floors[0].resetting) {
            $scope.data.dungeon.floors[0].group = group;
        }
    };

    $scope.getGroupById = function(groupId) {
        return $scope.data.groups.find(g => {
            return g.id == groupId
        });
    }

    $scope.getCharacterById = function(characterId) {
        return $scope.data.characters.find(c => {
            return c.id == characterId
        });
    };

    $scope.getCharacterCurrentHealth = function(characterId) {
        var char = $scope.getCharacterById(characterId);
        
        return char.currentHealth;
    }

    $scope.adjustCharacterCurrentHealth = function(characterId, adjustment) {
        var char = $scope.getCharacterById(characterId);
        char.currentHealth += adjustment;

        if (char.currentHealth > $scope.getEffectiveMaxHealth(characterId)) {
            char.currentHealth = $scope.getEffectiveMaxHealth(characterId);            
        }
        if (char.currentHealth < 0) {
            char.currentHealth = 0;
        }
    }

    $scope.healCharacter = function(characterId) {
        var char = $scope.getCharacterById(characterId);
        char.currentHealth = $scope.getEffectiveMaxHealth(characterId);
    }

    $scope.triggerEnemyAttack = function triggerEnemyAttack(enemy) {
        var floorIndex = enemy.getAttribute('floor-index');
        var attackDamage = enemy.getAttribute('attack-damage');
        var attackName = enemy.getAttribute('attack-name');
        var enemyName = enemy.getAttribute('enemy-name');
        var enemyIndex = enemy.getAttribute('enemy-index');

        var group = $scope.data.dungeon.floors[floorIndex].group

        if (group) {
            
            var targetCharId = -1;
            group.characterIds.forEach(function(c) {
                if ($scope.getCharacterCurrentHealth(c) > 0 && targetCharId == -1) {
                    targetCharId = c;
                }
            });

            if (targetCharId == -1) {
                //everyone's  dead
                group.characterIds.forEach(c => {
                    $scope.healCharacter(c);                    
                });
                $scope.data.dungeon.floors[floorIndex].group = null;
                
                $('#floor' + floorIndex + 'bar')[0].classList.add('progress-bar-increasing');
                $scope.data.dungeon.floors[floorIndex].resetting = true;

                return;
            }
            
            $scope.adjustCharacterCurrentHealth(targetCharId, -attackDamage);
            var char = $scope.getCharacterById(targetCharId);                        
            console.log(enemyName + ' ' + attackName + 's ' + char.name + ' for ' + attackDamage + ' damage.');
        }
        
        var enemyObject = $scope.data.dungeon.floors[floorIndex].enemyWaves[0][enemyIndex];

        if (enemyObject) {
            var possibleAttacks = [];
            enemyObject.attackProbabilities.forEach(function(a, index) {
                for (ai = 0; ai < a; ai++) {
                    possibleAttacks.push(index);
                }
            });
    
            var randIndex = Math.floor(Math.random() * possibleAttacks.length);
            enemyObject.currentAttackIndex = possibleAttacks[randIndex];
        }        
    }

    //generate a list of enemies for each floor of the dungeon
    $scope.generateDungeonEnemies = function generateDungeonEnemies() {
        for (iFloor = 0; iFloor < $scope.data.dungeon.maxFloor; iFloor++) {
            var eWaves = $scope.generateEnemiesByFloor(iFloor);
            $scope.data.dungeon.floors.push({ 
                enemyWaves: eWaves,
                group: null,
                resetting: false,
             });
        }
    };

    $scope.getGroupCurrentFloor = function getGroupCurrentFloor(groupId){
        var currentFloor = null;
        $scope.data.dungeon.floors.forEach(function(floor, index) {
            if (floor.group) {
                if (floor.group.id == groupId) {
                    currentFloor = index + 1;
                }
            }
        });

        return currentFloor;
    }

    //generate a list of enemies for a single floor
    $scope.generateEnemiesByFloor = function generateEnemiesByFloor(floorIndex) {
        var floor = CONSTANTS.dungeonFloors[floorIndex];
        
        var possibleEnemies = floor.possibleEnemies;
        var enemyProbabilities = floor.enemyProbabilities;
        var possibleEnemiesList = [];

        possibleEnemies.forEach(function(value, index) {
            for (i = 0; i < enemyProbabilities[index]; i++) {
                possibleEnemiesList.push(CONSTANTS.enemies[value.id]);
            };
        });
        
        //generave # of waves = wavesrequiredtopass
        var waveList = [];
        //foreachwave
            for (i = 0; i < floor.wavesRequiredToPass; i++) {
                var enemyList = [];
                //pick random floorwavelevel
                var currentWaveValue = 0                
                var targetWaveValue = Math.floor(Math.random() * (floor.waveLevelValueMax - floor.waveLevelValueMin + 1)) + floor.waveLevelValueMin;                

                while (currentWaveValue < targetWaveValue) {
                    //add enemy where level <= wavelevelremaining
                    var enemyToAdd = JSON.parse(JSON.stringify(possibleEnemiesList[Math.floor(Math.random() * possibleEnemiesList.length)]));
                    
                    //pick enemyattack
                    enemyToAdd.currentAttackIndex = 0;
                    var possibleAttacks = [];

                    enemyToAdd.attackProbabilities.forEach(function(a, index) {
                        for (ai = 0; ai < a; ai++) {
                            possibleAttacks.push(index);
                        }
                    });

                    var randIndex = Math.floor(Math.random() * possibleAttacks.length);
                    enemyToAdd.currentAttackIndex = possibleAttacks[randIndex];
                    enemyToAdd.currentHealth = enemyToAdd.health;
                    
                    currentWaveValue += enemyToAdd.level;
                    enemyList.push(enemyToAdd);
                }

                waveList.push(enemyList);
            }
                        
        return waveList;
    };


    $scope.createCharacterObject = function createCharacterObject(id, name, newClass) {
        char = {
            name: name,
            class: newClass,
            id: id,
            experience: 1,
            maxFloor: 1,
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

    $scope.createGroupObject = function createGroupObject(id, name, charId1, charId2, charId3, charId4, charId5) {
        var group = {};
        group.id = id;
        group.name = name;
        group.characterIds = [];

        if (charId1) {
            group.characterIds.push(charId1);
        }
        if (charId2) {
            group.characterIds.push(charId2);
        }
        if (charId3) {
            group.characterIds.push(charId3);
        }
        if (charId4) {
            group.characterIds.push(charId4);
        }
        if (charId5) {
            group.characterIds.push(charId5);
        }

        $scope.data.groups.push(group);
    };

    $scope.updateGroupObject = function updateGroupObject(id, name, charId1, charId2, charId3, charId4, charId5) {
        var group = $scope.getGroupById(id);

        group.name = name;
        group.characterIds = [];

        if (charId1) {
            group.characterIds.push(charId1);
        }
        if (charId2) {
            group.characterIds.push(charId2);
        }
        if (charId3) {
            group.characterIds.push(charId3);
        }
        if (charId4) {
            group.characterIds.push(charId4);
        }
        if (charId5) {
            group.characterIds.push(charId5);
        }
    }

    $scope.createGroup = function createGroup() {
        //if form is valid
        if ($('#formCreateGroup')[0].checkValidity() === true) {

            var newName = $('#createGroupFormName')[0].value;     
            var charId1 = $('#createGroupFormCharacter1')[0].value;                   
            var charId2 = $('#createGroupFormCharacter2')[0].value;
            var charId3 = $('#createGroupFormCharacter3')[0].value;
            var charId4 = $('#createGroupFormCharacter4')[0].value;
            var charId5 = $('#createGroupFormCharacter5')[0].value;

            if ($('#createGroupId')[0].value) {
                //edit group
                var groupId = $('#createGroupId')[0].value;
                $scope.updateGroupObject(groupId, newName, charId1, charId2, charId3, charId4, charId5);
            } else {
                //create group
                var newId = $scope.data.groups.length + 1;

                $scope.createGroupObject(newId, newName, charId1, charId2, charId3, charId4, charId5);
                
            }
            

            $('#formCreateGroup')[0].classList.remove('was-validated');
            $('#formCreateGroup')[0].reset();

            $('#createGroupModal').modal('toggle');
        }

    }

    $scope.deleteGroup = function deleteGroup(groupId) {
        var groupIndex = $scope.data.groups.findIndex(g => g.id == groupId);

        $scope.data.groups.splice(groupIndex, 1);
        
        $('#formCreateGroup')[0].classList.remove('was-validated');
        $('#formCreateGroup')[0].reset();

        $('#createGroupModal').modal('toggle');
    }

    $scope.getNumberOfLivingEnemiesInFloorWave = function getNumberOfLivingEnemiesInFloorWave(floorIndex, waveIndex = 0) {
        var enemyCount = 0;
        $scope.data.dungeon.floors[floorIndex].enemyWaves[waveIndex].forEach(e => {
            if (e.currentHealth > 0) {
                enemyCount ++;
            }
        });

        return enemyCount;
    }

    $scope.resetCharacterAttacksByFloor = function resetCharacterAttacksByFloor(floorIndex) {
        var floor = $scope.data.dungeon.floors[floorIndex];
        var chars = floor.group.characterIds;

        chars.forEach(char => {
            $('#character' + char + 'attack')[0].ariaValueNow = 0;
        });
    }

    $scope.attack = function attack(character) {
        var char = $scope.getCharacterById(character.getAttribute('character-id'));  
        var floorIndex = character.getAttribute('floor-index');
        var floor = $scope.data.dungeon.floors[floorIndex];

        var effectiveDamage = $scope.getEffectiveAttackDamage(char.id);
        //first enemy
        var currentEnemyIndex = -1;
        
        floor.enemyWaves[0].forEach(function(e, i) {
            if (e.currentHealth > 0 && currentEnemyIndex == -1) {
                currentEnemyIndex = i;
            }
        });

        if (currentEnemyIndex == -1) {
            //no more enemies
        } else {
            var currentEnemy = floor.enemyWaves[0][currentEnemyIndex];

            currentEnemy.currentHealth -= effectiveDamage;

            if (currentEnemy.currentHealth <= 0) {
                //kill enemy
                var group = $scope.data.dungeon.floors[floorIndex].group;

                //$scope.data.dungeon.floors[floorIndex].enemyWaves[0].splice(enemyIndex,1);
                console.log(currentEnemy.name + ' dies.');

                //give enemy.level xp to all characters
                $scope.data.dungeon.floors[floorIndex].group.characterIds.forEach(c => {
                    if ($scope.getCharacterCurrentHealth(c) > 0) {
                        $scope.gainExperience(c, currentEnemy.level);                
                    }
                });

                $scope.lootItemsFromEnemy(currentEnemy);
                $scope.lootGoldFromEnemy(currentEnemy);

                //if no enemies left in wave - remove wave
                if ($scope.getNumberOfLivingEnemiesInFloorWave(floorIndex) == 0) {
                    $scope.data.dungeon.floors[floorIndex].enemyWaves.shift();

                    //reset character attack bars
                    $scope.resetCharacterAttacksByFloor(floorIndex);

                    //if no waves left
                    if ($scope.data.dungeon.floors[floorIndex].enemyWaves.length == 0) {
                        //if characters alive
                        if ($scope.data.dungeon.floors[floorIndex].group) {
                            //if at max floor
                            if (!CONSTANTS.dungeonFloors[floorIndex + 1]) {
                                $scope.data.dungeon.floors[floorIndex].group = null;
                                $scope.data.dungeon.floors[floorIndex].resetting = true;

                                //start floor bar to regen mobs
                                $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');

                                return;
                            }
                            //add new floor if necessary
                            if ($scope.data.dungeon.maxFloor == floorIndex + 1) {
                                $scope.data.dungeon.maxFloor++;
                                
                                $scope.data.dungeon.floors.push({
                                    enemyWaves: $scope.generateEnemiesByFloor(floorIndex + 1),
                                });
                            }
                            //move characters up a floor                
                            $scope.data.dungeon.floors[floorIndex+1].group = group;
                            $scope.data.dungeon.floors[floorIndex].group = null;

                            group.characterIds.forEach(c => {
                                $scope.setCharacterMaxFloor(c, floorIndex + 2);                    
                            });
                        }

                        //start floor bar to regen mobs
                        $('#floor'+floorIndex+'bar')[0].classList.add('progress-bar-increasing');
                        $scope.data.dungeon.floors[floorIndex].resteting = true;
                    }            
                }
            }
            console.log(char.name + ' hits ' + currentEnemy.name + ' for ' + effectiveDamage + ' damage.');
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
    $scope.gainExperience = function gainExperience(charId, experience) {
        var char = $scope.getCharacterById(charId);
        char.experience += experience;
    }

    
    $scope.setCharacterMaxFloor = function setCharacterMaxFloor(charId, floor) {
        var char = $scope.getCharacterById(charId);
        char.maxFloor = floor;
    }

    $scope.regenerateFloorEnemies = function regenerateFloorEnemies(floor) {
        var floorIndex = parseInt(floor.getAttribute('floor-index'));
        floor.classList.remove('progress-bar-increasing');
        floor.ariaValueNow = 0;
        $scope.data.dungeon.floors[floorIndex].enemyWaves = $scope.generateEnemiesByFloor(floorIndex);
        $scope.data.dungeon.floors[floorIndex].resetting = false;
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
        });

        //all health-bar will submit on empty
        var healthBars = document.getElementsByClassName("health-bar");

        Array.from(healthBars).forEach((element) => {
            var p = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = p * 100 + "%";

            if (parseInt(element.ariaValueNow) <= 0) {
                element.style.width = "0%";
                if (element.onsubmit) {
                    element.onsubmit();
                }   
            }
        });

        //all attack bars will disable with no target
        var attackBars = document.getElementsByClassName("attack-bar");

        Array.from(attackBars).forEach((element) => {
            var floorIndex = parseInt(element.getAttribute('floor-index'));
            var characterId = element.getAttribute('character-id');
            var enemyIndex = element.getAttribute('enemy-index');

            
            //check if no characters on floor
            if (!$scope.data.dungeon.floors[floorIndex].group) {
                element.ariaValueNow = 0;
            }
        

            if (characterId) {
                //To-do: disable when no enemies
                if ($scope.getCharacterById(characterId).currentHealth <= 0) {
                    element.ariaValueNow = 0;
                }
            }
            if (enemyIndex) {
                if ($scope.data.dungeon.floors[floorIndex].enemyWaves[0][enemyIndex]) {
                    if ($scope.data.dungeon.floors[floorIndex].enemyWaves[0][enemyIndex].currentHealth <= 0) {
                        element.ariaValueNow = 0;
                    }
                }
            }
        });

        //all experience bars will submit on full
        var xpBars = document.getElementsByClassName("xp-bar");

        Array.from(xpBars).forEach((element) => {
            var p = (parseInt(element.ariaValueNow) - parseInt(element.ariaValueMin)) / (parseInt(element.ariaValueMax) - parseInt(element.ariaValueMin));
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

        modal.find('#lblCharacterModalStrength')[0].innerText = $scope.getEffectiveStat(CONSTANTS.stats.Strength, charId);        
        modal.find('#lblCharacterModalAgility')[0].innerText =  $scope.getEffectiveStat(CONSTANTS.stats.Agility, charId);
        modal.find('#lblCharacterModalIntelligence')[0].innerText =  $scope.getEffectiveStat(CONSTANTS.stats.Intelligence, charId);
        modal.find('#lblCharacterModalConstitution')[0].innerText =  $scope.getEffectiveStat(CONSTANTS.stats.Constitution, charId);
        
    })

    $('#createGroupModal').on('show.bs.modal', function (event) {
        
        var triggeredBy = $(event.relatedTarget);
        var groupId = triggeredBy.data('group-id');
        

        var modal= $(this);
        if (groupId) {
            var group = $scope.getGroupById(groupId);
            $('#createGroupId')[0].value = groupId;

            modal.find('.modal-title').text('Edit Group');
            modal.find('#createGroupFormName').val(group.name);
            if (group.characterIds[0]) {
                modal.find('#createGroupFormCharacter1').val(group.characterIds[0]);
            }
            if (group.characterIds[1]) {
                modal.find('#createGroupFormCharacter2').val(group.characterIds[1]);
            }
            if (group.characterIds[2]) {
                modal.find('#createGroupFormCharacter3').val(group.characterIds[2]);
            }
            if (group.characterIds[3]) {
                modal.find('#createGroupFormCharacter4').val(group.characterIds[3]);
            }
            if (group.characterIds[4]) {
                modal.find('#createGroupFormCharacter5').val(group.characterIds[4]);
            }
        

            modal.find('.btn-primary').text('Update');
        } else {
            modal.find('.btn-primary').text('Create');
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
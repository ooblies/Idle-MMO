var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope, $timeout, $interval) {    
    $scope.CONSTANTS = CONSTANTS;
    $scope.performance = {};
    $scope.performance.timeSinceSave = 0;
    $scope.data = {};
    $scope.createCharacter = {};    
    $scope.$interval = $interval;

    $scope.saveGame = function saveGame() {
        //var saveString = JSON.stringify($scope.data);
        //localStorage.setItem('idleMMOSave',saveString);
        localStorage.removeItem('idleMMOSave');
    };
    $scope.loadGame = function loadGame() {
        //var saveString = localStorage.getItem("idleMMOSave");
        //if (saveString && saveString != "{}") {
        //    var saveObject = JSON.parse(saveString);
        //    $scope.data = saveObject;
        //    
        //    var chars = [];
        //    saveObject.characters.forEach(char => {
        //        chars.push(Character.createFromSave(char));
        //    })
        //    
        //    $scope.data.characters = chars;

        //} else {
            localStorage.removeItem('idleMMOSave');
            $scope.startNewGame();
        //}        
    };
    $scope.deleteSave = function deleteSave() {
        localStorage.removeItem('idleMMOSave');
        location.reload(true);
    }
    $scope.startNewGame = function startNewGame() {
        $scope.data = {};
        $scope.data.gold = 0;
        $scope.data.characters = [];        
        $scope.data.groups = [];
        $scope.data.dungeon = {};
        $scope.data.dungeon.maxFloor = 1;
        $scope.data.dungeon.floors = [];
        $scope.abilityPromises = [];
        $scope.characterBuffs = [];

        //temp characters
        $scope.createCharacterObject(1,'Ooblies',CONSTANTS.classes.Warrior);        
        $scope.createCharacterObject(2,'Rohnjudes',CONSTANTS.classes.Mage);
        $scope.createCharacterObject(3,'HealBot', CONSTANTS.classes.Cleric);
        $scope.createGroupObject(1,'TestGroup',$scope.data.characters[0].id);

        $scope.data.sharedInventory = [];
        
        $scope.generateDungeonEnemies();        
    };

    $scope.cancelFloorPromises = function cancelFloorPromsies(floorIndex) {
        $scope.abilityPromises.forEach(p => {
            if (p.floorIndex == floorIndex) {
                $interval.cancel(p.promise);
            }
        });

        $scope.abilityPromises = $scope.abilityPromises.filter(p => {
            return p.floorIndex != floorIndex;
        });
    }

    $scope.cancelCharacterPromises = function cancelCharacterPromises(characterId) {
        $scope.abilityPromises.forEach(p => {
            if (p.characterId == characterId) {
                $interval.cancel(p.promise);
            }
        });

        $scope.abilityPromises = $scope.abilityPromises.filter(p => {
            return p.characterId != characterId;
        });
    }

    $scope.cancelEnemyPromises = function cancelEnemyPromises(floorIndex, enemyIndex) {
        $scope.abilityPromises.forEach(p => {
            if (p.floorIndex == floorIndex && p.enemyIndex == enemyIndex) {
                $interval.cancel(p.promise);
            }
        });

        $scope.abilityPromises = $scope.abilityPromises.filter(p => {
            return (p.floorIndex != floorIndex) || (p.floorIndex == floorIndex && p.enemyIndex != enemyIndex);
        });
    }

    $scope.getCharacterIdFromIndex = function getCharacterIdFromIndex(floorIndex, characterIndex){
        return $scope.data.dungeon.floors[floorIndex].group.characterIds[characterIndex];
    }

    $scope.applyOrUpdateBuff = function applyOrUpdateBuff(charId, ability) {
        //check if buff exists
        var buffExists = false;
        $scope.characterBuffs.forEach(b => {
            if (b.characterId == charId && b.ability.name == ability.name) {
                buffExists = true;
                b.expiresOn = window.performance.now() + b.ability.effectDuration;
            }
        });
        
        if (!buffExists) {
            $scope.characterBuffs.push({
                characterId: charId,
                ability: ability,
                expiresOn: window.performance.now() + ability.effectDuration,
            });                
        }

        $scope.characterBuffs = $scope.characterBuffs.filter(b => {
            return b.expiresOn > window.performance.now();
        });
    }

    $scope.getStatIncreaseFromBuffs = function getStatIncreaseFromBuffs(stat, characterId) {
        var increase = 0;
        $scope.characterBuffs.forEach(b => {
            //if right character
            //right stat
            //not expired
            if (b.characterId == characterId) {
                if (b.ability.effectStat == stat) {
                    if(b.expiresOn >= window.performance.now()) {
                        increase += b.ability.effectStatIncreaseAmount;
                    }
                }
            }
        });
        return increase;
    }

    $scope.getBlockFlatFromBuffs = function getBlockFlatFromBuffs(characterId) {
        var blocked = 0;
        $scope.characterBuffs.forEach(b => {
            if (b.characterId == characterId) {
                if (b.ability.blockFlat > 0) {
                    if (b.expiresOn >= window.performance.now()) {
                        blocked += b.ability.blockFlat;
                    }
                }
            }
        });
        return blocked;
    }
    
    $scope.getBlockPercentFromBuffs = function getBlockPercentFromBuffs(characterId) {        
        var blockedP = 0;
        $scope.characterBuffs.forEach(b => {
            if (b.characterId == characterId) {
                if (b.ability.blockPercent > 0) {
                    if (b.expiresOn >= window.performance.now()) {
                        blockedP += b.ability.blockPercent;
                    }
                }
            }
        });
        return blockedP;
    }

    $scope.getStatMultiplierFromBuffs = function getStatIncreaseFromBuffs(stat, characterId) {        
        var multiplier = 1;
        $scope.characterBuffs.forEach(b => {
            //if right character
            //right stat
            //not expired
            if (b.characterId == characterId) {
                if (b.ability.effectStat == stat) {
                    if(b.expiresOn >= window.performance.now()) {
                        multiplier *= b.ability.effectStatIncreaseMultiplier;
                    }
                }
            }
        });
        return multiplier;
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
        var chars = $scope.getCharactersByGroupId(groupId).forEach(c => {
            c.fullHeal();
        });        
    }



    //Send a group to the first floor of the dungeon
    $scope.sendGroupToDungeon = function sendGroupToDungeon(groupId) {
        var group = $scope.getGroupById(groupId);
        $scope.healGroup(groupId);

        //if floor is empty, add group
        if (!$scope.data.dungeon.floors[0].group && !$scope.data.dungeon.floors[0].resetting) {
            $scope.data.dungeon.floors[0].group = group;
        }

        group.characterIds.forEach(cId => {
            $scope.getCharacterById(cId).currentFloor = 1;
        });
    };

    $scope.getGroupById = function(groupId) {
        return $scope.data.groups.find(g => {
            return g.id == groupId
        });
    }

    $scope.getCharacterById = function(characterId) {
        var char = {};
        $scope.data.characters.forEach(c => {
            if (c.id == characterId) {
                char = c;
            }
        });

        return char;        
    };

    $scope.triggerEnemyAttack = function triggerEnemyAttack(enemy) {
        var floorIndex = parseInt(enemy.getAttribute('floor-index'));
        var attackDamage = enemy.getAttribute('attack-damage');
        var attackName = enemy.getAttribute('attack-name');
        var enemyName = enemy.getAttribute('enemy-name');
        var enemyIndex = parseInt(enemy.getAttribute('enemy-index'));

        var group = $scope.data.dungeon.floors[floorIndex].group

        if (group) {
            
            var targetCharId = -1;
            group.characterIds.forEach(function(c) {
                if ($scope.getCharacterById(c).currentHealth > 0 && targetCharId == -1) {
                    targetCharId = c;
                }
            });

            if (targetCharId == -1) {
                //everyone's  dead       
                $scope.cancelFloorPromises(floorIndex);         
                $scope.data.dungeon.floors[floorIndex].group = null;
                group.characterIds.forEach(cId => {
                    $scope.getCharacterById(cId).currentFloor = null;
                })
                
                $('#floor' + floorIndex + 'bar')[0].classList.add('progress-bar-increasing');
                $scope.data.dungeon.floors[floorIndex].resetting = true;

                return;
            }

            var char = $scope.getCharacterById(targetCharId);
            char.adjustHealthWithDR(-attackDamage);
            if (char.currentHealth <= 0) {
                $scope.cancelCharacterPromises(char.id);
                console.log(char.name + ' dies.');
            }
                                              
            //console.log(enemyName + ' ' + attackName + 's ' + char.name + ' for ' + attackDamage + ' damage.');
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
        var char = new Character(id,name,newClass);

        $scope.data.characters.push(char);
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

        char.attack();              
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

    $scope.regenerateFloorEnemies = function regenerateFloorEnemies(floor) {
        var floorIndex = parseInt(floor.getAttribute('floor-index'));
        floor.classList.remove('progress-bar-increasing');
        floor.ariaValueNow = 0;
        $scope.data.dungeon.floors[floorIndex].enemyWaves = $scope.generateEnemiesByFloor(floorIndex);
        $scope.data.dungeon.floors[floorIndex].resetting = false;
    };

    $scope.tick = function tick() {        
        var start = window.performance.now();

        //run 20/s - all progress bars are updated here
        $scope.performance.timeSinceSave += CONSTANTS.performance.tickDuration;
        if ($scope.performance.timeSinceSave > 5000) {
            $scope.saveGame();
            $scope.performance.timeSinceSave = 0;
        }

        var progressBars = document.getElementsByClassName("progress-bar-increasing");
        var toAdd = CONSTANTS.performance.tickDuration;


        //all progressBars with progress-bar-increasing will auto-increment
        Array.from(progressBars).forEach((element) => {
            //element.classList.remove("no-transition");
            //element.classList.add("progress-bar-transition");
            
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
                //element.classList.add("no-transition");
                //element.classList.remove("progress-bar-transition");
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
            var enemyIndex = parseInt(element.getAttribute('enemy-index'));
            
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
                if ($scope.data.dungeon.floors[floorIndex].enemyWaves[0])
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

        var abilityBars = document.getElementsByClassName("ability-bar");
        Array.from(abilityBars).forEach((element) => {
            if (parseInt(element.ariaValueNow) > parseInt(element.ariaValueMax)) {
                element.ariaValueNow = element.ariaValueMax;
                element.style.width = "100%";

                return;
            }

            element.ariaValueNow = parseInt(element.ariaValueNow) + toAdd;

            var progress = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = progress * 100 + "%";
        });

        //character modal attack bars
        var demoBars = document.getElementsByClassName("demo-ability-bar");
        Array.from(demoBars).forEach((element) => {
            
            if (parseInt(element.ariaValueNow) > parseInt(element.ariaValueMax)) {
                element.ariaValueNow = element.ariaValueMax;
                element.style.width = "100%";

                return;
            }

            element.ariaValueNow = parseInt(element.ariaValueNow) + toAdd;

            var progress = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = progress * 100 + "%";
        });

        var stop = window.performance.now();
        $scope.performance.timePerTick = (stop - start).toFixed(2);
    };

    $scope.triggerDemoAttack = function triggerDemoAttack(element) {
        var abilityElements = document.getElementsByClassName('demo-ability-bar');
        var abilityLog = document.getElementById('taCharacterModalAbilityLog');

        //if ability is selected
        if (parseInt(abilityElements[0].ariaValueNow) >= parseInt(abilityElements[0].ariaValueMax) && document.getElementById('selCharacterModalAbility1').selectedIndex > 0) {
            abilityElements[0].ariaValueNow = 0;
            abilityLog.value = document.getElementById('selCharacterModalAbility1').value + '\r\n' +  abilityLog.value;
        } else if (parseInt(abilityElements[1].ariaValueNow) >= parseInt(abilityElements[1].ariaValueMax) && document.getElementById('selCharacterModalAbility2').selectedIndex > 0) {
            abilityElements[1].ariaValueNow = 0;
            abilityLog.value = document.getElementById('selCharacterModalAbility2').value + '\r\n' +  abilityLog.value;
        } else if (parseInt(abilityElements[2].ariaValueNow) >= parseInt(abilityElements[2].ariaValueMax) && document.getElementById('selCharacterModalAbility3').selectedIndex > 0) { 
            abilityElements[2].ariaValueNow = 0;
            abilityLog.value = document.getElementById('selCharacterModalAbility3').value + '\r\n' +  abilityLog.value;
        } else {
            abilityLog.value = 'Basic Attack \r\n' +  abilityLog.value;
        }
        
    }
    
    $('#characterModal').on('show.bs.modal', function (event) {
        var triggeredBy = $(event.relatedTarget);
        var charId = triggeredBy.data('character-id');
        var char = $scope.getCharacterById(charId);

        var modal = $(this);
        modal.find('.modal-title').text(char.name);
        modal.find('#lblCharacterModalId').text(charId);
        modal.find('#taCharacterModalAbilityLog')[0].value = "";

        modal.find('#lblCharacterModalClass')[0].innerText = char.class.name;
        modal.find('#lblCharacterModalHealth')[0].innerText = char.maxHealth;
        modal.find('#lblCharacterModalLevel')[0].innerText = char.level;
        modal.find('#lblCharacterModalAttackSpeed')[0].innerText = char.attackSpeed;
        modal.find('#lblCharacterModalMaxFloor')[0].innerText = char.maxFloor;
        modal.find('#lblCharacterModalAttackDamage')[0].innerText = char.attackDamage;

        modal.find('#lblCharacterModalStrength')[0].innerText = char.strength;
        modal.find('#lblCharacterModalAgility')[0].innerText =  char.agility;
        modal.find('#lblCharacterModalIntelligence')[0].innerText =  char.intelligence;
        modal.find('#lblCharacterModalConstitution')[0].innerText =  char.constitution;

        //ability demo
        modal.find('#progressCharacterModalAttack')[0].ariaValueNow = 0;
        modal.find('#progressCharacterModalAttack')[0].ariaValueMax = char.attackSpeed;
        var div1 = modal.find('#divAbility1')[0];
        var div2 = modal.find('#divAbility2')[0];
        var div3 = modal.find('#divAbility3')[0];

        //ability 1
        
        if (char.activeAbilities[0]) {            
            div1.classList.remove('hidden');       
        
            modal.find('#progressCharacterModalAbility1')[0].ariaValueNow = 0;
            modal.find('#progressCharacterModalAbility1')[0].ariaValueMax = char.activeAbilities[0].cooldown;            
        } else {
            div1.classList.add('hidden');
        }
        if (char.activeAbilities[1]) {
            div2.classList.remove('hidden');        
        

            modal.find('#progressCharacterModalAbility2')[0].ariaValueNow = 0;
            modal.find('#progressCharacterModalAbility2')[0].ariaValueMax = char.activeAbilities[1].cooldown;            
        } else {
            div2.classList.add('hidden');           
        }
        if (char.activeAbilities[2]) {
            div3.classList.remove('hidden');             

            modal.find('#progressCharacterModalAbility3')[0].ariaValueNow = 0;
            modal.find('#progressCharacterModalAbility3')[0].ariaValueMax = char.activeAbilities[2].cooldown;
        }   else {
            div3.classList.add('hidden');           
        }

        var selAbility1 = modal.find('#selCharacterModalAbility1')[0];
        while (selAbility1.options.length > 0) {
            selAbility1.remove(0);
        }
        var baseOption = document.createElement("option");
        baseOption.text = "Choose an ability...";
        baseOption.value = "";
        baseOption.selected = true;
        selAbility1.add(baseOption);
        char.class.abilities.forEach(a => {
            var option = document.createElement("option");
            option.text = a.name;
            option.value = a.name;
            if (char.activeAbilities[0] && char.activeAbilities[0].name == a.name) {
                option.selected = true;
            }
            selAbility1.add(option);                
        });     
        

        var selAbility2 = modal.find('#selCharacterModalAbility2')[0];
        while (selAbility2.options.length > 0) {
            selAbility2.remove(0);
        }
        var baseOption = document.createElement("option");
        baseOption.text = "Choose an ability...";
        baseOption.value = "";
        baseOption.selected = true;
        selAbility2.add(baseOption);
        char.class.abilities.forEach(a => {
            var option = document.createElement("option");
            option.text = a.name;
            option.value = a.name;
            if (char.activeAbilities[1] && char.activeAbilities[1].name == a.name) {
                option.selected = true;
            }
            selAbility2.add(option);                
        });     



        var selAbility3 = modal.find('#selCharacterModalAbility3')[0];
        while (selAbility3.options.length > 0) {
            selAbility3.remove(0);
        }
        var baseOption = document.createElement("option");
        baseOption.text = "Choose an ability...";
        baseOption.value = "";
        baseOption.selected = true;
        selAbility3.add(baseOption);
        char.class.abilities.forEach(a => {
            var option = document.createElement("option");
            option.text = a.name;
            option.value = a.name;
            if (char.activeAbilities[2] && char.activeAbilities[2].name == a.name) {
                option.selected = true;
            }
            selAbility3.add(option);                
        });            
    
    })

    $('#selCharacterModalAbility1').on('change', function (event) {                
        
        var charId = document.getElementById("lblCharacterModalId").innerText;

        //show/hide bar
        var div1 = document.getElementById('divAbility1');
        if (event.currentTarget.value != "") {            
            div1.classList.remove('hidden');    
                        
            var char = $scope.getCharacterById(charId);
            //set char.activeAbility
            char.setActiveAbilityByName(0, event.currentTarget.value);
            //set ariavaluemax            
            //reset ariaValueNow
            document.getElementById('progressCharacterModalAbility1').ariaValueMax = char.ability1Cooldown;
            document.getElementById('progressCharacterModalAbility1').ariaValueNow = 0;
        } else {
            div1.classList.add('hidden');
        }        
    });

    $('#selCharacterModalAbility2').on('change', function (event) {                
        
        var charId = document.getElementById("lblCharacterModalId").innerText;

        //show/hide bar
        var div2 = document.getElementById('divAbility2');
        if (event.currentTarget.value != "") {            
            div2.classList.remove('hidden');    
                        
            var char = $scope.getCharacterById(charId);
            //set char.activeAbility
            char.setActiveAbilityByName(1, event.currentTarget.value);
            //set ariavaluemax            
            //reset ariaValueNow
            document.getElementById('progressCharacterModalAbility2').ariaValueMax = char.ability2Cooldown;
            document.getElementById('progressCharacterModalAbility2').ariaValueNow = 0;
        } else {
            div2.classList.add('hidden');
        }        
    });

    $('#selCharacterModalAbility3').on('change', function (event) {                
        
        var charId = document.getElementById("lblCharacterModalId").innerText;

        //show/hide bar
        var div3 = document.getElementById('divAbility3');
        if (event.currentTarget.value != "") {            
            div3.classList.remove('hidden');    
                        
            var char = $scope.getCharacterById(charId);
            //set char.activeAbility
            char.setActiveAbilityByName(2, event.currentTarget.value);
            //set ariavaluemax            
            //reset ariaValueNow
            document.getElementById('progressCharacterModalAbility3').ariaValueMax = char.ability3Cooldown;
            document.getElementById('progressCharacterModalAbility3').ariaValueNow = 0;
        } else {
            div3.classList.add('hidden');
        }        
    });

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

//815
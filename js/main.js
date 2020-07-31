var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope, $timeout, $interval) {
    $scope.performance = {};
    $scope.data = {};
    $scope.createCharacter = {};
    $scope.data.characters = [];
    $scope.data.dungeon = {};
    $scope.data.dungeon.floors = [];
    //temp characters
    $scope.data.characters.push({
        name: 'Ooblies',
        level: 1,
        class: CONSTANTS.classes[CONSTANTS.classIndex.Warrior],
        id: 1,
        experience: 0,
        maxFloor: 1,
    });
    $scope.data.characters.push({
        name: 'Rohnjudes',
        level: 1,
        class: CONSTANTS.classes[CONSTANTS.classIndex.Mage],
        id: 2,
        experience: 0,
        maxFloor: 1,
    });

    $scope.popover = function() {
        $("[data-toggle=popover]").popover();
    };

    $scope.test = "1234";
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

    $scope.getCharacterMaxHealth = function(characterId) {
        return $scope.getCharacterById(characterId).level * 10;
    };

    $scope.getCharacterCurrentHealth = function(characterId) {
        var char = $scope.getCharacterById(characterId);

        if (char.currentHealth >= 0) {
            return char.currentHealth
        } else {
            var max = $scope.getCharacterMaxHealth(characterId);
            char.currentHealth = max;
            return char.currentHealth;
        }
    }

    $scope.triggerEnemyAttack = function triggerEnemyAttack(enemy) {
        var floorIndex = enemy.getAttribute('floor-index');
        var enemyIndex = enemy.getAttribute('enemy-index');
        var attackDamage = enemy.getAttribute('attack-damage');
        console.log(floorIndex + '.' + enemyIndex + '-' + attackDamage);

        $scope.data.dungeon.floors[floorIndex].characters[0].currentHealth -= attackDamage;
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
                enemyList.push(CONSTANTS.enemies[CONSTANTS.enemyIndex[value]])
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

    $scope.createCharacter = function createCharacter() {
        //if form is valid
        if ($('#formCreateCharacter')[0].checkValidity() === true) {

            var newName = $('#createCharacterFormName')[0].value;
            var newClass = CONSTANTS.classes[$('#createCharacterFormClass')[0].value];
            var newId = $scope.data.characters.length + 1;

            $scope.data.characters.push({
                name: newName,
                level: 1,
                class: newClass,
                id: newId,
            });

            $('#formCreateCharacter')[0].classList.remove('was-validated');
            $('#formCreateCharacter')[0].reset();
        }

    };
    $scope.attack = function attack(character) {
        var char = $scope.getCharacterById(character.getAttribute('character-id'));
        var floor = $scope.data.dungeon.floors[character.getAttribute('floor-index')];
        //first enemy
        var nextEnemy = floor.enemies[0];

        nextEnemy.currentHealth -= char.level;
    };

    $scope.killCharacter = function killCharacter(character) {
        var char = $scope.getCharacterById(character.getAttribute('character-id'));
        var floorIndex = parseInt(character.getAttribute('floor-index'));

        //To-do : send to heal somewhere
        char.currentHealth = $scope.getCharacterMaxHealth(char.id);

        //Remove character from floor.characters
        $scope.data.dungeon.floors[floorIndex].characters = $scope.data.dungeon.floors[floorIndex].characters.filter(c => {
            return char.id != c.id;
        });

        //if floor has no characters, deactive and heal enemy
        $scope.data.dungeon.floors[floorIndex].enemies[0].isAttacking = false;
        $scope.data.dungeon.floors[floorIndex].enemies[0].currentHealth = $scope.data.dungeon.floors[floorIndex].enemies[0].health;
    };

    $scope.levelUp = function levelUp() {

    }

    $scope.killEnemy = function killEnemy(enemy) {
        var floorIndex = parseInt(enemy.getAttribute('floor-index'));
        var enemyIndex = parseInt(enemy.getAttribute('enemy-index'));
        var enemyName = enemy.getAttribute('enemy-name');

        var enemy = CONSTANTS.enemies[CONSTANTS.enemyIndex[enemyName]];

        $scope.data.dungeon.floors[floorIndex].enemies.splice(enemyIndex, 1);

        //give enemy.level xp to all characters
        $scope.data.dungeon.floors[floorIndex].characters.forEach(c => {
            //here
            c.experience += enemy.level;
        });

        if ($scope.checkIfFloorIsEmpty(floorIndex) == false) {
            //if enemies left
            $scope.data.dungeon.floors[floorIndex].enemies[0].isAttacking = true;
        } else {
            //if no enemies left
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
            $scope.data.dungeon.floors[floorIndex].enemies[0].isAttacking = true;

            //start floor bar to regen mobs
            $('#floor' + floorIndex + 'bar')[0].classList.add('progress-bar-increasing');
        }
    };

    $scope.checkIfFloorIsEmpty = function checkIfFloorIsEmpty(floorIndex) {
        return $scope.data.dungeon.floors[floorIndex].enemies.length <= 0;
    }

    $scope.regenerateFloorEnemies = function regenerateFloorEnemies(floor) {
        var floorIndex = parseInt(floor.getAttribute('floor-index'));
        floor.classList.remove('progress-bar-increasing');
        floor.ariaValueNow = 0;
        $scope.data.dungeon.floors[floorIndex].enemies = $scope.generateEnemiesByFloor(floorIndex);
    };

    $scope.tick = function tick() {
        //run 20/s - all progress bars are updated here

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

                    element.onsubmit();
                    return;
                }
                if (parseInt(element.ariaValueNow) > parseInt(element.ariaValueMax)) {
                    element.classList.add("no-transition");
                    element.classList.remove("progress-bar-transition");
                    element.ariaValueNow = 0;
                    element.style.width = "0%";

                    element.onsubmit();
                    return;
                }

                element.ariaValueNow = parseInt(element.ariaValueNow) + toAdd;

                var progress = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
                element.style.width = progress * 100 + "%";
            }
        });

        //all progressbars with health-bar will submit on empty
        var healthBars = document.getElementsByClassName("health-bar");

        Array.from(healthBars).forEach((element) => {
            var p = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = p * 100 + "%";

            if (parseInt(element.ariaValueNow) <= 0) {
                element.onsubmit();
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
                        $scope.data.dungeon.floors[floorIndex].enemies[enemyIndex].isAttacking = false;
                        element.ariaValueNow = 0;
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
            var p = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = p * 100 + "%";

            if (element.ariaValueNow >= element.ariaValueMax) {
                element.onsubmit();
            }
        });

        var stop = window.performance.now();
        $scope.performance.timePerTick = (stop - start).toFixed(0);
    };

    //setup for initial load
    $interval($scope.tick, CONSTANTS.performance.tickDuration);

    $scope.data.dungeon.maxFloor = $scope.data.characters.reduce(function(prev, current) {
        return (prev.maxFloor > current.maxFloor) ? prev : current
    }).maxFloor;

    $scope.generateDungeonEnemies();
    //create character spots
    $scope.data.dungeon.floors.forEach(f => {
        f.characters = [];
    });
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
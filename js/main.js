var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope, $timeout, $interval) {
    $scope.performance = {};
    $scope.data = {};

    $scope.CONSTANTS = CONSTANTS;
    $scope.createCharacter = {};
    $scope.data.characters = [];
    $scope.data.dungeon = {};
    $scope.data.dungeon.floors = [];
    //temp characters
    $scope.data.characters.push({
        name: 'Ooblies',
        level: 10,
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

    //Send a character to the first floor of the dungeon
    $scope.enterDungeon = function enterDungeon(characterId) {
        var char = $scope.getCharacterById(characterId);

        //if next floor character count < floor max characters
        if ($scope.data.dungeon.floors[0].characters.length == 0) {
            //add character
            $scope.data.dungeon.floors[0].characters.push(char);
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
            generatedEnemies.push(JSON.parse(JSON.stringify(enemyList[Math.floor(Math.random() * enemyList.length)]))

            );
        }

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


    $scope.applyDamage = function applyDamage(damageTo, damageAmt) {
        if (damageTo.enemy) {
            damageTo.enemy.currentHealth -= damageAmt;
        } else if (damageTo.character) {
            damageTo.character.currentHealth -= damageAmt;
        } else {
            debugger;
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
    };

    $scope.killEnemy = function killEnemy(enemy) {
        var floorIndex = parseInt(enemy.getAttribute('floor-index'));
        var enemyIndex = parseInt(enemy.getAttribute('enemy-index'));

        $scope.data.dungeon.floors[floorIndex].enemies.splice(enemyIndex, 1);

        //if no enemies left
        if ($scope.checkIfFloorIsEmpty(floorIndex)) {
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

        //all experience bars will submit on full
        var xpBars = document.getElementsByClassName("xp-bar");

        Array.from(xpBars).forEach((element) => {

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
var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope, $timeout, $interval) {
    $scope.performance = {};
    $scope.data = {};
    $scope.data.test1 = 0;

    $scope.CONSTANTS = CONSTANTS;
    $scope.createCharacter = {};
    $scope.data.characters = [];
    $scope.data.dungeon = {};
    $scope.data.dungeon.floors = [];
    $scope.data.dungeon.maxFloor = 7;
    $scope.data.characters.push({
        name: 'Ooblies',
        level: 2,
        class: CONSTANTS.classes[CONSTANTS.classIndex.Warrior],
        id: 1,
    });
    $scope.data.characters.push({
        name: 'RohnJudes',
        level: 1,
        class: CONSTANTS.classes[CONSTANTS.classIndex.Mage],
        id: 2,
    });


    $scope.generateDungeonEnemies = function generateDungeonEnemies() {
        for (iFloor = 0; iFloor < $scope.data.dungeon.maxFloor; iFloor++) {
            var floorEnemies = $scope.generateEnemiesByFloor(iFloor);
            $scope.data.dungeon.floors.push(floorEnemies);
        }
    };

    $scope.increaseMaxFloor = function increaseMaxFloor() {
        $scope.data.dungeon.maxFloor++;
    };

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

            $scope.generateCharacterStyles();

            location.hash = "#" + newName + "-" + newId;
        }

    };

    $scope.generateCharacterStyles = function generateCharacterStyles() {
        //To-do: get existing sheet, if exists
        var sheet = document.createElement('style')
        var css = "";

        $scope.data.characters.forEach(element => {
            css += "#" + element.name + "-" + element.id + ":target,";
        });

        css += "#dummy:target { display: block; }";
        sheet.innerHTML = css;
        document.body.appendChild(sheet);
    };

    $scope.test1 = function test1() {
        $scope.data.test1++;
    }

    $scope.damageEnemy = function damageEnemy(enemy, amt) {
        enemy.enemy.currentHealth -= amt;
    };
    $scope.killEnemy = function killEnemy(enemy) {
        enemy.parentNode.parentNode.parentNode.removeChild(enemy.parentNode.parentNode);
    };

    $scope.regenerateFloorEnemies = function regenerateFloorEnemies(floor) {
        debugger;
    };

    $scope.tick = function tick() {
        var start = window.performance.now();
        //code goes here

        var progressBars = document.getElementsByClassName("progress-bar-increasing");
        var toAdd = 1000 / CONSTANTS.performance.tickRate;


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

        var healthBars = document.getElementsByClassName("health-bar");

        Array.from(healthBars).forEach((element) => {
            var p = parseInt(element.ariaValueNow) / parseInt(element.ariaValueMax);
            element.style.width = p * 100 + "%";

            if (parseInt(element.ariaValueNow) == 0) {
                element.onsubmit();
            }
        });

        var stop = window.performance.now();
        $scope.performance.timePerTick = (stop - start).toFixed(0);
    };

    //start
    $interval($scope.tick, 1000 / CONSTANTS.performance.tickRate);
    $scope.generateCharacterStyles();
    $scope.generateDungeonEnemies();
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
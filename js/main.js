var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope, $timeout, $interval) {
    $scope.performance = {};
    $scope.data = {};
    $scope.CONSTANTS = CONSTANTS;
    $scope.createCharacter = {};
    $scope.data.characters = [];
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

    $scope.tick = function tick() {
        var start = window.performance.now();
        //code goes here

        var stop = window.performance.now();
        $scope.performance.timePerTick = (stop - start).toFixed(0);
    };

    //start
    $interval($scope.tick, 1000 / CONSTANTS.performance.tickRate);
    $scope.generateCharacterStyles();

    $(".dropdown-menu li a").click(function() {
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
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
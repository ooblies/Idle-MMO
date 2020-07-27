var idleApp = angular.module('idleApp', []);

idleApp.controller('idleController', function idleController($scope) {
    $scope.data = {};

    $scope.data.test = "It's alive!";
});
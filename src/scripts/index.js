var modules = require('./modules');
var routes = require('./routes.js');

window.App = {

    module: angular.module('App', ['ngRoute']).config(routes),
    scope: null,
    controller: function (
        $scope,
        $route,
        $routeParams,
        $location,
        $http,
        $anchorScroll,
        baseService,
        setupService,
        robotService
    ) {

        var self = this;

        /* Core */
        self.scope = window.App.scope = $scope;
        self.scope.$route = $route;
        self.scope.$routeParams = $routeParams;
        self.scope.$http = $http;
        self.scope.$location = $location;
        self.scope.$anchorScroll = $anchorScroll;

        /* Tools */
        self.scope.Math = window.Math;
        self.scope.moment = require('moment');

        /* Services */
        self.scope.baseService = baseService;
        self.scope.setupService = setupService;
        self.scope.robotService = robotService;

        //Stops #hashes from reloading the view
        var lastRoute = $route.current;
        self.scope.$on('$locationChangeSuccess', function () {
            if (lastRoute && lastRoute.$$route.templateUrl === $route.current.$$route.templateUrl) {
                $route.current = lastRoute;
            } else {
                lastRoute = $route.current;
            }
        });
    }

};


/* Services */
Object.keys(modules.services).forEach(function (_key) {
    App.module.factory(modules.services[_key].name, modules.services[_key].service);
});
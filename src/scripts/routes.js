var routes = function ($routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            controller: controller('baseService'),
            templateUrl: '/partials/lander.html'
        })
        .when('/setup', {
            controller: controller('setupService'),
            templateUrl: '/partials/setup.html'
        })
        .when('/robot/:robotId', {
            controller: controller('robotService'),
            templateUrl: '/partials/robot.html'
        })
        .otherwise({
            controller: controller('baseService', true),
            templateUrl: '/partials/404.html'
        });
    // $locationProvider.html5Mode(true);

};

var controller = function (service, authRequired) {
    return function () {
        var App = window.App,
            module = App.scope.module = App.scope[service];

        if (typeof module == 'undefined') {
            console.log("ERROR: Cant find the '" + service + "' service. Did you forget to add it to the App.scope?");
            return;
        }

        module.name = service;
        module.scope = App.scope;
        module.init();
    };
};



module.exports = routes;
'use strict';

var MainController = ['$scope', '$http', '$route', '$rootScope','$location', 'geo',
            function ( $scope,   $http,   $route,   $rootScope,  $location,   geo) {

    $http.get('assets/uiuc_testdata.js').success(function (data) {
        $scope.spaces = data;

        if ($route.current.params.spot) {
            $scope.spot = parseInt($route.current.params.spot, 10);
            $scope.selectSpot($route.current.params.spot);
        }

        // Stub: get random images from images.json. 
        $http.get('assets/images.js').success(function (data) {
            for (var i in $scope.spaces) {
                for (var j in $scope.spaces[i].images) {
                    if (!$scope.spaces[i].images[j].url) {
                        var index = Math.floor(Math.random() * data.length);
                        $scope.spaces[i].images[j].url = data[index];
                    }
                }
            }
        });
    });

    // extend to allow extensions on the scope (See extensions/scope.js)
    angular.extend($scope, ngx.scope);

    // This flag is used to indicate whether current user is an admin or not. 
    // Even though this flag is can be modified by the client side, 
    // but the server side also implements authentication. 
    $rootScope.admin = true;

    /****************************
     * Spot selection management
     ****************************/

    $scope.$watch(function () {
        if (!$scope.spaces || ($scope.selectedSpot && $scope.selectedSpot.id === $scope.spot) ||
            ($scope.selectedSpot === null && isNaN($scope.spot))) {
            return;
        }
        $scope.selectedSpot = $scope.spaces.find(function (spot) {
            return spot.id === $scope.spot;
        });
    });

    $scope.selectSpot = function (id) {
        $scope.spot = parseInt(id, 10);

        if ($location.search().spot !== id) {
            var search = isNaN(id) ? {} : { spot: id };
            $location.search(search);
        }
        $scope.safeApply();
    };

    $scope.$on('$routeUpdate', function (event, route) {
        $scope.selectSpot(route.params.spot);
    });

    /*****************************
     * Vertical responsive design
     *****************************/

    $scope.resizeVertical = function (remHeight) {
        $('.content').children().outerHeight(remHeight - 50);
    };

    $scope.windowHeight = function () { return $(window).height(); };
    $scope.contentOffset = function () {
        return $('.content').length > 0 && $('.content').offset().top;
    };

    $scope.$watch('windowHeight() - contentOffset()', $scope.resizeVertical);
    $(window).resize($scope.safeApply.bind($scope));

    /**********************
     * Map-related stuff
     **********************/

    $scope.$on('panTo', function (event, location) {
        $scope.spot = null;
        $scope.gmap.panTo(new google.maps.LatLng(location.latitude, location.longitude));
    });

    $scope.mylocation = geo.watch();
    $scope.mylocationSymbol = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#3333FF',
        fillOpacity: 1,
        scale: 4,
        strokeWeight: 1
    };

    // configure Google Maps
    $scope.mapOptions = {
        center: new google.maps.LatLng(40.107882, -88.227201),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.onMarkerClicked = function (marker) {
        $scope.marker = marker;
        if (marker.spaces && marker.spaces.length === 1) {
            marker.id = marker.spaces[0].id;
        }
        if (marker.id !== undefined) {
            $scope.selectSpot(marker.id);
            return false;
        }
    };
}];

SpaceAvengers.controller('MainController', MainController);

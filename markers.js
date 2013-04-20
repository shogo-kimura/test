/**
 * A helper function to translate objects in the form { latitude: <lat>, longitude: <lng> } to a
 * Google Map API compatible LatLng object.
 */
function gmCoords(coords) {
    return new google.maps.LatLng(coords.latitude, coords.longitude);
}

/**
 * A directive to use in conjunction with the Angular-UI ui-map directive. Automatically syncs 
 * with the given markers array. 
 *
 * Usage: 
 * <div ui-map="myMap">
 *     <div map-markers="markersArray"></div>
 * </div>
 *
 * where markersArray is either an array or a function that returns an array. If markersArray 
 * is a function, the google.maps.Map object will be passed in as the first argument. 
 */
var MapMarkerController = function ($scope, $element, $rootScope) {
    var currentMarkers = null;
    var googleMarkers = null;
    var map = $element.parent().attr('ui-map');

    if (!map) {
        throw 'Map markers directive can only be used inside a ui-map element. ';
    }

    $scope.clickMarker = function (marker) {
        var showInfo = Utils.call($scope.clickHandler, marker.original, marker);
        if (showInfo !== false) {
            // return false means don't show info window
            $scope.$broadcast('displayInfo', {
                marker: marker.original,
                gMarker: marker,
                gmap: $scope.gmap,
            });
        }
        $rootScope.$apply();
    };

    $scope.removeMarkers = function (markers) {
        if (!markers) {
            return;
        }
        for (var i = 0, count = markers.length; i < count; i++) {
            markers[i].setMap(null);
        }
    };

    $scope.createGoogleMarkers = function (markers) {
        return markers.map(function (location) {
            var coords = gmCoords(location);
            var markerOptions = {
                position: coords,
                map: $scope.gmap,
                icon: $scope.icon,
                symbol: $scope.symbol
            };
            angular.extend(markerOptions, $scope.options);
            var marker = new google.maps.Marker(markerOptions);
            marker.original = location;
            google.maps.event.addListener(marker, 'click', $scope.clickMarker.bind(this, marker));
            return marker;
        });
    };

    // we need to watch everything because a function's return value can be changed even if the
    // function itself did not change.
    $scope.$watch(function () {
        $scope.gmap = $scope.$parent[map];
        var markers = Utils.execute($scope.markers, $scope.gmap);
        if (!angular.isArray(markers)) {
            if (markers && markers.latitude !== undefined) {
                markers = [markers];
            } else {
                console.warn('Markers is not an array nor a function that returns an array');
            }
        }

        if (!Utils.arrayEquals(markers, currentMarkers)) {
            // only if the stuff has changed
            $scope.removeMarkers(googleMarkers);
            currentMarkers = markers;
            googleMarkers = $scope.createGoogleMarkers(currentMarkers);
        }
    });
};
MapMarkerController.$inject = ['$scope', '$element', '$rootScope'];


SpaceAvengers.directive('mapMarkers', function() {
    'use strict';

    return {
        restrict: 'A',
        replace: false,
        transclude: false,
        scope: {
            'markers': '=mapMarkers',
            'clickHandler': '=mapClick',
            'icon': '=icon',
            'options': '=mapOptions'
        },
        require: '^uiMap',
        controller: MapMarkerController
    };
});

/**
 * locate-me-btn
 *
 * Usage: 
 * <div ui-map="myMap" locate-me-btn></div>
 */

var buttonHTML = '<button class="btn btn-info btn-small">' +
                    '<i class="icon-white icon-map-marker"></i>' +
                 '</button>';

var locateMeBtn = {};
locateMeBtn.link = function (scope, element, attrs, controller) {
    var map = scope[element.attr('ui-map')];
    if (!map) {
        throw 'Cannot find the map instance';
    }
    var button = $(buttonHTML);
    button.css({ 'zIndex': 99999, 'position': 'absolute', 'bottom': '25px', 'right': '5px' });
    element.append(button);
    var pendingLocateMe = false;
    button.click(function () {
        if (pendingLocateMe) {
            console.log('pending...');
            return;
        }

        pendingLocateMe = true;
        controller.geo.passive(function (position) {
            map.panTo(gmCoords(position.coords));
            pendingLocateMe = false;
        }, function (error) {
            pendingLocateMe = false;
        });
    });
};

locateMeBtn.controller = function ($scope, $element, geo) {
    this.geo = geo;
};
locateMeBtn.controller.$inject = ['$scope', '$element', 'geo'];

SpaceAvengers.directive('locateMeBtn', function() {
    'use strict';

    return {
        restrict: 'A',
        replace: false,
        transclude: false,
        scope: false,
        link: locateMeBtn.link,
        controller: locateMeBtn.controller
    };
});

/**
 * map-info-window
 *
 * Usage:
 * <div ui-map="myMap">
 *   <div map-markers="coords" icon="mylocationSymbol"></div>
 * </div>
 *
 * coords can be one of the following three things
 *
 * 1. A location object. A location object must have latitude and longitude properties, which
 *     contains the coordinates in a floating-point number.
 * 2. An array of location objects.
 * 3. A function that returns an array of marker locations
 *
 * The markers will be watched for changes and updated whenever the values change. (Just like
 * anything else in Angular)
 * 
 * This controls the map InfoWindow (a.k.a. popup / bubble) for showing the information for a 
 * building. 
 *
 * This is supposed to be the same as ui-map-info-window. But ui-map-info-window has a bug where
 * ng-repeat will generated repeated elements when you create the popup multiple times. 
 */
var mapInfoWindow = {};
mapInfoWindow.compile = function (element, attrs) {
    // remove the attribute so that it doesn't get recompiled when added to subtree
    element.removeAttr('map-info-window');
    element.template = element.prop('outerHTML');
    element.model = attrs.mapinfoWindow;
};

mapInfoWindow.controller = function ($scope, $element, $rootScope, $compile) {
    $element.remove();
    var mainScope = $scope.$parent;
    var mapInfo = new google.maps.InfoWindow();
    var template = $element.template;

    // Rename the function so client code can still programmtically call open.
    mapInfo._open = mapInfo.open;
    mapInfo.open = function (gmap, marker) {
        var elem = $compile(template)(mainScope);
        mapInfo.setContent(elem[0]);
        mapInfo._open(gmap, marker);
    };

    // The map-markers directive will tell us when the user clicked on the marker. If the user did
    // not return false there we will open this info window.
    $scope.$on('displayInfo', function (event, args) {
        mapInfo.open(args.gmap, args.gMarker);
    });
};
mapInfoWindow.controller.$inject = ['$scope', '$element', '$rootScope', '$compile'];

SpaceAvengers.directive('mapInfoWindow', function () {
    'use strict';

    return {
        restrict: 'A',
        replace: false,
        transclude: false,
        compile: mapInfoWindow.compile,
        scope: false,
        controller: mapInfoWindow.controller
    };

});
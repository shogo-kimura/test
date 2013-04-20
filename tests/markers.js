/*global describe:false, it:false, beforeEach:false, inject:false, expect:false, browser:false,
         element:false, gmCoords:false, MapMarkerController:false, locateMeBtn:false,
         mapInfoWindow:false */

'use strict';

describe('Test map markers directive', function () {

    var mapmarker, scope, elem, rootScope;
    var watchFunc;

    function randomMarkers(num) {
        var markers = [];
        for (var i = 0; i < num; i++) {
            markers.push({ latitude: Math.random(), longitude: Math.random() });
        }
        return markers;
    }

    beforeEach(function () {
        expect(window.google.maps.LatLng).toBeDefined();
        scope = {
            $watch: function (func) { watchFunc = func; },
            $parent: { 'test': 'hi' }
        };
        elem = $('<div ui-map="test"><div></div></div>');
        rootScope = { $apply: function () {} };
        mapmarker = new MapMarkerController(scope, elem.children(), rootScope);
    });

    it('Test gmCoords', function () {
        var latlng = gmCoords({ latitude: 1, longitude: 88 });
        expect(latlng instanceof google.maps.LatLng).toBe(true);
        expect(latlng.lat()).toBe(1);
        expect(latlng.lng()).toBe(88);
    });

    it('Map marker create google markers', function () {
        // randomly generate locations
        var markers = randomMarkers(12);
        var gMarkers = scope.createGoogleMarkers(markers);
        expect(markers.length).toBe(12);
        expect(gMarkers.length).toBe(12);
    });

    it('Should update markers if watch fired', function () {
        scope.markers = randomMarkers(9);
        var removeCalled = false;
        scope.removeMarkers = function () { removeCalled = true; };
        watchFunc();

        expect(removeCalled).toBe(true);

        removeCalled = false;
        watchFunc();

        expect(removeCalled).toBe(false);

        scope.markers = randomMarkers(10);
        watchFunc();

        expect(removeCalled).toBe(true);

        removeCalled = false;
        scope.markers = { latitude: 1, longitude: 88 };
        watchFunc();

        expect(removeCalled).toBe(true);
    });

    it('Remove markers (empty case)', function () {
        scope.markers = null;
        scope.removeMarkers(scope.markers);
        // you didn't expect anything to happen, did you?
    });

    it('Remove markers', function () {
        scope.markers = randomMarkers(13);
        scope.markers.forEach(function (marker) {
            marker.setMap = function (map) {
                marker.map = map;
            };
            marker.map = 'testmap';
        });

        expect(scope.markers[5].map).toBe('testmap');

        scope.removeMarkers(scope.markers);

        expect(scope.markers[5].map).toBeNull();
    });

    it('Click handler', function () {
        var clickedMarker, clickedGMarker, broadcastcalled = false;
        var marker = { original: 'vanilla test', data: 'chocolate test' };
        scope.$broadcast = function () {
            broadcastcalled = true;
        };
        scope.clickHandler = function (marker, gMarker) {
            clickedMarker = marker;
            clickedGMarker = gMarker;
            return false;
        };

        scope.clickMarker(marker);

        expect(broadcastcalled).toBe(false); // we returned false in the click handler. 
        expect(clickedGMarker).toBe(marker);
        expect(clickedMarker).toBe('vanilla test');

        scope.clickHandler = function (marker, gMarker) {
            clickedMarker = marker;
            clickedGMarker = gMarker;
        };

        scope.clickMarker(marker);

        expect(broadcastcalled).toBe(true);
    });
});

describe('Locate me button directive', function () {

    it('Clicking locate me button should call geo.passive', function () {
        var passiveCalled = false;
        var element = $('<div ui-map="uimap">');
        var scope = {
            uimap: 'mappy'
        };
        var controller = {
            geo: {
                passive: function () { passiveCalled = true; }
            }
        };
        locateMeBtn.link(scope, element, {}, controller);

        expect(passiveCalled).toBe(false);

        element.find('button').click();

        expect(passiveCalled).toBe(true);

        passiveCalled = false;
        element.find('button').click();

        expect(passiveCalled).toBe(false); // not set to true because some passive already pending
    });
});

describe('Map info window directive', function () {

    // It is removed to avoid the window being created again and again. 
    it('Directive attribute should be removed after running', function () {
        var element = $('<div map-info-window>');
        mapInfoWindow.compile(element, {});
        expect(element.attr('map-info-window')).toBeUndefined();
    });

    it('Link function should be running', function () {
        var openCalled = false, displayFunc;
        google.maps.InfoWindow = function () {
            this.setContent = function () {};
            this.open = function () { openCalled = true; };
        };
        var scope = {
            $parent: {},
            $on: function (event, func) { expect(event).toBe('displayInfo'); displayFunc = func; }
        };
        var element = $('<div>');
        var rootScope = {};
        var compile = function () {
            return function () {
                return [1];
            };
        };

        mapInfoWindow.controller(scope, element, rootScope, compile);

        expect(displayFunc).toBeDefined();
        displayFunc(null, {});

        expect(openCalled).toBe(true);
    });

});
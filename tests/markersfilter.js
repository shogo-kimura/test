/*global describe:false, it:false, beforeEach:false, inject:false, expect:false */

'use strict';

var mockSpaces = [
    {
        id: 0,
        location: {
            latitude: 'lat1',
            longitude: 'lng1',
            building_name: 'bld1'
        }
    },
    {
        id: 1,
        location: {
            latitude: 'lat2',
            longitude: 'lng2',
            building_name: 'bld2'
        }
    },
    {
        id: 2,
        location: {
            latitude: 'lat3',
            longitude: 'lng3',
            building_name: 'bld2'
        }
    }
];

var coarseMap = {
    getZoom: function () {
        return 15;
    }
};

var fineMap = {
    getZoom: function () {
        return 17;
    }
};

describe('filter | markers', function() {

    // var http, makeController, scope, main; // test object

    var markers;

    beforeEach(function () {
        markers = markerFilter();
    });

    it('Should buildings for coarse map', function () {
        var buildings = markers(mockSpaces, coarseMap);
        expect(buildings.length).toBe(2);
        expect(buildings[1].spaces.length).toBe(2);
        expect(buildings[1].spaces[0].id).toBe(1);
    });

    it('Should rooms for fine map', function () {
        var rooms = markers(mockSpaces, fineMap);
        expect(rooms.length).toBe(3);
        expect(rooms[0].id === 0);
    });

});

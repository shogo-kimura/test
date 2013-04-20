/*global describe:false, it:false, beforeEach:false, inject:false, expect:false, browser:false
         element:false, GeoService: false */

'use strict';

describe('Test geo service', function () {

    var watches = {};
    var pendingGetPosition = [];
    var fakeLocation = {
        coords: {
            accuracy: 24000,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            latitude: 40.11642,
            longitude: -88.243383,
            speed: null
        },
        timestamp: Date.now()
    };

    var fakeLocation2 = {
        coords: {
            accuracy: 16000,
            altitude: 1652,
            altitudeAccuracy: null,
            heading: null,
            latitude: 41.11642,
            longitude: -82.243383,
            speed: null
        },
        timestamp: Date.now()
    };

    function fakeLocationChange (fLocation) {
        for (var i in watches) {
            if (watches[i].success) {
                watches[i].success(fLocation);
            }
        }
        pendingGetPosition.forEach(function (item) {
            if (item.success) {
                item.success(fLocation);
            }
        });
        pendingGetPosition = [];
    }

    function fakeLocationFail () {
        for (var i in watches) {
            if (watches[i].error) {
                watches[i].error({ code: 888 });
            }
        }
        pendingGetPosition.forEach(function (item) {
            if (item.error) {
                item.error({ code: 888 });
            }
        });
        pendingGetPosition = [];
    }

    var fakeRootScope = { $apply: function () { fakeRootScope.callNumber++; } };
    var geo, loc, positionData, err;

    beforeEach(function () {

        // Lets mock the HTML5 geolocation API
        window.navigator.geolocation.watchPosition = function (success, error) {

            window.setTimeout(function () { success(fakeLocation); }, 300);

            var testid = Date.now();
            watches[testid] = { success: success, error: error };
            return testid;
        };

        window.navigator.geolocation.clearWatch = function (watchid) {
            delete watches[watchid];
        };

        window.navigator.geolocation.getCurrentPosition = function (success, error) {
            pendingGetPosition.push({ success: success, error: error });
        };

        geo = new GeoService(fakeRootScope);
        loc = null;
        positionData = null;
        err = null;

    });


    it('once should call success on location change', function () {
        loc = geo.once(function (position) { positionData = position; }, function (_err) { err = _err; });

        expect(loc).toEqual({});
        expect(positionData).toBeNull();
        expect(err).toBeNull();

        fakeLocationChange(fakeLocation);

        expect(loc).toEqual(fakeLocation);
        expect(positionData).toEqual(fakeLocation);
        expect(err).toBeNull();
    });

    it('once should only execute once', function () {
        loc = geo.once(function (position) { positionData = position; }, function (_err) { err = _err; });
        fakeLocationChange(fakeLocation);
        fakeLocationFail();
        expect(loc).toEqual(fakeLocation);
        expect(positionData).toEqual(fakeLocation);
        expect(err).toBeNull();
    });

    it('once should fail if location error', function () {
        loc = geo.once(function (position) { positionData = position; }, function (_err) { err = _err; });
        fakeLocationFail();
        expect(err.code).toBe(888);
    });

    it('watch should watch for success continuously', function () {
        loc = geo.watch(function (position) { positionData = position; }, function (_err) { err = _err; });

        expect(loc).toEqual({});
        expect(positionData).toBeNull();
        expect(err).toBeNull();

        fakeLocationChange(fakeLocation2);

        expect(loc).toEqual(fakeLocation2);
        expect(positionData).toEqual(fakeLocation2);
        expect(err).toBeNull();

        fakeLocationChange(fakeLocation);

        expect(loc).toEqual(fakeLocation);
        expect(positionData).toEqual(fakeLocation);
        expect(err).toBeNull();

        fakeLocationFail();

        expect(err.code).toEqual(888);
    });

    it('watch should stop after calling stop', function () {
        loc = geo.watch(function (position) { positionData = position; }, function (_err) { err = _err; });
        fakeLocationChange(fakeLocation2);

        expect(loc).toEqual(fakeLocation2);
        expect(positionData).toEqual(fakeLocation2);
        expect(err).toBeNull();

        expect(geo.stop()).toBe(0);

        fakeLocationChange(fakeLocation); // should have no effect

        expect(loc).toEqual(fakeLocation2);
        // they are not "equal" because it is a rewrite
        expect(err).toBeNull();

        expect(geo.get()).toEqual(loc);
    });

    it('watch retaining system test', function () {
        loc = geo.watch(function (position) { positionData = position; }, function (_err) { err = _err; });
        var loc2 = geo.watch(function (position) { positionData = position; }, function (_err) { err = _err; });

        expect(loc).toEqual(loc2);

        expect(geo.stop()).toBe(1); // we should still have one watching

        fakeLocationChange(fakeLocation);

        expect(loc).toEqual(fakeLocation);
        expect(err).toBeNull();

        expect(geo.stop()).toBe(0); // now it will fully stop
        fakeLocationChange(fakeLocation2);

        expect(loc).toEqual(fakeLocation);
        expect(err).toBeNull();
    });

    it('passive test', function () {
        loc = geo.passive(function (position) { positionData = position; }, function (_err) { err = _err; });

        fakeLocationChange(fakeLocation);

        expect(loc).toEqual(fakeLocation);
        expect(positionData).toEqual(fakeLocation);
        expect(err).toBeNull();

        loc = geo.passive(function (position) { positionData = position; }, function (_err) { err = _err; });

        expect(loc).toEqual(fakeLocation);

        fakeLocationChange(fakeLocation2); // Nothing should change as this is passive

        expect(loc).toEqual(fakeLocation);
    });

});
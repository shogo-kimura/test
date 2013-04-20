/**
 * An Angular service that updates with the current geolocation. This is a singleton object so data
 * calls from different clients will update the "global" location object. 
 *
 * The format of the global location object is the same as the position object returned from the
 * HTML5 Geolocation API.
 * http://diveintohtml5.info/geolocation.html
 * http://www.w3.org/TR/geolocation-API/#position
 *
 * Usage: 
 *     <div>My location: {{location.coords.latitude}}, {{location.coords.longitude}}</div>
 *
 *     var someController = function ($scope, $watch, geo) {
 *         $scope.location = geo.watch;
 *         // It will appear in the text box!
 *     }
 */
var GeoService = function ($rootScope) {

    /**
     * Rewrite the contents of dest with the contents of src. The effect is similar to assigning
     * dest = src, but the pointers to dest does not change, so all references to it stays valid.
     */
    function rewrite(dest, src) {
        for (var i in dest) {
            delete dest[i];
        }
        for (var j in src) {
            dest[j] = src[j];
        }
    }

    var loc = {};
    var watchCount = 0;
    var watchId;

    var geo = {};

    /**
     * Start watching the geolocation, which continuously updates the current location for the user.
     * Returns the global location object. 
     */
    geo.watch = function (update, error) {
        if (watchCount <= 0 && window.navigator.geolocation) {
            watchId = window.navigator.geolocation.watchPosition(function (position) {
                rewrite(loc, position);
                Utils.call(update, position);
                $rootScope.$apply();
            }, error);
        }
        watchCount++;
        return loc;
    };

    /**
     * Stop watching the current location. Only affects the current client.
     * Returns the remaining watch count.
     */
    geo.stop = function () {
        watchCount--;
        if (watchCount <= 0 && window.navigator.geolocation) {
            window.navigator.geolocation.clearWatch(watchId);
        }
        return watchCount;
    };

    /**
     * Tries to get the current location for once.
     * Returns the global location object (that means the object will still update if other clients
     * are using watch)
     */
    geo.once = function (success, error) {
        window.navigator.geolocation.getCurrentPosition(function (position) {
            rewrite(loc, position);
            Utils.call(success, position);
        }, error);
        return loc;
    };

    /**
     * Just get the global location object.
     */
    geo.get = function () {
        return loc;
    };

    /**
     * Get a new position only if there is no current data. The same as geo.get if location data
     * already available. Otherwise it is same as geo.once
     */
    geo.passive = function (success, error) {
        if (loc && loc.coords) {
            Utils.call(success, loc);
            return loc;
        } else {
            return geo.once(success, error);
        }
    };

    return geo;
};

GeoService.$inject = ['$rootScope'];

SpaceAvengers.factory('geo', GeoService);
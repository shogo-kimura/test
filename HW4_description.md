Illini Spatio (a.k.a. Space Avengers)
======================================
- Shengchao Huangfu
- Shogo Kimura
- Yuk Yin Maurice Lam

## This Document
This document is intended to be supplementary to the comments inside the source files and the actual source codes themselves. 


## Brief Description of our project
- Creating a web application in which a user can search study spaces in UIUC libraries.
- [Project page](https://wiki.engr.illinois.edu/display/cs428sp13/Space+Avengers)
- [Demo page](http://cs429.chencharlie.com)


## The files to be reviewed
- `markers.js` - about markers which point to UIUC libraries on Google Map.
- `main.html`  - usage of `markers` directives can be seen from here.
- `geo.js`     - about information of the user's current location.
- `main.js`    - relevant parts are the usage of the `geo` service. 


## User Stories
- A user can see markers which point to UIUC libraries on Google Map.

- When a user clicks a marker which points to a library on Google Map, an information window pops up and he/she can choose a study space in the library.

- A user's current location is pointed as a blue dot on Google Map.

- When a user clicks a button at the right bottom corner on Google Map, the map focuses on the user's current location.


## Information about AngularJS
We are using an open-source JavaScript Framework called [AngularJS](http://angularjs.org/) by Google. It uses some special/weird patterns and constructs. (It is a little hard to wrap your head around at first, so we recommend you to look through AngularJS official website if you are confused.)

- Controller:   Typical in the MVC model, a controller controls the data flow, and controls the presentation of data in the views. Controller is (somewhat unfortunately) tightly coupled with the scope object. The scope object contains the data passed in from models, and they can be thought of as the `this` of the controller.

- Scope:        The scope object stores the data from the model and is used for data binding. For example, if in the HTML there is `<a href="{{something}}"</a>`, the `scope.something` will be set as the link location of the anchor tag. 

- Directive:    Directives are responsible for manipulating the DOM. The *Angular way* is to keep DOM manipulations off the controller and have them in a separate resuable component called directive. They hook up with the HTML syntax so if in the HTML markup you have `<a my-directive="valueToBePassedIn"></a>`, the element will automatically initialize the directive object and has the functionalities. `marker.js` is an example of directive.

- Service:      A service is a reusable code component that provides some standard functionalities. For example, Angular JS by default provides the `$compile` service which allows us to compile HTML code / elements with Angular directives in them. Services are generally injected into controllers or directives so that they can use the functions. 

- Special functions:
    - `$watch`: The `$watch` function watches a variable in the scope for changes. The callback function is fired whenever something changes. If the function is called without the first parameter, the function is called on every user interaction (including mousemove!). 

## Additional resources
- [AngularJS – A crash course – in processing AJAX JSON](http://outbottle.com/angularjs-a-crash-course-in-processing-ajax-json/)
- [Egghead](http://www.egghead.io/)
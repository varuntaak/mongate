# mongate [![Build Status](https://secure.travis-ci.org/varuntaak/mongate.png?branch=master)](http://travis-ci.org/varuntaak/mongate)

Kick start your nodejs app with mongate.

mongate is inspired by need of having high level apis to communicate to node-mongodb-native apis. This removes all the complexity and clutters to access mongodb natively.


## Documentation

While working on [Gyansource](http://gyansource.com) (an approach to infuse social networking in marketing and sales.), I realize that there is apparent need of wrapper on [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) library to enhace the reusability in the application.

[Gyansource](http://gyansource.com) retrieves and persist docuemnts, images, user records, user comments etc in mongodb. Mongate is designed to hide the low level interaction step with [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) lib, and provides a clear, intutive interface from user point of view.


## Examples

if you like to create a document in database 

use mongate as follows 

```javascript
mongate.createDocument(document, callback);
```
document is a JSON, and a callback to know the status. 

To read a document from database

```javascript
mongate.readDocumentById(_id, callback);
```
_id is mongodb document id in String format.

... for more detail look into test/mongate_test.js

## Getting Started
Install the module with: `npm install mongate`

set your application specific settings in models/ApplicationConstants.js, such as dbName, application root/domain ...

and thats it, and mongate will do rest of the things such as setting up a connection, getting db client for mongodb, iterating over the items and much more, for details look at lib/mongate.js and test/mongate_test.js

```javascript
var mongate = require('mongate');
mongate.readDocumentById(_id, callback)
```

## Contributing
Mongate is an effort to come up with simple, intiutive and complete apis to build a web application's database layer.

Contribution is needed from the community as and when mongate need to evolve.

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

31-12-2013  v0.1.0-beta released

28-12-2013  mongate repository created


## License
Copyright (c) 2013 Varun Tak. Licensed under the MIT license.

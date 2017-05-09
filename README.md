
[![Build Status](https://travis-ci.org/lane-webperformance/legion.svg?branch=master)](https://travis-ci.org/lane-webperformance/legion)
[![Dependency Status](https://gemnasium.com/badges/github.com/lane-webperformance/legion.svg)](https://gemnasium.com/github.com/lane-webperformance/legion)

![Legion Logo (Red)](./legion-logo-red.png "Legion Framework")

Legion is a load testing tool for HTTP servers and other kinds of software.
It consists of two major components: legion-metrics, which collects and merges
performance metrics from various sources; and legion-io, a Promise-based
library that makes it quick and easy to describe a testcase.

To get started with Legion, try the [starter seed project](https://github.com/lane-webperformance/legion-starter-project).

A legion testcase is chained together from pieces, in much the same way that we use promises:

	const L = require('legion');
	const fetch = require('legion-io-fetch');
	const delay = require('legion-io-delay');

	const my_testcase = Io.of()
	  .chain(fetch.text('http://www.example.com/'))
	  .chain(delay(10))
	  .chain(fetch.text('http://www.example.com/page1.html'))
	  .chain(delay(10))
	  .chain(fetch.text('http://www.example.com/page2.html'));

	L.create()
	 .withTestcase(my_testcase)
	 .main();

And then executed from the command line (in this case, with 50 concurrent users):

	node testcase.js -n 50

Visit the [wiki](https://github.com/lane-webperformance/legion/wiki) for more information.

API
===

	const L = require('legion');

L.create()
----------

Create a new Legion load test.

L.prototype
-----------

Prototype of all Legion load test objects.

### L.prototype.withBeforeTestAction(f : function)

Adds an action to run before starting the load test. If you have multiple Legion
instances running in parallel, this action will run once on each instance.

Returns: A load test object incorporating the given before-test action.

### L.prototype.withAfterTestAction(f : function)

Adds an action to run after finishing the load test. If you have multiple Legion
instances running in parallel, this action will run once on each instance.

Returns: A load test object incorporating the given after-test action.

### L.prototype.withGlobalService(f : function)

Adds an action to set up a service that will be available to all users.
Any such services will appear in the services field of the state object.

 * f - a function taking a services object and returning a (possibly modified) services object.

Returns: A load test object incorporating the given global service.

Example:

	L.create()
	 .withGlobalService(services => {
           services.myExampleService = { foo: 'bar' };
           return services;
         })
         .withTestcase(L.get().chain(state => {
           console.log(state.services.foo); //prints 'bar'
         });

### L.prototype.withUserService(f : function)

Adds an action to set up a service so that a unique instance will be available to each virtual user.
Any such services will appear in the services field of the state object.

Returns: A load test object incorporating the given user service.

Unlike the withGlobalService() method, the setup function that you supply to this method
will be called once for each virtual user.

### L.prototype.withMetricsTarget(target : object)

Supply a custom MetricsTarget to be used for this load test. This setting can be overridden from the
command line.

Returns: A load test object that will use the given MetricsTarget to collect test metrics.

### L.prototype.withController(target : object)

Supply a controller client object to be used for this load test. This setting can be overridden from
the command line.

Returns: A load test object that will use the given controller client to orchestrate the load test.

### L.prototype.withProjectKey(project\_key : string)

Supply a project\_key to be used for this load test. This setting can be overridden from the
command line. The project\_key is primarily used to uniquely identify a test run on both the
controller and when capturing test metrics.

Returns: A load test object that will use the given project\_key.

### L.prototype.withTestcase(tc : function or object)

Supply a testcase to execute during this load test. A testcase is usually an Io
object which wraps one or more functions that describe what the testcase should do.
The simplest testcase is just one function that returns an ES6 Promise.

To chain multiple functions together, begin the chain with L.of():

	L.create().withTestcase(
	  L.of()
	   .chain(() => Promise.resolve('operation one'))
	   .chain(() => Promise.resolve('operation two'))
	   .chain(() => Promise.resolve('operation three')))

### L.prototype.run(n : number)

Run a load test.

 * n - the number of users to start

Note: consider using the main() method instead.

### L.prototype.main()

Run a load test using command-line options. For example:

	L.create()
	 .withTestcase(L.of('simplest possible testcase'))
         .main();

L.of(value : any)
-----------------

Constructs the simplest possible Io action, returning a fixed value.

L.get()
-------

An Io action that gets the embedded state and passes it to the next action.

L.projectKey()
--------------

An Io action that gets the project key and passes it to the next action.

L.controller()
--------------

An Io action that gets the controller client and passes it to the next action.
Usually you use L.getControlData() or L.getCounters() instead.

L.getControlData()
------------------

An Io action that gets the control data for this load test. Control data is provided
by a control server and can be used to synchronize the behavior of several legion instances
in real time.

L.getCounters(counter\_key:string, n:number)
--------------------------------------------

An Io action that allocates some counters that will be unique for this virtual user. Counters
are small numbers (starting from zero) that are provided from a single control server and guaranteed
to be unique for each call, project\_key, and controller server.

L.getUserUniqueId()
-------------------

An Io action that gets the Version 4 UUID for this virtual user.

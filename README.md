
Legion is a tool library to support load and performance testing in Javascript.
It consists of two major components: legion-metrics, which collects and merges
performance metrics from various sources; and legion-io, a Promise-based
fluent library that makes it quick and easy to describe a testcase.

Getting Started
---------------

In this example we'll use legion to execute a few requests against
http://www.example.com and measure the response time. This example uses legion
and node-fetch, a promise-based HTTP client API.

	npm init
	npm install --save https://github.com/lane-webperformance/legion.git#v0.0.2
	npm install --save https://github.com/lane-webperformance/legion-io-fetch.git#v0.0.2

Having done this, edit your project's index file:

	var L = require('legion');
	var fetch = require('legion-io-fetch');

	var testcase = fetch.text("http://demo6.webperformance.com")
                .chain(fetch.text("https://demo6.webperformance.com"));

        L.run(5,testcase).log();

These requests will go to a site, demo6.webperformance.com, which
my employer, Web Performance, Inc, set up to absorb load test
traffic from prospective users who don't yet have a testable
system of their own. Feel free to burn it to the ground. :)

It just so happens that demo6.webperformance.com uses a self-signed
certificate. This means that all of our HTTPS requests will fail, which
will be convenient for the purpose of this demonstration.

When you run this, it'll make ten requests to www.example.com: five using HTTP
and five using HTTPS, average up the response times, and print a result. I've
snipped and simplified the output a little bit to make it easier to talk about:

	"protocol": {
	  "http": {
	    "value$max": 5370,  // slowest response time (in milliseconds)
	    "value$min": 117,   // fastest response time (in milliseconds)
	    "time$max": 1462216657694,
	    "time$min": 1462216652466,
	    "total$sum": 13307, // total of all response times
	    "count$sum": 10,    // number of responses (5 HTTP and 5 HTTPS)
                                // Giving an average response time of 1.33 seconds.
	    "tags": {
	      "outcome": {
	        "success": {    // Statistics for successful HTTP requests.
	          "value$max": 5370,
	          "value$min": 492,
	          "time$max": 1462216657357,
	          "time$min": 1462216652466,
	          "total$sum": 7494,
	          "count$sum": 5
	        },
	        "failure": {    // Statistics for failed HTTP requests.
	          "value$max": 5117,
	          "value$min": 117,
	          "time$max": 1462216657694,
	          "time$min": 1462216652632,
	          "total$sum": 5813,
	          "count$sum": 5
	        }
	      }
	    }
	  }
	}

Note a few things:

* For the moment, legion doesn't separate HTTP and HTTPS traffic in
in the statistical summary. HTTPS traffic is included under the
protocol:HTTP heading.

* If you look at the output outside of the protocol:HTTP block, you
might see 5 successes and 10 failures. Why? Because there were 5
successful requests, 5 failed requests, and 5 testcase iterations
that failed to to complete (due to the 5 failed requests).


[![Build Status](https://travis-ci.org/lane-webperformance/legion.svg?branch=master)](https://travis-ci.org/lane-webperformance/legion)
[![Dependency Status](https://gemnasium.com/badges/github.com/lane-webperformance/legion.svg)](https://gemnasium.com/github.com/lane-webperformance/legion)

Legion is a load testing tool for HTTP servers and other kinds of software.
It consists of two major components: legion-metrics, which collects and merges
performance metrics from various sources; and legion-io, a Promise-based
fluent library that makes it quick and easy to describe a testcase.

To get started with Legion, try the [starter seed project](https://github.com/lane-webperformance/legion-starter-project).

A legion testcase is chained together from pieces, in much the same way that we use promises:

	fetch.text('http://www.example.com/')
	     .chain(delay(10))
	     .chain(fetch.text('http://www.example.com/page1.html'))
	     .chain(delay(10))
	     .chain(fetch.text('http://www.example.com/page2.html'))

And then executed from the command line (in this case, with 50 concurrent users):

	node testcase.js -n 50

Visit the [wiki](https://github.com/lane-webperformance/legion/wiki) for more information.


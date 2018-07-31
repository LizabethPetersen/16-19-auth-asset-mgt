# LAB 16 - AUTH-ASSET-MGT README

## Travis Badge
[![Build Status](https://travis-ci.org/LizabethPetersen/16-19-auth-asset-mgt.svg?branch=master)](https://travis-ci.org/LizabethPetersen/16-19-auth-asset-mgt)

## Code
This is the structure for an account with basic authorization for signup and subsequent logins. Routes include POST and GET. 

##### POST
The Account Schema includes a username, email, and password as required fields, and upon POST, will create a new Account, with added token seed and created on date/time. The token seed will have a hash length of 64 and will use 4 rounds to generate this (in combination with the password).

##### GET
We can access an Account via a GET request using a correct username and password.

##### DELETE
We can delete images from the S3 bucket via their key (aka filepath).

### Load Testing Analysis
[![Heroku Report](file:///Users/elizabethpetersen/codefellows:401/labs/16-19-auth-asset-mgt/heroku-report.json.html
)]
The above report shows that of 230 tests created, only 63 completed. The reaminder ran into a timeout and did not complete. It took an average of 68 seconds for the tests to hit both 95% and 99% of the users. Minimum response time (or, latency) was ~3 seconds, while the maximum was 68 seconds.

[![Heroku Simple Load Test Report](file:///Users/elizabethpetersen/codefellows:401/labs/16-19-auth-asset-mgt/load-testing/heroku-simple-test-report.json.html)]

For the above tests, we only created 20 new users and were able to complete all 20 tests. Median latency was 3.9s, with requests hitting 95% of the users at around 10s and 99% of the users at nearly 15s. We received all 404 errors, so none of the POST requests hit.



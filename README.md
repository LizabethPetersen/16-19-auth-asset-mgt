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


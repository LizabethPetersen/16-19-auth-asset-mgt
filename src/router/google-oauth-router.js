import { Router } from 'express';
import superagent from 'superagent';
import HttpErrors from 'http-errors';
// import { access } from 'fs';

import crypto from 'crypto';
import jsonWebToken from 'jsonwebtoken';
import Account from '../model/account';
import logger from '../lib/logger';

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

require('dotenv').config();

const googleOAuthRouter = new Router();

googleOAuthRouter.get('/api/oauth/google', (request, response, next) => {
  return Account.init()
    .then(() => {
      if (!request.query.code) {
        logger.log(logger.ERROR, 'DID NOT GET CODE FROM GOOGLE');
        response.redirect(process.env.CLIENT_URL);
        return next(new HttpErrors(500, 'Google OAuth Error'));
      }
      logger.log(logger.INFO, `RECVD CODE FROM GOOGLE AND SENDING IT BACK TO GOOGLE: ${request.query.code}`);

      let accessToken;
      return superagent.post(GOOGLE_OAUTH_URL)
        .type('form')
        .send({
          code: request.query.code,
          grant_type: 'authorization_code',
          client_id: process.env.GOOGLE_OAUTH_ID,
          client_secret: process.env.GOOGLE_OAUTH_SECRET,
          redirect_uri: `${process.env.API_URL}/oauth/google`,
        })    
        .then((googleTokenResponse) => {
          if (!googleTokenResponse.body.access_token) {
            logger.log(logger.ERROR, 'No Token from Google');
            return response.redirect(process.env.CLIENT_URL);
          }
          logger.log(logger.INFO, `RECEIVED GOOGLE ACCESS TOKEN: ${JSON.stringify(googleTokenResponse.body, null, 2)}`);
          accessToken = googleTokenResponse.body.access_token;

          logger.log(logger.INFO, `ACCESS TOKEN RECEIVED: ${JSON.stringify(accessToken)}`);
          return superagent.get(OPEN_ID_URL)
            .set('Authorization', `Bearer ${accessToken}`);
        })
        .then((openIDResponse) => {
          logger.log(logger.INFO, `OPEN ID: ${JSON.stringify(openIDResponse.body, null, 2)}`);
          const { email } = openIDResponse.body;

          return Account.findOne({ email })
            .then((foundAccount) => {
              if (!foundAccount) {
                const username = email;

                const secret = `${crypto.randomBytes(32)}${process.env.SECRET_KEY}`;

                return Account.create(username, email, secret)
                  .then((account) => {
                    console.log(account, 'THIS IS MY ACCOUNT');
                    account.tokenSeed = accessToken;
                    return account.save();
                  })
                  .then((updatedAccount) => {
                    return jsonWebToken.sign({ tokenSeed: updatedAccount.tokenSeed }, process.env.SECRET_KEY);
                  })
                  .then((signedToken) => {
                    const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
                    response.cookie('L37-401d25-Token', signedToken, cookieOptions);
                    return response.redirect(process.env.CLIENT_URL);
                  })
                  .catch(next);
              } else { // eslint-disable-line
                return jsonWebToken.sign({ tokenSeed: foundAccount.tokenSeed }, process.env.SECRET_KEY);
              }
            })
            .then((token) => {
              const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
              // This will not work outside of localhost
              response.cookie('L37-401d25-Token', token, cookieOptions);              
              return response.redirect(process.env.CLIENT_URL);
            })
            .catch(next);
        })
        .catch(next);
    })
    .catch(next);
});

export default googleOAuthRouter;

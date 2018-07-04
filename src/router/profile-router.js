import { Router } from 'express';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const profileRouter = new Router();

profileRouter.post('api/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'POST Profile Router: Invalid Request'));

  Profile.init()
    .then(() => {
      return new Profile({
        ...request.body,
        accountId: request.account._id,
      }).save();
    })
    .then((profile) => {
      logger.log(logger.INFO, `POST Profile Router: 200 for new Profile created, ${JSON.stringify(profile)}`);
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.get('api/profiles/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(401, 'GET Profile Router: 401 for invalid request'));
    
  if (!request.params._id) {
    return Profile.find({})
      .then((profiles) => {
        return response.json(profiles);
      })
      .catch(next);
  }

  Profile.findOne({ _id: request.params.id })
    .then((profile) => {
      if (!profile) return next(new HttpErrors(400, 'Profile Router GET: profile not found'));
      return response.json(profile);
    })
    .catch(next);
  return undefined;
});

export default profileRouter;

import { Router } from 'express';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const profileRouter = new Router();

profileRouter.post('/api/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'POST PROFILE ROUTER: Invalid Request'));
  Profile.init()
    .then(() => {
      return new Profile({
        ...request.body,
        accountId: request.account._id,
      })
        .save()
        .then((profile) => {
          logger.log(logger.INFO, `POST PROFILE ROUTER: 200 for new Profile created, ${JSON.stringify(profile)}`);
          return response.json(profile);
        })
        .catch(next);
    })
    .catch(next);
  return undefined;
});

profileRouter.get('/api/profiles/me', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'GET PROFILE ROUTER-AUTH: 400 for invalid request'));
  
  return Profile.findOne({ accountId: request.account._id })
    .then((profile) => {
      if (!profile) return next(new HttpErrors(404, 'Not Found'));
      console.log(profile, 'RETURNING ONE PROFILE'); 
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.get('/api/profiles/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'GET PROFILE AUTH-ROUTER: 400 for invalid request'));
  if (!request.params._id) {
    Profile.find({})
      .then((profiles) => {
        console.log(profiles);
        return response.json(profiles);
      })
      .catch(next);
    return undefined;
  }

  Profile.findOne({ _id: request.params.id })
    .then((profile) => {
      if (!profile) return next(new HttpErrors(400, 'GET PROFILE AUTH-ROUTER: Profile not found'));
      return response.json(profile);
    })
    .catch(next);
  return undefined;
});

profileRouter.put('/api/profiles/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'PUT PROFILE AUTH-ROUTER: Invalid request'));
  if (!request.params.id) {
    return next(new HttpErrors(400, 'No ID entered'));
  }
  const options = { new: true, runValidators: true };

  Profile.findByIdAndUpdate(request.params.id, request.body, options) 
    .then((updatedProfile) => {
      if (!updatedProfile) return next(new HttpErrors(404, 'Profile not found'));
      return response.json(updatedProfile);
    })
    .catch(next);
  return undefined;
});


export default profileRouter;

import multer from 'multer';
import { Router } from 'express';
import HttpErrors from 'http-errors';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import Image from '../model/image';
import { s3Upload, s3Remove } from '../lib/s3';
import logger from '../lib/logger';

const multerUpload = multer({ dest: `${__dirname}/../temp` });

const imageRouter = new Router();

imageRouter.post('/api/images', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  if (!request.account) return next(new HttpErrors(401, 'IMAGE ROUTER POST ERROR: not authorized'));
  if (!request.body.title || !request.files.length < 1) {
    return next(new HttpErrors(400, 'IMAGE ROUTER POST REQUEST: invalid request'));
  } 

  const [file] = request.files;
  logger.log(logger.INFO, `IMAGE ROUTER POST: valid file ready to upload: ${JSON.stringify(file, null, 2)}`);

  const key = `${file.fileName}.${file.originalname}`;
  return s3Upload(file.path, key)
    .then((url) => {
      logger.log(logger.INFO, `IMAGE ROUTER POST: received a valid url from Amazon S3: ${url}`);
      return new Image({
        title: request.body.title,
        accountId: request.account._id,
        fileName: key,
        url,
      }).save();
    })
    .then((newImage) => {
      logger.log(logger.INFO, `IMAGE ROUTER POST: new image created: ${JSON.stringify(newImage, null, 2)}`);
      return response.json(newImage);
    })
    .catch(next);
});
    
imageRouter.get('/api/images/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(401, 'IMAGE ROUTER GET: invalid request'));
  if (!request.params.id) return next(new HttpErrors(400, 'IMAGE ROUTER GET: no id provided'));

  return Image.findById(request.params.id)
    .then((image) => {
      if (!image) return next(new HttpErrors(404, 'IMAGE ROUTER GET: no image found'));
      logger.log(logger.INFO, `IMAGE ROUTER GET: successfully retrieved image: ${JSON.stringify(image, null, 2)}`);
      return response.json(image);
    })
    .catch(next);
});

imageRouter.delete('/api/images/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(401, 'IMAGE ROUTER DELETE: invalid request'));
  if (!request.params.key) return next(new HttpErrors(400, 'IMAGE ROUTER DELETE: no id provided'));

  // how do we incorporate s3Remove to remove the item from AWS S3????
  
  return Image.findByIdAndRemove(request.params.id)
    .then((image) => {
      if (!image) return next(new HttpErrors(404, 'IMAGE ROUTE DELETE: no image found'));
      logger.log(logger.INFO, 'IMAGE ROUTER DELETE: successfully deleted image');
      return response.sendStatus(204);
    })
    .catch(next);
});


export default imageRouter;

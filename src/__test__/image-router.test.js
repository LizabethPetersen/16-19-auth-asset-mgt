'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { createImageMockPromise, removeImagesAndAccounts } from './lib/image-mock';

const yellowBenchImg = `${__dirname}/asset/yellow-bench.jpg`;
const apiUrl = `http://localhost:${process.env.PORT}/api/images`;

describe('TESTING ROUTES AT /api/images', () => {
  let token;
  let account;
  let image;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    try {
      const mockData = await createImageMockPromise();
      token = mockData.token;  /* eslint-disable-line */
      account = mockData.account;  /* eslint-disable-line */
      image = mockData.image;  /* eslint-disable-line */
    } catch (err) {
      return console.log(err); /* eslint-disable-line */
    }
    return undefined;
  });
  afterEach(async () => {
    await removeImagesAndAccounts();
  });

  describe('POST ROUTES to /api/images', () => {
    test('POST 200', async () => {
      try {
        const response = await superagent.post(apiUrl)
          .set('Authorization', `Bearer ${token}`)
          .field('title', 'yellow bench')
          .attach('image', yellowBenchImg);
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual('yellow bench');
        expect(response.body._id).toBeTruthy();
        expect(response.body.url).toBeTruthy();
      } catch (err) {
        console.log(err);  /* eslint-disable-line */
        expect(err).toEqual('foobar');
      }
      return undefined;
    });
  });

  describe('GET ROUTES to /api/images', () => {
    test('Send 200 for successful retrieval of an image', async () => {
      try {
        const response = await superagent.get(apiUrl)
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual(image.title);
        expect(response.body.accountId).toEqual(image.accountId.toString());
        expect(response.body.url).toEqual(image.url);
        expect(response.body.fileName).toEqual(image.fileName);
      } catch (err) {
        console.log(err);  /* eslint-disable-line */
        expect(err).toEqual('FAILING IN GET 200 REQUEST');
      }
    });
  });
});

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { createImageMockPromise, removeImagesAndAccounts } from './lib/image-mock';

const yellowBenchImg = `${__dirname}/assets/yellow-bench.jpg`;
const apiUrl = `http://localhost:${process.env.PORT}/api/images`;

describe('TESTING IMAGE ROUTER AT /api/images', () => {
  let token;
  let account;  /* eslint-disable-line */
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
      return console.log(err);  /* eslint-disable-line */
    }
    return undefined;
  });

  afterEach(async () => {
    await removeImagesAndAccounts();
  });

  describe('POST IMAGE ROUTES to /api/images', () => {
    test('POST 200', async () => {
      try {
        const response = await superagent.post(`${apiUrl}`)
          .set('Authorization', `Bearer ${token}`)
          .field('title', 'yellow bench')
          .attach('image', yellowBenchImg);
        expect(response.status).toEqual(200);
        // expect(response.body.title).toEqual('yellow bench');
        // expect(response.body._id).toBeTruthy();
        // expect(response.body.url).toBeTruthy();
        console.log(response, 'I AM ABLE TO GET TO MY ROUTE!!!!!!!!!');
      } catch (err) {
        console.log(err);  /* eslint-disable-line */
        expect(err).toEqual('foo');
      }
      return undefined;
    });
  });

  describe('GET ROUTES to /api/images', () => {
    test('Send 200 for successful retrieval of an image', async () => {
      try {
        const response = await superagent.get(`${apiUrl}/${image._id}`)
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual(image.title);
        expect(response.body.accountId).toEqual(image.accountId.toString());
        expect(response.body.url).toEqual(image.url);
        expect(response.body.fileName).toEqual(image.fileName);
      } catch (err) {
        console.log(err);  /* eslint-disable-line */
        expect(err).toEqual('foo');
      }
      return undefined;
    });
  });

  describe('DELETE ROUTES to /api/images', () => {
    test('Send 202 for successful deletion of an image', async () => {
      try {
        const response = await superagent.delete(`${apiUrl}/images/:id?`)
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(202);
      } catch (err) {
        console.log(err);  /* eslint-disable-line */
        expect(err).toEqual('FAILING IN DELETE 202 REQUEST');
      }
    });
  });
});

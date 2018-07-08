import superagent from 'superagent';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise } from './lib/account-mock';
import { removeAllResources } from './lib/profile-mock';

const apiUrl = `http://localhost:${process.env.PORT}}`;

describe('TESTING PROFILE ROUTER', () => {
  let mockData;
  let token;
  let account;
  beforeAll(async () => {
    startServer();
  });
  afterAll(stopServer);
  beforeEach(async () => {
    await removeAllResources();

    try {
      mockData = await createAccountMockPromise();
      token = mockData.token;   /* eslint-disable-line */
      account = mockData.account;  /* eslint-disable-line */
    } catch (err) {
      return console.log(err);  /* eslint-disable-line */
    }
    return undefined;
  });

  describe('POST PROFILE ROUTES TESTING', () => {
    test('200 to api/profiles for successful profile creation', async () => {
      const mockProfile = {
        bio: faker.lorem.words(15),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        accountId: account._id,
      };
      try {
        const response = await superagent.post('http://localhost:5000/api/profiles')
          .set('Authorization', `Bearer ${token}`)
          .send(mockProfile);
        expect(response.status).toEqual(200);
        expect(response.body.accountId).toEqual(account._id.toString());
        expect(response.body.firstName).toEqual(mockProfile.firstName);
        expect(response.body.lastName).toEqual(mockProfile.lastName);
        expect(response.body.bio).toEqual(mockProfile.bio);
      } catch (err) {
        expect(err).toEqual('FOO');
      }
    });

    test('POST 400 for trying to post a profile with a bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/api/profiles`)
          .set('Authorization', 'Bearer THISISABADTOKEN');
        expect(response).toEqual(400);
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});

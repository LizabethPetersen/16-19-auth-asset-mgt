import 'babel-polyfill';
import faker from 'faker';
import { createAccountMockPromise, removeAccountMockPromise } from './account-mock';
import Image from '../../model/image';
import Account from '../../model/account';

const createImageMockPromise = async () => {
  const mockData = {};
  const mockAccountResponse = await createAccountMockPromise();
  mockData.account = mockAccountResponse.account;
  mockData.token = mockAccountResponse.token;
  const image = await new Image({
    title: faker.lorem.words(2),
    url: faker.random.image(),
    fileName: faker.system.fileName(),
    accountId: mockData.account._id,
  }).save();
  console.log(image, 'THIS IS MY NEW IMAGE!!!!!!!!!!') /* NOTE THAT THIS WORKS—I AM SEEING MY IMAGE DATA */
  mockData.image = image;
  return mockData;
};

const removeImagesAndAccounts = () => {
  return Promise.all([
    Image.remove({}),
    Account.remove({ removeAccountMockPromise }),
  ]);
};

export { createImageMockPromise, removeImagesAndAccounts };

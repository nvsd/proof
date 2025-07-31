import { createHash } from 'crypto';
import { faker } from '@faker-js/faker';
import { NewUser } from '@/lib/server/db/repo/users';

export interface TestInfo {
  testId?: string;
  file?: string;
  title?: string;
}

export class TestUser {
  public readonly testId: string;
  public readonly googleId: string;
  public readonly email: string;
  public readonly name: string;
  public readonly picture: string;

  constructor(testInfo: TestInfo) {
    const { testId, file, title } = testInfo;

    const identifier = testId || `${file}-${title}`;
    const seed = createHash('md5').update(identifier).digest('hex');

    faker.seed(parseInt(seed.slice(0, 8), 16));

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    this.testId = testId || identifier;
    this.googleId = faker.string.uuid();
    this.picture = faker.image.avatar();
    this.name = `${firstName} ${lastName}`;
    this.email = faker.internet.email({ firstName, lastName });
  }

  toNewUser(): NewUser {
    return {
      googleId: this.googleId,
      email: this.email,
      name: this.name,
      picture: this.picture,
    };
  }

  static fromTestId(testId: string): TestUser {
    return new TestUser({ testId });
  }

  static fromTestInfo(file: string, title: string): TestUser {
    return new TestUser({ file, title });
  }
}

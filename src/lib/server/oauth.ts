import { Resource } from 'sst';
import { Google } from 'arctic';

export const google = new Google(
  Resource.GoogleClientId.value,
  Resource.GoogleClientSecret.value,
  `http://localhost:3000/login/google/callback`,
);

import type { IUserProfile } from '../../../../domain/user/user.types';

export interface ILoginResult {
  token: string;
  user: IUserProfile;
}

export interface IAuthStrategy {
  authenticate(payload: any): Promise<ILoginResult>;
}

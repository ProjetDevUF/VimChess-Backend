export class SessionEntity {
  constructor(data: Partial<SessionEntity>) {
    Object.assign(this, data);
  }

  id: number;
  refreshToken: string;
  deviceId: string;
  expiresIn: Date;
  userUid: string;
}

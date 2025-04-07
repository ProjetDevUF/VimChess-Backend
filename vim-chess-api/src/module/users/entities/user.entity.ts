import { RoleEntity } from './role.entity';

export class UserEntity {
  constructor({ Role, ...data }: Partial<UserEntity>) {
    Object.assign(this, data);
    if (Role) {
      this.Role = new RoleEntity(Role);
    }
  }

  uid: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  country: string;
  elo: number;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;

  Role: RoleEntity;
}

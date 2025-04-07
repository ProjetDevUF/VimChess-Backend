export class RoleEntity {
  constructor(data: Partial<RoleEntity>) {
    Object.assign(this, data);
  }

  id: number;
  role: string;
}

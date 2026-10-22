export type UserRole = {
  id: string;
  roleTypeId?: string;
  title: string;
  province: string | number;
};

export type Profile = {
  fullName: string;
  phone: string;
  roles: UserRole[];
  activeRoleId: string | null;
};

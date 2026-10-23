export type UserRole = {
  [key: string]: unknown;
  id: string;
  roleTypeId?: string;
  title: string;
  province: string | number;
  chamberName?: string | null;
};

export type Profile = {
  fullName: string;
  phone: string;
  roles: UserRole[];
  activeRoleId: string | null;
};

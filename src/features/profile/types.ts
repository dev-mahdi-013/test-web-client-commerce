export type UserRole = {
  [key: string]: unknown;
  id: string;
  roleTypeId?: string;
  title: string;
  province: string | number;
  chamberName?: string | null;
  /** Name of the association the role belongs to, when the backend sends it (kept in the persisted session). */
  associationName?: string | null;
};

export type Profile = {
  fullName: string;
  phone: string;
  roles: UserRole[];
  activeRoleId: string | null;
};

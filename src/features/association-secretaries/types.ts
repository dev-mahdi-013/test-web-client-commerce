export type AssociationSecretary = {
  id: string;
  fullName: string;
  phone: string;
  /** ISO date the person was registered as secretary */
  appointedAt: string;
  /** ISO date the person was dismissed; null while still in office */
  dismissedAt: string | null;
};

/** Docs: POST `/ap/agents/20/add` body — association member + card role. */
export type AddSecretaryPayload = {
  memberId: string;
  memberRoleId: string;
};

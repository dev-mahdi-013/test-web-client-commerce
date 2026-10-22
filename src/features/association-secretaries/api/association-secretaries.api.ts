import { commerceHttp, fromEpoch } from "@/lib/commerce-http";
import type { AddSecretaryPayload, AssociationSecretary } from "../types";

/** Association secretary role id in the Commerce agent endpoints. */
const AGENTS_BASE = "/ap/agents/20";

type ApiAgent = {
  _id: string;
  roleId: string;
  name: string;
  phone: string;
  startDate: number;
  endDate: number;
};

function toSecretary(agent: ApiAgent): AssociationSecretary {
  return {
    id: `${agent._id}.${agent.roleId}`,
    fullName: agent.name,
    phone: agent.phone,
    appointedAt: fromEpoch(agent.startDate) ?? new Date(0).toISOString(),
    dismissedAt: fromEpoch(agent.endDate),
  };
}

export const associationSecretariesApi = {
  /** Full appointment history, oldest and current secretaries alike. */
  list: async () => (await commerceHttp<ApiAgent[]>(`${AGENTS_BASE}/history`)).map(toSecretary),

  add: async ({ memberId, memberRoleId }: AddSecretaryPayload) =>
    toSecretary(
      await commerceHttp<ApiAgent>(`${AGENTS_BASE}/add`, {
        method: "POST",
        body: { memberId, memberRoleId },
      }),
    ),

  remove: async (secretary: AssociationSecretary) => {
    const [agentId = "", roleId = ""] = secretary.id.split(".");
    await commerceHttp(`${AGENTS_BASE}/${agentId}/${roleId}/remove`, { method: "DELETE" });
  },
};

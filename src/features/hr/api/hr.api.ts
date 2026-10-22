import { commerceHttp, fromEpoch } from "@/lib/commerce-http";
import type { AddOfficerPayload, DismissOfficerPayload, Officer, OfficerUnit } from "../types";

const agentRole: Record<OfficerUnit, number> = {
  organizations: 0x11,
  "card-issuance": 0x12,
};

type ApiAgent = {
  _id: string;
  roleId: string;
  name: string;
  phone: string;
  startDate: number;
  endDate: number;
};

function toOfficer(agent: ApiAgent): Officer {
  return {
    id: `${agent._id}.${agent.roleId}`,
    userId: agent._id,
    roleId: agent.roleId,
    fullName: agent.name,
    phone: agent.phone,
    appointedAt: fromEpoch(agent.startDate) ?? new Date(0).toISOString(),
    dismissedAt: fromEpoch(agent.endDate),
  };
}

export const hrApi = {
  /** The whole appointment history of the unit, in the order the backend returns */
  listOfficers: async (unit: OfficerUnit) => {
    const agents = await commerceHttp<ApiAgent[]>(`/pcp/agents/${agentRole[unit]}/history`);
    return agents.map(toOfficer);
  },

  addOfficer: async ({ unit, fullName, phone }: AddOfficerPayload) =>
    toOfficer(
      await commerceHttp<ApiAgent>(`/pcp/agents/${agentRole[unit]}/add`, {
        method: "POST",
        body: { name: fullName, phone },
      }),
    ),

  dismissOfficer: ({ unit, officer }: DismissOfficerPayload) =>
    commerceHttp<number>(`/pcp/agents/${agentRole[unit]}/${officer.userId}/${officer.roleId}/remove`, {
      method: "DELETE",
    }),
};

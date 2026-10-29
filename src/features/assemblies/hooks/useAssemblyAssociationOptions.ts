import { useQuery } from "@tanstack/react-query";
import { associationKeys, associationsApi } from "@/features/associations/api";
import { currentCommerceScope } from "@/lib/commerce-scope";

/** Association options for assembly filters and the create-assembly form (id + name). */
export function useAssemblyAssociationOptions() {
  return useQuery({
    queryKey: [...associationKeys.all, "assembly-options"] as const,
    // The association-president endpoint is bound to its own association, so the picker is never used there;
    // fetching it would only repeat the /ap/association/info call the role switcher already makes.
    enabled: currentCommerceScope() !== "ap",
    queryFn: async () => {
      const first = await associationsApi.listAssociations({ page: 1 });
      const pages = [first];
      for (let page = 2; page <= first.totalPages; page += 1) {
        pages.push(await associationsApi.listAssociations({ page }));
      }
      return pages.flatMap((result) => result.items.map((item) => ({ value: item.id, label: item.name })));
    },
  });
}

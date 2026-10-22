import { useQuery } from "@tanstack/react-query";
import { associationKeys, associationsApi } from "@/features/associations/api";

/** Association options for assembly filters and the create-assembly form (id + name). */
export function useAssemblyAssociationOptions() {
  return useQuery({
    queryKey: [...associationKeys.all, "assembly-options"] as const,
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

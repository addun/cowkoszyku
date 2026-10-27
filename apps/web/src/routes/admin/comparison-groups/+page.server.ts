import { queryParams, queryValue } from '$lib/common/http';
import { listComparisonGroups } from '$lib/api/admin/groups';

export const load = async ({ url }) => {
  const body = await listComparisonGroups();
  return { groups: body.groups, error: queryValue(queryParams(url), 'error') };
};

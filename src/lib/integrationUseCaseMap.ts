/**
 * Cross-reference map: integration name/slug → use case slugs that mention it.
 * Built by scanning USE_CASES step tools for matching integration names.
 */

import { USE_CASES } from "@/data/useCases";
import { INTEGRATIONS } from "@/data/integrations";

type UseCaseSlug = string;
type IntegrationSlug = string;

let _map: Record<IntegrationSlug, UseCaseSlug[]> | null = null;

export function getIntegrationUseCaseMap(): Record<IntegrationSlug, UseCaseSlug[]> {
  if (_map) return _map;

  _map = {};

  for (const integration of INTEGRATIONS) {
    const matchingUseCases: UseCaseSlug[] = [];

    for (const useCase of USE_CASES) {
      const allTools = useCase.steps.flatMap((s) => s.tools.map((t) => t.label.toLowerCase()));
      const integrationName = integration.name.toLowerCase();
      const integrationSlug = integration.slug.toLowerCase();

      const matches = allTools.some(
        (tool) =>
          tool.includes(integrationName) ||
          integrationName.includes(tool) ||
          tool.includes(integrationSlug) ||
          integrationSlug.includes(tool)
      );

      if (matches) {
        matchingUseCases.push(useCase.slug);
      }
    }

    _map[integration.slug] = matchingUseCases;
  }

  return _map;
}

export function getUseCasesForIntegration(integrationSlug: string): UseCaseSlug[] {
  const map = getIntegrationUseCaseMap();
  return map[integrationSlug] || [];
}

export function getRelatedIntegrations(integrationSlug: string, limit = 5): IntegrationSlug[] {
  const integration = INTEGRATIONS.find((i) => i.slug === integrationSlug);
  if (!integration) return [];

  return INTEGRATIONS.filter(
    (i) => i.slug !== integrationSlug && i.category === integration.category
  )
    .slice(0, limit)
    .map((i) => i.slug);
}

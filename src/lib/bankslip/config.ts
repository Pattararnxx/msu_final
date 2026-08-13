const DEFAULT_DOCS_URL = "https://thaibankslip.com/docs";

export const THAIBANKSLIP_PROVIDER = "thaibankslip" as const;

export type ThaiBankSlipIntegrationStatus = "prepared";

export interface ThaiBankSlipConfig {
  provider: typeof THAIBANKSLIP_PROVIDER;
  docsUrl: string;
  enabled: boolean;
  status: ThaiBankSlipIntegrationStatus;
}

function readBoolean(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

/**
 * Configuration only. This module intentionally does not make network calls
 * or define a provider payload until the ThaiBankSlip API contract is confirmed.
 */
export function getThaiBankSlipConfig(): ThaiBankSlipConfig {
  return {
    provider: THAIBANKSLIP_PROVIDER,
    docsUrl: process.env.THAIBANKSLIP_DOCS_URL?.trim() || DEFAULT_DOCS_URL,
    enabled: readBoolean(process.env.THAIBANKSLIP_ENABLED),
    status: "prepared",
  };
}

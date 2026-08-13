import { getThaiBankSlipConfig } from "@/lib/bankslip/config";

export const dynamic = "force-dynamic";

/**
 * Readiness/status endpoint only. It deliberately never calls ThaiBankSlip.
 */
export function GET() {
  const config = getThaiBankSlipConfig();

  return Response.json({
    provider: config.provider,
    docsUrl: config.docsUrl,
    enabled: config.enabled,
    status: config.status,
    liveVerification: false,
  });
}

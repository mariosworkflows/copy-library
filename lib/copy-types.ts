export type CampaignCategory = "cold" | "signal" | "micro";

export const SIGNAL_SUBCATEGORIES = [
  "funding",
  "new_hire",
  "job_opening",
  "customer_alumni",
  "linkedin_engagement",
  "competitor_followers",
  "website_visitor",
] as const;

export const MICRO_SUBCATEGORIES = ["webinar", "event_invite"] as const;

export type SignalSubcategory = (typeof SIGNAL_SUBCATEGORIES)[number];
export type MicroSubcategory = (typeof MICRO_SUBCATEGORIES)[number];

export interface CopyStep {
  id: string;
  label: string;
  subject?: string;
  body: string;
  channel: "email" | "linkedin";
}

export interface CopyCampaign {
  id: string;
  name: string;
  client: string;
  clientDomain?: string;
  channel: "Email" | "LinkedIn";
  positiveReplies: number;
  positiveReplyRate: number | null;
  steps: CopyStep[];
  category: CampaignCategory;
  subcategory?: string;
}

export interface CopyClient {
  id: string;
  name: string;
  domain?: string;
  campaigns: CopyCampaign[];
}

import { properties } from "../../../Environment/v2";

/** Full channel partner import template (matches legacy sample / fallback column order). */
export const CreateHeaderForChannelPartnerImport_allFields: string[] = [
  "name",
  "date_of_joining",
  "source_of_recruitment",
  "birthday",
  "is_individual",
  "is_fulltime",
  "channel_partner_type",
  "is_location_specific",
  "anniversary",
  "salutation",
  "first_name",
  "last_name",
  "phone",
  "email",
  "alternate_phone",
  "alternate_email",
  "occupation",
  "designation",
  "pan",
  "location",
  "project_ids",
  "address1",
  "address2",
  "city",
  "state",
  "country_code",
  "country",
  "zip",
  "address_type",
  "primary",
  "rera_number",
  "property_type",
  "min_budget",
  "max_budget",
  "channel_partner_code",
  "rera_name",
  "rera_validity",
];

/** Default `project_ids` when no explicit id is passed (legacy `properties.Project_id`). */
export function defaultChannelPartnerProjectId(): string {
  return properties.Project_id ? String(properties.Project_id) : "";
}

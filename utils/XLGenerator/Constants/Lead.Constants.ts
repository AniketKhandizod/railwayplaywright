import { properties } from "../../../properties/v2";

// LeadConstants.ts
export const PropertyType = [
    "studio", "villa", "apartment", "penthouse", "bunglow", "cottage", "duplex",
    "plot", "shop", "office", "row_house", "town_house", "extra", "all",
  ];
  
  export const BHK = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK", "7 BHK"];
  
  export const educationDetails = ["school", "graduation", "post-graduation", "other"];
  
  export const ProfessionalDetails = [
    "self-employed", "government-servant", "company-employee", "other",
    "retired", "housewife", "student"
  ];
  
  export const INCOMEDetails = ["personal", "family"];
  
  export const LoanDetails = ["home-loan", "car-loan", "personal-loan", "education-loan"];
  
  export const IntrestedIn = ["sale", "resale", "rental"];
  
  export const Purpose = ["end_use", "investor"];
  
  export const Furnishing = ["furnished", "semi-furnished", "unfurnished"];
  
  export const Industry = ["Real estate", "education"];
  
  export const Salutation = ["Mr", "Mrs", "Dr", "Ms"];
  
  export const CountryCode = ["91"];
  
  export const Source = [
    "Channel Partner", "Magicbricks" 
  ];
  
  export const Stages = ["Lost"];
  
  export const Status = ["hot", "warm"];
  
  export const Facing = ["North", "East", "South", "West"];
  
  export const Nri = ["Yes", "No"];
  
  export const TransactionType = ["outright_purchase", "lease", "either"];
  
  export const FundingSource = ["self", "home_loan"];
  
  export const BathroomPreferences = ["1", "2", "3", "4", "5", "6", "7"];
  
  export const Gender = ["Male", "Female"];
  
  export const URLType = ["facebook", "twitter", "google-plus", "linkedin", "instagram"];
  
  export const LostReasons = ["Booked with competitor"];
  
  export const UnqualifiedReasons = ["no_followup"];
  
  export const States = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh", "West Bengal"
  ];
  
  export const arySource = [
    "Economic Times - Online", "Channel Partner", "DNA - Online", "DNA - Print", "Moneycontrol"
  ];

  export const CreateHeaderForLeadImport_allFields = [
    "Created At", "Salutation", "First Name", "Last Name",
			"Lead Id", "Primary Phone", "Secondary Phone", "Primary Email", "Secondary Email", "Minimum possesion",
			"Maximum possesion", "Minimum budget", "Maximum budget", "Property types", "Locations", "BHK", "Note",
			"Followup date", "Site visit date", "Age", "Birthday", "Anniversary", "Industry", "Educational Details",
			"Professional Details", "Income", "Loan Details", "Url", "Address", "State", "City", "Country",
			"Project Ids", "Sales Ids", "Campaign Ids", "Sources", "Sub-Sources / Sub-Campaigns", "Lead Stages",
			"Status in Given Stage", "Stage Change Reasons", "Purpose", "Furnishing", "Facing", "Nri",
			"Transaction Type", "Funding Source", "Bathroom Preferences", "Married", "Manual Tags", "Gender",
			"Channel Partner ID", "Zip", "Street", "Area", "Interested In","Dropped By"
  ];

  // Dummy-strategy lead import (matches Java `CreateHeaderForLeadImportDummyStrategy` in XL_Utils)
  export const CreateHeaderForLeadImportDummyStrategy = ["Primary Phone", "Primary Email"];

  // Reengage import headers (matches Java `CreateHeaderForLeadImportReengage_allFields`)
  export const CreateHeaderForLeadImportReengage_allFields = [
    "Salutation", "First Name", "Last Name",
    "Lead Id", "Primary Phone", "Secondary Phone", "Primary Email", "Secondary Email", "Minimum possesion",
    "Maximum possesion", "Minimum budget", "Maximum budget", "Property types", "Locations", "BHK", "Note",
    "Followup date", "Site visit date", "Age", "Birthday", "Anniversary", "Industry", "Educational Details",
    "Professional Details", "Income", "Loan Details", "Url", "Address", "State", "City", "Country",
    "Project Ids", "Sales Ids", "Campaign Ids", "Sources", "Sub-Sources / Sub-Campaigns", "Lead Stages",
    "Status in Given Stage", "Stage Change Reasons", "Purpose", "Furnishing", "Facing", "Nri",
    "Transaction Type", "Funding Source", "Bathroom Preferences", "Married", "Manual Tags", "Gender",
    "Channel Partner ID", "Zip", "Street", "Area", "Interested In", "Dropped By"
  ];
  
  export const SiteVisitType = ["visit", "home_visit", "online_walkthrough"];
  
  // For values coming from `prop()` in Java, we assume they are injected at runtime via config
  export const projectIds = [properties.Project_id];
  export const SalesIds = [properties.Sales_id];
  export const CampaignIds = [properties.Campeign_id];
  export const ChannelPartnerID = [properties.Channel_partner_id];
  
  // You can replace placeholders with actual config or use dotenv/config file to inject these values at runtime
  
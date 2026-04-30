import { expect, request } from "@playwright/test";
import { properties } from "../../Environment/v2";
import { AheadOf, Utils } from "../PlaywrightTestUtils";
import { CRMAPIUtils } from "./CRMAPIUtils";

export class SearchListAPIUtils {
  private readonly clientId: string;
  private readonly apiKey: string;

  constructor(clientId: string, apiKey: string){
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

   async getListOfSearchlistIdsEnabledOnDashboard(): Promise<string[]> {
    const url = `/client/search_criteria.json`;
    
    const req = await request.newContext();
    const response = await req.get(url, {
      params: {
        utf8: "✓",
        commit: "Apply",
        "search_params[name]": "",
        "search_params[is_default]": "false",
        "search_params[available_for]": "",
        "search_params[only_user_dashboard_sc]": "true",
        api_key: this.apiKey,
        client_id: this.clientId,
      },
    });
  
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // Extract all "_id" values from the results array
    const ids: string[] = responseBody.results.map((item: any) => item._id);
    
    return ids;
  }

  async toggleSearchListDashboardVisibility(searchListId: string, enable: boolean): Promise<void> {
    const url = `/client/search_criteria/${searchListId}.json`;
    
    const req = await request.newContext();
    const response = await req.post(url, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      form: {
        utf8: "✓",
        _method: "patch",
        "search_criterium[display_on_user_dashboard]": enable.toString(),
        commit: "Save",
      },
    });
  
    expect(response.status()).toBe(200);
  }
  
   async toggleAllSearchListsDashboardVisibility(enable: boolean): Promise<void> {
    // Get all search list IDs that are currently enabled on dashboard
    const searchListIds = await this.getListOfSearchlistIdsEnabledOnDashboard();
    
    // Toggle each search list's dashboard visibility
    for (const searchListId of searchListIds) {
      await this.toggleSearchListDashboardVisibility(searchListId, enable);
    }
  }

   // ✅ Get Search List By Sales
   async getSearchListBySales(sl: string, email: string): Promise<number> {
    const req = await request.newContext();
    const token = await new CRMAPIUtils(this.clientId, this.apiKey).getUserToken(email, properties.PASSWORD ?? "");
    const url = `/client/leads.json`;
    const res = await req.get(url, {
      params: {
        "search_criterium[id]": sl,
        page: 1,
        per_page: 50,
      },
      multipart: {
        user_email: email,
        user_token: token,
      },
    });
    const json = await res.json();
    return json.total;
  }

  async getSearchListCountBySales(sl: string, email: string): Promise<number> {
    const utils = new Utils();
    const DateRange = utils.calculateFutureDate(AheadOf.Day, 0, "dd-MM-yyyy") + "to"
    + utils.calculateFutureDate(AheadOf.Day, 0, "dd-MM-yyyy");
    const req = await request.newContext();
    const token = await new CRMAPIUtils(this.clientId, this.apiKey).getUserToken(email, properties.PASSWORD ?? "");
    const url = `/client/leads.json?called_from=get_leads_count&search_criterium%5Bid%5D=${sl}&search_criterium%5Bsearch%5D=&search_criterium%5Bsearch_attributes%5D%5Bdate_range%5D=actual%3D${DateRange}`;
    const res = await req.get(url, {
      params: {
        "search_criterium[id]": sl,
        page: 1,
        per_page: 50,
      },
      multipart: {
        user_email: email,
        user_token: token,
      },
    });
    const json = await res.json();
    return json.total;
  }

  async getSearchListCountByAdmin(sl: string): Promise<number> {
    const req = await request.newContext();
    const url = `/client/search_criteria/${sl}/get_count.json`;
    const res = await req.get(url, {
      params: {
        "search_criterium[id]": sl,
        page: 1,
        per_page: 50,
      },
      multipart: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
    });
    const json = await res.json();
    return json.count;
  }

}






 

 

 

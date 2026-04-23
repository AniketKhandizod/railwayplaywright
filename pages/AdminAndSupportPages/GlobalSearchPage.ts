import { Page, Locator } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

export class GlobalSearchPage {
  private readonly page: Page;
  private readonly GlobalSearch: Locator;
  private readonly enterSearchText: Locator;
  private readonly searchForLeadWithName: Locator;
  private readonly waitTillVisible: Locator;
  private readonly utils: Utils;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.GlobalSearch = page.getByRole('link', { name: 'Search...' });
    this.enterSearchText = page.locator('#select2-drop').getByRole('textbox');
    this.searchForLeadWithName = page.getByText('Search for Lead with');
    this.waitTillVisible = page.getByRole('columnheader', { name: 'Lead id' });

    // wait
    this.waitTillVisible = page.locator("#Note_lead_profile");
  }

  async globalSearch(searchText: string) {
    await this.GlobalSearch.click();
    await this.enterSearchText.fill(searchText);
    await this.searchForLeadWithName.click();
    await this.utils.sleep(1000);
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async isNoteVisible() {
    return await this.waitTillVisible.isVisible();
  }
}
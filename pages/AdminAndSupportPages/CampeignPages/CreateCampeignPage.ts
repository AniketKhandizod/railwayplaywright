import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class CreateCampaignPage {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly inputChannel: Locator;
  private readonly SRDListing: Locator;
  private readonly inputAPIChannel: Locator;
  private readonly inputChannelProject: Locator;
  private readonly inputChannelSource: Locator;
  private readonly inputChannelSubSource: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.inputChannel = page.locator("#tab_head4");
    this.SRDListing = page.locator(".success td[width='20%']");

    // Inpute channel list
    this.inputAPIChannel = page.locator("(//tr[@class='success']/td)[1]");
    this.inputChannelProject = page.locator("(//tr[@class='success']/td)[3]");
    this.inputChannelSource = page.locator("(//tr[@class='success']/td)[4]");
    this.inputChannelSubSource = page.locator("(//tr[@class='success']/td)[5]");
  }

  async clickOnInputChannel(): Promise<void>{
    await this.inputChannel.click();
  }

  // Inpute channel list
  async getSRDListing(): Promise<Locator[]>{
    return await this.SRDListing.all();
  }

  // Inpute channel list
  async getInputAPIChannel(): Promise<string | null>{
    const content = await this.inputAPIChannel.first().textContent();
    return content ? content.trim() : null;
  }

  // Inpute channel list
  async getInputChannelProject(): Promise<string | null>{
    const content = await this.inputChannelProject.first().textContent();
    return content ? content.trim() : null;
  } 

  // Inpute channel list
  async getInputChannelSource(): Promise<string | null>{
    const content = await this.inputChannelSource.first().textContent();
    return content ? content.trim() : null;
  }

  // Inpute channel list
  async getInputChannelSubSource(): Promise<string | null>{
    const content = await this.inputChannelSubSource.first().textContent();
    return content ? content.trim() : null;
  } 
}
import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CreateDeveloperPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newDeveloperLink : Locator;
    private readonly developerNameDropdown: Locator;
    private readonly developerNameInput : Locator;
    private readonly selectSalutation : Locator;
    private readonly firstName : Locator;
    private readonly lastName  : Locator;
    private readonly phoneNumber : Locator;
    private readonly Email: Locator;
    private readonly saveButton : Locator;
    private readonly successCreateMsg : Locator;
    private readonly allDeveloperLink : Locator;
    
    constructor(page: Page) {
      this.page = page;
      this.utils = new Utils();
      this.newDeveloperLink = page.getByRole('link', { name: 'New Developer' });
      this.developerNameDropdown = page.getByRole('link', { name: 'Developer name' });
      this.developerNameInput = page.locator('#select2-drop').getByRole('textbox');
      this.selectSalutation = page.getByRole('link', { name: 'salutation' });
      this.firstName = page.locator('#developer_contact_first_name');
      this.lastName = page.locator('#developer_contact_last_name');
      this.phoneNumber = page.getByRole('textbox', { name: 'Phone', exact: true });
      this.Email = page.locator('.email.form-control');
      this.saveButton = page.getByRole('button', { name: 'Save' });
      this.successCreateMsg = page.getByText("Developer is successfully created.");
      this.allDeveloperLink = page.getByRole('link',{name:'All Developers', exact: true});  
   }      
    async clickOnNewDeveloper() {
      await this.newDeveloperLink.click();
    }
    async enterDeveloperName(developerName:string){
      await this.developerNameDropdown.click();
      await this.developerNameInput.fill(developerName);  
      await this.page.getByText(developerName).click();
    }
    async enterSalutation(){
      await this.selectSalutation.click();
      await this.page.getByText('Mr.').click();
    }
    async enterFirstName(firstName:string){
      await this.firstName.fill(firstName);
    }
    async enterLastName(lastName:string){
       await this.lastName.fill(lastName);
    }
    async enterPhoneNumber(phNumber:string){
       await this.phoneNumber.click();
       await this.phoneNumber.fill(phNumber);
    }
    async enterEmail(email:string){
       await this.Email.click() ;
       await this.Email.fill(email);
    }
    async clickSave(){
       await this.saveButton.click();
    }
    async isDeveloperCreatedSuccessfully(): Promise<boolean> {
       return await this.successCreateMsg.isVisible();
    }
    async clickAllDeveloper(){
       await this.allDeveloperLink.click();
       await this.utils.waitTillFullPageLoad(this.page);
    }  
  }
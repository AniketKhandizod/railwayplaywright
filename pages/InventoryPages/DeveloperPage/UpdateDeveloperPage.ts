import { Page, Locator, expect } from "@playwright/test";


export class UpdateDeveloperPage{  
    private readonly page: Page;
    private readonly DevDescription : Locator;
    private readonly successUpdateMsg : Locator;
 
     constructor (page:Page){
       this.page = page;
       this.DevDescription = page.locator('.note-editing-area');
       this.successUpdateMsg = page.getByText("Developer is successfully updated.");
    }
     async enterDescription(){
        await this.DevDescription.waitFor({ state: 'visible', timeout: 10000 });
        await this.DevDescription.click();
        await this.DevDescription.pressSequentially('This is developer description box.');
       }
     async isDeveloperUpdatedSuccessfully(): Promise<boolean> {
        return await this.successUpdateMsg.isVisible();
     }
}
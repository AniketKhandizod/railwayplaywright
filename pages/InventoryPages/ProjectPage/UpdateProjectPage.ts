import { Page, Locator, expect } from "@playwright/test";

export class UpdateProjectPage {
    private readonly page: Page;
    private readonly projectDescription : Locator;
    private readonly successUpdateMsg : Locator;
 
      constructor (page:Page){
         this.page = page;
         this.projectDescription = page.locator('.note-editing-area');
         this.successUpdateMsg = page.getByText("Project is successfully updated.");
        }
        async enterDescription(){
        await this.projectDescription.waitFor({ state: 'visible', timeout: 10000 });
        await this.projectDescription.click();
        await this.projectDescription.pressSequentially('This is Project description box.');
       }
     async isProjectUpdatedSuccessfully(): Promise<boolean> {
        return await this.successUpdateMsg.isVisible();
     }  
 }
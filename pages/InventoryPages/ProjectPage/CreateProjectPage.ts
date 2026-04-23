import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CreateProjectPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly projectLink : Locator;
    private readonly newProjectLink : Locator;
    private readonly projectNameDropdown: Locator;
    private readonly projectNameInput : Locator;
    private readonly devNameDropdown : Locator;
    private readonly devNameInput : Locator;
    private readonly devNameChoose : Locator;
    private readonly clickSales : Locator;
    private readonly selectSales : Locator;
    private readonly clickPresales : Locator;
    private readonly selectPresales : Locator;
    private readonly clickSave : Locator;
    private readonly successCreateMsg : Locator;
    private readonly allProjectsLink : Locator;

     constructor (page:Page){
        this.page = page;
        this.utils = new Utils();
        this.projectLink = page.getByRole('link', { name: 'Projects' });
        this.newProjectLink = page.getByRole('link', { name:'New Project' });
        this.projectNameDropdown = page.locator('#s2id_project_name'); 
        this.projectNameInput = page.locator('#select2-drop').getByRole('textbox');  
        this.devNameDropdown = page.getByRole('link', { name: 'Developer' });   
        this.devNameInput = page.locator('#select2-drop').getByRole('textbox');
        this.devNameChoose = page.locator('.select2-results li:has-text("Demo Booking with Postsales")');
        this.clickSales =  page.locator('#s2id_project_project_sale_ids');
        this.selectSales = page.getByText('Sales User (Sales) (Default)');
        this.clickPresales = page.locator('#s2id_project_project_pre_sale_ids');
        this.selectPresales = page.getByText('Pre Sales User (Pre Sales) (Default)');
        this.clickSave = page.getByRole('button', { name: 'Save' });
        this.successCreateMsg = page.getByText("Project is successfully created");
        this.allProjectsLink = page.getByRole('link',{name:'All Projects', exact: true});
    }
    
     async clickOnProjects() {
        await this.projectLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }
     async clickOnNewProject(){
        await this.newProjectLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
     }
     async enterProjectName(pName:string){
        await this.projectNameDropdown.click();
        await this.projectNameInput.fill(pName); 
        await this.page.getByText(pName).click();
     }
     async enterDeveloperName(){
        await this.devNameDropdown.click();           
        await this.devNameInput.fill("Demo");
        await this.devNameChoose.waitFor({ state: 'visible' });
        await this.devNameChoose.click({force:true});
     } 
     async enterSales(){       
        await this.clickSales.click();
        await this.selectSales.waitFor({ state: 'visible' });
        await this.selectSales.click();
     }
     async enterPresales(){
        await this.clickPresales.click();
        await this.selectPresales.waitFor({ state: 'visible' });
        await this.selectPresales.click();
     }
     async clickOnSave(){
        await this.clickSave.click();
     }
     async isProjectCreatedSucessfully(): Promise<boolean> {
        return await this.successCreateMsg.isVisible();
    }
     async clickAllProjects(){
        await this.allProjectsLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
     }
 }


   


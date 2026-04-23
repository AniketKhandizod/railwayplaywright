import { Page, Locator } from "@playwright/test";

export enum Configuration {
    EnableCaptcha = 0,
    PhoneVerification = 1,
    Selfhosting = 2,
    CalendarSlotsForSiteisit = 3,
}

export class LeadCaptureFormPage {
  private readonly page: Page;
  private readonly NewLeadCaptureForm: Locator;
  private readonly Name: Locator;
  private readonly Greeting: Locator;
  private readonly ThankyouMsg: Locator;
  private readonly SubmitButtonText: Locator;
  private readonly Disclaimer: Locator;
  private readonly Save: Locator;
  private readonly NameText: Locator;
  private readonly EmailText: Locator;
  private readonly PhoneText: Locator;
  private readonly SaveAlignment: Locator;
  private readonly HowToIntegrate: Locator;
  private readonly Preview: Locator;
  private readonly leadName: Locator;
  private readonly leadEmail: Locator;
  private readonly leadPhone: Locator;
  private readonly submitButton: Locator;
  private readonly Disable: Locator;
  private readonly Enable: Locator;
  private readonly fields: Locator;
  private readonly SaveSuccessBar: Locator;
  private readonly AddNewField: Locator;
  private readonly Select: Locator;
  private readonly ProjectSelect: Locator;
  private readonly SaveField: Locator;
  private readonly AlignmentUpdated: Locator;
  private readonly ProjectSelectText: Locator;
  private readonly howToIntegrateUrl: Locator;
  private readonly CustomFormFieldProject: Locator;
  private readonly Mandatory: Locator;
  private readonly errorFields: Locator;
  private readonly greeting: Locator;
  private readonly thankyouMsg: Locator;
  private readonly submitButtonText: Locator;
  private readonly disclaimer: Locator;
  private readonly previewPageTitle: Locator;

  constructor(page: Page) {

    // Create new lead capture form
    this.NewLeadCaptureForm = page.getByRole('link', { name: 'New Lead Capture Template' });
    this.Name = page.getByRole('textbox', { name: 'Name *' });
    this.Greeting = page.getByRole('textbox', { name: 'Greeting' });
    this.ThankyouMsg = page.getByRole('textbox', { name: 'Thankyou msg' });
    this.SubmitButtonText = page.getByRole('textbox', { name: 'Submit button text' });
    this.Disclaimer = page.getByRole('textbox', { name: 'Disclaimer' });
    this.Save = page.getByRole('button', { name: 'Save' });

    // Form configuration
    this.Disable = page.getByText('Disable', { exact: true });
    this.Enable = page.getByText('Enable', { exact: true });

    // Save success bar
    this.SaveSuccessBar = page.locator("div[class='noty_message']");

    // Alignment of form fields
    this.fields = page.getByRole('link', { name: 'Fields' });
    this.NameText = page.getByText('Name Text | Required');
    this.EmailText = page.getByText('Email Email | Required');
    this.PhoneText = page.getByText('Phone Phone | Required');
    this.SaveAlignment = page.getByRole('button', { name: 'Save alignment' });

    // Add new field
    this.AddNewField = page.getByRole('link', { name: 'Add Another Field' });
    this.Select = page.getByRole('link', { name: 'Select' });
    this.ProjectSelect = page.getByText('Project - Intersted Project', { exact: true });
    this.SaveField = page.getByRole('button', { name: 'Save', exact: true });
    this.SaveAlignment = page.getByRole('button', { name: 'Save alignment' });
    this.AlignmentUpdated = page.getByText('Alignment for fields updated');
    this.ProjectSelectText = page.locator('#select2-drop').getByRole('textbox');


    // How to integrate
    this.HowToIntegrate = page.getByRole('link', { name: 'How to integrate' });
    this.howToIntegrateUrl = page.locator(".script_code.form-control");
    
    // Form details
    this.Preview = page.getByRole('link', { name: 'Preview' });
    this.leadName = page.getByRole('textbox', { name: 'Name' });
    this.leadEmail = page.getByRole('textbox', { name: 'Email' });
    this.leadPhone = page.getByRole('textbox', { name: 'Phone' });
    this.submitButton = page.locator("input[class='btn']");
    this.errorFields = page.getByText('This field is required');

    // prview page mislaneous
    this.previewPageTitle = page.locator("div[class='title']");
    this.greeting = page.locator("div[class='greeting']");
    this.thankyouMsg = page.locator("div[class='thankyou']");
    this.submitButtonText = page.locator("input[type='submit']");
    this.disclaimer = page.locator("div[class='disclaimer']");

    // Custom form field
    this.CustomFormFieldProject = page.locator("select[name='sell_do[form][lead][project_id]']");
    this.Mandatory = page.locator('#webform_field_form').getByText('Required', { exact: true });
   
  }

  async clickOnNewLeadCaptureForm() {
    await this.NewLeadCaptureForm.click();
  }

  async createNewLeadCaptureForm(formName: string, formGreeting: string, formThankyou: string, formSubmitButton: string, formDisclaimer: string) {
    await this.Name.fill(formName);
    await this.Greeting.fill(formGreeting);
    await this.ThankyouMsg.fill(formThankyou);
    await this.SubmitButtonText.fill(formSubmitButton);
    await this.Disclaimer.fill(formDisclaimer);
  }

  async configureCaptureForm(configuration: Configuration, IsEnabled: boolean, IsFinalSave?: boolean): Promise<string> {
    await this.Save.scrollIntoViewIfNeeded();
    if (IsEnabled) {
      if (!await this.Enable.nth(configuration).isChecked()) {
        await this.Enable.nth(configuration).click();
      }
    } else {
      if (!await this.Disable.nth(configuration).isChecked()) {
        await this.Disable.nth(configuration).click();
      }
    }
    if (IsFinalSave) {
      await this.Save.click();
      await this.SaveSuccessBar.waitFor({ state: 'visible' });
      return await this.SaveSuccessBar.textContent() || "";
    }
    return "";
  }

  async fieldsMapping() {
    await this.fields.click();
    await this.NameText.click();

  }

  async addNewField(markAsMandatory?: boolean): Promise<string> {
    await this.AddNewField.click();
    await this.Select.click();
    await this.ProjectSelectText.fill('pro');
    await this.ProjectSelect.nth(1).click();
    if (markAsMandatory) {
      await this.Mandatory.click();
    }
    await this.SaveField.click();
    await this.SaveAlignment.click();
    await this.AlignmentUpdated.click();
    await this.SaveSuccessBar.waitFor({ state: 'visible' });
    return await this.SaveSuccessBar.textContent() || "";
  }

  async howToIntegrate(page: Page): Promise<string[]> {
    await this.HowToIntegrate.click();
    await this.howToIntegrateUrl.waitFor({ state: 'visible' });
    const arr = [await this.howToIntegrateUrl.textContent() || "", page.url()];
    return arr;
  }

  async preview(leadName: string, leadEmail: string, leadPhone: string,submitForm?: boolean) {
    await this.Preview.click();
    await this.leadName.fill(leadName);
    await this.leadEmail.fill(leadEmail);
    await this.leadPhone.clear();
    await this.leadPhone.fill(leadPhone);
    if (submitForm) {
      await this.submitButton.click();
      await this.submitButton.waitFor({ state: 'hidden' });
    }
  }

  async previewWithSRDUpdate(leadName: string, leadEmail: string, leadPhone: string, page: Page, srd: string, submitForm?: boolean) {
    await this.Preview.click();
    await page.goto(page.url() + "?srd=" + srd);
    await this.leadName.waitFor({ state: 'visible' });
    await this.leadName.fill(leadName);
    await this.leadEmail.fill(leadEmail);
    await this.leadPhone.clear();
    await this.leadPhone.fill(leadPhone);
    if (submitForm) {
      await this.submitButton.click();
      await this.submitButton.waitFor({ state: 'hidden' });
    }
  }

  async getErrorFieldsCount(): Promise<number> {
    await this.submitButton.click();
    return await this.errorFields.count();
  }

  async selectProject(projectName: string) {
    await this.CustomFormFieldProject.selectOption({ label: projectName });
    await this.submitButton.click();
    await this.submitButton.waitFor({ state: 'hidden' });
  }

  async getPreviewPageTitle(): Promise<string> {
    return await this.previewPageTitle.textContent() || "";
  }

  async getGreetingText(): Promise<string> {
    return await this.greeting.textContent() || "";
  }

  async getThankyouMsgText(): Promise<string> {
    return await this.thankyouMsg.textContent() || "";
  }

  async getSubmitButtonText(): Promise<string> {
    return await this.submitButtonText.getAttribute('value') || "";
  }

  async getDisclaimerText(): Promise<string> {
    return await this.disclaimer.textContent() || "";
  }
}
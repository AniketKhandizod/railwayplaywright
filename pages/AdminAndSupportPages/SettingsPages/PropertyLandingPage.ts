import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class PropertyLandingPage {
    private readonly page: Page;
    private readonly utils: Utils;

    // Tab navigation
    private readonly tab1Basic: Locator;
    private readonly tab2HeaderImages: Locator;
    private readonly tab3OverviewAboutUs: Locator;
    private readonly tab4Testimonials: Locator;
    private readonly tab5SocialSEO: Locator;
    private readonly tab6AddressDomain: Locator;
    private readonly tab7LeadCaptureTools: Locator;

    // Tab 1 - Basic (Template Detail)
    private readonly templateRadio1: Locator;
    private readonly templateRadio2: Locator;
    private readonly templateRadio3: Locator;
    private readonly headerListField: Locator;
    private readonly headerTitleField: Locator;
    private readonly headerContentField: Locator;
    private readonly saveButton: Locator;
    private readonly nextButton: Locator;

    // Tab 2 - Header Images (handled via file upload)

    // Tab 3 - Overview & About Us
    private readonly overviewTitleField: Locator;
    private readonly overviewDescriptionField: Locator;
    private readonly aboutUsTitleField: Locator;
    private readonly aboutUsDescriptionField: Locator;

    // Tab 4 - Testimonials
    private readonly addTestimonialButton: Locator;
    private readonly testimonialNameField: Locator;
    private readonly testimonialCompanyField: Locator;
    private readonly testimonialReviewField: Locator;

    // Tab 5 - Social & SEO
    private readonly facebookUrlField: Locator;
    private readonly twitterUrlField: Locator;
    private readonly linkedinUrlField: Locator;
    private readonly instagramUrlField: Locator;
    private readonly seoTitleField: Locator;
    private readonly seoDescriptionField: Locator;

    // Tab 6 - Address & Domain
    private readonly addressField: Locator;
    private readonly cityField: Locator;
    private readonly stateField: Locator;
    private readonly pincodeField: Locator;
    private readonly latitudeField: Locator;
    private readonly longitudeField: Locator;
    private readonly domainField: Locator;

    // Tab 7 - Lead Capture Tools
    private readonly webformSelect: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();

        // Tab navigation - using the tab structure from the view
        this.tab1Basic = page.locator("#tab_head1, a[data-url='#tab1']");
        this.tab2HeaderImages = page.locator("#tab_head2, a[data-url='#tab2']");
        this.tab3OverviewAboutUs = page.locator("#tab_head3, a[data-url='#tab3']");
        this.tab4Testimonials = page.locator("#tab_head4, a[data-url='#tab4']");
        this.tab5SocialSEO = page.locator("#tab_head5, a[data-url='#tab5']");
        this.tab6AddressDomain = page.locator("#tab_head6, a[data-url='#tab6']");
        this.tab7LeadCaptureTools = page.locator("#tab_head7, a[data-url='#tab7']");

        // Tab 1 - Basic fields
        this.templateRadio1 = page.locator("input[name='property_landing[broker_template_name]'][value='template_1']");
        this.templateRadio2 = page.locator("input[name='property_landing[broker_template_name]'][value='template_2']");
        this.templateRadio3 = page.locator("input[name='property_landing[broker_template_name]'][value='template_3']");
        this.headerListField = page.locator("input[name='property_landing[header_list]'], select[name='property_landing[header_list]']");
        this.headerTitleField = page.locator("input[name='property_landing[header_title]']");
        this.headerContentField = page.locator("textarea[name='property_landing[header_content]']");
        this.saveButton = page.locator("button:has-text('Save'), input[type='submit'][value*='Save']");
        // Next button is in the property landing footer wizard
        this.nextButton = page.locator("#property_landing_footer .pager.wizard .next a:has-text('Next')");

        // Tab 3 - Overview & About Us
        this.overviewTitleField = page.locator("input[name*='overview_title'], input[name*='overview'][name*='title']");
        this.overviewDescriptionField = page.locator("textarea[name*='overview_description'], textarea[name*='overview'][name*='description']");
        this.aboutUsTitleField = page.locator("input[name*='about_title'], input[name*='about'][name*='title']");
        this.aboutUsDescriptionField = page.locator("textarea[name*='about_description'], textarea[name*='about'][name*='description']");

        // Tab 4 - Testimonials
        this.addTestimonialButton = page.locator("button:has-text('Add Testimonial'), a:has-text('Add Testimonial')");
        this.testimonialNameField = page.locator("input[name*='testimonial'][name*='name'], input[name*='name']").last();
        this.testimonialCompanyField = page.locator("input[name*='testimonial'][name*='company'], input[name*='company_name']").last();
        this.testimonialReviewField = page.locator("textarea[name*='testimonial'][name*='review'], textarea[name*='review']").last();

        // Tab 5 - Social & SEO
        this.facebookUrlField = page.locator("input[name*='facebook'], input[name*='facebook_url']");
        this.twitterUrlField = page.locator("input[name*='twitter'], input[name*='twitter_url']");
        this.linkedinUrlField = page.locator("input[name*='linkedin'], input[name*='linkedin_url']");
        this.instagramUrlField = page.locator("input[name*='instagram'], input[name*='instagram_url']");
        this.seoTitleField = page.locator("input[name*='seo_title'], input[name*='meta_title']");
        this.seoDescriptionField = page.locator("textarea[name*='seo_description'], textarea[name*='meta_description']");

        // Tab 6 - Address & Domain
        this.addressField = page.locator("input[name*='address'], textarea[name*='address']");
        this.cityField = page.locator("input[name*='city']");
        this.stateField = page.locator("input[name*='state']");
        this.pincodeField = page.locator("input[name*='pincode'], input[name*='pin_code']");
        this.latitudeField = page.locator("input[name*='latitude'], input[name*='lat']");
        this.longitudeField = page.locator("input[name*='longitude'], input[name*='lng']");
        this.domainField = page.locator("input[name*='domain'], input[name*='custom_domain']");

        // Tab 7 - Lead Capture Tools
        this.webformSelect = page.locator("select[name*='webform'], select[name*='webform_id']");
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
        await this.utils.waitTillFullPageLoad(this.page);
    }

    // Tab Navigation Methods
    async clickTab1Basic() {
        await this.tab1Basic.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab1Basic.click();
        await this.waitForPageLoad();
    }

    async clickTab2HeaderImages() {
        await this.tab2HeaderImages.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab2HeaderImages.click();
        await this.waitForPageLoad();
    }

    async clickTab3OverviewAboutUs() {
        await this.tab3OverviewAboutUs.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab3OverviewAboutUs.click();
        await this.waitForPageLoad();
    }

    async clickTab4Testimonials() {
        await this.tab4Testimonials.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab4Testimonials.click();
        await this.waitForPageLoad();
    }

    async clickTab5SocialSEO() {
        await this.tab5SocialSEO.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab5SocialSEO.click();
        await this.waitForPageLoad();
    }

    async clickTab6AddressDomain() {
        await this.tab6AddressDomain.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab6AddressDomain.click();
        await this.waitForPageLoad();
    }

    async clickTab7LeadCaptureTools() {
        await this.tab7LeadCaptureTools.waitFor({ state: 'visible', timeout: 10000 });
        await this.tab7LeadCaptureTools.click();
        await this.waitForPageLoad();
    }

    // Tab 1 - Basic Methods
    async selectTemplate(templateNumber: 1 | 2 | 3 = 1) {
        let templateRadio: Locator;
        switch (templateNumber) {
            case 1:
                templateRadio = this.templateRadio1;
                break;
            case 2:
                templateRadio = this.templateRadio2;
                break;
            case 3:
                templateRadio = this.templateRadio3;
                break;
        }
        if (await templateRadio.isVisible({ timeout: 5000 })) {
            await templateRadio.check();
        }
    }

    async updateHeaderList(headerList: string) {
        // header_list is a select2 multi-select field
        if (await this.headerListField.isVisible({ timeout: 5000 })) {
            // Click to open select2 dropdown
            await this.headerListField.click();
            await this.page.waitForTimeout(500);
            // For select2, we need to find the input and type
            const select2Input = this.page.locator(".select2-drop-active input, .select2-search input");
            if (await select2Input.isVisible({ timeout: 2000 })) {
                await select2Input.fill(headerList);
                await this.page.waitForTimeout(500);
                // Select the first option
                const option = this.page.locator(".select2-results li").first();
                if (await option.isVisible({ timeout: 2000 })) {
                    await option.click();
                }
            } else {
                // Fallback: try direct fill if it's a regular input
                await this.headerListField.fill(headerList);
            }
        }
    }

    async updateHeaderTitle(headerTitle: string) {
        if (await this.headerTitleField.isVisible({ timeout: 5000 })) {
            await this.headerTitleField.fill(headerTitle);
        }
    }

    async updateHeaderContent(headerContent: string) {
        if (await this.headerContentField.isVisible({ timeout: 5000 })) {
            await this.headerContentField.fill(headerContent);
        }
    }

    async clickNextButton() {
        // Use first() to handle multiple matches, targeting the property landing wizard Next button
        const nextBtn = this.page.locator("#property_landing_footer .pager.wizard .next a:has-text('Next')").first();
        if (await nextBtn.isVisible({ timeout: 5000 })) {
            await nextBtn.click();
            await this.waitForPageLoad();
        }
    }

    // Tab 3 - Overview & About Us Methods
    async updateOverviewTitle(title: string) {
        if (await this.overviewTitleField.isVisible({ timeout: 5000 })) {
            await this.overviewTitleField.fill(title);
        }
    }

    async updateOverviewDescription(description: string) {
        if (await this.overviewDescriptionField.isVisible({ timeout: 5000 })) {
            await this.overviewDescriptionField.fill(description);
        }
    }

    async updateAboutUsTitle(title: string) {
        if (await this.aboutUsTitleField.isVisible({ timeout: 5000 })) {
            await this.aboutUsTitleField.fill(title);
        }
    }

    async updateAboutUsDescription(description: string) {
        if (await this.aboutUsDescriptionField.isVisible({ timeout: 5000 })) {
            await this.aboutUsDescriptionField.fill(description);
        }
    }

    // Tab 4 - Testimonials Methods
    async addTestimonial(name: string, company: string, review: string) {
        if (await this.addTestimonialButton.isVisible({ timeout: 5000 })) {
            await this.addTestimonialButton.click();
            await this.page.waitForTimeout(1000);
        }
        if (await this.testimonialNameField.isVisible({ timeout: 5000 })) {
            await this.testimonialNameField.fill(name);
        }
        if (await this.testimonialCompanyField.isVisible({ timeout: 5000 })) {
            await this.testimonialCompanyField.fill(company);
        }
        if (await this.testimonialReviewField.isVisible({ timeout: 5000 })) {
            await this.testimonialReviewField.fill(review);
        }
    }

    // Tab 5 - Social & SEO Methods
    async updateFacebookUrl(url: string) {
        if (await this.facebookUrlField.isVisible({ timeout: 5000 })) {
            await this.facebookUrlField.fill(url);
        }
    }

    async updateTwitterUrl(url: string) {
        if (await this.twitterUrlField.isVisible({ timeout: 5000 })) {
            await this.twitterUrlField.fill(url);
        }
    }

    async updateLinkedInUrl(url: string) {
        if (await this.linkedinUrlField.isVisible({ timeout: 5000 })) {
            await this.linkedinUrlField.fill(url);
        }
    }

    async updateInstagramUrl(url: string) {
        if (await this.instagramUrlField.isVisible({ timeout: 5000 })) {
            await this.instagramUrlField.fill(url);
        }
    }

    async updateSEOTitle(title: string) {
        if (await this.seoTitleField.isVisible({ timeout: 5000 })) {
            await this.seoTitleField.fill(title);
        }
    }

    async updateSEODescription(description: string) {
        if (await this.seoDescriptionField.isVisible({ timeout: 5000 })) {
            await this.seoDescriptionField.fill(description);
        }
    }

    // Tab 6 - Address & Domain Methods
    async updateAddress(address: string) {
        if (await this.addressField.isVisible({ timeout: 5000 })) {
            await this.addressField.fill(address);
        }
    }

    async updateCity(city: string) {
        if (await this.cityField.isVisible({ timeout: 5000 })) {
            await this.cityField.fill(city);
        }
    }

    async updateState(state: string) {
        if (await this.stateField.isVisible({ timeout: 5000 })) {
            await this.stateField.fill(state);
        }
    }

    async updatePincode(pincode: string) {
        if (await this.pincodeField.isVisible({ timeout: 5000 })) {
            await this.pincodeField.fill(pincode);
        }
    }

    async updateLatitude(latitude: string) {
        if (await this.latitudeField.isVisible({ timeout: 5000 })) {
            await this.latitudeField.fill(latitude);
        }
    }

    async updateLongitude(longitude: string) {
        if (await this.longitudeField.isVisible({ timeout: 5000 })) {
            await this.longitudeField.fill(longitude);
        }
    }

    async updateDomain(domain: string) {
        if (await this.domainField.isVisible({ timeout: 5000 })) {
            await this.domainField.fill(domain);
        }
    }

    // Tab 7 - Lead Capture Tools Methods
    async selectWebform(webformName: string) {
        if (await this.webformSelect.isVisible({ timeout: 5000 })) {
            await this.webformSelect.selectOption({ label: webformName });
        }
    }

    // Navigate through all tabs
    async navigateThroughAllTabs() {
        await this.clickTab1Basic();
        await this.page.waitForTimeout(1000);
        
        await this.clickTab2HeaderImages();
        await this.page.waitForTimeout(1000);
        
        await this.clickTab3OverviewAboutUs();
        await this.page.waitForTimeout(1000);
        
        await this.clickTab4Testimonials();
        await this.page.waitForTimeout(1000);
        
        await this.clickTab5SocialSEO();
        await this.page.waitForTimeout(1000);
        
        await this.clickTab6AddressDomain();
        await this.page.waitForTimeout(1000);
        
        await this.clickTab7LeadCaptureTools();
        await this.page.waitForTimeout(1000);
    }
}

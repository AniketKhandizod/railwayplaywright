import { Page, Locator } from "@playwright/test";

export class addNoteForm {

    private readonly page: Page;
    private readonly note: Locator;
    private readonly noteTextArea: Locator;
    private readonly projectDropdown: Locator;
    private readonly saveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.note = page.locator("#add_note_navigation_lead_profile");
        this.noteTextArea = page.locator("#add_note_textarea_lead_profile");
        this.projectDropdown = page.locator(".select2-container.form-control.note_project_id");
        this.saveButton = page.locator("#save_button_lead_profile");
    }

    async clickOnAddNote() {
        await this.note.click();
    }

    async addNote(note: string) {
        await this.noteTextArea.fill(note);
    }

    async isProjectDropdownVisible() {
        await this.noteTextArea.waitFor({ state: "visible" });
        return await this.projectDropdown.isVisible();
    }

    async saveNote() {
        await this.saveButton.click();
    }
}
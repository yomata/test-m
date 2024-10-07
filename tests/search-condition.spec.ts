import { test, expect } from '@playwright/test';

// Module level variables and unitlity functions

/**
 * Debug flag to control debug output.
 * Set to true if the DEBUG environment variable is set, otherwise false.
 * @type {boolean}
 */
const DEBUG = process.env.DEBUG || false;

/**
 * Debug function to log messages when DEBUG is true.
 * @param {string} msg - The message to be logged.
 */
const debug = (msg: string) => {
    if (DEBUG) {
        console.debug(`[DEBUG] ${msg}`);
    }
}

/**
 * Logs a step in the test process.
 * 
 * @param {string} step - The description of the step being executed.
 */
const step = (step: string) => {
    console.debug(`[STEP] ${step}`);
}

/**
 * Extracts the displayed text of the currently selected option from a select element.
 * 
 * @param {Element} selectedOption - The select element from which to extract the selected option's text.
 * @returns {Promise<string>} A promise that resolves to the text content of the selected option.
 */
async function extractSelectedDisplayedValue(selectedOption) {
    if (DEBUG) {
        console.debug(`[DEBUG] extractSelectedDisplayedValue: ${selectedOption}`);
    }
    return selectedOption.evaluate(sel => sel.options[sel.options.selectedIndex].textContent);
}

/**
 * Extracts the tag name of a given locator.
 * 
 * @param {Locator} locator - The locator object from which to extract the tag name.
 * @returns {Promise<string>} A promise that resolves to the tag name of the locator.
 */
async function getTagName(locator) {  
    const tagName = await locator.evaluate(e => e.tagName);
    return tagName;
}


// Actual test step implementations

test.beforeEach(async ({ page, baseURL }) => {
    debug('**beforeEach');

    // Enable console logging for debugging purposes
    // This will log all console messages from the page to the test output
    page.on('console', (msg) => {
        if (msg.type() === 'debug')
            console.debug(`[DEBUG] ${msg.text()}`);        
      });
    
    step(`1. Go to Mercari top page: ${baseURL}`);
    await page.goto('/');
});


/**
 * Actual test execution code for search condition(Scenario 1)
 * Designed to be a parametrized test, so that this function can be called from other test cases.
 * 
 * @param {string} firstCategory - The first (top-level) category to select.
 * @param {string} secondCategory - The second (sub) category to select.
 * @param {string} thirdCategory - The third (sub-sub) category to select.
 */

const searchCondition = ({ firstCategory, secondCategory, thirdCategory}) => {
    test(`Search condition: ${firstCategory} / ${secondCategory} / ${thirdCategory}`, async ({ page }) => {
        debug('**Start testing "Search condition"');
        step('2. Click on the search box');
        await page.getByPlaceholder('なにをお探しですか？').click();
      
        step('3. Click on the "カテゴリーから探す" link');
        await page.getByRole('link', { name: 'カテゴリーからさがす' }).click();

        step(`4. Select ${firstCategory} as the tier 1 category by clicking on the target link`); 
        await page.locator(`//a[text()="${firstCategory}"]`).click();

        step(`5. Select ${secondCategory} as the tier 2 category by clicking on the target link`);
        await page.getByTestId('merListItem-container').getByRole('link', { name: `${secondCategory}` }).click();

        step(`6. Select ${thirdCategory} as the tier 3 category by clicking on the target link`);
        await page.getByRole('link', { name: `${thirdCategory}` }).click();

        step('7. Verify the selected category values');
        const category1 = await page.locator('li[data-testid="category_id"] select').first();
        debug('category1: ', category1);
        debug('tagName: ', await getTagName(category1));
        
        const firstCategorySelectHandle = await page.$('li[data-testid="category_id"] select');
        await expect(firstCategorySelectHandle, "第1カテゴリー選択要素が見つかりませんでした").not.toBeNull();
        if (firstCategorySelectHandle) {
          const category1Value = await firstCategorySelectHandle.evaluate((node: HTMLSelectElement) => node.options[node.options.selectedIndex].textContent);
          debug('category1Value: ', category1Value);
          await expect(category1Value).toBe(firstCategory);
        }
        
        /* Fix: this code does not work for now.
         * this code could not get the target element handle, somehow.
        const secondCategorySelectHandle = await page.$('li[data-testid="category_id"] select:nth-of-type(2)');
        await expect(secondCategorySelectHandle, "第2カテゴリー選択要素が見つかりませんでした").not.toBeNull();
        if (secondCategorySelectHandle) {
          const category2Value = await secondCategorySelectHandle.evaluate((node: HTMLSelectElement) => node.options[node.options.selectedIndex].textContent);
          console.debug('category2Value: ', category2Value);
          await expect(category2Value).toBe(secondCategory);
        } 
        */       
    });

}


// Test Scenario 1
test.describe('Scenario 1: Search condition', () => {
    [
        {firstCategory: '本・雑誌・漫画', secondCategory: '本', thirdCategory: 'コンピュータ・IT'},
    ].forEach(({firstCategory, secondCategory, thirdCategory}) => {
        searchCondition({ firstCategory, secondCategory, thirdCategory});
    });
});


// Test scenario 2
test.describe('Scenario1-2: Run search condition twice', () => {

    // Configure the test suite to run in serial mode
    test.describe.configure({ mode: 'serial' });

    // Declare a variable to hold the Page object
    let page: Page;

    // Before all tests, create a new page
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
    });

    step('Pre-condition: Run search condition twice');
    [
        {firstCategory: '本・雑誌・漫画', secondCategory: '本', thirdCategory: 'コンピュータ・IT'},
        {firstCategory: 'チケット', secondCategory: '音楽', thirdCategory: '女性アイドル'},
    ].forEach(({firstCategory, secondCategory, thirdCategory}) => {
        searchCondition({ firstCategory, secondCategory, thirdCategory});
    });

    test.step('Check search history', async () => {
        debug('**Start testing "Search history"');
        step('2. Click on the search box');
        await page.getByPlaceholder('なにをお探しですか？').click();

        step('3. Verify the search history');
        const countMerListItems = await page.evaluate(() => {
            const searchHistorySection = document.querySelector('section[data-testid="search-history"]');
            if (!searchHistorySection) return 0;
            const merListItems = searchHistorySection.querySelectorAll('div.merListItem');
            return merListItems.length;
        });
        await expect(countMerListItems).toBeGreaterThan(0);

        // const searchHistory = await page.getByTestId('search-history');
        // await expect(searchHistory, "検索履歴が見つかりませんでした").not.toBeNull();
        // if (searchHistory) {
        //   const searchHistoryItems = await searchHistory.locator('.merListItem');
        //   await expect(searchHistoryItems.count(), "検索履歴のアイテム数が0です").toBeGreaterThan(0);
        // }
    });

});

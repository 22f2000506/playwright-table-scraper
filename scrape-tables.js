const { chromium } = require('playwright');

async function scrapeTableSums() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    const seeds = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43];
    let grandTotal = 0;
    
    console.log('Starting table scraping for seeds:', seeds.join(', '));
    
    for (const seed of seeds) {
        try {
            const url = `https://practicum-content.s3.us-west-2.amazonaws.com/new-diploma/block-3-foundations-of-data-science/sprint-4/tables/table_${seed}.html`;
            console.log(`\nScraping seed ${seed}: ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Wait for tables to load
            await page.waitForTimeout(2000);
            
            // Find all tables on the page
            const tables = await page.locator('table');
            const tableCount = await tables.count();
            console.log(`Found ${tableCount} table(s) on seed ${seed}`);
            
            let seedTotal = 0;
            
            // Process each table
            for (let i = 0; i < tableCount; i++) {
                const table = tables.nth(i);
                
                // Get all cells that contain numbers (td and th elements)
                const cells = await table.locator('td, th').all();
                
                for (const cell of cells) {
                    const text = await cell.textContent();
                    const cleanText = text?.trim() || '';
                    
                    // Check if the text is a number (including decimals and negative numbers)
                    const numberMatch = cleanText.match(/^-?\d+\.?\d*$/);
                    if (numberMatch) {
                        const number = parseFloat(cleanText);
                        if (!isNaN(number)) {
                            seedTotal += number;
                            console.log(`  Found number: ${number}`);
                        }
                    }
                }
            }
            
            console.log(`Seed ${seed} total: ${seedTotal}`);
            grandTotal += seedTotal;
            
        } catch (error) {
            console.error(`Error scraping seed ${seed}:`, error.message);
        }
    }
    
    await browser.close();
    
    console.log('\n' + '='.repeat(50));
    console.log('FINAL RESULTS:');
    console.log('='.repeat(50));
    console.log(`Grand Total of all numbers in all tables: ${grandTotal}`);
    console.log('='.repeat(50));
    
    return grandTotal;
}

// Run the scraping function
scrapeTableSums()
    .then(total => {
        console.log(`\n✅ Scraping completed successfully!`);
        console.log(`📊 Total sum: ${total}`);
    })
    .catch(error => {
        console.error('❌ Scraping failed:', error);
        process.exit(1);
    });

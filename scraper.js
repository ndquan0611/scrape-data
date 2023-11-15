const createPage = async (browser, url) => {
    const page = await browser.newPage();
    console.log('>> Mở tab mới ...');
    await page.goto(url);
    console.log('>> Truy cập vào ' + url);
    return page;
};

const closePage = async (page) => {
    await page.close();
    console.log('>> Tab đã đóng.');
};

module.exports = {
    scrapeCategory: function (browser, url) {
        return new Promise(async (resolve, reject) => {
            try {
                const page = await createPage(browser, url);

                await page.waitForSelector('#shopify-section-all-collections');
                console.log('>> Website đã load xong...');

                const dataCategory = await page.$$eval(
                    '#shopify-section-all-collections > div.all-collections > div.sdcollections-content > ul.sdcollections-list > li',
                    (els) =>
                        els.map((el) => ({
                            category: el.querySelector('div.collection-name').innerText,
                            link: el.querySelector('a').href,
                        })),
                );

                await closePage(page);
                console.log('>> Tab đã đóng.');
                resolve(dataCategory);
            } catch (error) {
                console.log('Lỗi ở scrape category: ' + error);
                reject(error);
            }
        });
    },
    scrapeItems: async function (browser, url) {
        return new Promise(async (resolve, reject) => {
            try {
                const page = await createPage(browser, url);

                await page.waitForSelector('#collection_content');
                console.log('>> Website đã laod xong...');

                const items = await page.$$eval('#collection-product-grid > div.grid-element', (els) => {
                    items = els.map((el) => el.querySelector('a.grid-view-item__link').href);
                    return items;
                });

                await closePage(page);
                console.log('>> Tab đã đóng.');
                resolve(items);
            } catch (error) {
                console.log('lỗi ở scrape items: ' + error);
                reject(error);
            }
        });
    },
    scraper: async function (browser, url) {
        return new Promise(async (resolve, reject) => {
            try {
                const newPage = await createPage(browser, url);

                await newPage.waitForSelector('#PageContainer');
                console.log('>> Đã load xong tag main ...');

                const scrapeData = {
                    name: await newPage.$eval('header.section-header h3', (el) => el?.innerText),
                    thumb: await newPage.$eval('#ProductPhoto #ProductPhotoImg', (el) => el?.src),
                    images: await newPage.$$eval(
                        '#ProductThumbs div.owl-wrapper-outer div.owl-wrapper div.owl-item a.product-single__thumbnail',
                        (els) => els.map((el) => el.href),
                    ),
                    price: await newPage.$eval('#ProductPrice span.money', (el) => el?.innerText),

                    description: await newPage.$$eval('div.product-single__description > ul > li', (els) =>
                        els.map((el) => el?.innerText),
                    ),

                    variants: await newPage.$$eval('form.product-single__form > div.product-form__item', (els) =>
                        els.map((el) => {
                            const variants = el.querySelectorAll('fieldset.single-option-radio > label');
                            const values = [];
                            for (let variant of variants) values.push(variant?.innerText);
                            return {
                                label: el.querySelector('label.single-option-radio__label')?.innerText,
                                variants: values,
                            };
                        }),
                    ),
                };

                const infomationTitles = await newPage.$$eval('#tabs-information > ul > li', (els) =>
                    els.map((el) => el.querySelector('a')?.innerText),
                );

                const desc = await newPage.$eval('#desc', (el) => el?.innerText);
                const size = await newPage.$eval('#size', (el) => el?.innerText);
                const delivery = await newPage.$eval('#delivery', (el) => el?.textContent);
                const payment = await newPage.$eval('#payment', (el) => el?.innerText);

                scrapeData.infomations = {
                    [infomationTitles[0]]: desc,
                    [infomationTitles[1]]: size,
                    [infomationTitles[2]]: delivery,
                    [infomationTitles[3]]: payment,
                };

                await closePage(newPage);
                console.log('>> Trình duyệt đã đóng.');
                resolve(scrapeData);
            } catch (error) {
                console.log('Lỗi ở scraper: ' + error);
                reject(error);
            }
        });
    },
};

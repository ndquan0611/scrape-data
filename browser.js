const puppeteer = require('puppeteer');

module.exports = {
    startBrowser: async function () {
        let browser;
        try {
            browser = await puppeteer.launch({
                // Có hiện UI của chrome hay không, false là có
                headless: false,
                // Chrome sử dụng multiple layers của sanbox để tránh những nội dung web không đáng tin cậy
                args: ['--disable-setuid-sandbox'],
                // Truy cập website bỏ qua lỗi liên quan tới http secure
                ignoreHTTPSErrors: true,
            });
        } catch (error) {
            console.log('Không tạo được browser: ' + error);
        }
        return browser;
    },
};

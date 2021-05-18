const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');

const url = 'https://www.olx.ua/list/q-iphone/';

(async () => {
	const dom = await JSDOM.fromURL(url, {
		resources: 'usable'
	});
	const browser = await puppeteer.launch();
	const links = dom.window.document.querySelectorAll('.title-cell .detailsLink');
	for (link of links) await getPhone(link.getAttribute('href'), browser);

	await browser.close();

	return 1;
})();

const getPhone = async (url, browser) => {
	const page = await browser.newPage();
	await page.goto(url);
	try {
		const btnSelector = '#root > div.css-50cyfj > div.css-eovh6h > div:nth-child(2) > div.css-15ctlif > div.css-1p8n2mw > div > div > div > button'
		await page.waitForSelector(btnSelector)
		await page.click(btnSelector);
	} catch (e) {
		console.log(e)
		return 'No phone';
	}
	await page.waitForResponse((req) => {
		if (/^https:\/\/www.olx.ua\/api\/v1\/offers\/\d{1,}\/phones\/$/.test(req.url())) {
			return true;
		}
	});
	const phone = await page.evaluate(async () => {
		try {
			const phoneSelector = '#root > div.css-50cyfj > div.css-eovh6h > div:nth-child(2) > div.css-15ctlif > div.css-1p8n2mw > div > div > div > ul > li'
			const phones =[]
			document.querySelectorAll(phoneSelector).forEach(el=>phones.push(el.innerHTML))
			console.log(phones)
			return phones.join('; ');
		} catch(e) {
			console.log(e.message)
			return 'err'
		}
		
	});
	await page.close();
	return 1;
};

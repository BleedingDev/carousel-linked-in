import { test } from "@playwright/test";
import { down, texts } from "../i18n/texts";

test("test", async ({ page }) => {
  const email = process.env.email;
  const pass = process.env.pass;
  const url = process.env.url;
  const altOfFile = process.env.altOfFile;
  const postText = process.env.postText;
  const lang = process.env.lang as keyof typeof texts;

  await page.goto("https://www.linkedin.com/login");

  await page.locator(":focus").fill(email);
  await page.locator(":focus").press("Tab");
  await page.locator(":focus").fill(pass);
  await page.locator(":focus").press("Enter");

  await page.getByRole("button", { name: texts[lang].start }).click();

  await page.getByRole("button", { name: texts[lang].addDoc }).click();

  // Create download element
  const el = await page.$(".document-cloud-upload");
  const data = { el, url, down };
  // Create download link in page, so that Playwright can handle it easily
  await page.evaluate((data) => {
    const anchor = document.createElement("a");
    anchor.href = data.url;
    anchor.download = "temp.pdf";
    anchor.innerHTML = data.down;
    data.el.appendChild(anchor);
  }, data);
  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent("download");
  await page.getByText(down).click({ modifiers: ["Alt"] });
  // Wait for the download process to complete
  const download = await downloadPromise;
  const path = await download.path();
  const pdfPath = `${path}.pdf`;
  // Save in temporary files, so that it is deleted after automation ends
  await download.saveAs(pdfPath);

  await page.getByLabel(texts[lang].choose).setInputFiles(pdfPath);
  await page.getByPlaceholder(texts[lang].description).fill(altOfFile);
  await page.getByRole("button", { name: texts[lang].done }).click();

  await page.getByRole("textbox").fill(postText);
  await page.waitForSelector(".share-creation-state iframe");
  await page.getByRole("button", { name: texts[lang].post }).click();
});

// Use the same responsive entry point as a student, keeping controller tests intact.
export async function toggleReadingSettings(page) {
  if (await page.locator('.bb-settings-toggle').isVisible()) {
    await page.locator('.bb-settings-toggle').click();
  } else {
    await page.locator('#menu-toggle').click();
    await page.locator('#mobile-menu').getByRole('button', {name:'Setări de lectură',exact:true}).click();
  }
}

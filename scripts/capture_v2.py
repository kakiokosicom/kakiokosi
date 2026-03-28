from playwright.sync_api import sync_playwright
import os

OUTPUT = "/Users/hajimeataka/kakiokosi/screenshots-v2"

PAGES = [
    ("homepage", "https://kakiokosi.com/"),
    ("article", "https://kakiokosi.com/share/society/936"),
]

VIEWPORTS = [
    ("desktop", 1920, 1080),
    ("mobile", 375, 812),
]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        for page_name, url in PAGES:
            for vp_name, w, h in VIEWPORTS:
                ctx = browser.new_context(
                    viewport={"width": w, "height": h},
                    device_scale_factor=2 if vp_name == "mobile" else 1,
                )
                page = ctx.new_page()
                print(f"Capturing {page_name} @ {vp_name} ({w}x{h})...")
                page.goto(url, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(1000)

                # Above-the-fold screenshot
                page.screenshot(
                    path=os.path.join(OUTPUT, f"{page_name}-{vp_name}-atf.png"),
                    full_page=False,
                )

                # Full page screenshot
                page.screenshot(
                    path=os.path.join(OUTPUT, f"{page_name}-{vp_name}-full.png"),
                    full_page=True,
                )

                # Mobile hamburger menu test
                if vp_name == "mobile" and page_name == "homepage":
                    # Try to find and click hamburger menu button
                    hamburger = page.query_selector('button[aria-label*="menu" i], button[aria-label*="Menu" i], button[aria-label*="ナビ" i], .hamburger, [data-menu-toggle], header button, nav button')
                    if hamburger:
                        print("  Found hamburger button, clicking...")
                        hamburger.click()
                        page.wait_for_timeout(500)
                        page.screenshot(
                            path=os.path.join(OUTPUT, f"{page_name}-mobile-menu-open.png"),
                            full_page=False,
                        )
                    else:
                        # Try all buttons in header area
                        buttons = page.query_selector_all("header button, nav button")
                        print(f"  No hamburger found by selector. Found {len(buttons)} header/nav buttons.")
                        for i, btn in enumerate(buttons):
                            label = btn.get_attribute("aria-label") or btn.inner_text()
                            print(f"    Button {i}: {label}")
                            if i == 0:
                                btn.click()
                                page.wait_for_timeout(500)
                                page.screenshot(
                                    path=os.path.join(OUTPUT, f"{page_name}-mobile-menu-open.png"),
                                    full_page=False,
                                )

                ctx.close()

        browser.close()
        print("Done!")

if __name__ == "__main__":
    main()

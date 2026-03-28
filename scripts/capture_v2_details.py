from playwright.sync_api import sync_playwright
import os

OUTPUT = "/Users/hajimeataka/kakiokosi/screenshots-v2"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Desktop article - scroll to related articles and footer
        ctx = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = ctx.new_page()
        page.goto("https://kakiokosi.com/share/society/936", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)

        # Scroll to bottom to find related articles and footer
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUTPUT, "article-desktop-bottom.png"), full_page=False)

        # Check for related articles section
        related = page.query_selector('[class*="related"], [class*="Related"], h2:has-text("関連"), h3:has-text("関連")')
        if related:
            related.scroll_into_view_if_needed()
            page.wait_for_timeout(300)
            page.screenshot(path=os.path.join(OUTPUT, "article-desktop-related.png"), full_page=False)
            print("Related articles section found!")
        else:
            print("No related articles section found by selector.")

        ctx.close()

        # Mobile article - bottom
        ctx = browser.new_context(viewport={"width": 375, "height": 812}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto("https://kakiokosi.com/share/society/936", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUTPUT, "article-mobile-bottom.png"), full_page=False)
        ctx.close()

        # Homepage footer - desktop
        ctx = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = ctx.new_page()
        page.goto("https://kakiokosi.com/", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUTPUT, "homepage-desktop-footer.png"), full_page=False)
        ctx.close()

        # Homepage footer - mobile
        ctx = browser.new_context(viewport={"width": 375, "height": 812}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto("https://kakiokosi.com/", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUTPUT, "homepage-mobile-footer.png"), full_page=False)
        ctx.close()

        # Touch target analysis - measure interactive elements on mobile
        ctx = browser.new_context(viewport={"width": 375, "height": 812}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto("https://kakiokosi.com/", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)

        # Measure touch targets
        results = page.evaluate("""() => {
            const elements = document.querySelectorAll('a, button, input, [role="button"]');
            const issues = [];
            for (const el of elements) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    if (rect.width < 44 || rect.height < 44) {
                        issues.push({
                            tag: el.tagName,
                            text: el.textContent?.trim().substring(0, 50),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            href: el.getAttribute('href') || '',
                        });
                    }
                }
            }
            return { total: elements.length, issues: issues.slice(0, 30) };
        }""")
        print(f"Touch target check: {results['total']} interactive elements, {len(results['issues'])} with size < 44px")
        for issue in results['issues']:
            print(f"  {issue['tag']} [{issue['width']}x{issue['height']}] \"{issue['text'][:40]}\" href={issue['href'][:40]}")

        # Check horizontal scroll
        h_scroll = page.evaluate("""() => {
            return {
                bodyWidth: document.body.scrollWidth,
                viewportWidth: window.innerWidth,
                hasHScroll: document.body.scrollWidth > window.innerWidth
            }
        }""")
        print(f"Horizontal scroll: body={h_scroll['bodyWidth']}px, viewport={h_scroll['viewportWidth']}px, overflow={h_scroll['hasHScroll']}")

        # Check font sizes
        font_check = page.evaluate("""() => {
            const textElements = document.querySelectorAll('p, li, span, a, td, th');
            const small = [];
            for (const el of textElements) {
                const style = window.getComputedStyle(el);
                const size = parseFloat(style.fontSize);
                if (size < 14 && el.textContent.trim().length > 0 && el.getBoundingClientRect().width > 0) {
                    small.push({
                        tag: el.tagName,
                        text: el.textContent.trim().substring(0, 40),
                        fontSize: size
                    });
                }
            }
            return small.slice(0, 15);
        }""")
        print(f"Small font elements (< 14px): {len(font_check)}")
        for s in font_check:
            print(f"  {s['tag']} {s['fontSize']}px \"{s['text']}\"")

        ctx.close()
        browser.close()
        print("Done!")

if __name__ == "__main__":
    main()

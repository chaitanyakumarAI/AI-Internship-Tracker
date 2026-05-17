"""
workday_scraper.py — Automates checking application statuses on Workday portals.

Usage:
    python workday_scraper.py
"""
import os
import time
import logging
from typing import List, Dict
from playwright.sync_api import sync_playwright, TimeoutError

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(message)s")
logger = logging.getLogger("workday_scraper")

def scrape_workday(company_name: str, portal_url: str, email: str, password: str, headless: bool = False) -> List[Dict]:
    """
    Automates a Workday login and scrapes the status of all active applications.
    """
    results = []
    
    logger.info(f"Starting Workday scraper for {company_name}...")
    
    with sync_playwright() as p:
        # Launch browser (set headless=False to watch the magic happen!)
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        try:
            # 1. Navigate to the login page
            logger.info(f"Navigating to {portal_url}")
            page.goto(portal_url, wait_until="networkidle")
            
            # Wait a bit for React to render
            time.sleep(2)
            
            # 2. Login
            logger.info("Entering credentials...")
            
            # Check if there is a "Sign in with email" button and click it (some portals hide the input fields initially)
            for selector in ['button:has-text("Sign in with email")', 'button:has-text("Sign in with Email")', '[data-automation-id="signInWithEmailButton"]', 'text=Sign in with email']:
                try:
                    btn = page.locator(selector)
                    if btn.count() > 0 and btn.is_visible():
                        logger.info(f"Clicking 'Sign in with email' button using selector: {selector}")
                        btn.click()
                        time.sleep(1.5)
                        break
                except Exception as btn_err:
                    logger.debug(f"Error checking selector {selector}: {btn_err}")

            # Workday uses data-automation-id for testing
            page.fill('input[data-automation-id="email"]', email)
            page.fill('input[data-automation-id="password"]', password)
            
            # Click sign in
            page.click('[data-automation-id="signInSubmitButton"]')
            
            logger.info("Clicked Sign In. Waiting for dashboard to load...")
            
            # 3. Wait for the "My Applications" dashboard to load
            # Usually after login, you are redirected to the userHome page
            try:
                page.wait_for_selector('[data-automation-id="application-title"]', timeout=15000)
            except TimeoutError:
                logger.error("Could not find any applications. Are the credentials correct? Is there a Captcha?")
                page.screenshot(path="workday_error.png")
                logger.info("Saved a screenshot to workday_error.png so you can see what went wrong.")
                return []
                
            # 4. Scrape the applications
            logger.info("Dashboard loaded! Extracting applications...")
            
            titles = page.query_selector_all('[data-automation-id="application-title"]')
            statuses = page.query_selector_all('[data-automation-id="application-status"]')
            
            if len(titles) == len(statuses):
                for title_el, status_el in zip(titles, statuses):
                    role = title_el.inner_text().strip()
                    status = status_el.inner_text().strip()
                    
                    logger.info(f"Found: {role} -> {status}")
                    
                    results.append({
                        "company": company_name,
                        "role": role,
                        "raw_status": status,
                        "platform": "Company Portal"
                    })
            else:
                logger.warning("Mismatch in titles and statuses count. The portal HTML structure might be different.")

        except Exception as e:
            logger.error(f"An error occurred: {e}")
            try:
                if not page.is_closed():
                    page.screenshot(path="workday_error.png")
            except Exception as ss_err:
                logger.error(f"Could not take screenshot (browser likely closed): {ss_err}")
        finally:
            browser.close()
            
    return results

if __name__ == "__main__":
    print("="*60)
    print(" WORKDAY PORTAL SCRAPER TEST")
    print("="*60)
    print("Please enter a Workday portal to test.")
    print("Example URL: https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite/login")
    
    test_url = input("Portal Login URL: ").strip()
    test_email = input("Email: ").strip()
    test_pwd = input("Password: ").strip()
    
    if test_url and test_email and test_pwd:
        # We run headless=False so you can visually see the bot typing and clicking!
        scrape_workday("Test Company", test_url, test_email, test_pwd, headless=False)
    else:
        print("Missing details. Exiting.")

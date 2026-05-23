"""
company_researcher.py — Automated research for companies using DuckDuckGo & Gemini.
Provides Scam Risk Analysis and Interview Prep Cheat Sheets.
"""
import logging
import json
from typing import Dict, Optional
from duckduckgo_search import DDGS
import config

logger = logging.getLogger(__name__)

def _search_web(query: str, max_results: int = 3) -> str:
    """Perform a web search and return a concatenated string of results."""
    try:
        ddgs = DDGS()
        results = list(ddgs.text(query, max_results=max_results))
        if not results:
            return "No web results found."
        
        snippets = []
        for r in results:
            snippets.append(f"- {r.get('title')}: {r.get('body')} ({r.get('href')})")
        return "\n".join(snippets)
    except Exception as e:
        logger.warning("Web search failed for query '%s': %s", query, e)
        return "Web search unavailable."

def _heuristic_scam_check(company_name: str, scam_results: str) -> Dict[str, str]:
    """
    Fallback rule-based scam checker if Gemini is rate-limited or offline.
    Uses string matching against common red flags in search snippets.
    """
    results_lower = scam_results.lower()
    
    # 1. Direct blocklist companies (known predatory/scam platforms reported by the user)
    blocklist = {
        "labmentix": "Known predatory platform offering fake or paid internship cert schemes.",
        "bluestock": "Frequently flagged for deceptive internship offers, charging fees, or low educational value.",
        "codsoft": "Flagged for sending generic certificate-based unpaid mass internship loops.",
        "octanet": "Known for mass automated unpaid internship programs with low educational value."
    }
    
    comp_clean = company_name.lower().replace(" ", "").replace("-", "")
    for blocked_name, note in blocklist.items():
        if blocked_name in comp_clean:
            return {
                "scam_risk": "High",
                "risk_notes": f"[Heuristic Fallback] {note}"
            }

    # 2. Heuristic word matching
    high_risk_words = ["scam", "fake", "fraud", "scammer", "MLM", "pyramid scheme", "scammed", "predatory"]
    medium_risk_words = ["unpaid repetitive", "pay for certificate", "asking money", "deposit fee", "fees", "complaint", "not legit", "certificate scheme"]
    
    high_count = sum(1 for w in high_risk_words if w in results_lower)
    med_count = sum(1 for w in medium_risk_words if w in results_lower)
    
    if high_count >= 2:
        return {
            "scam_risk": "High",
            "risk_notes": "[Heuristic Fallback] Multiple online reviews flag this company as a potential scam or fake internship provider."
        }
    elif high_count >= 1 or med_count >= 2:
        return {
            "scam_risk": "Medium",
            "risk_notes": "[Heuristic Fallback] Several reviews suggest potential issues (unpaid mass certificates, fees, or mixed ratings)."
        }
        
    return {
        "scam_risk": "Low",
        "risk_notes": "[Heuristic Fallback] No significant scam reports or negative reviews found on Reddit or Google."
    }

def analyze_company(company_name: str, role: str, status: str) -> Dict[str, str]:
    """
    Research a company.
    If it's any new application, check for scam/legitimacy risk.
    If it's an Interview, also generate an interview cheat sheet.
    """
    if company_name == "Unknown" or company_name.lower() in ("linkedin", "internshala", "unstop"):
        return {"scam_risk": "Unknown", "risk_notes": "", "prep_sheet": ""}
        
    logger.info("Conducting AI web research on company: %s", company_name)
    
    # 1. Search for scam/legitimacy
    scam_query = f'"{company_name}" company (scam OR legit OR fake OR reviews) reddit'
    scam_results = _search_web(scam_query, max_results=4)
    
    # 2. If Interview, search for tech stack & interview questions
    prep_results = ""
    if status == "Interview Scheduled":
        prep_query = f'"{company_name}" "{role}" (tech stack OR interview questions OR glassdoor)'
        prep_results = _search_web(prep_query, max_results=5)

    # 3. Use Gemini to analyze the findings
    from status_classifier import _get_gemini_client
    from utils import retry
    import time
    
    prompt = f"""You are a cybersecurity expert and career advisor.
Analyze the following web search results for the company "{company_name}" (Role: {role}).

SCAM SEARCH RESULTS:
{scam_results}

INTERVIEW SEARCH RESULTS:
{prep_results}

Return ONLY valid JSON with this schema:
{{
  "scam_risk": "High | Medium | Low",
  "risk_notes": "1-2 short sentences explaining the scam risk (e.g., 'Reddit users report this is a known MLM scam' or 'Well known established company').",
  "prep_sheet": "If Interview Scheduled, provide a short bulleted list of 1. Likely Tech Stack, 2. Recent News, 3. Likely Interview Questions based on the role. Use formatting. If not an interview, leave empty string."
}}
"""
    client = _get_gemini_client()
    if client:
        # Define retrying call helper
        @retry(max_attempts=3, delay=5.0, backoff=2.0, exceptions=(Exception,))
        def _call_gemini():
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={"temperature": 0.2, "response_mime_type": "application/json"}
            )
            return response.text.strip()

        try:
            raw = _call_gemini()
            data = json.loads(raw)
            
            # Rate limit spacing: sleep 4.5s to respect the 15 requests per minute limit
            time.sleep(4.5)
            
            return {
                "scam_risk": data.get("scam_risk", "Unknown"),
                "risk_notes": data.get("risk_notes", ""),
                "prep_sheet": data.get("prep_sheet", "")
            }
        except Exception as e:
            logger.error("Failed to generate company analysis with Gemini: %s. Using heuristic fallback.", e)
            
    # Fallback to rules-based heuristic checker if AI is rate-limited or offline
    fallback_res = _heuristic_scam_check(company_name, scam_results)
    return {
        "scam_risk": fallback_res["scam_risk"],
        "risk_notes": fallback_res["risk_notes"],
        "prep_sheet": ""
    }



"""Live verification: real Groq call for resume extraction on a long resume.

Reproduces the production failure shape (>1024-token completion) and confirms
the raised budget + defensive parsing fix end-to-end. Run from backend/:
    .venv/Scripts/python scripts/verify_extraction_fix.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from merix.config import settings  # noqa: E402
from merix.core.exceptions import ExtractionError  # noqa: E402
from merix.clients.llm import get_llm_client  # noqa: E402
from merix.services import matching  # noqa: E402


def long_resume(n_skills: int = 60) -> str:
    lines = ["PRIYA MENON", "Data Scientist - Mumbai, India", "", "SKILLS", ""]
    skills = [
        "Python", "SQL", "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy",
        "Spark", "Kafka", "Airflow", "Docker", "Kubernetes", "AWS SageMaker", "GCP Vertex AI",
        "dbt", "PostgreSQL", "MongoDB", "Redis", "FastAPI", "Flask", "Django",
        "Tableau", "Power BI", "Looker", "MLflow", "Weights & Biases", "Hugging Face Transformers",
        "LangChain", "OpenAI API", "NLP", "Computer Vision", "Time Series Analysis",
        "A/B Testing", "Statistics", "Feature Engineering", "Model Deployment", "MLOps",
        "Git", "CI/CD", "Linux", "Bash", "Scala", "Java", "C++", "R",
        "Excel VBA", "Snowflake", "BigQuery", "Redshift", "Elasticsearch", "GraphQL",
        "REST APIs", "Microservices", "Terraform", "Jenkins", "Prometheus", "Grafana",
        "Streamlit", "Plotly Dash", "XGBoost", "LightGBM",
    ]
    for s in skills[:n_skills]:
        lines.append(f"- {s}: applied in production projects with measurable business outcomes")
    lines += [
        "",
        "EXPERIENCE",
        "Senior Data Scientist, FinTech Co (2019-present)",
        "Built credit-risk models serving 2M users; cut default rate 18%.",
        "Data Scientist, Retail Analytics (2016-2019)",
        "Demand forecasting across 400 stores; MAPE reduced from 22% to 14%.",
        "",
        "EDUCATION",
        "B.Tech, Computer Science, IIT Bombay (2016)",
    ]
    return "\n".join(lines)


async def main() -> int:
    llm = get_llm_client(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)
    text = long_resume()
    print(f"resume chars={len(text)} model={settings.LLM_MODEL}")
    result = await llm.generate(
        matching._RESUME_EXTRACT_PROMPT.format(resume_text=text),
        system=matching._RESUME_EXTRACT_SYSTEM,
        temperature=0.0,
        max_tokens=matching._RESUME_EXTRACT_MAX_TOKENS,
    )
    print(f"completion_tokens={result.completion_tokens} (budget={matching._RESUME_EXTRACT_MAX_TOKENS})")
    if result.completion_tokens >= matching._RESUME_EXTRACT_MAX_TOKENS:
        print("FAIL: response still hit the cap — budget needs raising")
        return 1
    try:
        parsed = matching._parse_json(result.text)
    except Exception as exc:
        print(f"FAIL: parse error after budget raise: {exc}\nraw head: {result.text[:300]!r}")
        return 1
    n = len(parsed.get("skills", []))
    print(f"OK: valid JSON, {n} skills extracted, experience_years={parsed.get('experience_years')}")
    if n < 30:
        print("FAIL: expected >=30 skills for this dense resume")
        return 1

    # Defensive path: malformed output must raise ExtractionError, not JSONDecodeError.
    try:
        await matching.extract_resume(llm, text)
        print("second pass OK")
    except ExtractionError as exc:
        print(f"ExtractionError raised cleanly: {exc}")
        return 1
    except Exception as exc:
        print(f"FAIL: unexpected exception type leaked: {type(exc).__name__}: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

from crewai.tools import BaseTool
from duckduckgo_search import DDGS

class DuckDuckGoSearchTool(BaseTool):
    name: str = "DuckDuckGo Search Tool"
    description: str = "Search the internet for educational content"

    def _run(self, query: str) -> str:

        results = []

        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=5):
                results.append(r["body"])

        return "\n".join(results)

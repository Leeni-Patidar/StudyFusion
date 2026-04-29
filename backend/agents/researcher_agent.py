from tools.search_tool import DuckDuckGoSearchTool
from llm.groq_llm import groq_llm

search_tool = DuckDuckGoSearchTool()

research_agent = Agent(
    role="Research Specialist",

    goal="""
    Gather accurate, relevant, and concise information about a given topic.
    Focus on key concepts, definitions, and important points only.
    """,

    backstory="""
    You are an expert academic researcher.
    You extract only the most useful and relevant study material
    from reliable sources and avoid unnecessary details.
    """,

    tools=[search_tool],

    llm=groq_llm,

    verbose=False,  
    allow_delegation=False
)
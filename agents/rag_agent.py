from crewai import Agent
from llm.groq_llm import groq_llm

rag_agent = Agent(
    role="RAG Agent",
    goal="Retrieve relevant information from vector database",
    backstory="Expert in retrieving educational content",
    llm=groq_llm,  
    verbose=True
)

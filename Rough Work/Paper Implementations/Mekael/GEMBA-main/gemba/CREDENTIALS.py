# deployment is used to list available models
# for Azure API, specify model name as a key and deployment name as a value
# for OpenAI API, specify model name as a key and a value
# credentials = {
#     "deployments": {"gpt-4": "gpt-4"},
#     "api_base": "https://******.openai.azure.com/",
#     "api_key": OPENAI_API_KEY,
#     "requests_per_second_limit": 1
# }
import os
from dotenv import load_dotenv
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

credentials = {
    "deployments": {"gpt-4o": "gpt-4o"},  # Model name used directly
    "api_key": OPENAI_API_KEY,
    "requests_per_second_limit": 1  # Limit API requests to one per second
}
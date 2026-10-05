import os
from dotenv import load_dotenv
from xai_sdk import Client

load_dotenv()

api_key = os.getenv("XAI_API_KEY")

if not api_key:
    print("ERROR: XAI_API_KEY not found in .env")
    exit()

client = Client(
    api_key=api_key
)

print("Connecting to xAI...")

batch = client.batch.create(
    batch_name="cloudcalc_test_batch"
)

print("SUCCESS!")
print(batch)
import google.genai as genai
import os
import sys
from dotenv import load_dotenv

def test_gemini():
    # Load environment variables from backend/.env
    # We look for .env in the current directory or parent/backend
    env_path = ".env"
    if not os.path.exists(env_path):
        env_path = os.path.join("backend", ".env")
    
    if os.path.exists(env_path):
        load_dotenv(env_path)
        print(f"Loaded environment from {env_path}")
    else:
        print("Warning: .env file not found. Using system environment variables.")

    gem_api_key = os.getenv("GEMINI_API_KEY")

    # The SDK auto-uses GOOGLE_API_KEY if present in environ, often ignoring the constructor.
    # To be safe, we remove it from the environment for this process.
    if "GOOGLE_API_KEY" in os.environ:
        del os.environ["GOOGLE_API_KEY"]
    
    target_key = gem_api_key

    if not target_key:
        print("Error: No API key found. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file.")
        return

    print(f"Testing with API Key: {target_key[:10]}...")

    client = genai.Client(api_key=target_key)
    
    # List of models to try in order of preference
    models_to_test = ["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-1.5-flash"]
    
    any_success = False
    for model_name in models_to_test:
        try:
            print(f"\nTesting model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=["Say 'System is operational'"],
            )
            print(f"SUCCESS! {model_name} responded:")
            print(f"---")
            print(response.text.strip())
            print(f"---")
            any_success = True
            break 
        except Exception as e:
            print(f"Model {model_name} failed.")
            if "API_KEY_INVALID" in str(e) or "400" in str(e):
                print("Reason: API Key is invalid.")
            elif "PERMISSION_DENIED" in str(e) or "403" in str(e):
                print("Reason: Permission denied (API might be blocked for this key).")
            else:
                print(f"Error: {e}")

    if not any_success:
        print("\nConclusion: Gemini integration is currently NOT WORKING. Please check your API keys and project permissions.")
        sys.exit(1)
    else:
        print("\nConclusion: Gemini integration is WORKING!")
        sys.exit(0)

if __name__ == "__main__":
    test_gemini()

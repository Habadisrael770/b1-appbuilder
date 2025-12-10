#!/usr/bin/env python3
"""
AI Orchestrator V2 - Improved with error handling and fallback models
"""

import os
import json
import requests
import time
from pathlib import Path
from typing import Dict, Any, Optional

# Configuration
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# AI Model assignments with fallbacks
MODELS = {
    "android_developer": ["openai/gpt-4-turbo", "openai/gpt-4", "openai/gpt-3.5-turbo"],
    "ios_developer": ["anthropic/claude-3-opus", "anthropic/claude-3-sonnet", "anthropic/claude-2"],
    "devops_engineer": ["meta-llama/llama-2-70b-chat", "openai/gpt-4", "google/gemini-pro"],
    "qa_engineer": ["google/gemini-2.0-flash", "google/gemini-pro", "openai/gpt-4"],
}

class AIOrchestrator:
    """Orchestrates AI models with retry logic and fallbacks"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = OPENROUTER_BASE_URL
        self.results = {}
        self.prompts_dir = Path(".")
        self.max_retries = 3
        self.retry_delay = 5
        
    def load_prompt(self, filename: str) -> str:
        """Load prompt from file"""
        path = self.prompts_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Prompt file not found: {filename}")
        return path.read_text()
    
    def call_ai_model(self, models: list, prompt: str, context: Dict[str, Any] = None, role: str = "") -> Optional[str]:
        """Call OpenRouter API with model fallback"""
        
        for attempt, model in enumerate(models):
            for retry in range(self.max_retries):
                try:
                    # Build messages
                    messages = []
                    
                    # Add context if available
                    if context:
                        context_str = json.dumps(context, indent=2)
                        messages.append({
                            "role": "user",
                            "content": f"Previous outputs for context:\n\n{context_str}\n\n---\n\n{prompt}"
                        })
                    else:
                        messages.append({
                            "role": "user",
                            "content": prompt
                        })
                    
                    # Call API
                    headers = {
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://b1appbuilder.com",
                        "X-Title": "B1 AppBuilder AI Orchestrator"
                    }
                    
                    payload = {
                        "model": model,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 8000,
                    }
                    
                    print(f"\n📡 [{role}] Calling {model} (attempt {retry+1}/{self.max_retries})...")
                    
                    response = requests.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload,
                        timeout=60
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if "choices" in result and len(result["choices"]) > 0:
                            content = result["choices"][0]["message"]["content"]
                            print(f"   ✅ Got response ({len(content)} chars) from {model}")
                            return content
                    else:
                        print(f"   ⚠️ Error {response.status_code}: {response.text[:200]}")
                        if response.status_code == 429:  # Rate limit
                            print(f"   ⏳ Rate limited, waiting {self.retry_delay}s...")
                            time.sleep(self.retry_delay)
                        elif response.status_code >= 500:  # Server error
                            print(f"   ⏳ Server error, waiting {self.retry_delay}s...")
                            time.sleep(self.retry_delay)
                        elif response.status_code == 400:  # Bad request
                            print(f"   ❌ Bad request, trying next model...")
                            break  # Try next model
                        continue
                    
                except requests.exceptions.Timeout:
                    print(f"   ⏳ Timeout, retrying...")
                    time.sleep(self.retry_delay)
                    continue
                except requests.exceptions.RequestException as e:
                    print(f"   ⚠️ Request error: {e}")
                    time.sleep(self.retry_delay)
                    continue
            
        print(f"   ❌ Failed with all models: {models}")
        return None
    
    def step_1_android_developer(self) -> bool:
        """Step 1: Android Developer"""
        print("\n" + "="*60)
        print("STEP 1: Android Developer - Building APK Template")
        print("="*60)
        
        try:
            prompt = self.load_prompt("ANDROID_DEVELOPER_PROMPT.md")
            response = self.call_ai_model(
                MODELS["android_developer"],
                prompt,
                role="Android Developer"
            )
            
            if response:
                self.results["android"] = {
                    "step": 1,
                    "role": "Android Developer",
                    "output": response[:2000],
                    "full_output": response,
                }
                print(f"✅ Android Developer completed")
                return True
            else:
                print(f"❌ Android Developer failed")
                return False
        except Exception as e:
            print(f"❌ Error in Android Developer: {e}")
            return False
    
    def step_2_ios_developer(self) -> bool:
        """Step 2: iOS Developer"""
        print("\n" + "="*60)
        print("STEP 2: iOS Developer - Building IPA Template")
        print("="*60)
        
        try:
            prompt = self.load_prompt("IOS_DEVELOPER_PROMPT.md")
            context = {
                "android_summary": self.results.get("android", {}).get("output", "")
            }
            
            response = self.call_ai_model(
                MODELS["ios_developer"],
                prompt,
                context,
                role="iOS Developer"
            )
            
            if response:
                self.results["ios"] = {
                    "step": 2,
                    "role": "iOS Developer",
                    "output": response[:2000],
                    "full_output": response,
                }
                print(f"✅ iOS Developer completed")
                return True
            else:
                print(f"❌ iOS Developer failed")
                return False
        except Exception as e:
            print(f"❌ Error in iOS Developer: {e}")
            return False
    
    def step_3_devops_engineer(self) -> bool:
        """Step 3: DevOps Engineer"""
        print("\n" + "="*60)
        print("STEP 3: DevOps Engineer - Building CI/CD Pipeline")
        print("="*60)
        
        try:
            prompt = self.load_prompt("DEVOPS_PROMPT.md")
            context = {
                "android_summary": self.results.get("android", {}).get("output", ""),
                "ios_summary": self.results.get("ios", {}).get("output", "")
            }
            
            response = self.call_ai_model(
                MODELS["devops_engineer"],
                prompt,
                context,
                role="DevOps Engineer"
            )
            
            if response:
                self.results["devops"] = {
                    "step": 3,
                    "role": "DevOps Engineer",
                    "output": response[:2000],
                    "full_output": response,
                }
                print(f"✅ DevOps Engineer completed")
                return True
            else:
                print(f"❌ DevOps Engineer failed")
                return False
        except Exception as e:
            print(f"❌ Error in DevOps Engineer: {e}")
            return False
    
    def step_4_qa_engineer(self) -> bool:
        """Step 4: QA Engineer"""
        print("\n" + "="*60)
        print("STEP 4: QA Engineer - Building Testing Framework")
        print("="*60)
        
        try:
            qa_prompt = """
You are a Senior QA Engineer. Based on the previous outputs from Android, iOS, and DevOps teams,
create a comprehensive testing strategy and test suite for the Web-to-APK converter.

Include:
1. Unit tests (Vitest)
2. Integration tests
3. E2E tests (Playwright)
4. Performance tests
5. Security tests
6. Test coverage targets (80%+)
7. CI/CD test integration

Provide:
- Test file structure
- Sample test cases
- Test configuration
- Coverage reports
- Automation strategy
"""
            
            context = {
                "android_summary": self.results.get("android", {}).get("output", ""),
                "ios_summary": self.results.get("ios", {}).get("output", ""),
                "devops_summary": self.results.get("devops", {}).get("output", "")
            }
            
            response = self.call_ai_model(
                MODELS["qa_engineer"],
                qa_prompt,
                context,
                role="QA Engineer"
            )
            
            if response:
                self.results["qa"] = {
                    "step": 4,
                    "role": "QA Engineer",
                    "output": response[:2000],
                    "full_output": response,
                }
                print(f"✅ QA Engineer completed")
                return True
            else:
                print(f"❌ QA Engineer failed")
                return False
        except Exception as e:
            print(f"❌ Error in QA Engineer: {e}")
            return False
    
    def run_orchestration(self):
        """Run the complete orchestration pipeline"""
        print("\n" + "🚀 "*30)
        print("B1 AppBuilder - AI Orchestrator V2")
        print("Building Web-to-APK Converter with AI Team")
        print("🚀 "*30)
        
        try:
            # Step 1
            if not self.step_1_android_developer():
                print("⚠️ Android Developer failed, but continuing...")
            
            # Step 2
            if not self.step_2_ios_developer():
                print("⚠️ iOS Developer failed, but continuing...")
            
            # Step 3
            if not self.step_3_devops_engineer():
                print("⚠️ DevOps Engineer failed, but continuing...")
            
            # Step 4
            if not self.step_4_qa_engineer():
                print("⚠️ QA Engineer failed, but continuing...")
            
            # Save results
            self.save_results()
            
            print("\n" + "="*60)
            print("✅ ORCHESTRATION COMPLETE!")
            print("="*60)
            print(f"\nCompleted steps: {len(self.results)}")
            print(f"Results saved to: orchestration_results.json")
            
            return self.results
            
        except Exception as e:
            print(f"\n❌ Orchestration error: {e}")
            self.save_results()
            raise
    
    def save_results(self):
        """Save orchestration results to file"""
        output = {
            "orchestration": {
                "status": "completed",
                "total_steps": len(self.results),
                "timestamp": str(Path.cwd()),
            },
            "steps": self.results
        }
        
        # Save full results
        with open("orchestration_results.json", "w") as f:
            json.dump(output, f, indent=2)
        print(f"   Saved: orchestration_results.json")
        
        # Save individual outputs
        for role, result in self.results.items():
            filename = f"output_{role}.md"
            with open(filename, "w") as f:
                f.write(f"# {result['role']} Output\n\n")
                f.write(result["full_output"])
            print(f"   Saved: {filename}")

def main():
    """Main entry point"""
    orchestrator = AIOrchestrator(OPENROUTER_API_KEY)
    orchestrator.run_orchestration()

if __name__ == "__main__":
    main()

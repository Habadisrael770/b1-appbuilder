#!/usr/bin/env python3
"""
AI Orchestrator - Chains multiple AI models to build Web-to-APK converter
Uses OpenRouter to route between different AI models
"""

import os
import json
import requests
from pathlib import Path
from typing import Dict, Any, List

# Configuration
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# AI Model assignments
MODELS = {
    "android_developer": "openai/gpt-4-turbo",  # ChatGPT
    "ios_developer": "anthropic/claude-3-opus",  # Claude
    "devops_engineer": "meta-llama/llama-2-70b-chat",  # Llama (instead of Grok)
    "qa_engineer": "google/gemini-2.0-flash",  # Gemini
}

class AIOrchestrator:
    """Orchestrates AI models to build Web-to-APK converter"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = OPENROUTER_BASE_URL
        self.results = {}
        self.prompts_dir = Path(".")
        
    def load_prompt(self, filename: str) -> str:
        """Load prompt from file"""
        path = self.prompts_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Prompt file not found: {filename}")
        return path.read_text()
    
    def call_ai_model(self, model: str, prompt: str, context: Dict[str, Any] = None) -> str:
        """Call OpenRouter API with specified model"""
        
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
        
        print(f"\n📡 Calling {model}...")
        print(f"   Prompt: {prompt[:100]}...")
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                print(f"   ✅ Got response ({len(content)} chars)")
                return content
            else:
                raise Exception(f"Unexpected API response: {result}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ API Error: {e}")
            raise
    
    def step_1_android_developer(self) -> Dict[str, Any]:
        """Step 1: Android Developer builds APK template"""
        print("\n" + "="*60)
        print("STEP 1: Android Developer - Building APK Template")
        print("="*60)
        
        prompt = self.load_prompt("ANDROID_DEVELOPER_PROMPT.md")
        
        response = self.call_ai_model(
            MODELS["android_developer"],
            prompt
        )
        
        result = {
            "step": 1,
            "role": "Android Developer",
            "model": MODELS["android_developer"],
            "output": response[:2000],  # Store first 2000 chars
            "full_output": response,
        }
        
        self.results["android"] = result
        return result
    
    def step_2_ios_developer(self) -> Dict[str, Any]:
        """Step 2: iOS Developer builds IPA template"""
        print("\n" + "="*60)
        print("STEP 2: iOS Developer - Building IPA Template")
        print("="*60)
        
        prompt = self.load_prompt("IOS_DEVELOPER_PROMPT.md")
        
        # Pass Android output as context
        context = {
            "android_summary": self.results["android"]["output"]
        }
        
        response = self.call_ai_model(
            MODELS["ios_developer"],
            prompt,
            context
        )
        
        result = {
            "step": 2,
            "role": "iOS Developer",
            "model": MODELS["ios_developer"],
            "output": response[:2000],
            "full_output": response,
        }
        
        self.results["ios"] = result
        return result
    
    def step_3_devops_engineer(self) -> Dict[str, Any]:
        """Step 3: DevOps Engineer builds CI/CD pipeline"""
        print("\n" + "="*60)
        print("STEP 3: DevOps Engineer - Building CI/CD Pipeline")
        print("="*60)
        
        prompt = self.load_prompt("DEVOPS_PROMPT.md")
        
        # Pass Android + iOS outputs as context
        context = {
            "android_summary": self.results["android"]["output"],
            "ios_summary": self.results["ios"]["output"]
        }
        
        response = self.call_ai_model(
            MODELS["devops_engineer"],
            prompt,
            context
        )
        
        result = {
            "step": 3,
            "role": "DevOps Engineer",
            "model": MODELS["devops_engineer"],
            "output": response[:2000],
            "full_output": response,
        }
        
        self.results["devops"] = result
        return result
    
    def step_4_qa_engineer(self) -> Dict[str, Any]:
        """Step 4: QA Engineer builds testing framework"""
        print("\n" + "="*60)
        print("STEP 4: QA Engineer - Building Testing Framework")
        print("="*60)
        
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
        
        # Pass all previous outputs as context
        context = {
            "android_summary": self.results["android"]["output"],
            "ios_summary": self.results["ios"]["output"],
            "devops_summary": self.results["devops"]["output"]
        }
        
        response = self.call_ai_model(
            MODELS["qa_engineer"],
            qa_prompt,
            context
        )
        
        result = {
            "step": 4,
            "role": "QA Engineer",
            "model": MODELS["qa_engineer"],
            "output": response[:2000],
            "full_output": response,
        }
        
        self.results["qa"] = result
        return result
    
    def run_orchestration(self):
        """Run the complete orchestration pipeline"""
        print("\n" + "🚀 "*30)
        print("B1 AppBuilder - AI Orchestrator")
        print("Building Web-to-APK Converter with AI Team")
        print("🚀 "*30)
        
        try:
            # Step 1: Android
            step1 = self.step_1_android_developer()
            print(f"\n✅ Android Developer completed")
            
            # Step 2: iOS
            step2 = self.step_2_ios_developer()
            print(f"\n✅ iOS Developer completed")
            
            # Step 3: DevOps
            step3 = self.step_3_devops_engineer()
            print(f"\n✅ DevOps Engineer completed")
            
            # Step 4: QA
            step4 = self.step_4_qa_engineer()
            print(f"\n✅ QA Engineer completed")
            
            # Save results
            self.save_results()
            
            print("\n" + "="*60)
            print("✅ ORCHESTRATION COMPLETE!")
            print("="*60)
            print(f"\nResults saved to: orchestration_results.json")
            print(f"Total steps: 4")
            print(f"Models used: {len(set(MODELS.values()))}")
            
            return self.results
            
        except Exception as e:
            print(f"\n❌ Orchestration failed: {e}")
            raise
    
    def save_results(self):
        """Save orchestration results to file"""
        output = {
            "orchestration": {
                "status": "completed",
                "total_steps": len(self.results),
                "models_used": list(set(MODELS.values())),
                "timestamp": str(Path.cwd()),
            },
            "steps": self.results
        }
        
        # Save full results
        with open("orchestration_results.json", "w") as f:
            json.dump(output, f, indent=2)
        
        # Save individual outputs
        for role, result in self.results.items():
            filename = f"output_{role}.md"
            with open(filename, "w") as f:
                f.write(f"# {result['role']} Output\n\n")
                f.write(f"Model: {result['model']}\n\n")
                f.write(result["full_output"])
            print(f"   Saved: {filename}")

def main():
    """Main entry point"""
    orchestrator = AIOrchestrator(OPENROUTER_API_KEY)
    orchestrator.run_orchestration()

if __name__ == "__main__":
    main()

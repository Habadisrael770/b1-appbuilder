/**
 * GitHub API Client
 * 
 * Provides helper functions to interact with GitHub Actions API
 * for triggering workflows and checking build status.
 */

import { ENV } from "./env";

const GITHUB_API_BASE = "https://api.github.com";

interface WorkflowDispatchInput {
  buildId: string;
  appId: string;
  appName: string;
  websiteUrl: string;
  primaryColor: string;
  secondaryColor?: string;
  iconUrl?: string;
  splashScreenUrl?: string;
}

interface GitHubWorkflowRun {
  id: number;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Trigger Android build workflow on GitHub Actions
 */
export async function triggerAndroidBuild(
  inputs: WorkflowDispatchInput
): Promise<{ success: boolean; runId?: number; error?: string }> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${ENV.githubOwner}/${ENV.githubRepo}/actions/workflows/build-android.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ENV.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            buildId: inputs.buildId,
            appId: inputs.appId,
            appName: inputs.appName,
            websiteUrl: inputs.websiteUrl,
            primaryColor: inputs.primaryColor,
            secondaryColor: inputs.secondaryColor || "#008556",
            iconUrl: inputs.iconUrl || "",
            splashScreenUrl: inputs.splashScreenUrl || "",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("GitHub API error:", error);
      return {
        success: false,
        error: `GitHub API returned ${response.status}: ${error}`,
      };
    }

    // Workflow dispatch returns 204 No Content on success
    // We need to query for the run ID separately
    const runId = await getLatestWorkflowRunId();

    return {
      success: true,
      runId,
    };
  } catch (error) {
    console.error("Failed to trigger Android build:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get the latest workflow run ID for the Android build workflow
 */
async function getLatestWorkflowRunId(): Promise<number | undefined> {
  try {
    // Wait a bit for the workflow to be created
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${ENV.githubOwner}/${ENV.githubRepo}/actions/workflows/build-android.yml/runs?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${ENV.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to get workflow runs:", await response.text());
      return undefined;
    }

    const data = await response.json();
    return data.workflow_runs?.[0]?.id;
  } catch (error) {
    console.error("Failed to get latest workflow run:", error);
    return undefined;
  }
}

/**
 * Get workflow run status by run ID
 */
export async function getWorkflowRunStatus(
  runId: number
): Promise<GitHubWorkflowRun | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${ENV.githubOwner}/${ENV.githubRepo}/actions/runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to get workflow run status:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get workflow run status:", error);
    return null;
  }
}

/**
 * Get download URL for build artifacts
 */
export async function getBuildArtifactUrl(
  runId: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${ENV.githubOwner}/${ENV.githubRepo}/actions/runs/${runId}/artifacts`,
      {
        headers: {
          Authorization: `Bearer ${ENV.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to get artifacts:", await response.text());
      return null;
    }

    const data = await response.json();
    const artifact = data.artifacts?.[0];

    if (!artifact) {
      return null;
    }

    // Return the GitHub Actions run page URL where users can download
    return `https://github.com/${ENV.githubOwner}/${ENV.githubRepo}/actions/runs/${runId}`;
  } catch (error) {
    console.error("Failed to get build artifact URL:", error);
    return null;
  }
}

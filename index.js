const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('github-token', {required: true});
        const currentRunStatus = core.getInput('current-status', {required: true});

        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;
        const runId = github.context.runId;

        console.debug("Authenticating with Octokit");
        const octokit = github.getOctokit(token);

        console.debug("Getting current `workflow_id`");
        const { data: currentRun }  = await octokit.rest.actions.getWorkflowRun({
            owner: owner,
            repo: repo,
            run_id: runId,
        });

        console.debug("Current run:", {
            url: currentRun.html_url,
            run_number: currentRun.run_number,
            branch: currentRun.head_branch,
        });

        console.debug("Listing workflow runs")
        const { data: workflowRunsData } = await octokit.rest.actions.listWorkflowRuns({
            owner: owner,
            repo: repo,
            workflow_id: currentRun.workflow_id,
            branch: currentRun.head_branch,
            per_page: 2,  // Only need current and previous
        });

        console.debug("Extracting previous run")
        let previousRunStatus = "unknown";
        if ( workflowRunsData.total_count > 1 ){
            // 0 is ourselves in serial builds.
            const previousRun = workflowRunsData.workflow_runs[1];
            console.debug("Previous run:", {
                url: previousRun.html_url,
                run_number: previousRun.run_number,
                branch: previousRun.head_branch,
                status: previousRun.status,
                conclusion: previousRun.conclusion,
            });
            // In general we want (completes, failure) or (completed, success)
            // anything else is useless here.
            previousRunStatus = previousRun.conclusion || "unknown";
        }

        console.log("PREVIOUS STATUS WAS", previousRunStatus);
        console.log("CURRENT STATUS IS", currentRunStatus);

        let runStatusChange = currentRunStatus;
        if (currentRunStatus === "failure") {
            runStatusChange = "broke";
        } else if (currentRunStatus === "success" && previousRunStatus === "failure") {
            runStatusChange = "fixed";
        }
        console.log("WORKFLOW STATUS CHANGE IS", runStatusChange);
        core.setOutput("change", runStatusChange);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()

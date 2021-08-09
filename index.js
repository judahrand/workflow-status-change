const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('github-token', {required: true});
        const currentJobStatus = core.getInput('current-job-status', {required: true});

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
        });

        console.debug("Extracting previous run")
        let previousJobStatus = "unknown";
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
            previousJobStatus = previousRun.conclusion || "unknown";
        }

        console.log("PREVIOUS STATUS WAS", previousJobStatus);
        console.log("CURRENT STATUS IS", currentJobStatus);

        let jobStatusChange = currentJobStatus;
        if (currentJobStatus === "failure") {
            jobStatusChange = "broken";
        } else if (currentJobStatus === "success" && previousJobStatus === "failure") {
            jobStatusChange = "fixed";
        }
        console.log("JOB STATUS CHANGE IS", jobStatusChange);
        core.setOutput("change", jobStatusChange);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()

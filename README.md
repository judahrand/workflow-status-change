# Job Status Change javascript action

This action determines if the job status of the current workflow has changed since its last run. This action should be run as the last (or penultimate if sending the result somewhere) step of a GitHub Job.

## Inputs

## `github-token`

**Required** The token to use to authenicate with the GitHub API. Default `${{ github.token }}`.

## `current-job-status`

**Required** The status of the current GitHub Job. Default `${{ job.status }}`.

## Outputs

## `change`

The job status transition that has occurred, if any. Possible outputs are: `"fixed", "broke", "success"`

## Example usage

uses: actions/job-status-change@v1

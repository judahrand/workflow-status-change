# Workflow Status Change javascript action

This action determines if the status of the current workflow has changed since its last run. This action should be run as the last (or penultimate if sending the result somewhere) step of a GitHub Workflow.

## Inputs

## `github-token`

**Required** The token to use to authenicate with the GitHub API. Default `${{ github.token }}`.

## `current-status`

**Required** The status of the current GitHub Workflow. Default `${{ job.status }}`.

## Outputs

## `change`

The status transition that has occurred. Possible outputs are: `"fixed", "broke", "success"`

## Example usage
```yaml
- name: Workflow status change
  if: always()
  uses: judahrand/workflow-status-change@master
```

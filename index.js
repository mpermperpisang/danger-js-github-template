const { details, isWIP, regex } = require( './general' );
const { failures } = require( './message' );

// Github
const { git, github } = danger;
const {
  modified_files,
} = git;
const {
  pr, thisPR, api, issue,
} = github;
const { issues } = api;
const {
  body, title, changed_files, user, additions, deletions, assignees,
} = pr;
const { owner, repo, number } = thisPR;

// Function declaration and calling
function checkPRChanges() {
  const hasTooMuchFilesChanged = changed_files > details.max.changedFiles;
  const hasTooMuchCodesChanged = additions + deletions > details.max.changedCodes;

  if (hasTooMuchFilesChanged || hasTooMuchCodesChanged) {
    fail(failures.tooMuchChanges());
  }
}

module.exports = {
  title,
  prTitle() { // Force author to follow title rule
    const isTitleSHort = title.match(regex.shortTitle);

    if (isWIP) warn(warnings.wip);
    if (!isTitleSHort) fail(failures.tooShortTitle);
  },
  prDesc() { // Force author to follow description rule
    const hasMinDesc = body.length < details.min.desc;

    if (hasMinDesc) {
      warn(warnings.minDesc);
    }
  },
  prAssignees() { // Force author to assign assignee
    const isEmptyAssignee = assignees.length === 0;
    const payload = {
      owner, repo, issue_number: number, assignees: user.login,
    };

    if (isEmptyAssignee) issues.addAssignees(payload);
  },
  prLabels() { // Force author to add label
    const isEmptyLabel = (isWIP && issue.labels.length === 1)
                          || (!isWIP && issue.labels.length === 0);
    const payloadLabelAdd = {
      owner, repo, issue_number: number, labels: labels.working_in_progress,
    };
    const payloadLabelList = { owner, repo, issue_number: number };
    const payloadLabelRemove = {
      owner, repo, issue_number: number, name: labels.working_in_progress,
    };

    if (isEmptyLabel) fail(failures.noLabel);
    if (isWIP) {
      issues.addLabels(payloadLabelAdd);
    } else {
      issues.listLabelsOnIssue(payloadLabelList).then((response) => {
        response.data.forEach((arr) => {
          if (JSON.stringify(arr.name).includes(labels.working_in_progress)) {
            issues.removeLabel(payloadLabelRemove);
          }
        });
      });
    }
  },
  prChangesCount() { // Force author to create small changes
    const isFileModified = details.exclude.filter((e) => modified_files.includes(e)).length > 0;

    if (isFileModified) {
      fail(failures.excludeFilesChanged);
    } else {
      checkPRChanges();
    }
  },
  prCommits() { // Force author to follow commit message format
    if (!lastCommit.match(regex.commitPrefix)) warn(warnings.lastCommit(lastCommit));
  },
}

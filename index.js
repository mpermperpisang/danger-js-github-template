const _ = require( './general' );
const { warnings, failures } = require( './message' );

// Function declaration and calling
function checkPRChanges() {
  const hasTooMuchFilesChanged = _.changed_files > _.details.max.changedFiles;
  const hasTooMuchCodesChanged = _.additions + _.deletions > _.details.max.changedCodes;

  if (hasTooMuchFilesChanged || hasTooMuchCodesChanged) {
    fail(failures.tooMuchChanges());
  }
}

module.exports = {
  prTitle() { // Force author to follow title rule
    const isTitleSHort = _.title.match(_.regex.shortTitle);

    if (_.isWIP) warn(warnings.wip);
    if (!isTitleSHort) fail(failures.tooShortTitle);
  },
  prDesc() { // Force author to follow description rule
    const hasMinDesc = _.body.length < _.details.min.desc;

    if (hasMinDesc) {
      warn(warnings.minDesc);
    }
  },
  prAssignees() { // Force author to assign assignee
    const isEmptyAssignee = _.assignees.length === 0;
    const payload = {
      owner: _.owner, repo: _.repo, issue_number: _.number, assignees: _.user.login,
    };

    if (isEmptyAssignee) _.issues.addAssignees(payload);
  },
  prLabels() { // Force author to add label
    const isEmptyLabel = (_.isWIP && _.issue.labels.length === 1)
                          || (!_.isWIP && _.issue.labels.length === 0);
    const payloadLabelAdd = {
      owner: _.owner, repo: _.repo, issue_number: _.number, labels: labels.working_in_progress,
    };
    const payloadLabelList = { owner: _.owner, repo: _.repo, issue_number: _.number };
    const payloadLabelRemove = {
      owner: _.owner, repo: _.repo, issue_number: _.number, name: labels.working_in_progress,
    };

    if (isEmptyLabel) fail(failures.noLabel);
    if (_.isWIP) {
      _.issues.addLabels(payloadLabelAdd);
    } else {
      _.issues.listLabelsOnIssue(payloadLabelList).then((response) => {
        response.data.forEach((arr) => {
          if (JSON.stringify(arr.name).includes(_.labels.working_in_progress)) {
            _.issues.removeLabel(payloadLabelRemove);
          }
        });
      });
    }
  },
  prChangesCount() { // Force author to create small changes
    const isFileModified = _.details.exclude.filter((e) => _.modified_files.includes(e)).length > 0;

    if (isFileModified) {
      fail(failures.excludeFilesChanged);
    } else {
      checkPRChanges();
    }
  },
  prCommits() { // Force author to follow commit message format
    if (!lastCommit.match(_.regex.commitPrefix)) warn(warnings.lastCommit(_.lastCommit));
  },
}

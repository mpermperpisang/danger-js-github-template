const _ = require( './general' );
const { warnings, failures } = require( './message' );

// Function declaration and calling
function checkPRLabel() {
  const payloadLabelList = { owner: _.owner, repo: _.repo, issue_number: _.number };
  const payloadLabelRemove = {
    owner: _.owner, repo: _.repo, issue_number: _.number, name: _.labels.working_in_progress,
  };

  _.issues.listLabelsOnIssue(payloadLabelList).then((response) => {
    response.data.forEach((arr) => {
      if (JSON.stringify(arr.name).includes(_.labels.working_in_progress)) {
        _.issues.removeLabel(payloadLabelRemove);
      }
    });
  });
}

function checkPRChanges() {
  const hasTooMuchFilesChanged = _.changed_files > _.details.max.changedFiles;

  if (hasTooMuchFilesChanged) {
    fail(failures.tooMuchChanges);
  }
}

module.exports = {
  prTitle() { // Force author to follow title rule
    const isTitleShort = _.title.match(_.regex.shortTitle);

    if (_.isWIP) warn(warnings.wip);
    if (!isTitleShort) fail(failures.tooShortTitle);
  },
  prDesc() { // Force author to follow description rule
    const hasMinDesc = _.body.length < _.details.min.desc;

    if (hasMinDesc) {
      warn(warnings.minDesc);
    }
  },
  prAssignees() { // Force author to follow assignee rule
    const isEmptyAssignee = _.assignees.length === 0;
    const payload = {
      owner: _.owner, repo: _.repo, issue_number: _.number, assignees: _.user.login,
    };

    if (isEmptyAssignee) _.issues.addAssignees(payload);
  },
  prLabels() { // Force author to follow label rule
    const isEmptyLabel = (_.isWIP && _.issue.labels.length === 1)
                          || (!_.isWIP && _.issue.labels.length === 0);
    const payloadLabelAdd = {
      owner: _.owner, repo: _.repo, issue_number: _.number, labels: _.labels.working_in_progress,
    };

    if (_.isWIP) {
      _.issues.addLabels(payloadLabelAdd);
    } else {
      checkPRLabel();
    }

    if (isEmptyLabel) fail(failures.noLabel);
  },
  prChangesCount() { // Force author to follow changes rule
    const isFileModified = _.details.exclude.filter((e) => _.modified_files.includes(e)).length > 0;

    if (isFileModified) {
      fail(failures.excludeFilesChanged);
    } else {
      checkPRChanges();
    }
  },
  prCommits() { // Force author to follow commit rule
    if (!_.lastCommit.match(_.regex.commitPrefix)) warn(warnings.lastCommit(_.lastCommit));
  },
}

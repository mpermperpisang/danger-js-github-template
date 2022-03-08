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
  body, title, changed_files, user, assignees,
} = pr;
const { owner, repo, number } = thisPR;

// Details
const details = {
  exclude: [
    'package-lock.json',
    'dangerfile.js',
  ],
  max: {
    changedFiles: 25,
    changedCodes: 500,
  },
  min: {
    desc: 25,
  },
};
const regex = {
  shortTitle: /[ a-zA-Z0-9:]{5,50}/,
  commitPrefix: /^(feat:)|(fix:)|(docs:)|(test:)/g,
};
const labels = {
  wip: ['wip'],
  working_in_progress: ['working in progress'],
};
const titleUpper = title.toUpperCase();
const isWIP = titleUpper.includes(labels.wip.toString().toUpperCase());
const lastCommit = danger.git.commits[danger.git.commits.length - 1].message;

const warnings = {
  minDesc: 'Please add more detail in description.',
  wip: 'PR is classified as Working in Progress',
  lastCommit: 'Please check last commit message format.',
};

const failures = {
  tooShortTitle: 'Please add more words on PR title.',
  noLabel: 'Please add more tags on PR label.',
  excludeFilesChanged: `Please DO NOT change ${details.exclude.join(' or ')}`,
  tooMuchChanges: 'Big PR. Please break the PR changes.',
};

// Function declaration and calling
function checkPRChanges() {
  const hasTooMuchFilesChanged = changed_files > details.max.changedFiles;

  if (hasTooMuchFilesChanged) {
    fail(failures.tooMuchChanges);
  }
}

module.exports = {
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
      owner: owner, repo: repo, issue_number: number, assignees: user.login,
    };

    if (isEmptyAssignee) issues.addAssignees(payload);
  },
  prLabels() { // Force author to add label
    const isEmptyLabel = (isWIP && issue.labels.length === 1)
                          || (!isWIP && issue.labels.length === 0);
    const payloadLabelAdd = {
      owner: owner, repo: repo, issue_number: number, labels: labels.working_in_progress,
    };
    const payloadLabelList = { owner: owner, repo: repo, issue_number: number };
    const payloadLabelRemove = {
      owner: owner, repo: repo, issue_number: number, name: labels.working_in_progress,
    };

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
    if (isEmptyLabel) fail(failures.noLabel);
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

const { danger } = require( 'danger' );

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

// Details
const titleUpper = title.toUpperCase();
const isWIP = titleUpper.includes(labels.wip.toString().toUpperCase());
const lastCommit = danger.git.commits[danger.git.commits.length - 1].message;
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
    desc: 100,
  },
};
const regex = {
  shortTitle: /\][ a-zA-Z0-9]{5,50}/,
  commitPrefix: /^(feat:)|(fix:)|(docs:)|(test:)/g,
};
const labels = {
  wip: ['wip'],
  working_in_progress: ['working in progress'],
};

module.exports = {
  danger, git, github,
  modified_files,
  pr, thisPR, api, issue,
  issues,
  body, title, changed_files, user, additions, deletions, assignees,
  owner, repo, number,
  isWIP, lastCommit, details, regex, labels
}

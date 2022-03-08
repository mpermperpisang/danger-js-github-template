const { details } = require( './general' );

const warnings = {
  wip: 'PR is classified as Working in Progress',
  lastCommit: 'Please check last commit message format.',
};

const failures = {
  tooShortTitle: 'Please add more words on PR title.',
  noLabel: 'Please add more tags on PR label.',
  excludeFilesChanged: `Please DO NOT change ${details.exclude.join(' or ')}`,
  tooMuchChanges: 'Big PR. Please break the PR changes.',
};

module.exports = {
  warnings, failures
}

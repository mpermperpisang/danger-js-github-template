const titleUpper = title.toUpperCase();
const isWIP = titleUpper.includes(labels.wip.toString().toUpperCase());
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

module.exports = {
  isWIP, details, regex
}

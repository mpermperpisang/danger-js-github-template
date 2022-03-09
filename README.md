# danger-js-github-template

### How to install
HTTP version - `npm i git+https://github.com/mpermperpisang/danger-js-github-template.git#master --save-optional`<br/>
SSH version - `npm i git+ssh://git@github.com:mpermperpisang/danger-js-github-template.git#master --save-optional`

### How to setup
1. Put this code in dangerfile.js of <b>your destination repo</b>.
```
// dangerfile.js

import {
  prTitle, prDesc, prAssignees, prLabels, prChangesCount, prCommits,
} from 'danger-js-github-template';

prTitle();
prDesc();
prAssignees();
prLabels();
prChangesCount();
prCommits();
```

2. <b>In local env</b>, we must export danger token in .bash_profile (or any profile you usually used)<br/>
`export DANGER_GITHUB_API_TOKEN=<your token here>`

### How to run
We can run danger rules in local or CI.<br/>

Run 1 of these commands in <b>your destination repo</b>:<br/>
In local env - `yarn danger pr <your pr/mr link here>`<br/>
In CI env - `yarn danger ci --failOnErrors`

### Contact
Email - mpermperpisang@gmail.com<br/>
Twitter - mpermperpisang

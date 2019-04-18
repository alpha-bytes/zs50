# ZS50 CLI

zs50 is a command line utility built on `node`. It is used to **declaratively generate and run anonymous Apex, and validate expected outcomes, against any authorized Salesforce org**. Assertions are declared in simple `yaml` configuration files.

Although zs50 was originally built to support users taking the Salesforce-focused [ZS50](https://alpha-bytes.github.io/zs50-content/) course (companion resource to Harvard's online `CS50`), the zs50 cli can utilize any properly-formatted yaml file to execute anonymous Apex and validate results. 

## Use Cases

The original intent of the cli was to create a "checker" for Salesforce development-related learning content. However, any flow where an end user provides implementation of pre-defined classes, and the outcome of those classes needs to be verified, can be implemented through zs50. 






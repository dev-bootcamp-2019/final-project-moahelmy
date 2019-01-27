# Bounty Nest

## Project Description

This app allows job poster to add bounties for hunter to resolve. Bounty hunters can pick any bounty and submit a resolution.

Disclaimer: Please notice that not all use cases supported in the UI but all handled in the contract.

## Use Cases

### Add New Bounty

As a job poster, user can create new bounty by providing description and reward. Job poster must pay value equals to the reward specified to be paid to the successful bounty hunter.

### Close Existing Bounty

Job poster might decide to close a bounty if it's still open and no successful submission added to it. When closed, the reward will be refunded to poster.

### Add Submission

Bounty hunter can add submissions for existing bounties. Their submission will be reviewed by the job poster.

### Accept Submission

Job poster can choose to accept a submission to one of their bounties. Upon acceptence the reward will be paid to the bounty hunter. The bounty itself will be marked as resolved.

At the moment, no more submissions can be added, however it should be better to leave it open and ask job poster to pay the reward to be hold for future submissions.

### Reject Submission

Job poster can choose to reject a submission.

## Notes for developers

## Prerequisites

- Solidity v5
- Truffle v5.0.1
- npm 3.5.2
- ganachi-cli
- Metamask

### Running tests

To migrate contracts to your local env. Make sure ganache is running the back-ground and run this command

> truffle migrate (Add --reset if not first run)

The app is truffle project, so developer can run all tests using:

> truffle test

Please notice contracts need to be migrated before running tests.

### Running the App

To run the web app just do the following

1. Migrate contracts
2. Copy the json files from build/contracts to client/src/contracts overriding its content.
3. Run the web server with npm or yarn
    > npm run start

This will open a new locahost:3000 tab in your browser.

## Author

Mohammad Mahmoud (as per gov. and Mohammad Helmy for most people)

- Twitter: [@moahelmy](https://twitter.com/moahelmy)
- Github: [moahelmy](https://github.com/moahelmy)
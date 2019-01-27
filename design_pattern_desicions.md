# Design Patterns

## Fail early and fail loud

All methods in the contract fail early as all preconditions are checked mostly in modifiers except for SimpleBank. In SimpleBank however all conditions are tested before applying the method logic. Failing loud complicated unit tests but it is better to let the caller know that his call has been failed.

## Restricting Access

Only owner of the contract can remove existing admins and only admins can add other admins. The plan was to use administrators to respond and resolve any deputes between bouty hunters and job posters. However, deputes feature is not implemented in the system.

Also, only job poster can close, accept or reject submissions to their bounties.

## Pull over Push Payments OR Withdraw pattern

This pattern was the reason behind adding SimpleBank to this project. The BountyNest inherits SimpleBank although it hides the enroll function to disallow users from using it in that purpose.

Instead of paying bounty hunter for example for successfull submission, hunter's balance is increased by the appropriate amount. Then the bounty hunter can withdraw his balance or part of it at any time.

## Circuit Breaker

Circuit Breaker is implemented in the main contract (Bounty Nest) to allow its owner to stop certain functionality like (adding new bounties, accept existing submissions or adding new submissions) when there is a bug or something wrong.

Circuit Breaker is implemented in separate contract and inherited by BountyNest.

Only owner can stop the contract or resume it.

## Upgradable Relay Pattern

I implemented the Relay pattern to allow upgrade. At the moment, the work is incomplete as the storeage need to be external rather than inherited.
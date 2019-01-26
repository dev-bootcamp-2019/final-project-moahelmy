# Avoiding Common Attacks

## Reentrancy

No calls has been done to any contracts. Even in payment the withdrawal pattern was used to avoid paying users directly.

## Integer Overflow and Underflow

All operations that involves calculations are tested against overflow. This includes:

- Deposit
- Transfer
- Withdraw

## DoS with (Unexpected) revert

This has been avoided by using withdrawal pattern to pay bounty hunters or refund job posters.

## Gas Limit DoS

No loops has been used in the system to avoid these kinds of attackes. Only mapping have been used to store data. For example, bounties created by posters are tracked and not filtered up on request. Same applies for bounties hunter's list of bounties.

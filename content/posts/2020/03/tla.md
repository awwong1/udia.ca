---
title: "TLA+"
date: 2020-03-04T15:11:22-07:00
draft: true
description: Notes and progress for learning TLA+ formal specification language. Extends the Practical TLA+ book (2018).
status: in-progress
tags:
  - personal
---

# Introduction

This post contains notes from learning [TLA+](https://en.wikipedia.org/wiki/TLA%2B), a formal specification language for designing, modelling, documenting, and verifying concurrent systems.
These notes created from [Practical TLA+](https://www.learntla.com/book/), a book targeted towards TLA+ beginners.

TLA+ is an acronym for [Temporal Logic of Actions](https://en.wikipedia.org/wiki/Temporal_logic_of_actions).

## Mathematics

| Human Semantics | `TLA+`   | Math     |
|-----------------|----------|----------|
| not             | `~`      | $\neg$   |
| and             | `/\ `    | $\wedge$ |
| or              | `\/`     | $\vee$   |
| in              | `\in`    | $\in$    |
| notin           | `\notin` | $\notin$ |
| True            | `T`      | $1$      |
| False           | `F`      | $0$      |

# Chapter 1

Use TLA+ to specify a bank wire transfer problem.

1. Each wire must occur between two different people in the bank and wire at least one dollar;
2. If the wire succeeds, value of the wire is deducted from the sender and added to the receiver;
3. If the wire fails, the two accounts are unchanged;
4. A wire may not cause an account to have a negative balance;
5. Multiple wires my occur simultaneously.


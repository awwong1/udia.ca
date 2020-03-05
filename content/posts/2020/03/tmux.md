---
title: "tmux"
date: 2020-03-05T14:50:35-07:00
draft: false
description: A brief overview and cheat sheet for the tmux terminal multiplexer program.
status: in-progress
tags:
  - linux
---

This post discusses [`tmux`](https://man.openbsd.org/OpenBSD-current/man1/tmux.1), a [terminal multiplexer](https://en.wikipedia.org/wiki/Terminal_multiplexer) for [Unix-like](https://en.wikipedia.org/wiki/Unix-like) operating systems. It allows multiple terminal sessions to be run simultaneously in a single window.
Other uses include executing remote commands in a session on a server through an SSH connection, disconnecting, and later returning to the session to see the command output.

Tmux is a rewrite of [GNU Screen](https://en.wikipedia.org/wiki/GNU_Screen).

# Cheat Sheet

## Session Control

| Session Control (from the command line) | Description |
|----------------------------------------:|-------------|
| `tmux` | Start a new session |
| `tmux new -s <session-name>` | Start a new session with the name chosen
| `tmux ls` | List all sessions |
| `tmux attach -t <target-session>` | Re-attach a detached session |
| `tmux attach -d -t <target-session>` | Re-attach a detached session (and detach it from elsewhere) |
| `tmux kill-session -t <target-session>` | Delete session |

## Pane Control
| Pane Control | Description |
|-------------:|-------------|
| `Ctrl b, "` | Split pane horizontally |
| `Ctrl b, %` | Split pane vertically |
| `Ctrl b, o` | Next pane |
| `Ctrl b, ;` | Previous pane |
| `Ctrl b, q` | Show pane numbers |
| `Ctrl b, z` | Toggle pane zoom |
| `Ctrl b, !` | Convert pane into a window |
| `Ctrl b, x` | Kill current pane |
| `Ctrl b, Ctrl O` | Swap panes |
| `Ctrl b, t` | Display clock |
| `Ctrl b, q` | Transpose two letters (delete and paste) |
| `Ctrl b, {` | Move to the previous pane |
| `Ctrl b, }` | Move to the next pane |
| `Ctrl b, Space` | Toggle between pane layouts |
| `Ctrl b, ↑` | Resize pane (make taller) |
| `Ctrl b, ↓` | Resize pane (make smaller) |
| `Ctrl b, ←` | Resize pane (make wider) |
| `Ctrl b, →` | Resize pane (make narrower) |

## Window Control

| Window Control | Description |
|---------------:|-------------|
| `Ctrl b, c` | Create new window |
| `Ctrl b, d` | Detach from session |
| `Ctrl b, ,` | Rename current window |
| `Ctrl b, &` | Close current window |
| `Ctrl b, w` | List windows |
| `Ctrl b, p` | Previous window |
| `Ctrl b, n` | Next window |

## Copy-Mode (vi)

| Copy-Mode (vi) | Description |
|---------------:|-------------|
| `Ctrl b, [` | Enter copy mode |
| `Ctrl b, G` | Bottom of history |
| `Ctrl b, g` | Top of history |
| `Ctrl b, Enter` | Copy selection |
| `Ctrl b, p` | Paste selection |
| `Ctrl b, k` | Cursor Up |
| `Ctrl b, j` | Cursor Down |
| `Ctrl b, h` | Cursor Left |
| `Ctrl b, l` | Cursor Right |

## Copy-Mode (Emacs)

| Copy-Mode (Emacs) | Description |
|------------------:|-------------|
| `Ctrl b, [` | Enter copy mode |
| `Ctrl b, M-<` | Bottom of history |
| `Ctrl b, M->` | Top of history |
| `Ctrl b, M-m` | Back to indentation |
| `Ctrl b, M-w` | Copy selection |
| `Ctrl b, M-y` | Paste selection |
| `Ctrl b, Ctrl g` | Clear selection |
| `Ctrl b, M-R` | Cursor to top line |
| `Ctrl b, M-r` | Cursor to middle line |
| `Ctrl b, ↑` | Cursor Up |
| `Ctrl b, ↓` | Cursor Down |
| `Ctrl b, ←` | Cursor Left |
| `Ctrl b, →` | Cursor Right |

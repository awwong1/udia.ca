---
title: "Useful SSH"
date: 2020-01-29T10:06:38-07:00
draft: false
description: A collection of some secure shell commands, tips, and tricks.
status: in-progress
tags:
  - ssh
---

# Introduction

[Secure Shell (SSH)](https://en.wikipedia.org/wiki/Secure_Shell) is a cryptographic network protocol for remote system administration and file transfers.
This document will summarize a collection of useful SSH commands that I use regularly.
All commands assume that you are using the OpenSSH SSH client.

```bash
$ ssh -V
OpenSSH_7.9p1 Debian-10+deb10u1, OpenSSL 1.1.1d  10 Sep 2019
```

# Basic SSH + Config

The most common use case for `ssh` is logging into and executing commands on a remote machine.

```bash
# login to a server (tilde.town) as the user (udia)
ssh udia@tilde.town
```

For ease of use, a user defined configuration file can be created: `~/.ssh/config`.

```text
host tilde
    HostName tilde.town
    User udia
```

Now, to log into the remote server, the command is simpler.
```bash
ssh tilde
```

## Secure SSH-Keygen

To avoid entering in your password each time you want to remote in, an ssh key can be used instead. First, generate a secure ssh key.

```bash
# generating a secure SSH key
ssh-keygen -f ~/.ssh/id_ed25519 -t ed25519 -C alex@udia.ca
```
```text
Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/alexander/.ssh/id_ed25519.
Your public key has been saved in /home/alexander/.ssh/id_ed25519.pub.
The key fingerprint is:
SHA256:b6mJRRWu5gqrM9ncOjV5uA7Bhi7qaOshyMwf0Mhcjzo alex@udia.ca
The key's randomart image is:
+--[ED25519 256]--+
|          .      |
|         . .     |
|   .      o      |
|o +oo    o       |
| =.o+. oS        |
|=.o. .=+.. .     |
|+E.=oo +o +      |
|+oB =+o+ +       |
|*+o=o++ o        |
+----[SHA256]-----+
```

Now, put the contents of the `*.pub` file into the remote server's `~/.ssh/authorized_keys` file.
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub udia@tilde.town
# alternatively manually copy and paste the contents
cat ~/.ssh/id_ed25519.pub
# paste into ~/.ssh/authorized_keys
```

To ensure that the key files are kept permanently, they can be added in the `~/.ssh/config` file. It is a good idea to make the keys specific to the host, otherwise all keys will be tried against the server each time an ssh connection is attempted.

```text
host tilde
    HostName tilde.town
    User udia
    IdentityFile ~/.ssh/id_ed25519
```

## Reverse SSH Tunnel

If a linux server is behind a NAT and a firewall, a reverse SSH tunnel may be a solution.
This example uses three machines, a **local** that you are currently using, a **destination** that you are trying to connect to, and a **middle** that both local and destination can SSH into.

On the destination computer, type the following command replacing **middleuser** with the middle machine's username and **middle** with the domain of the middle machine.

```bash
# on destination
ssh -R 36446:localhost:22 middleuser@middle
```

Port 36446 will be opened for listening and will forward future connections to port 22.
Now, to access the destination computer, you can connect using the following command:
```bash
# on local
ssh destinationuser@middle -p 36446
# alternatively, ssh into the middle machine...
ssh middleuser@middle
# then from the middle machine ssh into the destination machine
ssh destinationuser@localhost -p 36446
```

The sample port of 36446 is arbitrary.
Any open and available port can be used instead.

### Persistent Reverse SSH Tunnel

This is a quick shell script for running a reverse tunnel. It can be used in combination with `cron` and `run-one`.

```sh
#!/bin/sh
# rtun.sh

OUTPUT="/path/to/log/file.log"
TUN_PORT=8022

ssh -E ${OUTPUT} -o ExitOnForwardFailure=yes -R ${TUN_PORT}:127.0.0.1:22 -N remote_server >> $OUTPUT 2>&1
```

```cron
# m h  dom mon dow   command
* * * * * run-one rtun.sh
```

## Firefox SOCKS Proxy Tunnel

If you want to browse the internet as if you are another machine, one method is to use a [SOCKS proxy](https://en.wikipedia.org/wiki/SOCKS) tunnel.
This is particularly useful if you want to access a Jupyter lab or notebook that is running on another server locally.

```bash
# on local
ssh -D 8123 -C -q -N researcher@researchmachine
```

Within Firefox, go to `Preferences > Network Settings`. Under the category `Configure Proxy Access to the Internet` select `Manual proxy configuration`.

* SOCKS Host: `localhost`
* Port: `8123`
* SOCKS v5: `true`

Now, when browsing the internet in Firefox, you are proxied through your remote server through SOCKS.
The port number 8123 is arbitrary and can be any available, free port.

## Unresponsive SSH Session

Occasionally, the SSH session will become unresponsive while you are connected remotely.
You can use the ssh escape sequence `~.` to close the SSH session without closing the terminal window.

---
title: "Server Quality of Life"
date: 2020-05-28T20:28:03-06:00
draft: false
description: Manual configuration for the setup of new linux servers.
status: in-progress
tags:
  - personal
  - linux
---

Similar to the [Workspace Quality of Life](/posts/2020/03/workspace_qol) document that I created, I decided to write a similar document for manual configurations of new linux servers.
The following contains some utility scripts and hardening practices.

Although multiple tools exist for programmatic provisioning of virtual machines and infrastructure, this document will rely primarily on manual configuration using `ssh`.

# Initial Server Setup

For servers, I typically use a combination of [Ubuntu](https://ubuntu.com/) and [Debian](https://www.debian.org/), opting to use the stable or long term support variants.
The following setup instructions are intended for [Rapid Access Cloud (RAC)](https://www.cybera.ca/services/rapid-access-cloud/) but can be tooled for other cloud virtual machine providers with minimal changes.
These following instructions should be applicable to both operating systems, but assume Ubuntu, as the Debian image is not provided by default through RAC.
The [documentation from Cybera](https://wiki.cybera.ca/display/RAC/Rapid+Access+Cloud) is excellent and serves as a useful starting point for working with these virtual machines.

## Security Groups

The [quickstart default security group settings](https://wiki.cybera.ca/display/RAC/Rapid+Access+Cloud+Guide%3A+Part+1#RapidAccessCloudGuide:Part1-Modifythedefaultsecuritygroup) are modified slightly to lockdown inbound SSH to trusted IP addresses only.

| Direction | Ether Type | IP Protocol | Port Range | Remote IP Prefix | Remote Security Group | Notes |
|-----------|------------|-------------|------------|------------------|-----------------------|-------|
| Egress | IPv6 | Any | Any | ::/0 | - | No restrictions on outbound traffic. |
| Egress | IPv4 | Any | Any | 0.0.0.0/0 | - | |
| Ingress | IPv4 | ICMP | Any | 0.0.0.0/0 | - | Allow all incoming Internet Control Message Protocol traffic (ex: `ping`) |
| Ingress | IPv6 | ICMP | Any | ::/0 | - | |
| Ingress | IPv4 | TCP | 22 (SSH) | `home_residential_ip`/0 | - | |
| Ingress | IPv4 | TCP | 22 (SSH) | `rac_instance_private_ipv4`/0 | - | |
| Ingress | IPv6 | TCP | 22 (SSH) | `rac_instance_private_ipv6`/0 |

## Basic Hardening and Server Utility Scripts

Hardening is a practice of security to reduce the vulnerability of a system.
Various [approaches for hardening](https://linux-audit.com/linux-server-hardening-most-important-steps-to-secure-systems/) exist and may depend on the tasks that the server will be used to perform.
Here are some of the common minimal steps that are done on my servers.

I use the default Cybera cloud image helper scripts that are provided in each new Ubuntu 18.04 instance.
These scripts can be ported to other cloud providers and on-site Linux systems.

### Enabling Automatic Updates

```bash
cat /usr/local/bin/enableAutoUpdate
```
```bash
#! /bin/bash

if [ -f /etc/debian_version ]; then

    # Enable Automatic Security Updates
    sudo apt-get update
    sudo apt-get install -y unattended-upgrades

    echo """
    APT::Periodic::Update-Package-Lists "1";
    APT::Periodic::Unattended-Upgrade "1";
    """ | sudo tee /etc/apt/apt.conf.d/20auto-upgrades

    echo "To disable Auto Security Updates - delete /etc/apt/apt.conf.d/20auto-upgrades"

elif [ -f /etc/redhat-release ]; then
    # Enable Auto Updates
    sudo yum updateinfo
    # Work around CentOS package bug
    sudo yum update -y yum
    sudo yum -y install yum-cron

    echo """
    update_cmd = security
    apply_updates = yes
    random_sleep = 360
    [emitters]
    system_name = None
    emit_via=stdio
    output_width=80
    [base]
    debuglevel = -2
    mdpolicy = group:main
    """ | sudo tee /etc/yum/yum-cron.conf

    sudo service yum-cron start

    echo "Automatic Security Updates Have Been Enabled."
fi
```

### Create New User with Root Privileges

A new user account should be created and used instead of the default `root` or `ubuntu` VM user. The following will use my first name as the new user.
Follow the prompts to create the UNIX password and optionally enter user information like.

```bash
# requires root
adduser alexander
```
```text
Adding user `alexander' ...
Adding new group `alexander' (1001) ...
Adding new user `alexander' (1001) with group `alexander' ...
Creating home directory `/home/alexander' ...
Copying files from `/etc/skel' ...
Enter new UNIX password: 
Retype new UNIX password: 
passwd: password updated successfully
Changing the user information for alexander
Enter the new value, or press ENTER for the default
        Full Name []: Alexander Wong
        Room Number []: 
        Work Phone []: 
        Home Phone []: 
        Other []: 
Is the information correct? [Y/n]
```
```bash
# add this new user to the `sudo` group
# requires root
gpasswd -a alexander sudo
```

We want to use this user for secure shell and linux server maitainance operations with the server. Generate a local SSH key and add install it in the `/home/alexander/.ssh/authorized_keys` file.
Refer to the [Useful SSH](/posts/2020/01/useful_ssh.md#secure-ssh-keygen) section for further instructions.

### Configure SSH Daemon

Backup the SSH daemon configuration file located at `/etc/ssh/sshd_config` before making any changes.
Calling the SSH daemon with the *extended test mode* flag `-T` will show the configuration details.

```bash
# show the current SSH daemon settings
sshd -T
```
```text
...
ignorerhosts yes
x11forwarding no
usedns yes
permitemptypasswords no
maxauthtries 3
pubkeyauthentication yes
passwordauthentication no
permitrootlogin no
```

The following baseline settings are applied to my `/etc/ssh/sshd_config` file.

```text
X11Forwarding no
IgnoreRhosts yes
UseDNS yes
PermitEmptyPasswords no
MaxAuthTries 3
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin no
```

Reload the SSH daemon and run the *test mode* flag `-t` to ensure that no errors exist. Perform a sanity check by `ssh`ing into the server with the new settings.

```bash
# requires root
systemctl reload ssh.service
sshd -t   # no output should appear
```

### Change the Message of the Day

I like to use my logo as [motd](https://en.wikipedia.org/wiki/Motd_(Unix)).
Contents of this file are shown to all users prior to executing the login shell.

```bash
cat /etc/motd
```
```text
UDIA
                 ╓▄██▄▄
             ,▄██▀┘  ╙▀██▄ç
         ,▄██▀▀          ╙▀██▄,
      ▄▄█▀▀`                 ▀▀██▄
    ██▀└                         ▀██
    ██              ║█            ║█
    ██       ;▄██   █▌ ██▄ç       ║█
    ██   ;▄████▀╙  ▐█⌐ ╙▀▀███▄µ   ║█
    ██   ███▄      ██      ▄███⌐  ║█
    ██    ▀▀███▄▄  █▌  ▄▄███▀▀¬   ║█
    ██        ▀▀█ ██   █▀▀¬       ║█
    ██            █▌              ║█
    ▀█▄▄                        ▄▄██
      └▀██▄▄                ╓▄██▀┘
          ╙▀██▄ç        ;▄██▀└
              ╙▀██▄┌,▄██▀▀
                  ▀▀▀▀

```

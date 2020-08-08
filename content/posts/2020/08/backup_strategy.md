---
title: "Backup Strategy"
date: 2020-08-07T14:00:26-06:00
draft: false
description: What are the high priority things that must be backed up? What is the backup and restoration strategy for these items?
status: in-progress
tags:
  - personal
  - linux
---

This document outlines a process for the backup and restoration of critical files necessary for maintaining my identity and online presence.

# Motivation

I want to maintain a process for storing copies of sensitive data, ensuring that it is backed up to a set of locations, and how to retrieve this data should it be deemed necessary.
I tend to avoid proprietary solutions, opting for strategies that are open source and audited.

I like the idea of having a 3-2-1 backup strategy, popularized by [multiple](https://www.acronis.com/en-us/articles/backup-rule/) [sources](https://www.veeam.com/blog/how-to-follow-the-3-2-1-backup-rule-with-veeam-backup-replication.html) [on](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/) [the](https://www.carbonite.com/blog/article/2016/01/what-is-3-2-1-backup/) [internet](https://www.nakivo.com/blog/3-2-1-backup-rule-efficient-data-protection-strategy/).
It is defined by having **three copies** of your data. **two copies** of the data is stored on different storage media, while **one copy** of the data is located offsite.
I will use this principle as the minimum set, as multiple copies may exist elsewhere.

## High Priority Items

I have two vital repositories of data that I use regularly. These are the most important items to backup, as losing access to either of these would result in a devastating loss of my online self.

1. [Bitwarden](https://bitwarden.com/), namely I self host a local copy of [bitwarden_rs](https://github.com/dani-garcia/bitwarden_rs) which I use to store the bulk of my credentials.
Bitwarden has a promising commitment to security, [with multiple 3rd party audits](https://bitwarden.com/blog/post/bitwarden-network-security-assessment-2020/) and and a reputable [bug bounty program](https://hackerone.com/bitwarden).
  - This application is accessed through a Firefox extension. A local copy of the password vault is stored in the web browser, while the self-hosted instance resides on my home server.

2. [Aegis](https://getaegis.app/), an [open source](https://github.com/beemdevelopment/Aegis) Android application that manages my two factor authentication codes.
Their security documentation is outlined [here](https://github.com/beemdevelopment/Aegis/blob/master/docs/vault.md) with signed releases available on both the Google Play and F-Droid app stores.
    - This application has the additional challenge as it exists on my cellphone, an unrooted Pixel 3.
    - Currently my backup solution is to set an reminder in my calendar to connect my phone to my laptop, manually export the encrypted vault file, and treat it as any regular file.

I also have other, simpler files that I backup and/or rotate regularly, including:

- GPG & SSH keys
- Media (lower priority, I've fallen victim to Google convenience applications)
- Source code (lower priority, as backed up by multiple git remotes)

## Backup Locations

I will have three locations that I backup regularly to.

1. A local raspberry pi NAS, USB external storage attachment
2. Cybera RAC's S3 Object Storage (OpenStack Swift)
3. Backblaze B2 Cloud Storage

Including the existing, primary copy that will be actively used (such as my laptop and mobile phone), the 3-2-1 backup strategy is achieved.

Additional cold storage backups exist, which are updated less frequently.

## Backup Software

### Restic

My backup software is [Restic](https://restic.net/), an [open source](https://github.com/restic/restic) program that has been actively developed since 2015.
It is also available in the official Debian repositories through `apt`.
So far, it offers the easiest/frictionless way to save and restore files to multiple backends.

```bash
# Initialization of remote repositories example
# https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html

# Bitwarden (on server, local copies in Bitwarden extensions)
restic -r swift:personal_backup:/bitwarden init
restic -r b2:udia-personal-backup:/bitwarden init

# Priority File Store (on user facing devices, like laptop)
# Holds misc. files, like the encrypted Aegis vault
restic -r sftp:pi:/media/slim/restic_repos/priority_files init
restic -r swift:personal_backup:/priority_files init
restic -r b2:udia-personal-backup:/priority_files init
```

To backup, the following commands should be run.
It may be convenient to use the `--password-file` option or set an environment variable using `export RESTIC_PASSWORD="<secret>"`.

```bash
# Bitwarden Backup (on server)
restic -r swift:personal_backup:/bitwarden --verbose backup /media/slim/bitwarden_rs/
restic -r b2:udia-personal-backup:/bitwarden --verbose backup /media/slim/bitwarden_rs/

# Priority File Store Backup
restic -r sftp:pi:/media/slim/restic_repos/priority_files --verbose backup ~/Documents/backup/
restic -r swift:personal_backup:/priority_files --verbose backup ~/Documents/backup/
restic -r b2:udia-personal-backup:/priority_files --verbose backup ~/Documents/backup/
```

To restore, simply use the restic restore command, passing in the appropriate repository.

```bash
restic -r restic -r sftp:pi:/media/slim/restic_repos/priority_files restore latest --target /tmp/restore-art
```

## Future Improvements

Currently, this is a manual process that I need to repeat on a set interval, or when I make changes to my login credentials.

It would be nice to automate this using something like [`anacron`](https://linux.die.net/man/8/anacron), however I don't like the existing solutions for storing the restic repository passwords to file (if not plaintext, it will require another tool like GPG, which defeats the purpose).

Additionally, some of the priority files that I would like to save are involved to extract, as the Aegis vault requires me to enter the app and export the file manually through the app options.

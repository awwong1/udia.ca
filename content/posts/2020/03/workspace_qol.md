---
title: "Workspace Quality of Life"
date: 2020-03-23T10:02:22-07:00
draft: false
description: Notes and configuration for developer laptop settings. Keeping track of some of preferences (when setting up a new laptop from scratch).
status: in-progress
tags:
  - personal
  - linux
---

The following are some quick lessons learned from setting up a Linux developer laptop from scratch. These points are my own personal preferences, intended to be a reference for when I have to do this again.

# Personal Computing Operating System, Desktop Environment, Hardware

I really enjoy using [Debian](https://www.debian.org/) with [KDE Plasma](https://kde.org/).
My personal computing devices use the Testing/Unstable distributions.
~~Currently, I am using a MacBook Pro (13-inch, Early 2015) as my hardware.~~
I am in the process of switching my daily driver to a Lenovo C740, running Debian Buster.

Aside: I have had a relatively positive experience with the Dell XPS13 9360. Unfortunately a capacitor popped rendering the screen unusable. That laptop served me for roughly two years (May 2018 - Mar 2020), so I am slightly disappointed with its durability/longevity.

## KDE Additional Setup (System Settings)

* Desktop Behavior > Virtual Desktops > 
    * Desktops > Layout > Number of desktops: `4`
    * Switching > Desktop Switching
        * Switch One Desktop to the Left: `Meta+Shift+Left`
        * Switch One Desktop to the Right: `Meta+Shift+Right`
        * Desktop Switch On-Screen Display: `True`
            * Duration: `500 msec`
            * Show desktop layout indicators: `True`


* Hardware > Input Devices
    * Taps > Mouse Click Emulation: `True`
    * Scrolling > Reverse scrolling: `True`

* Shortcuts >
    * Global Shortcuts > System Settings
        * Window One Desktop to the Left: `Meta+Alt+Shift+Left`
        * Window One Desktop to the Right: `Meta+Alt+Shift+Right`
        * Make Window Fullscreen: `Meta+Shift+PgUp`
        * Maximize Window: `Meta+PgUp`
        * Minimize Window: `Meta+PgDown`
    * Custom Shortcuts > Screenshots
        * Take Full Screen Screenshot: `Meta+#` (`Meta+Shift+3`)
        * Take Rectangular Region Screenshot `Meta+$` (`Meta+Shift+4`)
        * Take Active Window Screenshot: `Meta+Shift+Space`

## Default Applications

* Browser: [Firefox](https://www.mozilla.org/en-US/firefox/new/)
    * `about:config` > `ui.systemUsesDarkTheme`: 1
* Mail: [Thunderbird](https://www.thunderbird.net/en-US/)
    * [Enigmail](https://addons.thunderbird.net/en-US/thunderbird/addon/enigmail/)
    * Optional: Remove KMail `sudo apt remove kmail`
* Text Editor: [vim](https://www.vim.org/)
* Code Editor: [Visual Studio Code](https://code.visualstudio.com/) 

### Linking to Binaries

Example uses for [the latest stable Firefox binary](https://www.mozilla.org/en-US/firefox/).

1. Decompress the archives into `/opt` for system-wide installation, or `~/opt` for the current user only.
2. Create a file `firefox-stable.desktop` (replace `stable` with `beta`/`nightly`,) in the:
    - `/usr/share/applications` directory for system-wide installation
    - `~/.local/share/applications` directory for current user installation

```text
[Desktop Entry]
Name=Firefox Stable
Comment=Web Browser
Exec=/opt/firefox/firefox %u
Terminal=false
Type=Application
Icon=/opt/firefox/browser/chrome/icons/default/default128.png
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;application/xml;application/vnd.mozilla.xul+xml;application/rss+xml;application/rdf+xml;image/gif;image/jpeg;image/png;x-scheme-handler/http;x-scheme-handler/https;
StartupNotify=true
```

Update the paths accordingly.

## GNU Privacy Guard

```text
gpg (GnuPG) 2.2.12
libgcrypt 1.8.4
Copyright (C) 2018 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: /home/alexander/.gnupg
Supported algorithms:
Pubkey: RSA, ELG, DSA, ECDH, ECDSA, EDDSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2
```

Retrieve the cold storage private keys and import them: `gpg --import Alexander\ William\ Wong\ \(0FC4B4EE\)\ –\ Secret.asc`
```text
gpg: key 0F8D1FA50FC4B4EE: public key "Alexander William Wong (Master)" imported
gpg: key 0F8D1FA50FC4B4EE: "Alexander William Wong (Master)" not changed
gpg: key 0F8D1FA50FC4B4EE: secret key imported
gpg: Total number processed: 2
gpg:               imported: 1
gpg:              unchanged: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
```

You should have the following: `gpg --list-keys --with-keygrip`
```text
/home/alexander/.gnupg/pubring.kbx
----------------------------------
pub   rsa4096 2018-04-05 [SC]
      48797A6E15706026C51E9CF50F8D1FA50FC4B4EE
      Keygrip = DE7933342CF50A95030CCD4FD0A0E9C7649E4816
uid           [ unknown] Alexander William Wong (Master)
uid           [ unknown] Alexander Wong <admin@alexander-wong.com>
uid           [ unknown] Alexander Wong <alex@udia.ca>
uid           [ unknown] Alexander Wong <alex.wong@ualberta.ca>
uid           [ unknown] Alexander Wong <alexander.wong@ualberta.ca>
uid           [ unknown] Alexander Wong <admin@udia.ca>
uid           [ unknown] Alexander Wong <awwong1@ualberta.ca>
sub   rsa4096 2018-04-05 [E]
      Keygrip = 56A194F4FD9EF161B0DC7EC41B5ED7A268C31E5A
sub   rsa4096 2018-04-05 [S] [expires: 2022-04-05]
      Keygrip = 729B0B7AE008371B33F6862279D3BD8EACB1C811
sub   rsa4096 2018-04-05 [E] [expires: 2022-04-05]
      Keygrip = 799803C46EB10274E0D775F18CF63F4C59EF7DF2
```

Remove the private master encryption key from the keyring:
`gpg --edit-key alex@udia.ca`

```text
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa4096/0F8D1FA50FC4B4EE
     created: 2018-04-05  expires: never       usage: SC  
     trust: unknown       validity: unknown
sub  rsa4096/F50CB8DC10476CA6
     created: 2018-04-05  expires: never       usage: E   
ssb  rsa4096/E90E5D6448C2C663
     created: 2018-04-05  expires: 2022-04-05  usage: S   
ssb  rsa4096/833AEEDFD24FC81E
     created: 2018-04-05  expires: 2022-04-05  usage: E   
[ unknown] (1). Alexander William Wong (Master)
[ unknown] (2)  Alexander Wong <admin@alexander-wong.com>
[ unknown] (3)  Alexander Wong <alex@udia.ca>
[ unknown] (4)  Alexander Wong <alex.wong@ualberta.ca>
[ unknown] (5)  Alexander Wong <alexander.wong@ualberta.ca>
[ unknown] (6)  Alexander Wong <admin@udia.ca>
[ unknown] (7)  Alexander Wong <awwong1@ualberta.ca>

gpg> key 1      # selects the key that does not have expiry date
gpg> delkey     # delete the key
gpg> trust      # set own key to ultimate trust
gpg> passwd     # modify the password from cold-storage password to something more friendly
gpg> save
```

This key should now be removed from the private keyring. Remove the cold storage and appropriate files.

### Enigmail Preferences

* Compatibility
    * Enigmail Junior Mode: `Force using S/MIME and Enigmail`
    * OpenPGP Compatibility: `Lookup keys on server automatically`
* Basic
    * Passphrase Timeout: `43200` minutes

---
title: "Rooting a Pixel 3 with OTA"
date: 2020-08-26T15:49:30-06:00
draft: false
description: How do you root a Google Pixel 3 phone consistently, while maintaining support for over the air (OTA) security updates?
status: in-progress
tags:
  - personal
  - linux
---

This document will outline the steps that I took to root my Google Pixel 3 phone.
It is a combination of multiple tutorials, with minor adaptations to address some issues during the root process.

# Original Tutorials

- [How to Unlock the Bootloader and Root the Google Pixel 3 with Magisk](https://www.xda-developers.com/google-pixel-3-unlock-bootloader-root-magisk/)
    - Rooting the Phone instructions from this site were very helpful!
- [Magisk OTA Upgrade Guides](https://topjohnwu.github.io/Magisk/ota.html)

-----

**Make sure to backup your device!**
Unlocking the bootloader will wipe all user data from the device.
Save all important data to a remote location before proceeding.

------

# Prerequisites

You should have [Android Debug Bridge (adb)](https://developer.android.com/studio/command-line/adb) installed.
I used the packages provided with [Android Studio](https://developer.android.com/studio/) and configured my path accordingly.

```bash
adb --version
# Android Debug Bridge version 1.0.41
# Version 30.0.4-6686687
# Installed as /home/alexander/Android/Sdk/platform-tools/adb

fastboot --version
# fastboot version 30.0.4-6686687
# Installed as /home/alexander/Android/Sdk/platform-tools/fastboot
```

# Rooting the Phone

> I was only able to root my phone with the Android 9 Pie OS. Using Android 10, the rooting process was unsuccessful (with or without twrp)!

## Unlock the Bootloader

1. Open the **Settings** app.
2. Go to **About phone**.
3. Tap on the **Build number** menu item until a message appears saying that you are now a developer.
4. Go back one page and open the **System** > **Developer options** menu.
5. Enable the **OEM unlocking** option.
6. Enable the **USB debugging** option.
7. Plug your phone into your computer and **ensure that the device is detected** with `adb devices`.
    ```bash
    $ adb devices
    # List of devices attached
    # 8A4X0LMZF       device
    ```
8. **Reboot the phone to the bootloader menu**.
You can hold the power and volume down buttons while booting up your phone, or alternatively run the command:
    ```bash
    adb reboot bootloader
    ```
9. In the bootloader menu, use the `fastboot` command to **unlock the bootloader**.
    ```bash
    fastboot flashing unlock
    ```
10. Some text on your phone should now display potential risks of unlocking the bootloader.
Continue unlocking the bootloader by **pressing the volume up key** until it says *Unlock the bootloader*. **Press the power button to confirm**.
11. The bootloader will unlock and reboot back to the bootloader menu. A red warning icon and *unlocked* text will appear.
12. Reboot the phone back to the Android operating system by running the command:
    ```bash
    fastboot reboot
    ```
13. Your phone now has an unlocked bootloader!
You will see a warning message that your phone is unlocked on every boot.
This is something that cannot be removed or hidden.

## Downgrade to Android 9 (Pie)

You can skip this step if your phone is already running Android 9.

1. Since the device is wiped, re-enable **Developer Options** and **USB Debugging**. Ensure that the device is still recognized by the computer through `adb`.
2. Reboot the phone back into the bootloader menu.
3. Download an Android 9 factory image from the [Google image repository, "blueline" for Pixel 3](https://developers.google.com/android/images#blueline)
I used [9.0.0 (PQ3A.190801.002, Aug 2019)](https://dl.google.com/dl/android/aosp/blueline-pq3a.190801.002-factory-f3d66c49.zip) as it was the latest Android 9 image, all newer images belonging to Android 10.
    ```bash
    # Download the factory image archive
    wget https://dl.google.com/dl/android/aosp/blueline-pq3a.190801.002-factory-f3d66c49.zip

    # Ensure the checksum matches the google provided value.
    # f3d66c498994c7ca8c63a97f74bbd2634db7f91e1e114e7924cb721a149ddd2b
    sha256sum blueline-pq3a.190801.002-factory-f3d66c49.zip 
    ```
4. Unzip the verified archive and run the `flash-all.sh` script to downgrade your device.
    ```bash
    unzip blueline-pq3a.190801.002-factory-f3d66c49.zip
    cd blueline-pq3a.190801.002
    # Begin the flash process
    ./flash-all.sh
    ```
5. Your device is now downgraded to Android 9. Proceed to rooting the phone using [Magisk](https://github.com/topjohnwu/Magisk) and [TWRP](https://www.xda-developers.com/how-to-install-twrp/).

## Using TWRP to install Magisk

[TWRP](https://www.xda-developers.com/how-to-install-twrp/) is a custom recovery that allows you to use the Magisk installer script.
You will not need to install TWRP, as after upgrading to Android 10, TWRP will no longer function.
[Magisk](https://github.com/topjohnwu/Magisk) is a suite of open source tools for in-depth Android customization that provides root access, functionality to modify read-only file systems on your device, and basic root hiding functionality and system integrity check spoofing.

1. Re-enable **Developer Options** and **USB Debugging**, ensuring that the computer can recognize the device through `adb`.
2. Download the TWRP image (`.img` file) for the Google Pixel 3 from the [TWRP blueline repository](https://dl.twrp.me/blueline/).
I used the latest `twrp-3.3.0-0-blueline.img` with no issues.
The twrp team forbids linking directly to files, and [must be accessed through their HTML pages](https://dl.twrp.me/blueline/twrp-3.3.0-0-blueline.img.html).
Verify the checksums and PGP signatures.
3. Download the latest Magisk release and sync it to the phone.
I used [Magisk-v20.4.zip](https://github.com/topjohnwu/Magisk/releases/tag/v20.4).

    ```bash
    # Sync the Magisk file to the phone's Download folder
    adb push Magisk-v20.4.zip /sdcard/Download/Magisk-v20.4.zip
    ```

3. Reboot your phone to the bootloader menu.
4. Once the phone is on the bootloader screen, **temporarily boot into TWRP** using the TWRP boot image:
    ```bash
    fastboot boot twrp-3.3.0-0-blueline.img
    ```
5. Your phone should exit the bootloader menu and reboot to TWRP recovery.
If this step fails, **double check that you are running Android 9.**
6. Tap on Install.
7. Find the `Magisk-v20.4.zip` file saved in the Download folder. Tap on it and use the slider to install it.
8. Reboot back to the OS and check the status of the root by opening up Magisk Manager.

## Installing OTA Updates

These instructions are taken directly from the [Magisk OTA Upgrade Guides](https://topjohnwu.github.io/Magisk/ota.html).

It is reccomended to disable the switch for **Automatic system updates** within **Developer Options** so OTA updates will not install without your acknowledgement.

When an OTA is available:

1. Open up **Magisk Manager**.
2. Select **Uninstall**.
3. Select **Restore Images**.
4. **Do not reboot or you will have Magisk uninstalled.** This will restore partitions modified by Magisk back to stock from backups made at install in order to pass the pre-OTA block verifications.
5. Apply the OTA update as you would normally (**Settings** > **System** > **System Update**).
6. After the installation finishes, **do not press the "Restart Now" or "Reboot" button!** Instead, go to **Magisk Manager**, select **Install**, and **Install to Inactive Slot**.
7. Reboot when prompted by Magisk Manager. Your phone should now be updated to the latest OTA and you should still have root.

# Asides

There are a few tutorials online suggesting that Magisk can be installed directly on an Android device running Android 10 by having Magisk patch an Android 10 image prior to flashing.
These tutorials have not worked for me.

TWRP is not supported on Android 10 so therefore does not need to be installed on the device.

Enable the Magisk Manager **Systemless hosts**, **Magisk Hide** functions in the settings.

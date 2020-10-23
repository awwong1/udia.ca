---
title: "Rooting a Pixel 3 with OTA"
date: 2020-08-26T15:49:30-06:00
draft: false
description: How do you root a Google Pixel 3 phone consistently, while maintaining support for over the air (OTA) security updates?
status: complete
tags:
  - personal
  - linux
---

_EDIT 2020-01-23_: Despite having Android 11 and automatic updates disabled, my phone suddenly lost the capacity for undetected root (`ctsProfile: False`, `evalType: Hardware`).
I have updated the guide to use [[ROM][Pixel 3][10.0.0_r41] PixelDust CAF Android 10 for blueline [7 Aug 2020]](https://forum.xda-developers.com/pixel-3/development/rom-pixeldust-caf-android-10-blueline-t4103707) and included step by step instructions below.

This document will outline the steps that I took to root my Google Pixel 3 phone.
It is a combination of multiple tutorials, with minor adaptations to address some issues during the root process.

# Original Tutorials

- [[ROM][Pixel 3][10.0.0_r41] PixelDust CAF Android 10 for blueline [7 Aug 2020]](https://forum.xda-developers.com/pixel-3/development/rom-pixeldust-caf-android-10-blueline-t4103707)
- (old) [How to Unlock the Bootloader and Root the Google Pixel 3 with Magisk](https://www.xda-developers.com/google-pixel-3-unlock-bootloader-root-magisk/)
    - Rooting the Phone instructions from this site were very helpful!
- (old) [Magisk OTA Upgrade Guides](https://topjohnwu.github.io/Magisk/ota.html)

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

## Downgrade to Android 10 (Oreo)

You **must have a recent factory image flashed** prior to installing the rom.

1. Since the device is wiped, re-enable **Developer Options** and **USB Debugging**. Ensure that the device is still recognized by the computer through `adb`.
2. Reboot the phone back into the bootloader menu.
3. Download an Android 9 factory image from the [Google image repository, "blueline" for Pixel 3](https://developers.google.com/android/images#blueline)
I used [10.0.0 (QQ3A.200805.001, Aug 2020)](https://dl.google.com/dl/android/aosp/blueline-qq3a.200805.001-factory-1ba5d2c2.zip) as it was the latest Android 10 image, all newer images belonging to Android 11.
    ```bash
    # Download the factory image archive
    wget https://dl.google.com/dl/android/aosp/blueline-qq3a.200805.001-factory-1ba5d2c2.zip

    # Ensure the checksum matches the google provided value.
    # 1ba5d2c20f71e46f08a0ae05bc2b478c3e4b3641ec661e9fdb0b8e7ec4df6a22
    sha256sum blueline-qq3a.200805.001-factory-1ba5d2c2.zip 
    ```
4. Unzip the verified archive and run the `flash-all.sh` script to downgrade your device.
    ```bash
    unzip blueline-qq3a.200805.001-factory-1ba5d2c2.zip
    cd blueline-qq3a.200805.001
    # Begin the flash process
    ./flash-all.sh
    ```
5. Your device is now running stock Android 10. Proceed to flashing the PixelDust ROM.

## Flashing the PixelDust ROM

1. Re-enable **Developer Options** and **USB Debugging**, ensuring that the computer can recognize the device through `adb`.
2. Download the PixelDust Boot Image and the PixelDust CAF Android 10 images from the [XDA-Forums links section](https://forum.xda-developers.com/pixel-3/development/rom-pixeldust-caf-android-10-blueline-t4103707).
    - I used the [boot_caf_2020_5.img](https://sourceforge.net/projects/pixeldustproject/files/ota/blueline/boot_caf_2020_5.img/download) and [pixeldust_blueline-ota-retrofit-0b6310662f.zip](https://sourceforge.net/projects/pixeldustproject/files/ota/blueline/pixeldust_blueline-ota-retrofit-0b6310662f.zip/download) sourceforge links wihout issue.
    ```bash
    sha256sum boot_caf_2020_5.img
    # 8b7993a0ef6137fad626ae9057c397f6eded5f855956529422c3d007f29b2c81  boot_caf_2020_5.img
    sha256sum pixeldust_blueline-ota-retrofit-0b6310662f.zip
    # 5e2bcb3900640f05a50651a4022a16f788810f432e6cc560e81975829ea9378e  pixeldust_blueline-ota-retrofit-0b6310662f.zip
    ```
    - It was not necessary to download the Magisk patched boot image, as I sideloaded Magisk separately.
3. Reboot into the bootloader and flash the boot image to enable recovery mode.
    ```bash
    fastboot flash boot boot_caf_2020_5.img
    ```
4. Wipe the userdata (necessary for first PixelDust/Android 10 install).
    ```bash
    fastboot erase userdata
    ```
5. Reboot into the bootloader.
    ```bash
    fastboot reboot fastboot
    ```
6. Use the volume keys and power button to select `Enter Recovery`
7. Select `Apply Update > Apply Update from ADB`.
8. Sideload the PixelDust ROM zip archive.
    ```bash
    adb sideload pixeldust_blueline-ota-retrofit-0b6310662f.zip
    ```
9. Reboot the device. Proceed to sideloading Magisk.

## Sideloading Magisk

[Magisk](https://github.com/topjohnwu/Magisk) is a suite of open source tools for in-depth Android customization that provides root access, functionality to modify read-only file systems on your device, and basic root hiding functionality and system integrity check spoofing.

1. Download the latest stable MagiskManager release and install it on the phone.
    - I used [Magisk Manager v8.0.2](https://github.com/topjohnwu/Magisk/releases/download/manager-v8.0.2/MagiskManager-v8.0.2.apk) with success.
    ```bash
    sha256sum MagiskManager-v8.0.2.apk 
    1b28f4952f994e5bff850a6586d66dbb34324f569860d91cdff03e6dfbd3a877  MagiskManager-v8.0.2.apk

    adb install MagiskManager-v8.0.2.apk
    ```
2. Reboot the phone into recovery mode.
3. Download the latest stable Magisk release and sideload it onto the phone.
    - I used [Magisk-v20.4.zip](https://github.com/topjohnwu/Magisk/releases/download/v20.4/Magisk-v20.4.zip) with success.
    ```bash
    sha256sum Magisk-v20.4.zip 
    5795228296ab3e84cda196e9d526c9b8556dcbf5119866e0d712940ceed1f422  Magisk-v20.4.zip

    # See Flashing the PixelDust ROM, steps 5 through 7.
    adb sideload Magisk-v20.4.zip
    ```
    - The signature mismatch warning is expected and can be bypassed.
4. Reboot the phone and navigate to MagiskManager.
5. If safetyNet shows errors `ctsProfile: False`, `evalType: BASIC`, install the MagiskHide Props Config from the modules page.
    - I used [[MODULE] MagiskHide Props Config - SafetyNet, prop edits, and more - v5.3.5-v105](https://forum.xda-developers.com/apps/magisk/module-magiskhide-props-config-t3789228).
6. Within MagiskManager settings, enable the `MagiskHide` functionality and the `Systemless hosts` support.
7. Reboot your phone. Congratulations! You now have root on your device and you should still be able to run apps like Google Pay.


# Asides

I had issues with root being lost while using the stock Android ROM, even with automatic updates disabled.
The scenario was I was able to OTA upgrade to v11 successfully, but sporadically after a week of use, the phone would no longer pass SafetyNet.

I do not recommend the [LineageOS blueline](https://download.lineageos.org/blueline) roms yet, because I had severe battery life issues using as well as random crashing of [OpenGApps](https://opengapps.org/), despite using the recommended settings.

The primary motivation for rooting the device is to enable [Axet's Call Recorder](https://github.com/di72nn/callrecorder-axet) as a system app.

Do not change the bootloader settings (lock/unlock), as this will wipe your device user data again or potentially brick your device.

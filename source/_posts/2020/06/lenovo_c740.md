---
title: "Debian Buster on Lenovo C740"
date: 2020-06-24T21:33:18-06:00
draft: false
description: Setup instructions for installing Debian on Lenovo Yoga C740.
status: in-progress
tags:
  - linux
  - personal
---

I am following suit from [Beryllium's blog post](https://martin.beryllium.net/2019/09/23/linux-on-lenovo-yoga-c740/) setting up an Ubuntu/Windows dual boot.
However, I am not dual booting Windows, instead only using Debian 10.

# Pre-Installation Details

I am using a [Lenovo Yoga C740-14IML](https://psref.lenovo.com/Detail/Yoga/Yoga_C740_14IML?M=81TC000QUS) with 16 GB DDR4-2666 Memory, an Intel Core i7-10510U processor, and a 1TB SSD M.2 2280 PCIe NVMe for storage.
The laptop user guide can be found at the [Lenovo support page](https://download.lenovo.com/consumer/mobiles_pub/c740_14iml_15iml_ug_en_201908.pdf).

Enter BIOS by holding down the `F2` key during power on.
Boot device can be changed by holding down the `F12` key during power on.
Disable secure boot in the BIOS to enable hibernate and suspend.
I left the hotkey settings such that the holding down `Fn` is necessary for the function keys `F1-12`, and pressing them otherwise will default to the hotkey functionality `Volume Up/Down/Mute`.

For my operating system image, I used the [`debian-10.4.0-amd64-netinst`](https://www.debian.org/distrib/netinst#smallcd) image.
I did not load the `iwlwifi` firmware, instead using a wired connection for my installation.

# Installation Choices

I opted for the non-graphical installation approach.
For disk partitioning, I used the guided approach for setting up an encrypted LVM with a separate `/home` partition, opting to use 80% of my available physical storage space.
Additionally, I set the volume groups for my root and home partitions to use `btrfs` instead of the default `ext4`.

```bash
# list file systems, showing type, size, additional meta
df -Th
```
```text
Filesystem                              Type      Size  Used Avail Use% Mounted on
udev                                    devtmpfs  7.7G     0  7.7G   0% /dev
tmpfs                                   tmpfs     1.6G  9.3M  1.6G   1% /run
/dev/mapper/udia--lenovo--c740--vg-root btrfs      28G  5.7G   22G  21% /
tmpfs                                   tmpfs     7.8G  7.5M  7.8G   1% /dev/shm
tmpfs                                   tmpfs     5.0M     0  5.0M   0% /run/lock
tmpfs                                   tmpfs     7.8G     0  7.8G   0% /sys/fs/cgroup
/dev/mapper/udia--lenovo--c740--vg-home btrfs     719G   35M  718G   1% /home
/dev/nvme0n1p2                          ext2      237M  111M  114M  50% /boot
/dev/nvme0n1p1                          vfat      511M  5.1M  506M   1% /boot/efi
tmpfs                                   tmpfs     1.6G   12K  1.6G   1% /run/user/1000
```

For my desktop environment, I chose the Plasma/KDE option.

## Upgrade Linux Kernel

After the OS installation finished, I noticed that my laptop could not boot into the display manager, showing only text in tty1.
When I attempted to run the `startx`, the following errors appeared in `/var/log/Xorg.0.log`:

```text
[  3570.258] 
X.Org X Server 1.20.4
X Protocol Version 11, Revision 0
[  3570.259] Build Operating System: Linux 4.9.0-8-amd64 x86_64 Debian
...
Fatal server error:
[  3570.274] (EE) Cannot run in framebuffer mode. Please specify busIDs        for all framebuffer devices
[  3570.274] (EE) 
[  3570.274] (EE) 
Please consult the The X.Org Foundation support 
	 at http://wiki.x.org
 for help. 
[  3570.274] (EE) Please also check the log file at "/var/log/Xorg.0.log" for additional information.
[  3570.274] (EE) 
[  3570.277] (EE) Server terminated with error (1). Closing log file.
```

To resolve this error, I updated my linux kernel.
First, the buster-backports source needs to be added (to the end of `/etc/apt/sources.list`).

```text
deb http://deb.debian.org/debian/ buster-backports main non-free contrib
deb-src http://deb.debian.org/debian/ buster-backports main non-free contrib
```
Next, install linux kernel 5.4.

> Linux kernel >=5.5 has a [known Debian issue](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=949019) with audio drivers not working.

```bash
sudo apt update
sudo apt install linux-image-5.4.0-0.bpo.4-amd64 linux-headers-5.4.0-0.bpo.4-amd64 
# after installation completes, reboot
sudo reboot now
```

# "Out of the Box" Functionality Checklist

The following devices were detected on the pci busses (output of `lspci`).

```text
00:00.0 Host bridge: Intel Corporation Device 9b61 (rev 0c)
00:02.0 VGA compatible controller: Intel Corporation Device 9b41 (rev 02)
00:04.0 Signal processing controller: Intel Corporation Skylake Processor Thermal Subsystem (rev 0c)
00:08.0 System peripheral: Intel Corporation Skylake Gaussian Mixture Model
00:12.0 Signal processing controller: Intel Corporation Device 02f9
00:13.0 Serial controller: Intel Corporation Device 02fc
00:14.0 USB controller: Intel Corporation Device 02ed
00:14.2 RAM memory: Intel Corporation Device 02ef
00:14.3 Network controller: Intel Corporation Device 02f0
00:15.0 Serial bus controller [0c80]: Intel Corporation Device 02e8
00:15.1 Serial bus controller [0c80]: Intel Corporation Device 02e9
00:16.0 Communication controller: Intel Corporation Device 02e0
00:17.0 SATA controller: Intel Corporation Device 02d3
00:19.0 Serial bus controller [0c80]: Intel Corporation Device 02c5
00:19.2 Communication controller: Intel Corporation Device 02c7
00:1d.0 PCI bridge: Intel Corporation Device 02b4 (rev f0)
00:1f.0 ISA bridge: Intel Corporation Device 0284
00:1f.3 Multimedia audio controller: Intel Corporation Device 02c8
00:1f.4 SMBus: Intel Corporation Device 02a3
00:1f.5 Serial bus controller [0c80]: Intel Corporation Device 02a4
01:00.0 Non-Volatile memory controller: Samsung Electronics Co Ltd NVMe SSD Controller SM981/PM981
```

Marked items indicate no further setup required.
Items not checked required additional configuration before full functionality was available.

- [ ] Audio
    - Speakers working using Linux Kernel 5.4, does not work in Linux Kernel 5.6.
    - Microphone appears to have an issue. When attempting to conference call, only "Monitor of Built-in Audio Analog Stereo" was available.
    - Testing using audacity revealed only static noise when recording. However, the static noise was mutable by the laptop hotkey for the microphone.
- [x] Battery
    - Battery indicator appears in the bottom right corner and shows the charge when not plugged into AC. When plugged into AC, laptop charges.
- [x] Web Camera
    - Running `mplayer tv://`, I see myself appear on the screen. (`mplayer` can be installed through apt)
- [ ] Bluetooth/Wifi
    - No adapters available.
- [x] Touchpad
    - Multi-touch scrolling, tap emulation worked with no issues.
- [ ] Keyboard Hotkeys (Partial)
    - Working:
        - Mute `F1`
        - Volume Down `F2`
        - Volume Up `F3`
        - Microphone On/Off `F4`
        - Browser Refresh Page `F5`
        - Touchpad On/Off `F6`
        - Airplane Mode On/Off `F7`
        - Switch display device `F10`
        - Keyboard Backlight `Fn+Spacebar`
    - Not working: 
        - Enable/Disable Integrated Camera `F8`
        - Lock Screen `F9`
        - Screen Brightness Down `F11`
        - Screen Brightness Up `F12`
- [x] Touchscreen
    - Touch inputs appear to simulate mouse events
- [x] USB/USB-C
    - Appears to work with no issues
- [ ] Fingerprint Scanner
    - Not supported by fprintd. Low priority, will likely not use even if supported.
- [x] Suspend (Suspend to RAM)
    - Ran "Suspend to RAM", screen shuts off. On keyboard event, screen turns back on, lock screen appears.
- [x] Hibernate (Suspend to Disk)
    - Ran "Hibernate", screen shuts off. On press of power button, laptop resumed from hibernation with no issue.

To diagnose these errors, I read through the `dmesg` output.

## Enabling WLAN and Bluetooth

```bash
sudo dmesg | grep 'wifi\|bluetooth'
```
```text
[   12.231809] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-50.ucode (-2)
[   12.231884] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-50.ucode failed with error -2
[   12.231907] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-49.ucode (-2)
[   12.231973] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-49.ucode failed with error -2
[   12.231991] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-48.ucode (-2)
[   12.232055] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-48.ucode failed with error -2
[   12.232072] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-47.ucode (-2)
[   12.232138] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-47.ucode failed with error -2
[   12.232154] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-46.ucode (-2)
[   12.232220] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-46.ucode failed with error -2
[   12.232237] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-45.ucode (-2)
[   12.232300] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-45.ucode failed with error -2
[   12.232317] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-44.ucode (-2)
[   12.232383] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-44.ucode failed with error -2
[   12.232400] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-43.ucode (-2)
[   12.232466] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-43.ucode failed with error -2
[   12.232483] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-42.ucode (-2)
[   12.232549] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-42.ucode failed with error -2
[   12.232565] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-41.ucode (-2)
[   12.232628] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-41.ucode failed with error -2
[   12.232645] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-40.ucode (-2)
[   12.232711] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-40.ucode failed with error -2
[   12.232727] iwlwifi 0000:00:14.3: firmware: failed to load iwlwifi-QuZ-a0-jf-b0-39.ucode (-2)
[   12.232792] iwlwifi 0000:00:14.3: Direct firmware load for iwlwifi-QuZ-a0-jf-b0-39.ucode failed with error -2
[   12.232796] iwlwifi 0000:00:14.3: minimum version required: iwlwifi-QuZ-a0-jf-b0-39
[   12.232855] iwlwifi 0000:00:14.3: maximum version supported: iwlwifi-QuZ-a0-jf-b0-50
[   12.232915] iwlwifi 0000:00:14.3: check git://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git
[   12.523137] bluetooth hci0: firmware: failed to load intel/ibt-19-0-1.sfi (-2)
[   12.523234] bluetooth hci0: Direct firmware load for intel/ibt-19-0-1.sfi failed with error -2
```

The firmware requested in the dmesg logs `iwlwifi-QuZ-a0-jf-b0-*` is for the Intel Wireless 22000 series. The product specification for my laptop model suggests that I should have received an `Intel 9560 11ac, 2x2 + BT5.0`.
I am unsure if this is an issue with Linux incorrectly determining the make/model of my WLAN hardware, or if I was shipped a laptop with a slightly newer components.

Output of `lspci -vv -s 00:14.3` does not appear to provide any useful identifying information.
```text
00:14.3 Network controller: Intel Corporation Device 02f0
        Subsystem: Intel Corporation Device 0034
        Control: I/O- Mem+ BusMaster- SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
        Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
        Interrupt: pin A routed to IRQ 16
        Region 0: Memory at b1218000 (64-bit, non-prefetchable) [size=16K]
        Capabilities: [c8] Power Management version 3
                Flags: PMEClk- DSI+ D1- D2- AuxCurrent=0mA PME(D0+,D1-,D2-,D3hot+,D3cold+)
                Status: D0 NoSoftRst+ PME-Enable- DSel=0 DScale=0 PME-
        Capabilities: [d0] MSI: Enable- Count=1/1 Maskable- 64bit+
                Address: 0000000000000000  Data: 0000
        Capabilities: [40] Express (v2) Root Complex Integrated Endpoint, MSI 00
                DevCap: MaxPayload 128 bytes, PhantFunc 0
                        ExtTag- RBE-
                DevCtl: Report errors: Correctable- Non-Fatal- Fatal- Unsupported-
                        RlxdOrd+ ExtTag- PhantFunc- AuxPwr+ NoSnoop+
                        MaxPayload 128 bytes, MaxReadReq 128 bytes
                DevSta: CorrErr- UncorrErr- FatalErr- UnsuppReq- AuxPwr+ TransPend-
                DevCap2: Completion Timeout: Range B, TimeoutDis+, LTR+, OBFF Via WAKE#
                DevCtl2: Completion Timeout: 16ms to 55ms, TimeoutDis-, LTR+, OBFF Disabled
        Capabilities: [80] MSI-X: Enable- Count=16 Masked-
                Vector table: BAR=0 offset=00002000
                PBA: BAR=0 offset=00003000
        Capabilities: [100 v1] Latency Tolerance Reporting
                Max snoop latency: 0ns
                Max no snoop latency: 0ns
        Capabilities: [164 v1] Vendor Specific Information: ID=0010 Rev=0 Len=014 <?>
        Kernel modules: iwlwifi
```

The necessary firmware is currently in [buster-backports](https://packages.debian.org/buster-backports/firmware-iwlwifi).
This should already be added in your sources due to the earlier step of upgrading the kernel.

```bash
sudo apt -t buster-backports install firmware-iwlwifi
# Restart the machine
sudo reboot now
```

Bluetooth requires no additional setup after WLAN is available.


## Hotkey Diagnosis

To view the scancode that maps to the hotkeys, I switched to a new tty (e.g. `Ctrl+Alt+Fn+F1`) and ran the `showkey --scancodes` command. By default, the graphical display is on tty7.

```bash
showkey --scancodes
0xe0 0x3b 0xe0 0xbb             # mapped to Hotkey F8
0xe0 0x5b 0x26 0xa6 0xe0 0xdb   # mapped to Hotkey F9

showkey
# pressed Hotkey F8
keycode 212 press
# released Hotkey F8
keycode 212 release

# pressed Hotkey F9
keycode 125 press
keycode 38 press
# released Hotkey F9
keycode 38 release
keycode 125 release
```

The display brightness hotkeys did not show any output when pressed.
- It appears to be related to [Ubuntu Bug#1872311](https://bugs.launchpad.net/ubuntu/+source/linux/+bug/1872311).
- A corresponding [discussion post on the Lenovo forums was linked](https://forums.lenovo.com/t5/Ubuntu/Lenovo-Yoga-S740-14IIL-Brightness-hotkeys-not-working-on-Ubuntu-20-04/m-p/5011698), but no solutions were provided.

**Update** *(July 9, 2020)*: It appears that after putting my laptop into hibernation (not suspend to RAM) and waking up, the brightness controls hotkeys work as intended.

**Workaround**: use software controls for display brightness management, or hibernate and wake up.


## Built-in Microphone Not Detected

This appears to be related to [Ubuntu Bug#1845797](https://bugs.launchpad.net/ubuntu/+source/alsa-driver/+bug/1845797).

**Workaround**: use an external USB microphone.

# Post Install Remarks, Setup

The setup was non-trivial and required lots of fine tuning and troubleshooting.
These issues are relatively minor with acceptable workarounds.

That being said, I would not recommend using linux on this hardware until these issues are patched.

Refer to the [workspace quality of life specification](/posts/2020/03/workspace_qol) for user and system preferences.

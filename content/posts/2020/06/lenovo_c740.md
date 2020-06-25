---
title: "Debian Buster on Lenovo C740"
date: 2020-06-24T21:33:18-06:00
draft: false
description: Setup instructions for installing Debian on Lenovo Yoga C740.
status: in-progress
tags:
  - personal
---

I am following suit from [Beryllium's blog post](https://martin.beryllium.net/2019/09/23/linux-on-lenovo-yoga-c740/) setting up an Ubuntu/Windows dual boot.
However, I am not dual booting Windows, instead only using Debian 10.

# Pre-Installation Details

I am using a [Lenovo Yoga C740-14IML](https://psref.lenovo.com/Detail/Yoga/Yoga_C740_14IML?M=81TC000QUS) with 16 GB DDR4-2666 Memory, an Intel Core i7-10510U processor, and a 1TB SSD M.2 2280 PCIe NVMe for storage.
The laptop user guide can be found at the [Lenovo support page](https://download.lenovo.com/consumer/mobiles_pub/c740_14iml_15iml_ug_en_201908.pdf).

For my operating system image, I used the [`debian-10.4.0-amd64-netinst`](https://www.debian.org/distrib/netinst#smallcd) image.
I had a flexible usb flash drive containing the non-free [firmware-iwlwifi](https://packages.debian.org/sid/firmware-iwlwifi) package, required for wireless support.

I disabled secure boot in the BIOS by holding down the `F2` key during power on.
Boot device can be changed by holding down the `F12` key during power on.

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
Next, install linux kernel 5.6.
```bash
sudo apt update
sudo apt install linux-image-5.6.0-0.bpo.2-amd64 linux-headers-5.6.0-0.bpo.2-amd64
# after installation completes, reboot
sudo reboot now
```

# "Out of the Box" Functionality Checklist

The following marked items indicate no further setup required.
Items not checked required additional configuration before full functionality was available.

- [ ] Audio
    - No input or output audio devices were detected.
- [x] Battery
    - Battery indicator appeared in the bottom right corner, showed the charge when not plugged into AC, could charge otherwise
- [x] Web Camera
    - Running `mplayer tv://`, I could see myself appear on the screen. (can be installed through apt)
- [ ] Bluetooth/Wifi
    - No adapters available (peculiar, as `firmware-iwlwifi` was provided during the Debian installation)
- [x] Touchpad
    - Multi-touch scrolling, tap emulation worked with no issues.
- [ ] Keyboard Hotkeys (Partial)
    - Working: Mute `F1`, Volume Down `F2`, Volume Up `F3`, Touchpad On/Off `F6`, Switch display device `F10`, Keyboard Backlight `Fn+Spacebar`
    - Not working: Screen Brightness Down `F11`, Screen Brightness Up `F12`
    - Other hotkeys are unconfirmed
- [x] Touchscreen
    - Touch inputs appear to simulate mouse events
- [x] USB/USB-C
    - Appears to work with no issues
- [ ] Fingerprint Scanner
    - Not supported by fprintd
- [x] Suspend (Suspend to RAM)
    - Ran "Suspend to RAM", screen shuts off. On keyboard event, screen turns back on, lock screen appears.
- [x] Hibernate (Suspend to Disk)
    - Ran "Hibernate", screen shuts off. On press of power button, laptop resumed from hibernation with no issue.

# Post Install Setup

Refer to the [workspace quality of life specification]({{< ref "/posts/2020/03/workspace_qol.md" >}}) for final configuration steps.
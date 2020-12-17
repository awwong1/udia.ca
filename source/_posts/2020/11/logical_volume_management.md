---
title: "Logical Volume Management"
date: 2020-11-09T13:57:42-06:00
draft: false
description: A brief guide in using logical volume manager (LVM) for disk space control.
status: in-progress
tags:
  - personal
  - linux
---

The [Logical Volume Manager (LVM) is a linux utility for mapping storage devices to storage volumes](https://en.wikipedia.org/wiki/Logical_Volume_Manager_%28Linux%29).
I am motivated to write this document due to not remembering the terminology and steps for resizing my root [`btrfs`](https://en.wikipedia.org/wiki/Btrfs) partition, despite setting aside free space on my initial linux setup.

# LVM Components

The following is my LVM version, examples shown are from my primary laptop.

```bash
lvm version
```
```text
  LVM version:     2.03.02(2) (2018-12-18)
  Library version: 1.02.155 (2018-12-18)
  Driver version:  4.41.0
  Configuration:   ./configure --build=x86_64-linux-gnu --prefix=/usr --includedir=${prefix}/include --mandir=${prefix}/share/man --infodir=${prefix}/share/info --sysconfdir=/etc --localstatedir=/var --disable-silent-rules --libdir=${prefix}/lib/x86_64-linux-gnu --libexecdir=${prefix}/lib/x86_64-linux-gnu --runstatedir=/run --disable-maintainer-mode --disable-dependency-tracking --exec-prefix= --bindir=/bin --libdir=/lib/x86_64-linux-gnu --sbindir=/sbin --with-usrlibdir=/usr/lib/x86_64-linux-gnu --with-optimisation=-O2 --with-cache=internal --with-device-uid=0 --with-device-gid=6 --with-device-mode=0660 --with-default-pid-dir=/run --with-default-run-dir=/run/lvm --with-default-locking-dir=/run/lock/lvm --with-thin=internal --with-thin-check=/usr/sbin/thin_check --with-thin-dump=/usr/sbin/thin_dump --with-thin-repair=/usr/sbin/thin_repair --enable-applib --enable-blkid_wiping --enable-cmdlib --enable-dmeventd --enable-dbus-service --enable-lvmlockd-dlm --enable-lvmlockd-sanlock --enable-lvmpolld --enable-notify-dbus --enable-pkgconfig --enable-readline --enable-udev_rules --enable-udev_sync
```

## Physical Volumes (PVs)

These are the actual hardware (HDD, SSD), that store your information.
They serve as the foundation for the logical volumes and volume groups.

```bash
pvdisplay
```
```text
  --- Physical volume ---
  PV Name               /dev/mapper/nvme0n1p3_crypt
  VG Name               udia-lenovo-c740-vg
  PV Size               953.11 GiB / not usable 0   
  Allocatable           yes 
  PE Size               4.00 MiB
  Total PE              243997
  Free PE               46241
  Allocated PE          197756
  PV UUID               tev150-KazX-GKQB-pTdJ-I0cO-L1YY-rrJk9B
```

## Volume Groups (VGs)

Volume groups are disk abstractions that depend on the physical volumes.
They may span multiple physical volumes or reside within a single physical volume. They can be resized and moved between physical volumes.

```bash
vgdisplay
```
```text
  --- Volume group ---
  VG Name               udia-lenovo-c740-vg
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  5
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                3
  Open LV               3
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               953.11 GiB
  PE Size               4.00 MiB
  Total PE              243997
  Alloc PE / Size       197756 / 772.48 GiB
  Free  PE / Size       46241 / <180.63 GiB
  VG UUID               TfKBVz-fpfe-RkhE-jtjG-v6rl-psdG-tTpGRr
```

## Logical Volumes (LVs)

Logical volumes are equivalent to a disk partition on a non-LVM system, but due to LVM, can extend across multiple physical hard drives.

```bash
lvdisplay
```
```text
  --- Logical volume ---
  LV Path                /dev/udia-lenovo-c740-vg/root
  LV Name                root
  VG Name                udia-lenovo-c740-vg
  LV UUID                kuvG5D-dS2o-AcDI-T91Y-5ffH-9KMm-ATloyU
  LV Write Access        read/write
  LV Creation host, time udia-lenovo-c740, 2020-06-24 20:26:01 -0600
  LV Status              available
  # open                 1
  LV Size                <37.94 GiB
  Current LE             9712
  Segments               2
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           254:1
   
  --- Logical volume ---
  LV Path                /dev/udia-lenovo-c740-vg/swap_1
  LV Name                swap_1
  VG Name                udia-lenovo-c740-vg
  LV UUID                kQ0w8H-lEq5-F2rG-mtiE-daf1-SKyy-DINnxb
  LV Write Access        read/write
  LV Creation host, time udia-lenovo-c740, 2020-06-24 20:26:01 -0600
  LV Status              available
  # open                 2
  LV Size                <15.71 GiB
  Current LE             4021
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           254:2
   
  --- Logical volume ---
  LV Path                /dev/udia-lenovo-c740-vg/home
  LV Name                home
  VG Name                udia-lenovo-c740-vg
  LV UUID                n76nkw-wdZ0-fblQ-nXVo-awcZ-fg27-ItAEu6
  LV Write Access        read/write
  LV Creation host, time udia-lenovo-c740, 2020-06-24 20:26:01 -0600
  LV Status              available
  # open                 1
  LV Size                <718.84 GiB
  Current LE             184023
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           254:3
```

### Resize root partition

The following is the output of `sudo fdisk -l`:

```text
Disk /dev/nvme0n1: 953.9 GiB, 1024209543168 bytes, 2000409264 sectors
Disk model: SAMSUNG MZVLB1T0HBLR-000L2              
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 0823A578-0160-4023-BB9A-8988BA36AAF2

Device           Start        End    Sectors   Size Type
/dev/nvme0n1p1    2048    1050623    1048576   512M EFI System
/dev/nvme0n1p2 1050624    1550335     499712   244M Linux filesystem
/dev/nvme0n1p3 1550336 2000408575 1998858240 953.1G Linux filesystem


Disk /dev/mapper/nvme0n1p3_crypt: 953.1 GiB, 1023398641664 bytes, 1998825472 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/udia--lenovo--c740--vg-root: 38 GiB, 40735080448 bytes, 79560704 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/udia--lenovo--c740--vg-swap_1: 15.7 GiB, 16865296384 bytes, 32940032 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/udia--lenovo--c740--vg-home: 718.9 GiB, 771848404992 bytes, 1507516416 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

Because my root partition is running btrfs, I can increase the space with the following:

```bash
# increase root partition by 10 GiB
lvextend -l +2560 /dev/udia-lenovo-c740-vg/root
# resize partition to take up available space
btrfs filesystem resize max /
```

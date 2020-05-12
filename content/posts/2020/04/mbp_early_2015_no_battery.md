---
title: "No Battery Adventures using a MacBook Pro 13 (Early 2015)"
date: 2020-04-21T08:03:46-06:00
draft: false
description: Subtlties in using a MacBook Pro with a removed battery. 
status: complete
tags:
  - personal
  - linux
---

# Battery Requires Removal

While working on my MacBook Pro, I noticed that the four laptop foot pads no longer made contact with the desk evenly, but rather the front two pads were lifted off the surface. The center of the laptop bulged slightly, deforming the track pad and spacebar key slightly.

{{< figure src="https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_e3b719b87453492086f32f5a66c427cf/media/2020/04/21/inflated-mbp13-battery.jpg" alt="An inflated MacBook Pro battery (13 inch, Early 2015)" link="//media.udia.ca/2020/04/21/inflated-mbp13-battery.jpg" title="An inflated MacBook Pro battery (13 inch, Early 2015)" caption="Batteries were safely disposed of at an eco center." >}}

After opening up the laptop, I saw that all my lithium ion cells had swollen.
Calling a local Apple repair shop, I was quoted a repair price of approximately $330 for a top case replacement, and $100 for labor.
The associate explained to me that the new batteries were fixed onto the case assembly and could not be sold separately. Additionally, the case assembly replacement would require additional, specialized tools.
(Other shops did not carry a battery or did not perform this repair.)
Therefore, I opted for a [third party battery](https://www.amazon.ca/dp/B07YYW3MN1/ref=cm_sw_em_r_mt_dp_U_-QWNEbFVPZSGZ) that I could reasonably install myself.

I followed the instructions in this [iFixit battery replacement tutorial](https://www.ifixit.com/Guide/MacBook+Pro+13-Inch+Retina+Display+Early+2015+Battery+Replacement/45137) with no issues.
I did not use adhesive remover, only a hair dryer and a old gym membership card.
There is a slight risk of static discharge and fire.

As I wait for the new battery to arrive, I've kept track of the following notes.
The laptop is bootable without a battery.
Using Debian, there is no automatic throttling of the CPU, contrary to these [following](https://web.archive.org/web/20081225111200/http://support.apple.com:80/kb/HT2332) [reference](https://apple.stackexchange.com/questions/116193/how-to-disable-the-speedstep-when-using-macbook-pro-without-a-battery) [posts](https://web.archive.org/web/20090705004324/http://www.gearlog.com:80/2008/11/apple_notebooks_take_huge_perf.php).

## Manually limit CPU frequency upperbound

The laptop is not stable under high CPU loads.
When under high load, the laptop will now sporadically power off (presumably due to insufficient power).

I used `cpufrequtils` to manually set the CPU frequency scaling daemon ([Debian package](https://packages.debian.org/buster/cpufrequtils)).
```bash
sudo apt install cpufrequtils
cpufreq-info
```
```text
cpufrequtils 008: cpufreq-info (C) Dominik Brodowski 2004-2009
Report errors and bugs to cpufreq@vger.kernel.org, please.
analyzing CPU 0:
  driver: intel_pstate
  CPUs which run at the same hardware frequency: 0
  CPUs which need to have their frequency coordinated by software: 0
  maximum transition latency: 4294.55 ms.
  hardware limits: 500 MHz - 3.40 GHz
  available cpufreq governors: performance, powersave
  current policy: frequency should be within 500 MHz and 3.40 GHz.
                  The governor "powersave" may decide which speed to use
                  within this range.
  current CPU frequency is 1.02 GHz.
analyzing CPU 1:
  driver: intel_pstate
  CPUs which run at the same hardware frequency: 1
  CPUs which need to have their frequency coordinated by software: 1
  maximum transition latency: 4294.55 ms.
  hardware limits: 500 MHz - 3.40 GHz
  available cpufreq governors: performance, powersave
  current policy: frequency should be within 500 MHz and 3.40 GHz.
                  The governor "powersave" may decide which speed to use
                  within this range.
  current CPU frequency is 924 MHz.
analyzing CPU 2:
  driver: intel_pstate
  CPUs which run at the same hardware frequency: 2
  CPUs which need to have their frequency coordinated by software: 2
  maximum transition latency: 4294.55 ms.
  hardware limits: 500 MHz - 3.40 GHz
  available cpufreq governors: performance, powersave
  current policy: frequency should be within 500 MHz and 3.40 GHz.
                  The governor "powersave" may decide which speed to use
                  within this range.
  current CPU frequency is 918 MHz.
analyzing CPU 3:
  driver: intel_pstate
  CPUs which run at the same hardware frequency: 3
  CPUs which need to have their frequency coordinated by software: 3
  maximum transition latency: 4294.55 ms.
  hardware limits: 500 MHz - 3.40 GHz
  available cpufreq governors: performance, powersave
  current policy: frequency should be within 500 MHz and 3.40 GHz.
                  The governor "powersave" may decide which speed to use
                  within this range.
  current CPU frequency is 942 MHz.
```

The first step is to manually limit the cpu upper frequency to a reduced value.
I arbitrarily chose 1.2GHz, further fine tuning to determine higher maximum is necessary.

```bash
# as root, each CPU core must be set independently
cpufreq-set -g powersave -u 1.2GHz -c0
cpufreq-set -g powersave -u 1.2GHz -c1
cpufreq-set -g powersave -u 1.2GHz -c2
cpufreq-set -g powersave -u 1.2GHz -c3
```

When running `cpufreq-info`, the current policy should now indicate the new upper and lower bounds.
```text
...
  current policy: frequency should be within 500 MHz and 1.20 GHz.
```

These settings are valid for the current session and will revert back to defaults on reboot.

## Use Airplane Mode

Whenever possible, avoid using wireless communication methods (WiFi, Bluetooth) and opt for the wired connection alternative.

## Minimize Ambient Temperature

Even if the cpu clock speed is limited, if the surrounding temperature is high, there is a higher probability that the laptop will sporadically shut off.
My hypothesis is that there is not enough available power to run the fans at high speed. The MacBook Pro relies heavily on passive cooling through the metal case underbody, so using an externally powered laptop cooling fan may be prudent.

# Reinstalling the Battery

Although the physical process of installing the battery hardware was straight forward, there were additional issues trying to get the laptop battery detected by my operating system.
The following steps were performed to get my laptop back into a usable state, beginning with the laptop powered off and the battery freshly installed.

1. Connect the charger/power adapter to the MacBook. Wait until the adapter's amber light becomes green, indicating that the battery is fully charged.
2. Reset the system management controller (SMC) by pressing and holding `Shift` + `Control` + `Option (Alt)` + `Power Button` for at least 10 seconds. The SMC will indicate that it has been reset if the light on the magsafe connector blinks. Immediately transition to the next step to avoid having the laptop start, although if it does start simply power it off.
3. Reset the nonvolatile random-access memory (NVRAM) and parameter ram (PRAM) by pressing and holding `Option (Alt)` + `Command` + `P` + `R` for at least 20 seconds. The startup sound should chime, the keys may be released after the second startup sound.

It was at this point that I tried to boot into my Debian OS, but my battery was not recognized (despite the laptop functioning without the adapter plugged in).
I repeated the SMC and NVRAM/PRAM reset steps before booting into OSX Recovery Mode by holding down `Command` + `R` during start up.
After booting into recovery mode, the laptop could detect the battery and I was satisfied that the hardware installation was correct.
Unfortunately, after another reboot, the laptop was unable to boot into Debian, showing an error indicating no startup disks were present.

## Startup Boot Repair

To repair the laptop without a hard reinstall of the operating system, I created an [Ubuntu 20.04 LTS](https://ubuntu.com/download/desktop) live-usb on a separate device. I used the [`boot-repair`](https://launchpad.net/~yannubuntu/+archive/ubuntu/boot-repair) tool to fix my laptop's boot issues.

1. Plug the Ubuntu bootable USB into the MacBook. Press and hold `Option (Alt)` and select the EFI-Boot option with the external media symbol. When prompted with the Ubuntu installation screen, choose to `Try Ubuntu`.
2. Once internet connection has been established, install the `boot-repair` tool:
    ```bash
    sudo su
    add-apt-repository ppa:yannubuntu/boot-repair
    apt-get update
    apt-get install -y boot-repair 
    boot-repair
    ```
3. If LUKS encrypted partitions are used:
    1. Ensure that the required packages are available on the live linux image.
        ```bash
        sudo apt-get update
        sudo apt-get install lvm2 cryptsetup
        ```
    2. Probe the required module and determine the encrypted drive.
        ```bash
        sudo modprobe dm-crypt
        sudo fdisk -l
        ```
    3. Mount the encrypted volume (in my case `/dev/sda3`):
        ```bash
        sudo cryptsetup luksOpen /dev/sde3 myvolume
        ```
    4. Ensure that the system is aware of the LVM entities.
        ```bash
        sudo vgscan
        sudo vgchange -ay
        ```
    5. Mount all remaining partitions.
        ```bash
        mkdir boot_efi && mount /dev/sda1 boot_efi
        mkdir boot && mount /dev/sda2 boot
        ```
4. Run `boot-repair`. Without changing any settings, follow the prompted instructions and restart after the tool completes.

You should now have a functional laptop again with the battery being detected by the operating system.

To promote battery health and extend its shelf life, be sure to properly calibrate your laptop battery.
Battery calibration is defined by charging until 100%, removing the power adapter and using the laptop normally until it powers off, then charging it up to 100% again.
The manufacturer's pamphlet suggests performing this step every two/three months.

# Remarks

It was disappointing to see how complicated this process became.
I do not expect the average user to be able to be able to remove a swollen lithium ion battery from the laptop, given the copious amounts of adhesive sticking the battery to the aluminum body frame.
Additionally, the usage of the crippled laptop while waiting for the new battery to arrive remained a difficult experience.
Even with manual throttling of CPU clock frequency, ambient temperatures and other energy demanding activities also meant that the laptop was prone to random power off events.
Installing the battery was not a simple plug-and-play event, requiring additional steps to enable battery recognition and neededing a boot repair step (possibly due to the MacOSX recovery mode step, unclear if boot corruption was caused by NVRAM/PRAM/SMC reset steps).

It is unlikely that I will purchase another MacBook device in the future.
I do not have solid recommendations for laptop hardware purchases, with only a mediocre experience with the Dell XPS series.

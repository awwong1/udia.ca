---
title: "No Battery Adventures using a MacBook Pro 13 (Early 2015)"
date: 2020-04-21T08:03:46-06:00
draft: false
description: Subtlties in using a MacBook Pro with a removed battery. 
status: in-progress
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

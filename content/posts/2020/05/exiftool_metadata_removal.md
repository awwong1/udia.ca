---
title: "Remove Exif Metadata from Photos"
date: 2020-05-07T08:34:38-06:00
draft: false
description: A step by step guide for removing EXIF metadata from photos on linux.
status: complete
tags:
  - linux
---

# Exchangeable Image File

The [Exchangeable image file format (Exif)](https://en.wikipedia.org/wiki/Exif) is a standard for specifying image, sound, and various metadata used by digital cameras, scanners, and other audio visual devices.
[ExifTool](https://exiftool.org/), a [Perl](https://en.wikipedia.org/wiki/Perl) library and [command line application](https://exiftool.org/exiftool_pod.html), is a popular program used for viewing, writing, and editing this metadata.
It is conveniently available in Debian sid as [`libimage-exiftool-perl`](https://packages.debian.org/sid/libimage-exiftool-perl).

## Command to Remove Exif

The following commands will remove Exif metadata from any compatible file.
```bash
# replace my_image.jpg with path to file

# Remove all Exif metadata
exiftool -all= my_image.jpg

# Remove only geographical coordinates
exiftool -geotag= -gps:all= my_image.jpg
```

You can specify a directory name in `exiftool` to process multiple images with a single command.
```bash
# replace my_directory with path to dir
exiftool -all= my_directory

# adding the -r option makes it recursive into subdirectories
exiftool -all= -r my_directory

# Additionally, if you only want to process jpeg and png images, you can specify the extensions
exiftool -all= -ext jpg -ext jpeg -ext png my_directory
```

## Exif Metadata Example

Let's look at a concrete example.

{{< figure src="https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_e3b719b87453492086f32f5a66c427cf/media/2020/05/07/IMG_20190508_200933_1.jpg" alt="A scenic photograph under the Porto bridge." link="//media.udia.ca/2020/05/07/IMG_20190508_200933_1.jpg" title="A scenic photograph under the Porto bridge." caption="A photograph from under the [Dom Luís I Bridge](https://en.wikipedia.org/wiki/Dom_Lu%C3%ADs_I_Bridge), experienced through the [Porto bridge climb](https://www.portobridgeclimb.com/) during my 2019 Spring vacation." >}}

Given a typical image captured by a modern cellphone, the following metadata tags can be found:

```bash
exiftool IMG_20190508_200933_1.jpg
```
```text
ExifTool Version Number         : 11.16
File Name                       : IMG_20190508_200933_1.jpg
Directory                       : .
File Size                       : 3.0 MB
File Modification Date/Time     : 2020:05:07 09:00:57-06:00
File Access Date/Time           : 2020:05:07 09:00:57-06:00
File Inode Change Date/Time     : 2020:05:07 09:01:15-06:00
File Permissions                : rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
Exif Byte Order                 : Little-endian (Intel, II)
Exposure Time                   : 1/559
F Number                        : 1.8
Exposure Program                : Program AE
ISO                             : 59
Exif Version                    : 0220
Date/Time Original              : 2019:05:08 20:09:33
Create Date                     : 2019:05:08 20:09:33
Components Configuration        : Y, Cb, Cr, -
Shutter Speed Value             : 1/560
Aperture Value                  : 1.8
Brightness Value                : 6.58
Exposure Compensation           : 0
Max Aperture Value              : 1.8
Subject Distance                : 2.289 m
Metering Mode                   : Center-weighted average
Flash                           : Off, Did not fire
Focal Length                    : 4.4 mm
Warning                         : [minor] Unrecognized MakerNotes
Sub Sec Time                    : 683675
Sub Sec Time Original           : 683675
Sub Sec Time Digitized          : 683675
Flashpix Version                : 0100
Color Space                     : sRGB
Exif Image Width                : 4032
Exif Image Height               : 3024
Interoperability Index          : R98 - DCF basic file (sRGB)
Interoperability Version        : 0100
Sensing Method                  : One-chip color area
Scene Type                      : Directly photographed
Custom Rendered                 : Custom
Exposure Mode                   : Auto
White Balance                   : Auto
Digital Zoom Ratio              : 0
Focal Length In 35mm Format     : 27 mm
Scene Capture Type              : Standard
Contrast                        : Normal
Saturation                      : Normal
Sharpness                       : Normal
Subject Distance Range          : Close
GPS Version ID                  : 2.2.0.0
GPS Latitude Ref                : North
GPS Longitude Ref               : West
GPS Altitude Ref                : Below Sea Level
GPS Time Stamp                  : 19:09:21
GPS Dilution Of Precision       : 27.668
GPS Processing Method           : fused
GPS Date Stamp                  : 2019:05:08
Make                            : Google
Camera Model Name               : Pixel 3
Orientation                     : Horizontal (normal)
X Resolution                    : 72
Y Resolution                    : 72
Resolution Unit                 : inches
Software                        : HDR+ 1.0.239730035zry
Modify Date                     : 2019:05:08 20:09:33
Y Cb Cr Positioning             : Centered
Compression                     : JPEG (old-style)
Thumbnail Offset                : 22240
Thumbnail Length                : 5940
JFIF Version                    : 1.01
Profile CMM Type                : 
Profile Version                 : 4.0.0
Profile Class                   : Display Device Profile
Color Space Data                : RGB
Profile Connection Space        : XYZ
Profile Date Time               : 2016:12:08 09:38:28
Profile File Signature          : acsp
Primary Platform                : Unknown ()
CMM Flags                       : Not Embedded, Independent
Device Manufacturer             : Google
Device Model                    : 
Device Attributes               : Reflective, Glossy, Positive, Color
Rendering Intent                : Perceptual
Connection Space Illuminant     : 0.9642 1 0.82491
Profile Creator                 : Google
Profile ID                      : 75e1a6b13c34376310c8ab660632a28a
Profile Description             : sRGB IEC61966-2.1
Profile Copyright               : Copyright (c) 2016 Google Inc.
Media White Point               : 0.95045 1 1.08905
Media Black Point               : 0 0 0
Red Matrix Column               : 0.43604 0.22249 0.01392
Green Matrix Column             : 0.38512 0.7169 0.09706
Blue Matrix Column              : 0.14305 0.06061 0.71391
Red Tone Reproduction Curve     : (Binary data 32 bytes, use -b option to extract)
Chromatic Adaptation            : 1.04788 0.02292 -0.05019 0.02959 0.99048 -0.01704 -0.00922 0.01508 0.75168
Blue Tone Reproduction Curve    : (Binary data 32 bytes, use -b option to extract)
Green Tone Reproduction Curve   : (Binary data 32 bytes, use -b option to extract)
Image Width                     : 4032
Image Height                    : 3024
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Aperture                        : 1.8
GPS Altitude                    : 0 m Above Sea Level
GPS Date/Time                   : 2019:05:08 19:09:21Z
GPS Latitude                    : 41 deg 8' 53.90" N
GPS Longitude                   : 8 deg 38' 20.10" W
GPS Position                    : 41 deg 8' 53.90" N, 8 deg 38' 20.10" W
Image Size                      : 4032x3024
Megapixels                      : 12.2
Scale Factor To 35 mm Equivalent: 6.1
Shutter Speed                   : 1/559
Create Date                     : 2019:05:08 20:09:33.683675
Date/Time Original              : 2019:05:08 20:09:33.683675
Modify Date                     : 2019:05:08 20:09:33.683675
Thumbnail Image                 : (Binary data 5940 bytes, use -b option to extract)
Circle Of Confusion             : 0.005 mm
Depth Of Field                  : inf (1.13 m - inf)
Field Of View                   : 67.4 deg
Focal Length                    : 4.4 mm (35 mm equivalent: 27.0 mm)
Hyperfocal Distance             : 2.22 m
Light Value                     : 11.6
```

It can be a good idea to remove some of these Exif tags from the image.
The photo's location is revealed through the `GPS *` tags, the photo creation time through `Create Date`, and details regarding the `Make` and `Camera Model Name` of my cellphone.

By removing the exif tags from the image before uploading to social media, you reduce the amount of information that you reveal about yourself.
May this be useful in the ongoing process of maintaining privacy and control over one's data.

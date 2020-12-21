---
title: Selfie StyleGAN2
draft: false
description: Training a StyleGAN2 on a short 20 second selfie video.
status: complete
tags:
  - personal
  - machine learning
  - research
date: 2020-12-21 10:02:52
---

I checked out the repository from [github.com/lucidrains/stylegan2-pytorch](https://github.com/lucidrains/stylegan2-pytorch) and trained a basic model to generate my face from a set of ~1000 images derived from a 20 second webcam selfie that I took on my laptop.

Interpolated results of training ~30 epochs are shown below.
The generator and discriminator losses appeared to have converged around epoch 20.
![my_face_interpolated](https://media.udia.ca/2020/12/21/my_face.gif)

# Quickstart

```bash
git clone git@github.com:lucidrains/stylegan2-pytorch.git
cd stylegan2-pytorch
pip install stylegan2-pytorch
```

## Generate Images from mp4

The following snippet is modified from [this github gist](https://gist.github.com/keithweaver/70df4922fec74ea87405b83840b45d57):

```python
'''
Using OpenCV takes a mp4 video and produces a number of images.

Requirements
----
You require OpenCV 3.2 to be installed.

Run
----
Open the main.py and edit the path to the video. Then run:
$ python main.py

Which will produce a folder called data with the images. There will be 2000+ images for example.mp4.
'''
import cv2
import numpy as np
import os

# Playing video from file:
cap = cv2.VideoCapture('example.mp4')

try:
    if not os.path.exists('data'):
        os.makedirs('data')
except OSError:
    print ('Error: Creating directory of data')

currentFrame = 0
while(True):
    # Capture frame-by-frame
    ret, frame = cap.read()

    y, x, _channels = frame.shape
    # 512 by 512
    y_mid = y // 2
    y_min = y_mid - 256
    y_max = y_mid + 256

    x_mid = x // 2
    x_min = x_mid - 256
    x_max = x_mid + 256

    crop_frame = frame[y_min:y_max, x_min:x_max, :]

    # Saves image of the current frame in jpg file
    name = './data/frame' + str(currentFrame) + '.jpg'
    print ('Creating...' + name)
    cv2.imwrite(name, crop_frame)

    # To stop duplicate images
    currentFrame += 1
    # break

# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()
```

## Training and using the model

```bash
stylegan2_pytorch --data data/ --name vanity --image-size 128
# using my home server, I did not have enough GPU memory to fit images of size 256 or higher.
stylegan2_pytorch --name vanity --generate-interpolation --interpolation-num-steps 1000
```

### GPU Details

```bash
nvidia-smi
```
```txt
Mon Dec 21 10:10:37 2020       
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 455.38       Driver Version: 455.38       CUDA Version: 11.1     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  TITAN Xp            Off  | 00000000:42:00.0 Off |                  N/A |
| 23%   36C    P8    16W / 250W |      0MiB / 12180MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```

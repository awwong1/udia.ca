---
title: "Electrocardiogram Machine Learning"
date: 2020-01-02T09:08:53-07:00
draft: false
description: Electrocardiogram machine learning research progress.
status: in-progress
tags:
  - research
---

This post will be continuously updated throughout the Master's degree research period.

The task is to extract utility from a large corpus of electrocardiogram (ECG) data using deep learning (DL) and machine learning (ML).
Data is in various formats (paper scans, [physiobank WFDB](https://archive.physionet.org/physiotools/wfdb.shtml), etc.)
Dataset may be partially labelled.

# Introduction

[Electrocardiograms](https://en.wikipedia.org/wiki/Electrocardiography) are graphs of voltage over time, indicating the electrical activity of the heart.
These measurements are recorded by placing electrodes on the patient's skin.
ECGs can be used to detect abnormalities in the heart, like [cardiac arrhythmia](https://en.wikipedia.org/wiki/Arrhythmia), [coronary artery disease](https://en.wikipedia.org/wiki/Coronary_artery_disease), and [heart attacks](https://en.wikipedia.org/wiki/Myocardial_infarction).

## Wave Schematic

See ["Learning the PQRST EKG Wave Tracing"](https://www.registerednursern.com/learning-the-pqrst-ekg-wave-tracing/).

## ECG Lead Placement

A conventional 12-lead ECG has [ten electrodes placed on the patient's limbs and chest](https://www.cablesandsensors.com/pages/12-lead-ecg-placement-guide-with-illustrations#2).
Six leads are placed on the chest, surrounding the heart, one lead is placed on each of the individual's four limbs.

## Reading an ECG

Following information is derived from ["How to read an ECG"](https://geekymedics.com/how-to-read-an-ecg/).

### Heart Rate

# Related Work

Links provided to online articles, datasets, source code, misc. resources.

## Datasets

* [Kaggle ECG Heartbeat Categorization Dataset](https://www.kaggle.com/shayanfazeli/heartbeat/) (2017)
  * Normalized collection of MIT-BIH and PTB datasets.
* [MIT-BIH Arrhythmia Database](https://doi.org/10.13026/C2F305) (2005)
  * Processed ECGs from original 2001 dataset
* [PTB Diagnostic ECG Database](https://doi.org/10.13026/C28C71) (2003)
  * Processed ECG from original 1995 dataset

## Articles

### Summary papers
* [Cardiac arrhythmia detection using deep learning](https://doi.org/10.1016/j.jelectrocard.2019.08.004) (2019)
  * Summary evaluated five aspects: dataset, application. type of input data, model architecture, performance evaluation
* [Diagnosing Abnormal Electrocardiogram (ECG) via Deep Learning](doi.org/10.5772/intechopen.85509) (2019)
  * Summary paper for existing ECG ML approaches
* [Machine learning in the electrocardiogram](https://doi.org/10.1016/j.jelectrocard.2019.08.008) (2019)
  * Summary paper for applying ML to ECG

### ECG Analysis
* [Cardiologist-Level Arrhythmia Detection with Convolutional Neural Networks](https://arxiv.org/abs/1707.01836) (2017)
  * Raw ECG signal (arbitrary length) into 34 layer CNN.
  * [Blog post](https://stanfordmlgroup.github.io/projects/ecg/), [Source code](https://github.com/awni/ecg)
* [Digitizing paper electrocardiograms: Status and challenges](https://doi.org/10.1016/j.jelectrocard.2016.09.007) (2017)
  * How to digitize paper ECG scans into signals
* [Deep learning to automatically interpret images of the electrocardiogram: Do we need the raw samples?](https://doi.org/10.1016/j.jelectrocard.2019.09.018) (2019)
  * Comparing DL approaches using the raw ECG signal versus the ECG as a scanned image

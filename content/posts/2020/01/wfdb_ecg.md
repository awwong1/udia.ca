---
title: "Physionet ECG Waveform Databases Summary"
date: 2020-01-09T12:25:19-07:00
draft: false
description: High level summarization of ECG datasets taken from Physionet.org
status: in-progress
tags:
  - personal
---

# Initialize WFDB Databases

Pull all of the PhysioNet WaveForm DataBase collections related to ECG, according to their [ECG Archive](https://archive.physionet.org/physiobank/database/#ecg)


```python
%matplotlib inline
```


```python
import glob
import os
import wfdb

from matplotlib import pyplot as plt
from pprint import pprint
```


```python
ecg_database_keys = (
    "aami-ec13",
    "edb",
    "ltstdb",
    "mitdb",
    "nstdb",
    "staffiii",
    "chfdb",
    "ecgcipa",
    "ecgdmmld",
    "ecgrdvq",
    "ecgiddb",
    "szdb",
    "qtdb",
    "shareedb",
    "nifeadb",
    "adfecgdb", # uses EDF format
    "aftdb",
    "cudb",
    "iafdb",
    "ltafdb",
    "macecgdb",
    "afdb",
    "cdb",
    "ltdb",
    "vfdb",
    "nsrdb",
    "stdb",
    "svdb",
    "nifecgdb",  # uses EDF format
    "afpdb",
    "ptbdb",
    "incartdb",
    "sddb",
    "vfdb"
)
```


```python
all_dbs = dict(wfdb.get_dbs())
missing_keys = []
ecg_dbs = {}

for ecg_db_key in ecg_database_keys:
    if ecg_db_key not in all_dbs:
        missing_keys.append(ecg_db_key)
        continue
    print(ecg_db_key, f"\n\t{all_dbs[ecg_db_key]}")
    ecg_dbs[ecg_db_key] = all_dbs[ecg_db_key]

if missing_keys:
    print('-' * 30)
    print("Missing keys:", missing_keys)
```

    aami-ec13 
    	ANSI/AAMI EC13 Test Waveforms
    edb 
    	European ST-T Database
    ltstdb 
    	Long Term ST Database
    mitdb 
    	MIT-BIH Arrhythmia Database
    nstdb 
    	MIT-BIH Noise Stress Test Database
    staffiii 
    	STAFF III Database
    chfdb 
    	BIDMC Congestive Heart Failure Database
    ecgcipa 
    	CiPA ECG Validation Study
    ecgdmmld 
    	ECG Effects of Dofetilide, Moxifloxacin, Dofetilide+Mexiletine, Dofetilide+Lidocaine and Moxifloxacin+Diltiazem
    ecgrdvq 
    	ECG Effects of Ranolazine, Dofetilide, Verapamil, and Quinidine
    ecgiddb 
    	ECG-ID Database
    szdb 
    	Post-Ictal Heart Rate Oscillations in Partial Epilepsy
    qtdb 
    	QT Database
    shareedb 
    	Smart Health for Assessing the Risk of Events via ECG Database
    nifeadb 
    	Non-Invasive Fetal ECG Arrhythmia Database
    adfecgdb 
    	Abdominal and Direct Fetal ECG Database
    aftdb 
    	AF Termination Challenge Database
    cudb 
    	CU Ventricular Tachyarrhythmia Database
    iafdb 
    	Intracardiac Atrial Fibrillation Database
    ltafdb 
    	Long Term AF Database
    macecgdb 
    	Motion Artifact Contaminated ECG Database
    afdb 
    	MIT-BIH Atrial Fibrillation Database
    cdb 
    	MIT-BIH ECG Compression Test Database
    ltdb 
    	MIT-BIH Long-Term ECG Database
    vfdb 
    	MIT-BIH Malignant Ventricular Ectopy Database
    nsrdb 
    	MIT-BIH Normal Sinus Rhythm Database
    stdb 
    	MIT-BIH ST Change Database
    svdb 
    	MIT-BIH Supraventricular Arrhythmia Database
    nifecgdb 
    	Non-Invasive Fetal ECG Database
    afpdb 
    	PAF Prediction Challenge Database
    ptbdb 
    	PTB Diagnostic ECG Database
    incartdb 
    	St Petersburg INCART 12-lead Arrhythmia Database
    sddb 
    	Sudden Cardiac Death Holter Database
    vfdb 
    	MIT-BIH Malignant Ventricular Ectopy Database



```python
# Iterate through all datasets, show summary information

for key, desc in ecg_dbs.items():
    db_dir = os.path.join("wfdb", key)
    print(f"{key}\n\t{desc}")
    with open(os.path.join(db_dir, "RECORDS"), "r") as f:
        records = f.read().splitlines()
    print("\tnumber of records: "+ str(len(records)))

    #for r in records:
    #    record = wfdb.io.rdrecord(os.path.join(db_dir, r))        
    #    sig_units = list(zip(record.__dict__["sig_name"], record.__dict__["units"]))

    # summarize records
    print("Records summary:")
    try:
        for r in records:
            rec_name = os.path.join(db_dir, r)
            _, fields = wfdb.rdsamp(rec_name)
            pprint(fields, indent=2)
            break
    except Exception as e:
        print(e)

    # summarize annotations
    print("Annotations summary:")
    try:
        for r in records:
            rec_name = os.path.join(db_dir, r)
            fns = [fn for fn in glob.iglob(rec_name+".*") if not fn.endswith(".hea") and not fn.endswith("dat") and not fn.endswith(".hea-")]
            if not fns:
                print("No annotation data")
                break
            for fn in fns:
                _, ext = os.path.splitext(fn)
                print(ext)
                ann = wfdb.rdann(rec_name, ext[1:], summarize_labels=True)
                print(ann.contained_labels)
                break
            break
    except Exception as e:
        print(e)
        
    print("~"* 60)
```

    aami-ec13
    	ANSI/AAMI EC13 Test Waveforms
    	number of records: 10
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': ['ANSI/AAMI EC13-1992, Figure 3a.'],
      'fs': 720,
      'n_sig': 1,
      'sig_len': 43081,
      'sig_name': ['ECG'],
      'units': ['mV']}
    Annotations summary:
    No annotation data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    edb
    	European ST-T Database
    	number of records: 90
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ 'Age: 62  Sex: M',
                    'Mixed angina',
                    '1-vessel disease (RCA)',
                    'Medications: nitrates, diltiazem',
                    'Recorder type: ICR 7200'],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 1800000,
      'sig_name': ['V4', 'MLIII'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .atr
        label_store symbol                            description
    1             1      N                            Normal beat
    5             5      V      Premature ventricular contraction
    6             6      F  Fusion of ventricular and normal beat
    14           14      ~                  Signal quality change
    18           18      s                              ST change
    28           28      +                          Rhythm change
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ltstdb
    	Long Term ST Database
    	number of records: 86
    Records summary:
    { 'base_date': datetime.date(1994, 12, 9),
      'base_time': datetime.time(17, 8),
      'comments': [ 'Age: 58  Sex: M',
                    'Comments:',
                    'Lead 0:',
                    'All ST change episodes appeared to be rate-related '
                    'non-ischemic',
                    'episodes characterized by J-point depression and scooping of '
                    'the',
                    'ST segment.',
                    'Lead 1:',
                    'All episodes in lead 1 are compatible with heart-rate induced',
                    'non-ischemic changes and are so labeled. It is recognized '
                    'that',
                    'this is an arbitrary decision.',
                    'This record is from the initial Long-Term ST Database of',
                    'eleven 24-hour ST annotated ambulatory records (record '
                    's20689).',
                    'Symptoms during Holter recording: None reported',
                    'Diagnoses:',
                    'No coronary artery disease',
                    'Treatment:',
                    'Medications: None',
                    'Balloon Angioplasty: No',
                    'Coronary Artery bypass Grafting: No',
                    'History:',
                    'ST depressions but no coronary artery disease',
                    'Hypertension: No',
                    'Left ventricular hypertrophy: No',
                    'Cardiomyopathy: No',
                    'Valve disease: No',
                    'Electrolyte abnormalities: No',
                    'Hypercapnia, anemia, hypotension, hyperventilation: No',
                    'Atrioventricular nodal conduction delay: No',
                    'Intraventricular conduction block: No',
                    'Previous Myocardial Infarction: No',
                    'Previous tests:',
                    'ECG stress test: Yes',
                    'Date: No data',
                    'Findings: Ischemic ST changes at high work load',
                    'Thallium/Stress echo: Negative',
                    'Left ventricular function:',
                    'Normal',
                    'Echocardiogram:',
                    'Normal',
                    'Coronary Arteriography:',
                    'No significant disease',
                    'Baseline ECG:',
                    'Normal sinus rhythm',
                    'Left atrial abnormality',
                    'Mild ST elevation V2-V4 consistent with early repolarization',
                    'Holter Recording:',
                    'Date: 09/12/1994',
                    'Recorder: No data'],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 20594750,
      'sig_name': ['ML2', 'MV2'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .stb
        label_store symbol description
    18           18      s   ST change
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    mitdb
    	MIT-BIH Arrhythmia Database
    	number of records: 48
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': ['69 M 1085 1629 x1', 'Aldomet, Inderal'],
      'fs': 360,
      'n_sig': 2,
      'sig_len': 650000,
      'sig_name': ['MLII', 'V5'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .xws
        label_store symbol                        description
    2           2.0      L      Left bundle branch block beat
    8           8.0      A       Atrial premature contraction
    11         11.0      j     Nodal (junctional) escape beat
    12         12.0      /                         Paced beat
    14         14.0      ~              Signal quality change
    15          NaN    NaN                                NaN
    16         16.0      |         Isolated QRS-like artifact
    17          NaN    NaN                                NaN
    18         18.0      s                          ST change
    19         19.0      T                      T-wave change
    20         20.0      *                            Systole
    21         21.0      D                           Diastole
    23         23.0      =             Measurement annotation
    24         24.0      p                        P-wave peak
    25         25.0      B  Left or right bundle branch block
    26         26.0      ^          Non-conducted pacer spike
    27         27.0      t                        T-wave peak
    28         28.0      +                      Rhythm change
    29         29.0      u                        U-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    nstdb
    	MIT-BIH Noise Stress Test Database
    	number of records: 15
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': ["Created by `nst' from records 118 and em (SNR = 0 dB)"],
      'fs': 360,
      'n_sig': 2,
      'sig_len': 650000,
      'sig_name': ['MLII', 'V1'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .xws
    cannot reshape array of size 91 into shape (2)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    staffiii
    	STAFF III Database
    	number of records: 520
    Records summary:
    { 'base_date': datetime.date(1995, 9, 27),
      'base_time': datetime.time(20, 26),
      'comments': ['Age: 52', 'Sex: F'],
      'fs': 1000,
      'n_sig': 9,
      'sig_len': 300000,
      'sig_name': ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'I', 'II', 'III'],
      'units': ['mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV']}
    Annotations summary:
    No annotation data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    chfdb
    	BIDMC Congestive Heart Failure Database
    	number of records: 15
    Records summary:
    { 'base_date': None,
      'base_time': datetime.time(10, 0),
      'comments': ['Age: 71  Sex: M  NYHA class: III-IV'],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 17994491,
      'sig_name': ['ECG1', 'ECG2'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .ecg
        label_store symbol                                 description
    1             1      N                                 Normal beat
    5             5      V           Premature ventricular contraction
    9             9      S  Premature or ectopic supraventricular beat
    41           41      r    R-on-T premature ventricular contraction
    28           28      +                               Rhythm change
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ecgcipa
    	CiPA ECG Validation Study
    	number of records: 11498
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ 'STUDYID,USUBJID,EGREFID,EGDTC,WAVEFORM',
                    'SCR-004,1001,00689D31-8491-4643-B3C8-45241FBBD47C,20170327065710.000,derived'],
      'fs': 1000,
      'n_sig': 16,
      'sig_len': 1200,
      'sig_name': [ 'I',
                    'II',
                    'III',
                    'AVR',
                    'AVL',
                    'AVF',
                    'V1',
                    'V2',
                    'V3',
                    'V4',
                    'V5',
                    'V6',
                    'VCGMAG',
                    'X',
                    'Y',
                    'Z'],
      'units': [ 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV',
                 'uV']}
    Annotations summary:
    .atr
        label_store symbol     description
    40           40      )    Waveform end
    1             1      N     Normal beat
    27           27      t     T-wave peak
    39           39      (  Waveform onset
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ecgdmmld
    	ECG Effects of Dofetilide, Moxifloxacin, Dofetilide+Mexiletine, Dofetilide+Lidocaine and Moxifloxacin+Diltiazem
    	number of records: 8422
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 1000,
      'n_sig': 12,
      'sig_len': 10000,
      'sig_name': [ 'I',
                    'II',
                    'III',
                    'AVR',
                    'AVL',
                    'AVF',
                    'V1',
                    'V2',
                    'V3',
                    'V4',
                    'V5',
                    'V6'],
      'units': [ 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV']}
    Annotations summary:
    No annotation data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ecgrdvq
    	ECG Effects of Ranolazine, Dofetilide, Verapamil, and Quinidine
    	number of records: 10455
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 1000,
      'n_sig': 12,
      'sig_len': 10000,
      'sig_name': [ 'I',
                    'II',
                    'III',
                    'AVR',
                    'AVL',
                    'AVF',
                    'V1',
                    'V2',
                    'V3',
                    'V4',
                    'V5',
                    'V6'],
      'units': [ 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV']}
    Annotations summary:
    No annotation data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ecgiddb
    	ECG-ID Database
    	number of records: 310
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': ['Age: 25', 'Sex: male', 'ECG date: 07.12.2004'],
      'fs': 500,
      'n_sig': 2,
      'sig_len': 10000,
      'sig_name': ['ECG I', 'ECG I filtered'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .atr
        label_store symbol  description
    1             1      N  Normal beat
    27           27      t  T-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    szdb
    	Post-Ictal Heart Rate Oscillations in Partial Epilepsy
    	number of records: 7
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 200,
      'n_sig': 1,
      'sig_len': 1079998,
      'sig_name': ['ECG'],
      'units': ['mV']}
    Annotations summary:
    .xws
    cannot reshape array of size 89 into shape (2)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    qtdb
    	QT Database
    	number of records: 105
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ '69 M 1085 1629 x1',
                    'Aldomet, Inderal',
                    'Produced by xform from record 100, beginning at 7:00.000'],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 225000,
      'sig_name': ['MLII', 'V5'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .q1c
        label_store symbol     description
    1             1      N     Normal beat
    39           39      (  Waveform onset
    40           40      )    Waveform end
    24           24      p     P-wave peak
    27           27      t     T-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    shareedb
    	Smart Health for Assessing the Risk of Events via ECG Database
    	number of records: 139
    Records summary:
    { 'base_date': None,
      'base_time': datetime.time(12, 20, 53),
      'comments': [],
      'fs': 128,
      'n_sig': 3,
      'sig_len': 10322048,
      'sig_name': ['III', 'V3', 'V5'],
      'units': ['mV', 'mV', 'mV']}
    Annotations summary:
    .qrs
       label_store symbol  description
    1            1      N  Normal beat
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    nifeadb
    	Non-Invasive Fetal ECG Arrhythmia Database
    	number of records: 26
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 1000,
      'n_sig': 6,
      'sig_len': 600052,
      'sig_name': [ 'ECG',
                    'Abdomen_1',
                    'Abdomen_2',
                    'Abdomen_3',
                    'Abdomen_4',
                    'Abdomen_5'],
      'units': ['mV', 'mV', 'mV', 'mV', 'mV', 'mV']}
    Annotations summary:
    No annotation data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    adfecgdb
    	Abdominal and Direct Fetal ECG Database
    	number of records: 5
    Records summary:
    [Errno 2] No such file or directory: '/home/alexander/sandbox/src/git.udia.ca/alex/ecgml_research/wfdb/adfecgdb/r01.edf.hea'
    Annotations summary:
    .qrs
       label_store symbol  description
    1            1      N  Normal beat
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    aftdb
    	AF Termination Challenge Database
    	number of records: 80
    Records summary:
    { 'base_date': None,
      'base_time': datetime.time(1, 28, 24),
      'comments': [],
      'fs': 128,
      'n_sig': 2,
      'sig_len': 7680,
      'sig_name': ['ECG', 'ECG'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .qrs
       label_store symbol  description
    1            1      N  Normal beat
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    cudb
    	CU Ventricular Tachyarrhythmia Database
    	number of records: 35
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 250,
      'n_sig': 1,
      'sig_len': 127232,
      'sig_name': ['ECG'],
      'units': ['mV']}
    Annotations summary:
    .xws
        label_store symbol                        description
    2           2.0      L      Left bundle branch block beat
    8           8.0      A       Atrial premature contraction
    11         11.0      j     Nodal (junctional) escape beat
    12         12.0      /                         Paced beat
    14         14.0      ~              Signal quality change
    15          NaN    NaN                                NaN
    16         16.0      |         Isolated QRS-like artifact
    17          NaN    NaN                                NaN
    18         18.0      s                          ST change
    19         19.0      T                      T-wave change
    20         20.0      *                            Systole
    21         21.0      D                           Diastole
    23         23.0      =             Measurement annotation
    24         24.0      p                        P-wave peak
    25         25.0      B  Left or right bundle branch block
    26         26.0      ^          Non-conducted pacer spike
    27         27.0      t                        T-wave peak
    28         28.0      +                      Rhythm change
    29         29.0      u                        U-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    iafdb
    	Intracardiac Atrial Fibrillation Database
    	number of records: 32
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ '<age>: 81 <sex>: F <diagnosis>: Atrial Fibrillation',
                    '<medications>: Atenolol, Monopril',
                    'Adenosine injected at 70 sec',
                    'Note: signals are uncalibrated'],
      'fs': 1000,
      'n_sig': 8,
      'sig_len': 154500,
      'sig_name': ['II', 'V1', 'aVF', 'CS12', 'CS34', 'CS56', 'CS78', 'CS90'],
      'units': ['mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV']}
    Annotations summary:
    .qrs
       label_store symbol  description
    1            1      N  Normal beat
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ltafdb
    	Long Term AF Database
    	number of records: 84
    Records summary:
    { 'base_date': datetime.date(2003, 1, 31),
      'base_time': datetime.time(9, 30),
      'comments': [],
      'fs': 128,
      'n_sig': 2,
      'sig_len': 9661440,
      'sig_name': ['ECG', 'ECG'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .qrs
        label_store symbol                 description
    16           16      |  Isolated QRS-like artifact
    1             1      N                 Normal beat
    19           19      T               T-wave change
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    macecgdb
    	Motion Artifact Contaminated ECG Database
    	number of records: 27
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ '<age>: 25  <sex>: M  <diagnoses>: (none)  <medications>: '
                    '(none)'],
      'fs': 500,
      'n_sig': 4,
      'sig_len': 4000,
      'sig_name': ['ECG 1', 'ECG 2', 'ECG 3', 'ECG 4'],
      'units': ['mV', 'mV', 'mV', 'mV']}
    Annotations summary:
    No annotation data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    afdb
    	MIT-BIH Atrial Fibrillation Database
    	number of records: 25
    Records summary:
    sampto must be greater than sampfrom
    Annotations summary:
    .atr
        label_store symbol    description
    28           28      +  Rhythm change
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    cdb
    	MIT-BIH ECG Compression Test Database
    	number of records: 168
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 5120,
      'sig_name': ['ECG', 'ECG'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .xws
        label_store symbol                        description
    2           2.0      L      Left bundle branch block beat
    8           8.0      A       Atrial premature contraction
    11         11.0      j     Nodal (junctional) escape beat
    12         12.0      /                         Paced beat
    13         13.0      Q                Unclassifiable beat
    14         14.0      ~              Signal quality change
    15          NaN    NaN                                NaN
    16         16.0      |         Isolated QRS-like artifact
    17          NaN    NaN                                NaN
    18         18.0      s                          ST change
    19         19.0      T                      T-wave change
    20         20.0      *                            Systole
    21         21.0      D                           Diastole
    23         23.0      =             Measurement annotation
    24         24.0      p                        P-wave peak
    25         25.0      B  Left or right bundle branch block
    26         26.0      ^          Non-conducted pacer spike
    27         27.0      t                        T-wave peak
    28         28.0      +                      Rhythm change
    29         29.0      u                        U-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ltdb
    	MIT-BIH Long-Term ECG Database
    	number of records: 7
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': ['Age: 46  Sex: M'],
      'fs': 128,
      'n_sig': 2,
      'sig_len': 10828800,
      'sig_name': ['ECG1', 'ECG2'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .xws
        label_store symbol                        description
    2           2.0      L      Left bundle branch block beat
    8           8.0      A       Atrial premature contraction
    11         11.0      j     Nodal (junctional) escape beat
    12         12.0      /                         Paced beat
    13         13.0      Q                Unclassifiable beat
    14         14.0      ~              Signal quality change
    15          NaN    NaN                                NaN
    16         16.0      |         Isolated QRS-like artifact
    17          NaN    NaN                                NaN
    18         18.0      s                          ST change
    19         19.0      T                      T-wave change
    20         20.0      *                            Systole
    21         21.0      D                           Diastole
    23         23.0      =             Measurement annotation
    24         24.0      p                        P-wave peak
    25         25.0      B  Left or right bundle branch block
    26         26.0      ^          Non-conducted pacer spike
    27         27.0      t                        T-wave peak
    28         28.0      +                      Rhythm change
    29         29.0      u                        U-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    vfdb
    	MIT-BIH Malignant Ventricular Ectopy Database
    	number of records: 22
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 525000,
      'sig_name': ['ECG', 'ECG'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .xws
        label_store symbol                        description
    2           2.0      L      Left bundle branch block beat
    8           8.0      A       Atrial premature contraction
    11         11.0      j     Nodal (junctional) escape beat
    13         13.0      Q                Unclassifiable beat
    14         14.0      ~              Signal quality change
    15          NaN    NaN                                NaN
    16         16.0      |         Isolated QRS-like artifact
    17          NaN    NaN                                NaN
    18         18.0      s                          ST change
    19         19.0      T                      T-wave change
    20         20.0      *                            Systole
    21         21.0      D                           Diastole
    23         23.0      =             Measurement annotation
    24         24.0      p                        P-wave peak
    25         25.0      B  Left or right bundle branch block
    26         26.0      ^          Non-conducted pacer spike
    27         27.0      t                        T-wave peak
    28         28.0      +                      Rhythm change
    29         29.0      u                        U-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    nsrdb
    	MIT-BIH Normal Sinus Rhythm Database
    	number of records: 18
    Records summary:
    { 'base_date': None,
      'base_time': datetime.time(8, 4),
      'comments': ['32 M'],
      'fs': 128,
      'n_sig': 2,
      'sig_len': 11730944,
      'sig_name': ['ECG1', 'ECG2'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .atr
        label_store symbol                                 description
    1             1      N                                 Normal beat
    5             5      V           Premature ventricular contraction
    6             6      F       Fusion of ventricular and normal beat
    9             9      S  Premature or ectopic supraventricular beat
    14           14      ~                       Signal quality change
    16           16      |                  Isolated QRS-like artifact
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    stdb
    	MIT-BIH ST Change Database
    	number of records: 28
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 360,
      'n_sig': 2,
      'sig_len': 536976,
      'sig_name': ['ECG', 'ECG'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .xws
        label_store symbol                        description
    2           2.0      L      Left bundle branch block beat
    8           8.0      A       Atrial premature contraction
    11         11.0      j     Nodal (junctional) escape beat
    12         12.0      /                         Paced beat
    14         14.0      ~              Signal quality change
    15          NaN    NaN                                NaN
    16         16.0      |         Isolated QRS-like artifact
    17          NaN    NaN                                NaN
    18         18.0      s                          ST change
    19         19.0      T                      T-wave change
    20         20.0      *                            Systole
    21         21.0      D                           Diastole
    23         23.0      =             Measurement annotation
    24         24.0      p                        P-wave peak
    25         25.0      B  Left or right bundle branch block
    26         26.0      ^          Non-conducted pacer spike
    27         27.0      t                        T-wave peak
    28         28.0      +                      Rhythm change
    29         29.0      u                        U-wave peak
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    svdb
    	MIT-BIH Supraventricular Arrhythmia Database
    	number of records: 78
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 128,
      'n_sig': 2,
      'sig_len': 230400,
      'sig_name': ['ECG1', 'ECG2'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .atr
        label_store symbol                                 description
    1             1      N                                 Normal beat
    5             5      V           Premature ventricular contraction
    6             6      F       Fusion of ventricular and normal beat
    9             9      S  Premature or ectopic supraventricular beat
    14           14      ~                       Signal quality change
    16           16      |                  Isolated QRS-like artifact
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    nifecgdb
    	Non-Invasive Fetal ECG Database
    	number of records: 55
    Records summary:
    [Errno 2] No such file or directory: '/home/alexander/sandbox/src/git.udia.ca/alex/ecgml_research/wfdb/nifecgdb/ecgca102.edf.hea'
    Annotations summary:
    .qrs
       label_store symbol  description
    1            1      N  Normal beat
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    afpdb
    	PAF Prediction Challenge Database
    	number of records: 300
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [],
      'fs': 128,
      'n_sig': 2,
      'sig_len': 230400,
      'sig_name': ['ECG0', 'ECG1'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .qrs
       label_store symbol  description
    1            1      N  Normal beat
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ptbdb
    	PTB Diagnostic ECG Database
    	number of records: 549
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ 'age: 81',
                    'sex: female',
                    'ECG date: 01/10/1990',
                    'Diagnose:',
                    'Reason for admission: Myocardial infarction',
                    'Acute infarction (localization): infero-latera',
                    'Former infarction (localization): no',
                    'Additional diagnoses: Diabetes mellitus',
                    'Smoker: no',
                    'Number of coronary vessels involved: 1',
                    'Infarction date (acute): 29-Sep-90',
                    'Previous infarction (1) date: n/a',
                    'Previous infarction (2) date: n/a',
                    'Hemodynamics:',
                    'Catheterization date: 16-Oct-90',
                    'Ventriculography: Akinesia inferior wall',
                    'Chest X-ray: Heart size upper limit of norm',
                    'Peripheral blood Pressure (syst/diast):  140/80 mmHg',
                    'Pulmonary artery pressure (at rest) (syst/diast): n/a',
                    'Pulmonary artery pressure (at rest) (mean): n/a',
                    'Pulmonary capillary wedge pressure (at rest): n/a',
                    'Cardiac output (at rest): n/a',
                    'Cardiac index (at rest): n/a',
                    'Stroke volume index (at rest): n/a',
                    'Pulmonary artery pressure (laod) (syst/diast): n/a',
                    'Pulmonary artery pressure (laod) (mean): n/a',
                    'Pulmonary capillary wedge pressure (load): n/a',
                    'Cardiac output (load): n/a',
                    'Cardiac index (load): n/a',
                    'Stroke volume index (load): n/a',
                    'Aorta (at rest) (syst/diast): 160/64 cmH2O',
                    'Aorta (at rest) mean: 106 cmH2O',
                    'Left ventricular enddiastolic pressure: 11 cmH2O',
                    'Left coronary artery stenoses (RIVA): RIVA 70% proximal to '
                    'ramus diagonalis_2',
                    'Left coronary artery stenoses (RCX): No stenoses',
                    'Right coronary artery stenoses (RCA): No stenoses',
                    'Echocardiography: n/a',
                    'Therapy:',
                    'Infarction date: 29-Sep-90',
                    'Catheterization date: 16-Oct-90',
                    'Admission date: 29-Sep-90',
                    'Medication pre admission: Isosorbit-Dinitrate Digoxin '
                    'Glibenclamide',
                    'Start lysis therapy (hh.mm): 19:45',
                    'Lytic agent: Gamma-TPA',
                    'Dosage (lytic agent): 30 mg',
                    'Additional medication: Heparin Isosorbit-Mononitrate ASA '
                    'Diazepam',
                    'In hospital medication: ASA Isosorbit-Mononitrate '
                    'Ca-antagonist Amiloride+Chlorothiazide Glibenclamide Insulin',
                    'Medication after discharge: ASA Isosorbit-Mononitrate '
                    'Amiloride+Chlorothiazide Glibenclamide'],
      'fs': 1000,
      'n_sig': 15,
      'sig_len': 38400,
      'sig_name': [ 'i',
                    'ii',
                    'iii',
                    'avr',
                    'avl',
                    'avf',
                    'v1',
                    'v2',
                    'v3',
                    'v4',
                    'v5',
                    'v6',
                    'vx',
                    'vy',
                    'vz'],
      'units': [ 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV']}
    Annotations summary:
    .xyz
        label_store symbol  description
    1           1.0      N  Normal beat
    63          NaN    NaN          NaN
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    incartdb
    	St Petersburg INCART 12-lead Arrhythmia Database
    	number of records: 75
    Records summary:
    { 'base_date': None,
      'base_time': None,
      'comments': [ '<age>: 65 <sex>: F <diagnoses> Coronary artery disease, '
                    'arterial hypertension',
                    'patient 1',
                    'PVCs, noise'],
      'fs': 257,
      'n_sig': 12,
      'sig_len': 462600,
      'sig_name': [ 'I',
                    'II',
                    'III',
                    'AVR',
                    'AVL',
                    'AVF',
                    'V1',
                    'V2',
                    'V3',
                    'V4',
                    'V5',
                    'V6'],
      'units': [ 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV',
                 'mV']}
    Annotations summary:
    .atr
       label_store symbol                        description
    1            1      N                        Normal beat
    5            5      V  Premature ventricular contraction
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    sddb
    	Sudden Cardiac Death Holter Database
    	number of records: 23
    Records summary:
    { 'base_date': None,
      'base_time': datetime.time(12, 0),
      'comments': [ 'Produced by xform_new from record 30, beginning at 26:35.000',
                    'vfon: 07:54:33'],
      'fs': 250,
      'n_sig': 2,
      'sig_len': 22099250,
      'sig_name': ['ECG', 'ECG'],
      'units': ['mV', 'mV']}
    Annotations summary:
    .ari
        label_store symbol                                 description
    1             1      N                                 Normal beat
    5             5      V           Premature ventricular contraction
    41           41      r    R-on-T premature ventricular contraction
    9             9      S  Premature or ectopic supraventricular beat
    10           10      E                     Ventricular escape beat
    18           18      s                                   ST change
    28           28      +                               Rhythm change
    30           30      ?                                    Learning
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

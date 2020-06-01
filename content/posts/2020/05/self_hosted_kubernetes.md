---
title: "Self Hosted On-Premise Kubernetes"
date: 2020-05-28T20:28:03-06:00
draft: false
description: Progress and necessary steps for creating a Kubernetes cluster on machines that are fully controlled.
status: in-progress
tags:
  - linux
---

**This document is incomplete.**

# Motivation for Kubernetes

[Kubernetes (K8s)](https://kubernetes.io/) is an open-source system designed to manage, scale, and deploy containerized applications.
The motivation is **scale**.
When designed appropriately, an application can have its computation load distributed across multiple machines.
The promise of Kubernetes is to have many containerized applications running on various machines, ranging from cloud infrastructure to local computers (or a hybrid of both), with trivial effort required to update and deploy new applications.
It is a universal abstraction layer that can use any Infrastructure as a Service (IaaS) provider, allowing a developer to create applications using infrastructure-as-code concepts through a standardized API.

Most of the available documentation focuses on deploying applications to existing Kubernetes clusters, relying on [Minikube](https://kubernetes.io/docs/tutorials/kubernetes-basics/create-cluster/cluster-intro/) (a single-node cluster running a virtual machine) for local development and testing.
Additionally, the popular way to use Kubernetes is through managed solutions like [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) or [DigitalOcean Kubernetes](https://www.digitalocean.com/products/kubernetes/).
This arrangement poses two primary disadvantages:

1. Diagnosing errors that occur between Minikube and the managed cloud Kubernentes service is now abstracted away from you. You have no guarantee that the Minikube behaviour accurately reflects the production environment.

2. Minikube is not intended to be production facing, so using it as the self-hosted cluster for a highly available product is not advised.

I aimed to explore how complex it is to build, run, and maintain a Kubernetes cluster for myself.
I will be following the reference documentation for [`kubeadm`](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/).

My aim is to transition my static website, currently hosted on a single server by nginx in a non-containerized fashion, into something managed by Kubernetes.
I will document my checks, configurations, and issues as I go about this process.

> Note: Confusion will be indicated with this visual blockquote. This indicates a step that required backtracking/revision from the reference documentation.

## Available Resources

I have three virtual machines that I will be using. I have named them `helium`, `lithium`, and `beryllium`.
The control-plane node will be `helium`, while `lithium` and `beryllium` are worker nodes, making this a single control-plane cluster of two worker nodes.

All three of these VMs are running Ubuntu 18.04 and have been configured according to my [server quality of life specification]({{< ref "/posts/2020/05/server_qol.md" >}}).
All swap partitions have been disabled in the `/etc/fstab` file, verified by checking `swapon --show` and seeing no results.

| Hostname  | VCPUs | Disk | RAM | UUID | IP Address | MAC address | Security Group |
|-----------|-------|------|-----|------|------------|-------------|----------------|
| helium    | 2     | 20GB | 2GB | 56DF3169-F59C-4CE1-8F71-1C7801D8FD36 | 10.2.7.39  | fa:16:3e:63:6e:8f | kube-control-plane-node |
| lithium   | 1     | 5GB  | 1GB | 32C8D053-5F51-45B5-BEC3-9BCAB6731400 | 10.2.7.53  | fa:16:3e:18:e7:50 | kube-worker-node        |
| beryllium | 1     | 5GB  | 1GB | 98326649-46A5-4199-85C7-E387FC529D9B | 10.2.7.42  | fa:16:3e:e5:48:7a | kube-worker-node        |

### Security Groups 

The security groups are configured to the [required ports documentation](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-required-ports).

> As a form of sanity checking, verify that the ports work using `nc`. This was one of the error diagnosing checks that I needed to perform during `kubeadm init` that could have been done earlier.

#### kube-control-plane-node

| Direction | Ether Type | IP Protocol | Port Range | Remote IP Prefix | Remote Security Group |
|-----------|------------|-------------|------------|------------------|-----------------------|
| Ingress | IPv6 | TCP | 2379 - 2380 | - | kube-worker-node |
| Ingress | IPv4 | TCP | 2379 - 2380 | - | kube-control-plane-node |
| Ingress | IPv6 | TCP | 2379 - 2380 | - | kube-control-plane-node |
| Ingress | IPv4 | TCP | 2379 - 2380 | - | kube-worker-node |
| Ingress | IPv4 | TCP | 6443 | - | kube-worker-node |
| Ingress | IPv6 | TCP | 6443 | - | kube-control-plane-node |
| Ingress | IPv4 | TCP | 6443 | - | kube-control-plane-node |
| Ingress | IPv6 | TCP | 6443 | - | kube-worker-node |
| Ingress | IPv6 | TCP | 10250 - 10252 | - | kube-control-plane-node |
| Ingress | IPv4 | TCP | 10250 - 10252 | - | kube-control-plane-node |


#### kube-worker-node

| Direction | Ether Type | IP Protocol | Port Range | Remote IP Prefix | Remote Security Group |
|-----------|------------|-------------|------------|------------------|-----------------------|
| Ingress | IPv4 | TCP | 10250 | - | kube-control-plane-node |
| Ingress | IPv6 | TCP | 10250 | - | kube-control-plane-node |
| Ingress | IPv6 | TCP | 10250 | - | kube-worker-node |
| Ingress | IPv4 | TCP | 10250 | - | kube-worker-node |
| Ingress | IPv6 | TCP | 30000 - 32767 | - | kube-worker-node |
| Ingress | IPv6 | TCP | 30000 - 32767 | - | kube-control-plane-node |
| Ingress | IPv4 | TCP | 30000 - 32767 | - | kube-worker-node |
| Ingress | IPv4 | TCP | 30000 - 32767 | - | kube-control-plane-node |

### Bridged Traffic in iptables

Load the module `br_netfilter` and ensure that the following sysctl variables are set.

> The lines for ip forwarding were not part of the original documentation, but **required**.

```bash
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
EOF

sudo sysctl --system
```

# Container Runtime

The documentation specified three types of container runtimes to choose from.
I have decided to use [`cri-o`](https://cri-o.io/). Alternatively, you could use [Docker](https://www.docker.com/products/container-runtime) or [containerd](https://containerd.io/).
This must be installed on all nodes.

```bash
CRIO_VERSION=1.17 
. /etc/os-release
sudo sh -c "echo 'deb http://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/x${NAME}_${VERSION_ID}/ /' >/etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list"
wget -nv https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/x${NAME}_${VERSION_ID}/Release.key -O- | sudo apt-key add -
sudo apt-get update -qq
sudo apt-get install cri-o-${CRIO_VERSION}
```

> The next steps are not specified in the documentation, but are required otherwise kubeadm will not work.

```bash
# enable the CRIO service
sudo systemctl enable crio
sudo systemctl start crio
# verify the status of crio using the cli
sudo crio-status i
```
```text
sudo crio-status i
cgroup driver: systemd
storage driver: 
storage root: /var/lib/containers/storage
default GID mappings (format <container>:<host>:<size>):
  0:0:4294967295
default UID mappings (format <container>:<host>:<size>):
  0:0:4294967295
```

A new file should be created at `/var/run/crio/crio.sock`.
```bash
ls -alh /var/run/crio/crio.sock 
# srwxr-xr-x 1 root root 0 May 30 03:48 /var/run/crio/crio.sock
```

# Install kubeadm, kubelet, and kubectl

These three packages must be installed on all of the machines.

* `kubeadm`: the command to bootstrap the cluster.
* `kubelet`: the component that runs on all of the machines in your cluster and does things like starting pods and containers.
* `kubectl`: the command line util to talk to your cluster.

```bash
sudo apt-get update && sudo apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

## Configure the control-plane node cgroup driver for kubelet

I am not using Docker as my container runtime, therefore the documentation tells me that I need to modify the `/var/lib/kubelet/config.yaml` file.
The heading implies that this only needs to be done for the control plane node, so in my case on the `helium` VM.

```bash
# enable and start the kubelet service
sudo systemctl enable kubelet
sudo systemctl start kubelet

# this file does not exist?
ls /var/lib/kubelet/
```
```
ls: cannot access '/var/lib/kubelet/': No such file or directory
```

> Maybe just create the file?

> Note: The documentation is not explicit on which cgroup driver I should use. The [CRI-O getting started section](https://github.com/cri-o/cri-o#running-kubernetes-with-cri-o) indicates that it should be `systemd`, but it seems to be set as an environment variable before calling a script `./hack/local-up-cluster.sh`.


```bash
sudo mkdir -p /var/lib/kubelet
cat <<EOF | sudo tee /var/lib/kubelet/config.yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF
```

Restart the kubelet service.

```bash
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

# Initializing the control-plane node

## Control Plane Endpoint

The [first step of the control-plane node initialization](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#initializing-your-control-plane-node) recommends that the `--control-plane-endpoint` flag be set to a DNS name or the IP address of a load-balancer.

> Perhaps I should use the ip address of `helium`, `10.2.7.39`? I only have one control-plane node. I do not know how difficult it is to change this in the future, should I scale up my kubernetes infrastructure.

## Choose a Pod network add-on

Second step redirects to [a new section for installing pod network add-ons](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network).
This is a mandatory step as without a Container Network Interface (CNI) Pod network, no Pod communication can occur.
Cluster DNS (CoreDNS) cannot start before the network is installed.

> First mention of Cluster DNS, not sure what it is and how it differs from regular DNS.

Five different pod network plugins are listed. `Calico`, `Cilium`, `Contiv-VPP`, `Kube-router`, `Weave Net`. Each one supposedly does the same thing? Another link to [Networking and Network Policy](https://kubernetes.io/docs/concepts/cluster-administration/addons/#networking-and-network-policy) shows an additional list of pod network plugins.

> Choosing a pod network add-on appears to be a critical step for Kubernetes cluster deployment, and too many options are presented. The effort for an individual to make an informed choice by comparing all of these plugins is overwhelming. 

I have decided to use `Calico` due to the statement that it is the only CNI plugin that `kubeadm` runs e2e tests against.
From the [Calico quickstart documentation](https://docs.projectcalico.org/getting-started/kubernetes/quickstart), I need to set the `--pod-network-cidr` flag when run. The provided default is `192.168.0.0/16`.

## Specifying the Container Runtime.

Running `kubeadm init` will try to detect the container runtime on Linux. Otherwise, the `--cri-socket` argument needs to be specified. I will specify the cri-socket explicity.

> The protocol should be supplied when running --cri-socket, so I should use `unix:///var/run/crio/crio.sock` as my value. First attempt did not specify protocol and an error occurred.

## IPV6 Addressing

I have set the security groups to support both IPv4 and IPv6 addressing. However, I will leave the `--apiserver-advertise-address` flag unset, defaulting to the IPv4 functionality.

> This needed to be set for me, and was not optional. For some reason, the api server was listening on IPv6 and caused the first cluster initialization attempt to fail.

## Verifying gcr.io container image registry connection

This is the fifth step, marked optional, to run prior to `kubeadm init`.

```bash
# verify connectivity to the gcr.io container image registry
sudo kubeadm config images pull
```
```text
W0530 03:53:21.845423   27423 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[config/images] Pulled k8s.gcr.io/kube-apiserver:v1.18.3
[config/images] Pulled k8s.gcr.io/kube-controller-manager:v1.18.3
[config/images] Pulled k8s.gcr.io/kube-scheduler:v1.18.3
[config/images] Pulled k8s.gcr.io/kube-proxy:v1.18.3
[config/images] Pulled k8s.gcr.io/pause:3.2
[config/images] Pulled k8s.gcr.io/etcd:3.4.3-0
[config/images] Pulled k8s.gcr.io/coredns:1.6.7
```

## Running kubeadm init

```bash
sudo kubeadm init \
  --pod-network-cidr=192.168.0.0/16 \
  --control-plane-endpoint=10.2.7.39 \
  --cri-socket=unix:///var/run/crio/crio.sock
```
```text
W0530 04:39:13.450561   31996 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[init] Using Kubernetes version: v1.18.3
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [helium kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 10.2.7.39 10.2.7.39]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [helium localhost] and IPs [10.2.7.39 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [helium localhost] and IPs [10.2.7.39 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
W0530 04:39:18.956479   31996 manifests.go:225] the default kube-apiserver authorization-mode is "Node,RBAC"; using "Node,RBAC"
[control-plane] Creating static Pod manifest for "kube-scheduler"
W0530 04:39:18.970005   31996 manifests.go:225] the default kube-apiserver authorization-mode is "Node,RBAC"; using "Node,RBAC"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[kubelet-check] Initial timeout of 40s passed.

        Unfortunately, an error has occurred:
                timed out waiting for the condition

        This error is likely caused by:
                - The kubelet is not running
                - The kubelet is unhealthy due to a misconfiguration of the node in some way (required cgroups disabled)

        If you are on a systemd-powered system, you can try to troubleshoot the error with the following commands:
                - 'systemctl status kubelet'
                - 'journalctl -xeu kubelet'

        Additionally, a control plane component may have crashed or exited when started by the container runtime.
        To troubleshoot, list all containers using your preferred container runtimes CLI.

        Here is one example how you may list all Kubernetes containers running in cri-o/containerd using crictl:
                - 'crictl --runtime-endpoint unix:///var/run/crio/crio.sock ps -a | grep kube | grep -v pause'
                Once you have found the failing container, you can inspect its logs with:
                - 'crictl --runtime-endpoint unix:///var/run/crio/crio.sock logs CONTAINERID'

error execution phase wait-control-plane: couldn't initialize a Kubernetes cluster
To see the stack trace of this error execute with --v=5 or higher
```

> Checking all the possible error conditions.

### Investigating Errors

* `systemctl status kubelet`, service is active and running.
    ```text
    kubelet.service - kubelet: The Kubernetes Node Agent
    Loaded: loaded (/lib/systemd/system/kubelet.service; enabled; vendor preset: enabled)
    Drop-In: /etc/systemd/system/kubelet.service.d
            └─10-kubeadm.conf
    Active: active (running) since Sat 2020-05-30 05:15:52 UTC; 7min ago
      Docs: https://kubernetes.io/docs/home/
    Main PID: 493 (kubelet)
    Tasks: 16 (limit: 2360)
    CGroup: /system.slice/kubelet.service
            └─493 /usr/bin/kubelet --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --config=/var/lib/kubelet/config.yaml --container-runtime=remote --container-runtime-endpoint=unix:///var/run/crio/crio.sock --resolv-conf=/run/systemd/resolve/resolv.conf
    ````
* `journalctl -xeu kubelet`, no entries.
* `crictl --runtime-endpoint unix:///var/run/crio/crio.sock ps -a | grep kube | grep -v pause`, no output.

When running the init command again, I noticed a peculiar thing: the port 10250 was in use, but using the tcp6 protocol.

```bash
sudo netstat -lnp | grep 1025
#tcp6       0      0 :::10250                :::*                    LISTEN      32166/kubelet  
```

Perhaps I need to set the IPV6 address in the `----apiserver-advertise-address` flag?

## Setting the Control Plane IPv6 address

```bash
sudo kubeadm init \
  --pod-network-cidr=192.168.0.0/16 \
  --control-plane-endpoint=2605:fd00:4:1001:f816:3eff:fe63:6e8f \
  --apiserver-advertise-address=2605:fd00:4:1001:f816:3eff:fe63:6e8f \
  --cri-socket=unix:///var/run/crio/crio.sock \
  --v=5
```
> Same error as before. Stack traces are not immediately useful.

### Investigating Errors

It is possible that my security groups are not properly allowing the TCP port traffic?

```bash
nc -z -v 2605:fd00:4:1001:f816:3eff:fe63:6e8f 10250
# Connection to 2605:fd00:4:1001:f816:3eff:fe63:6e8f 10250 port [tcp/*] succeeded!
nc -z -v 10.2.7.39 10250
# Connection to 10.2.7.39 10250 port [tcp/*] succeeded!
```

Perhaps run only with the `--pod-network-cidr` flag?

## Only --pod-network-cidr set

```bash
sudo kubeadm init --pod-network-cidr=192.168.0.0/16
```
> Same error as before.

### Searching for answers

I found two GitHub issues of users experiencing the same issue that I am currently running into.
* [kubeadm init "[kubelet-check] Initial timeout of 40s passed" #74249](https://github.com/kubernetes/kubernetes/issues/74249)
* [ couldn't initialize a Kubernetes cluster #74850 ](https://github.com/kubernetes/kubernetes/issues/74850)

Both issues are closed by bots due to 30 days of inactivity and no actionable suggestions for the issue opener.
Despair is starting to kick in, so I think I'll try taking a look at this with a fresh perspective another time.

> Boneheaded mistake! Needed to run `sudo journalctl -xeu kubelet`.

```bash
sudo journalctl -xeu kubelet | less
```
```text
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.316833    2563 kubelet.go:2267] node "helium" not found
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.417082    2563 kubelet.go:2267] node "helium" not found
May 30 06:09:25 helium kubelet[2563]: I0530 06:09:25.417558    2563 kubelet_node_status.go:294] Setting node annotation to enable volume controller attach/detach
May 30 06:09:25 helium kubelet[2563]: I0530 06:09:25.418057    2563 kubelet_node_status.go:294] Setting node annotation to enable volume controller attach/detach
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.481167    2563 remote_runtime.go:105] RunPodSandbox from runtime service failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/pod27338bfe3d038f59a91668505aa727cf
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.481312    2563 kuberuntime_sandbox.go:68] CreatePodSandbox for pod "kube-apiserver-helium_kube-system(27338bfe3d038f59a91668505aa727cf)" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/pod27338bfe3d038f59a91668505aa727cf
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.481376    2563 kuberuntime_manager.go:727] createPodSandbox for pod "kube-apiserver-helium_kube-system(27338bfe3d038f59a91668505aa727cf)" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/pod27338bfe3d038f59a91668505aa727cf
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.481480    2563 pod_workers.go:191] Error syncing pod 27338bfe3d038f59a91668505aa727cf ("kube-apiserver-helium_kube-system(27338bfe3d038f59a91668505aa727cf)"), skipping: failed to "CreatePodSandbox" for "kube-apiserver-helium_kube-system(27338bfe3d038f59a91668505aa727cf)" with CreatePodSandboxError: "CreatePodSandbox for pod \"kube-apiserver-helium_kube-system(27338bfe3d038f59a91668505aa727cf)\" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/pod27338bfe3d038f59a91668505aa727cf"
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.490693    2563 remote_runtime.go:105] RunPodSandbox from runtime service failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/poda8caea92c80c24c844216eb1d68fe417
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.490766    2563 kuberuntime_sandbox.go:68] CreatePodSandbox for pod "kube-scheduler-helium_kube-system(a8caea92c80c24c844216eb1d68fe417)" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/poda8caea92c80c24c844216eb1d68fe417
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.490791    2563 kuberuntime_manager.go:727] createPodSandbox for pod "kube-scheduler-helium_kube-system(a8caea92c80c24c844216eb1d68fe417)" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/poda8caea92c80c24c844216eb1d68fe417
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.490871    2563 pod_workers.go:191] Error syncing pod a8caea92c80c24c844216eb1d68fe417 ("kube-scheduler-helium_kube-system(a8caea92c80c24c844216eb1d68fe417)"), skipping: failed to "CreatePodSandbox" for "kube-scheduler-helium_kube-system(a8caea92c80c24c844216eb1d68fe417)" with CreatePodSandboxError: "CreatePodSandbox for pod \"kube-scheduler-helium_kube-system(a8caea92c80c24c844216eb1d68fe417)\" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/burstable/poda8caea92c80c24c844216eb1d68fe417"
May 30 06:09:25 helium kubelet[2563]: E0530 06:09:25.517320    2563 kubelet.go:2267] node "helium" not found
```

According to [crio issue 896](https://github.com/cri-o/cri-o/issues/896), I need to put `--cgroup-driver=systemd` to the `/var/lib/kubelet/kubeadm-flags.env` as `KUBELET_KUBEADM_ARGS` and restart my kubelet service.

```bash
cat /var/lib/kubelet/kubeadm-flags.env 
```
```text
KUBELET_KUBEADM_ARGS="--container-runtime=remote --container-runtime-endpoint=unix:///var/run/crio/crio.sock --resolv-conf=/run/systemd/resolve/resolv.conf --cgroup-driver=systemd"
```

Additionally, I should add the line `cgroup-manager: systemd` to `/etc/crictl.yaml`.

```bash
cat /etc/crictl.yaml
```
```text
runtime-endpoint: unix:///var/run/crio/crio.sock
cgroup-manager: systemd
```

## Rerun after setting crictl.yaml and kubeadm-flags

```bash
sudo kubeadm init \
  --pod-network-cidr=192.168.0.0/16 \
  --control-plane-endpoint=2605:fd00:4:1001:f816:3eff:fe63:6e8f \
  --apiserver-advertise-address=2605:fd00:4:1001:f816:3eff:fe63:6e8f \
  --cri-socket=unix:///var/run/crio/crio.sock
```

Still error'd out, same errors when inspecting kubelet output.

```bash
sudo journalctl -xeu kubelet | less
```
```text
Jun 01 01:31:47 helium kubelet[9371]: I0601 01:31:47.306631    9371 kubelet_node_status.go:294] Setting node annotation to enable volume controller attach/detach
Jun 01 01:31:47 helium kubelet[9371]: E0601 01:31:47.346049    9371 kubelet.go:2267] node "helium" not found
Jun 01 01:31:47 helium kubelet[9371]: E0601 01:31:47.356789    9371 remote_runtime.go:105] RunPodSandbox from runtime service failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/besteffort/pod79469814fc6e5900fc5dbff6869492a8
Jun 01 01:31:47 helium kubelet[9371]: E0601 01:31:47.356905    9371 kuberuntime_sandbox.go:68] CreatePodSandbox for pod "etcd-helium_kube-system(79469814fc6e5900fc5dbff6869492a8)" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/besteffort/pod79469814fc6e5900fc5dbff6869492a8
Jun 01 01:31:47 helium kubelet[9371]: E0601 01:31:47.356983    9371 kuberuntime_manager.go:727] createPodSandbox for pod "etcd-helium_kube-system(79469814fc6e5900fc5dbff6869492a8)" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/besteffort/pod79469814fc6e5900fc5dbff6869492a8
Jun 01 01:31:47 helium kubelet[9371]: E0601 01:31:47.357084    9371 pod_workers.go:191] Error syncing pod 79469814fc6e5900fc5dbff6869492a8 ("etcd-helium_kube-system(79469814fc6e5900fc5dbff6869492a8)"), skipping: failed to "CreatePodSandbox" for "etcd-helium_kube-system(79469814fc6e5900fc5dbff6869492a8)" with CreatePodSandboxError: "CreatePodSandbox for pod \"etcd-helium_kube-system(79469814fc6e5900fc5dbff6869492a8)\" failed: rpc error: code = Unknown desc = cri-o configured with systemd cgroup manager, but did not receive slice as parent: /kubepods/besteffort/pod79469814fc6e5900fc5dbff6869492a8"
Jun 01 01:31:47 helium kubelet[9371]: E0601 01:31:47.427571    9371 eviction_manager.go:255] eviction manager: failed to get summary stats: failed to get node info: node "helium" not found
```

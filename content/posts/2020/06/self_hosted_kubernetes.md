---
title: "Self Hosted On-Premise Kubernetes"
date: 2020-06-09T12:28:03-06:00
draft: false
description: Progress and necessary steps for creating a Kubernetes cluster on machines that are fully controlled.
status: in-progress
aliases:
  - /posts/2020/05/self_hosted_kubernetes/
tags:
  - linux
---

**This document is incomplete. (Still need step by step instructions for deploying a static nginx site)**

# Motivation for Kubernetes

[Kubernetes (K8s)](https://kubernetes.io/) is an open-source system designed to manage, scale, and deploy containerized applications.
The motivation is **scale**.
When designed appropriately, an application can have its computation load distributed across multiple machines.
The promise of Kubernetes is to have many containerized applications running on various machines, ranging from cloud infrastructure to local computers (or a hybrid of both), with trivial effort required to update and deploy new applications.
It is a universal abstraction layer that can use any Infrastructure as a Service (IaaS) provider, allowing a developer to create applications using infrastructure-as-code concepts through a standardized API.

Most of the available documentation focuses on deploying applications to existing Kubernetes clusters, relying on [Minikube](https://kubernetes.io/docs/tutorials/kubernetes-basics/create-cluster/cluster-intro/) (a single-node cluster running a virtual machine) for local development and testing.
Additionally, the popular way to use Kubernetes is through managed solutions like [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) or [DigitalOcean Kubernetes](https://www.digitalocean.com/products/kubernetes/).
This arrangement poses two primary disadvantages:

1. Diagnosing errors that occur between Minikube and the managed cloud Kubernetes service is now abstracted away from you. You have no guarantee that the Minikube behavior accurately reflects the production environment.

2. Minikube is not intended to be production facing, so using it as the self-hosted cluster for a highly available product is not advised.

I aimed to explore how complex it is to build, run, and maintain a Kubernetes cluster for myself.
I will be following the reference documentation for [`kubeadm`](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/).

My aim is to transition my static website, currently hosted on a single server by nginx in a non-containerized fashion, into something managed by Kubernetes.
I will document my checks, configurations, and issues as I go about this process.

> Note: Confusion will be indicated with this visual blockquote. This indicates a step that required backtracking/revision from the reference documentation.

All listed tokens are no longer active as of the publishing of this blog post.

## Available Resources

I have three virtual machines that I will be using. I have named them `helium`, `lithium`, and `beryllium`.
The control-plane node will be `helium`, while `lithium` and `beryllium` are worker nodes, making this a single control-plane cluster of two worker nodes.

All three of these VMs are running Ubuntu 18.04 and have been configured according to my [server quality of life specification]({{< ref "/posts/2020/05/server_qol.md" >}}).
All swap partitions have been disabled in the `/etc/fstab` file, verified by checking `swapon --show` and seeing no results.
The product uuid is found running `sudo cat /sys/class/dmi/id/product_uuid`.
The IPV4 addresses are private to the local network, while IPV6 addresses are public.

| Hostname  | VCPUs | Disk | RAM | MAC address       | IPV4 Address | IPV6 Address                         | UUID                                 |
|-----------|-------|------|-----|-------------------|--------------|--------------------------------------|--------------------------------------|
| beryllium | 1     | 5GB  | 1GB | fa:16:3e:97:2e:68 | 10.2.7.166   | 2605:fd00:4:1001:f816:3eff:fe97:2e68 | 86513ABD-2710-4CDF-9CC2-FDD9F36961F8 |
| lithium   | 1     | 5GB  | 1GB | fa:16:3e:4d:7d:54 | 10.2.7.51    | 2605:fd00:4:1001:f816:3eff:fe4d:7d54 | 7F9479E7-27A6-4062-AD99-2AEC69EB8E97 |
| helium    | 2     | 20GB | 2GB | fa:16:3e:c7:78:13 | 10.2.7.140   | 2605:fd00:4:1001:f816:3eff:fec7:7813 | E9B70618-6793-4671-835F-E2378BA8B5CF |

All three virtual machines have the following steps applied to them.

### Security Groups 

The security groups are configured to the [required ports documentation](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-required-ports).

> As a form of sanity checking, verify that the ports work using `netcat`. For example `nc -l 2379` while on another server `echo "Testing Port 2379" | nc <ip> 2379`

#### kube-node

Although the documentation states that the ports for the worker and control plane nodes can be different, I combined them into one group of rules for simplicity.

| Direction | Ether Type | IP Protocol | Port Range | Remote IP Prefix | Remote Security Group |
|-----------|------------|-------------|------------|------------------|-----------------------|
| Ingress | IPv4 | TCP | 2379 - 2380 | - | kube-node |
| Ingress | IPv6 | TCP | 2379 - 2380 | - | kube-node |
| Ingress | IPv4 | TCP | 6443 | - | kube-node |
| Ingress | IPv6 | TCP | 6443 | - | kube-node |
| Ingress | IPv4 | TCP | 10250 - 10252 | - | kube-node |
| Ingress | IPv6 | TCP | 10250 - 10252 | - | kube-node |
| Ingress | IPv4 | TCP | 30000 - 32767 | - | kube-node |
| Ingress | IPv6 | TCP | 30000 - 32767 | - | kube-node |

### Bridged Traffic in iptables

Load the module `br_netfilter` and ensure that the following sysctl variables are set.
As this module must be loaded, ensure that it is loaded after boot.

```bash
lsmod | grep br_netfilter
# if this returns nothing, make this kernel module on boot
cat <<EOF | sudo tee /etc/modules-load.d/br_netfilter.conf
br_netfilter
EOF

# load this kernel module
sudo modprobe br_netfilter
```

> The lines for ip forwarding were not part of the original documentation, but **required**.

```bash
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
I have decided to use the [docker.io](https://www.docker.com/products/container-runtime) runtime, although the [containerd](https://containerd.io/) or [CRI-O](https://cri-o.io/) runtimes can also be used.
This must be installed on all nodes.

> I had a lot of difficulty getting CRI-O to work, running into [cri-o issue#3301](https://cri-o.io/) in my first attempt at setting up a cluster. My second attempt started from fresh servers using the default docker runtime.

```bash
# (Install Docker CE)
## Set up the repository:
### Install packages to allow apt to use a repository over HTTPS
apt-get update && apt-get install -y \
  apt-transport-https ca-certificates curl software-properties-common gnupg2

# Add Docker’s official GPG key:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add the Docker apt repository:
add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"

# Install Docker CE
apt-get update && apt-get install -y \
  containerd.io=1.2.13-1 \
  docker-ce=5:19.03.8~3-0~ubuntu-$(lsb_release -cs) \
  docker-ce-cli=5:19.03.8~3-0~ubuntu-$(lsb_release -cs)

# Set up the Docker daemon
cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

mkdir -p /etc/systemd/system/docker.service.d

# Restart Docker
systemctl daemon-reload
systemctl restart docker
```

> When inspecting the output of `systemctl status docker`, kernel does not support swap memory limit, cgroup rt period, and cgroup rt runtime warnings appeared:
```text
● docker.service - Docker Application Container Engine
   Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2020-06-09 21:40:10 UTC; 10min ago
     Docs: https://docs.docker.com
 Main PID: 3950 (dockerd)
    Tasks: 10
   CGroup: /system.slice/docker.service
           └─3950 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock

Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.345976523Z" level=warning msg="Your kernel does not support swap memory limit"
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.346027949Z" level=warning msg="Your kernel does not support cgroup rt period"
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.346038318Z" level=warning msg="Your kernel does not support cgroup rt runtime"
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.346945181Z" level=info msg="Loading containers: start."
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.490767608Z" level=info msg="Default bridge (docker0) is assigned with an IP address 172.17.0.0/16. Daemon option --bip can be used to set a preferred IP address"
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.642315645Z" level=info msg="Loading containers: done."
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.690425595Z" level=info msg="Docker daemon" commit=afacb8b7f0 graphdriver(s)=overlay2 version=19.03.8
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.691112283Z" level=info msg="Daemon has completed initialization"
Jun 09 21:40:10 helium systemd[1]: Started Docker Application Container Engine.
Jun 09 21:40:10 helium dockerd[3950]: time="2020-06-09T21:40:10.721791596Z" level=info msg="API listen on /var/run/docker.sock"
```

All my virtual machines are currently running `Linux 4.15.0-101-generic` as the kernel.
I am ignoring these errors for the time being.

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
```bash
kubelet --version
# Kubernetes v1.18.3

kubectl version
# Client Version: version.Info{Major:"1", Minor:"18", GitVersion:"v1.18.3", GitCommit:"2e7996e3e2712684bc73f0dec0200d64eec7fe40", GitTreeState:"clean", BuildDate:"2020-05-20T12:52:00Z", GoVersion:"go1.13.9", Compiler:"gc", Platform:"linux/amd64"}

kubeadm version
# kubeadm version: &version.Info{Major:"1", Minor:"18", GitVersion:"v1.18.3", GitCommit:"2e7996e3e2712684bc73f0dec0200d64eec7fe40", GitTreeState:"clean", BuildDate:"2020-05-20T12:49:29Z", GoVersion:"go1.13.9", Compiler:"gc", Platform:"linux/amd64"}
```
# Initialize the Control Plane Node

These commands only need to be done on the control plane node `helium`.

- I created an `AAAA` record mapping `kube.udia.ca` to my IPv6 address for the cluster control plane node.
- I have chosen the default pod network add-on [Calico](https://docs.projectcalico.org/latest/introduction/). I will add the flag `--pod-network-cidr=192.168.0.0/16`, as it is not currently in use within my network.
- I am relying on kubeadm to automatically detect my container runtime, as I have left everything as default.
- I will be using IPv6 addressing, and therefore will specify the `--apiserver-advertise-address` flag accordingly.
- I have run `kubeadm config images pull` prior to `kubeadm init` to verify connectivity to the gcr.io container image registry.

```bash
kubeadm init \
  --apiserver-advertise-address=2605:fd00:4:1001:f816:3eff:fec7:7813 \
  --pod-network-cidr=192.168.0.0/16 \
  --control-plane-endpoint=kube.udia.ca
```

After a few moments, I was presented with a successful control-plane initialization message.

```text
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of control-plane nodes by copying certificate authorities
and service account keys on each node and then running the following as root:

  kubeadm join kube.udia.ca:6443 --token <private_token> \
    --discovery-token-ca-cert-hash sha256:<private_hash> \
    --control-plane

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join kube.udia.ca:6443 --token <private_token> \
    --discovery-token-ca-cert-hash sha256:<private_hash>
```

I ran the above steps for my regular user. As a non-sudo user, I installed the Calico pod network.

```bash
kubectl apply -f https://docs.projectcalico.org/v3.11/manifests/calico.yaml
```
```text
configmap/calico-config created
customresourcedefinition.apiextensions.k8s.io/felixconfigurations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ipamblocks.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/blockaffinities.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ipamhandles.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ipamconfigs.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/bgppeers.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/bgpconfigurations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ippools.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/hostendpoints.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/clusterinformations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/globalnetworkpolicies.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/globalnetworksets.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/networkpolicies.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/networksets.crd.projectcalico.org created
clusterrole.rbac.authorization.k8s.io/calico-kube-controllers created
clusterrolebinding.rbac.authorization.k8s.io/calico-kube-controllers created
clusterrole.rbac.authorization.k8s.io/calico-node created
clusterrolebinding.rbac.authorization.k8s.io/calico-node created
daemonset.apps/calico-node created
serviceaccount/calico-node created
deployment.apps/calico-kube-controllers created
serviceaccount/calico-kube-controllers created
```

Afterwards, I logged into my two worker virtual machines and ran the join command (as root).

I have verified that my cluster is operational.

```bash
kubectl get nodes
```
```text
NAME        STATUS   ROLES    AGE     VERSION
beryllium   Ready    <none>   51s     v1.18.3
helium      Ready    master   7m14s   v1.18.3
lithium     Ready    <none>   65s     v1.18.3
```
---
title: Infrastructure Example using Terraform and Ansible
draft: false
description: Transitioning my personal online presence to using declarative infrastructure as code.
status: in-progress
tags:
  - personal
  - linux
date: 2021-03-14 11:49:57
---

I want to be able to declaratively and consistently reproduce my virtual machines necessary for hosting my personal site and projects.
Before, using the cloud vendor provided web interfaces, I would construct my infrastructure manually by submitting web forms.

This post outlines summarizes one day of experimentation. It contains my approach to spinning up a small virtual machine/infrastructure, as well as the post-infrastructure scripts that I run to get a minimal secure website public facing.
Minimal and secure consists of:

* a 2 vCPU, 40GB disk with 4096MB memory virtual machine provisioned thorugh [Cybera's](https://www.cybera.ca/rapid-access-cloud/) [OpenStack](https://www.openstack.org/) offering
* instance attached to internal private network, as well as public network (ipv4 & ipv6)
* security groups for restrictive inbound and outbound connections
* additional 80GB storage volume for application data
* various operating system and SSH hardening configurations applied to the instance
* a basic NGINX instance up, serving a static website and using Let's Encrypt SSL

**This is a transitionary process, as I have not decommissioned my old server, instead continuing to proxy-pass various functionality until this is fully complete.**
The ideal state is all my applications are declared as code. Source code is available at [git.sr.ht/~udia/infra](https://git.sr.ht/~udia/infra).

# Terraform

I am using [Terraform](https://www.terraform.io/) to specify my infrastructure as code, relying on the [OpenStack Provider](https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest/docs) to interact with the OpenStack offered resources.

## Terraform Breakdown

```terraform
# https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest/docs

terraform {
  required_version = ">= 0.14.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.39.0"
    }
  }
}

provider "openstack" {
  # All provider required keys are stored as environment variables.
  # auth_url: OS_AUTH_URL
  # tenant_id: OS_PROJECT_ID
  # tenant_name: OS_PROJECT_NAME
  # user_domain_name: OS_USER_DOMAIN_NAME
  # user_name: OS_USERNAME
  # password: OS_PASSWORD
  # region: OS_REGION_NAME
}
```

### Provisioning Public SSH Key, Security Groups

No need for password based authentication, ensure that I can SSH into the machine, receive basic web traffic, and communicate out to public WAN.

```terraform
resource "openstack_compute_keypair_v2" "personal_key" {
  name       = "alex_at_udia_dot_ca april_2020"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC55eI+mNYEnwDyVb8EjPDQ4saNcw76rqzxDu6uX9bzFEQ8FiqDBXhLtpkW0toeyzSHWbDShYiTWNUKhcupY+i+J4kkFlSv9QDhLFVPkrvkjP1fqHG7eRxgGzcTywXyiT7yni4xxvEAPGIP/IFaDBSOHh8oA/YIvHLZVVcT3G7x/jYfcsIc3HtNGAayKEBRqXWrtSbkqrTN/qLQp5Rstz2zpOnVwdg2qkRuwABkySnssgIvEqAIAEhcBOJJXyYaA/DQFZRTQRH6CDTTYtyYTWdYjS+LdKV/umXPSXeUvMHNZkh8Vqkm9lfj0XyaOM3QQOp+eUIY228fgW1udV/ATo7N alex@udia.ca April, 2020"
}

resource "openstack_networking_secgroup_v2" "secgroup_1" {
  name        = "helium-ssh"
  description = "Enable SSH into the server."
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_1_rule_1" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup_1.id
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_1_rule_2" {
  direction         = "ingress"
  ethertype         = "IPv6"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "::/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup_1.id
}

resource "openstack_networking_secgroup_v2" "secgroup_2" {
  name        = "helium-basic-operations"
  description = "General operations, allow all outbound, inbound web"
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_2_rule_1" {
  direction         = "egress"
  ethertype         = "IPv4"
  protocol          = ""
  remote_group_id   = ""
  remote_ip_prefix  = ""
  security_group_id = openstack_networking_secgroup_v2.secgroup_2.id
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_2_rule_2" {
  direction         = "egress"
  ethertype         = "IPv6"
  protocol          = ""
  remote_group_id   = ""
  remote_ip_prefix  = ""
  security_group_id = openstack_networking_secgroup_v2.secgroup_2.id
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_2_rule_3" {
  direction         = "ingress"
  ethertype         = "IPv6"
  protocol          = "tcp"
  port_range_min = 80
  port_range_max = 80
  remote_ip_prefix = "::/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup_2.id
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_2_rule_4" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min = 80
  port_range_max = 80
  remote_ip_prefix = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup_2.id
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_2_rule_5" {
  direction         = "ingress"
  ethertype         = "IPv6"
  protocol          = "tcp"
  port_range_min = 443
  port_range_max = 443
  remote_ip_prefix = "::/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup_2.id
}
resource "openstack_networking_secgroup_rule_v2" "secgroup_2_rule_6" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min = 443
  port_range_max = 443
  remote_ip_prefix = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup_2.id
}
```

### Networking/Subnet Setup

Although I currently only have one machine, I wanted to set it up on a private network with a subnet and router in addition to the default network provided by Cybera.
The [networking documentation/wiki](https://wiki.cybera.ca/display/RAC/Networking) serves as a useful starting point, although it is geared towards using the openstack cli.

```
resource "openstack_networking_network_v2" "network_1" {
  name           = "tf_net"
  admin_state_up = "true"
}
resource "openstack_networking_subnet_v2" "network_1_subnet_1" {
  name       = "tf_subnet_v4"
  network_id = openstack_networking_network_v2.network_1.id
  cidr       = "192.168.199.0/24"
}
resource "openstack_networking_subnet_v2" "network_1_subnet_2" {
  name              = "tf_subnet_v6"
  ip_version        = "6"
  network_id        = openstack_networking_network_v2.network_1.id
  cidr              = "2605:fd00:5:1001::/64"
  ipv6_address_mode = "slaac"
  ipv6_ra_mode      = "slaac"
}

resource "openstack_networking_router_v2" "router_1" {
  name           = "tf_router"
  admin_state_up = true
}
resource "openstack_networking_router_interface_v2" "router_1_interface_subnet_1" {
  router_id = openstack_networking_router_v2.router_1.id
  subnet_id = openstack_networking_subnet_v2.network_1_subnet_1.id
}
resource "openstack_networking_router_interface_v2" "router_1_interface_subnet_2" {
  router_id = openstack_networking_router_v2.router_1.id
  subnet_id = openstack_networking_subnet_v2.network_1_subnet_2.id
}

resource "openstack_networking_port_v2" "port_1" {
  name               = "port_1"
  network_id         = openstack_networking_network_v2.network_1.id
  admin_state_up     = "true"
  security_group_ids = [openstack_networking_secgroup_v2.secgroup_1.id]

  fixed_ip {
    subnet_id  = openstack_networking_subnet_v2.network_1_subnet_1.id
    ip_address = "192.168.199.10"
  }
}
```

### Instance & Volume Provisioning

The instance will be running Ubuntu 20.04 (as the other provided options are older LTS Ubuntu, and CentOS 7/8).
TODO: Investigate using [Packer](https://www.packer.io/) to generate my own Debian image for VM provisioning.

The `remote-exec` and `local-exec` provisioning steps are commented out here as I manually assign a floating-ip (don't want to put this into terraform quite yet, as I have a lot of Cloudflare DNS records setup that just point to my fixed public ipv4 address and I don't want to accidentally lose it with an errant `terraform destroy`).

```terraform
resource "openstack_compute_instance_v2" "helium" {
  name = "helium"
  # Ubuntu 20.04 (524.6 MB)
  image_id = "ebcafd0b-9698-4adc-9e75-16e4e03082e2"

  # m1.medium (2 VCPUs, 40GB Root, 4096MB RAM)
  flavor_id   = "3"
  flavor_name = "m1.medium"

  # m1.small (2 VCPUs, 20GB Root, 2048MB RAM)
  # flavor_id   = "2"
  # flavor_name = "m1.small"

  # m1.micro (1 VCPU, 5GB Root, 1024MB RAM)
  # flavor_id       = "771cd84b-47ea-45e8-b76c-0b6a1080d11c" 
  # flavor_name     = "m1.micro"
  key_pair        = "alex_at_udia_dot_ca april_2020"
  security_groups = ["default", openstack_networking_secgroup_v2.secgroup_1.name, openstack_networking_secgroup_v2.secgroup_2.name]

  network {
    name = openstack_networking_network_v2.network_1.name
  }

  network {
    name = "default"
  }

  # provisioner "remote-exec" {
  #   inline = ["sudo apt update", "sudo apt install python3 -y", "echo Done!"]
  # }

  # provisioner "local-exec" {
  #   command = "ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u ubuntu -i 'helium,' -e 'pub_key=${openstack_compute_keypair_v2.personal_key.public_key}' nginx-install.yml"
  # }
}

resource "openstack_blockstorage_volume_v2" "vol_helium" {
  name        = "helium-volume"
  description = "non ephemeral disk for udia application"
  volume_type = "lvm"
  size        = 80
}

resource "openstack_compute_volume_attach_v2" "attached" {
  instance_id = openstack_compute_instance_v2.helium.id
  volume_id   = openstack_blockstorage_volume_v2.vol_helium.id
}

```

## Post Terraform Steps

After the Terraform script finishes, I use `terraform show` to obtain the network allocated IP addresses and ensure that my resources have been created to specification.

```bash
terraform plan -out tfplan
terraform apply tfplan
terraform show
```

Look for the lines indicating the fixed ipv4 address on the public network, as well as the volume storage instance ID.

```text
# openstack_compute_instance_v2.helium:
resource "openstack_compute_instance_v2" "helium" {
    ...
    network {
        access_network = false
        fixed_ip_v4    = "10.2.4.185"
        fixed_ip_v6    = "[2605:fd00:4:1001:f816:3eff:feb5:3d36]"
        mac            = "fa:16:3e:b5:3d:36"
        name           = "default"
        uuid           = "722c9bb4-d50f-4a30-88f6-7c77baaaf1e8"
    }
}

...

# openstack_compute_volume_attach_v2.attached:
resource "openstack_compute_volume_attach_v2" "attached" {
    device      = "/dev/sdc"
    id          = "a19846a9-1d3c-4ef9-a769-c731f8456d08/4d1bbbb9-2df4-457c-b49c-71b99f14335d"
    instance_id = "a19846a9-1d3c-4ef9-a769-c731f8456d08"
    region      = "Edmonton"
    volume_id   = "4d1bbbb9-2df4-457c-b49c-71b99f14335d"
}

```

Ensure that SSH-ing into this new instance occurs without any errors.
This can be done by manually assigning the public floating ipv4 address to the new instance or proxy jumping through an existing instance (old server that I'm trying to axe).
I use a `.ssh/config` entry to make this process less cumbersome (see [Useful SSH](/2020/01/useful_ssh.md)).

# Ansible

I automated the configuration of my new instance using [Red Hat Ansible](https://www.ansible.com/).

## Playbook Breakdown

I've installed the `nginxinc.nginx` and `nginxinc.nginx_config` [roles from Ansible Galaxy](https://github.com/nginxinc/ansible-role-nginx#ansible-galaxy).

```bash
(env) $ ansible-galaxy list
# /home/alexander/.ansible/roles
- nginxinc.nginx_config, 0.3.3
- nginxinc.nginx, 0.19.1
[WARNING]: - the configured path /usr/share/ansible/roles does not exist.
[WARNING]: - the configured path /etc/ansible/roles does not exist.
(env) $ ansible --version
ansible 2.10.6
  config file = /etc/ansible/ansible.cfg
  configured module search path = ['/home/alexander/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/alexander/sandbox/src/git.udia.ca/alex/udia-infra/env/lib/python3.7/site-packages/ansible
  executable location = /home/alexander/sandbox/src/git.udia.ca/alex/udia-infra/env/bin/ansible
  python version = 3.7.3 (default, Jul 25 2020, 13:03:44) [GCC 8.3.0]
```

### Basic Operating System Setup

This play configures the new instance with the passwordless root users, ssh key for myself, as well [as sets up automatic updates](https://git.sr.ht/~udia/infra/tree/master/item/enableAutoUpdate.sh).

The volume mounting and binding has been commented out because the disk is not guaranteed to exist on `/dev/sdc`, and the UUID listed in the terraform output does not appear associated to the disk.

```yml
- name: os-setup
  become: yes
  hosts: all
  tags:
    - initialize-os
  vars:
    ansible_python_interpreter: /usr/bin/python3
    sudoers:
      - alexander
      - ubuntu
  tasks:
    - name: Make sure we have a 'wheel' group
      group:
        name: wheel
        state: present
    - name: Allow 'wheel' group to have passwordless sudo
      lineinfile:
        dest: /etc/sudoers
        state: present
        regexp: '^%wheel'
        line: '%wheel ALL=(ALL) NOPASSWD: ALL'
        validate: visudo -cf %s

    - name: Add sudoers users to wheel group
      user:
        name: "{{ item }}"
        groups: wheel
        append: yes
      with_items: "{{ sudoers }}"

    - name: Ensure that user 'alexander' is present
      user:
        name: alexander
        state: present
        groups: wheel
        append: yes
        create_home: yes

    - name: Set 'alexander' authorized key
      ansible.posix.authorized_key:
        user: alexander
        state: present
        key: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"

    - name: enable-automatic-updates
      ansible.builtin.script: enableAutoUpdate.sh

    # - name: Create an ext4 filesystem on /dev/sdc
    #   community.general.filesystem:
    #     fstype: ext4
    #     dev: /dev/sdc

    # - name: Mount /dev/sdc to the server as /mnt/chocolate
    #   ansible.posix.mount:
    #     path: /mnt/chocolate
    #     src: /dev/sdc
    #     fstype: ext4
    #     state: mounted
```

### NGINX Setup

This is a quick and dirty script for setting up the NGINX web server. I am currently proxy passing all of the traffic for `udia.ca` and the relevant static files back to my old instance, but this should be modified to serve the static files directly.

The commented out lines are [defaults provided by the nginx playbook example](https://github.com/nginxinc/ansible-role-nginx-config/blob/main/molecule/default/converge.yml).

```yml
- name: nginx-setup
  hosts: all
  become: yes
  collections:
    - nginxinc.nginx_core
  tags:
    - initialize-nginx
    - nginx
  roles:
    - role: nginx
    - role: nginx_config
      vars:
        nginx_config_http_template_enable: true
        nginx_config_http_template:
          app:
            template_file: http/default.conf.j2
            conf_file_name: default.conf
            conf_file_location: /etc/nginx/conf.d/
            servers:
              main:
                listen:
                  listen_localhost:
                    port: 80
                server_name: udia.ca www.udia.ca txt.udia.ca
                access_log:
                  - name: main
                    location: /var/log/nginx/access.log
                reverse_proxy:
                  locations:
                    main:
                      location: /
                      proxy_pass: http://hydrogen/
                      proxy_set_header:
                        header_host:
                          name: Host
                          value: $host
              static_media:
                listen:
                  listen_static_media:
                    port: 80
                server_name: static.udia.ca media.udia.ca
                access_log:
                  - name: main
                    location: /var/log/nginx/access.log
                reverse_proxy:
                  locations:
                    main:
                      location: /
                      root: html
                      proxy_pass: https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_e3b719b87453492086f32f5a66c427cf/media/
                      # proxy_cache_valid: 200 10m
                      proxy_cache_valid: any 1m
                      proxy_http_version: 1.1
              # server_one:
              #   listen:
              #     listen_server_one:
              #       port: 8081
              #   server_name: udia.ca
              #   access_log:
              #     - name: main
              #       location: /var/log/nginx/access.log
              #   web_server:
              #     locations:
              #       server_one:
              #         location: /
              #         html_file_location: /usr/share/nginx/html
              #         html_file_name: server_one.html
              #   sub_filter:
              #     once: false
              #     sub_filters:
              #       - "'server_hostname' '$hostname'"
              #       - "'server_address' '$server_addr:$server_port'"
              #       - "'server_url' '$request_uri'"
              #       - "'remote_addr' '$remote_addr:$remote_port'"
              #       - "'server_date' '$time_local'"
              #       - "'client_browser' '$http_user_agent'"
              #       - "'request_id' '$request_id'"
              #       - "'nginx_version' '$nginx_version'"
              #       - "'document_root' '$document_root'"
              #       - "'proxied_for_ip' '$http_x_forwarded_for'"
              # server_two:
              #   listen:
              #     listen_server_two:
              #       port: 8082
              #   server_name: udia.ca
              #   access_log:
              #     - name: main
              #       location: /var/log/nginx/access.log
              #   web_server:
              #     locations:
              #       server_two:
              #         location: /
              #         html_file_location: /usr/share/nginx/html
              #         html_file_name: server_two.html
              #   sub_filter:
              #     once: false
              #     sub_filters:
              #       - "'server_hostname' '$hostname'"
              #       - "'server_address' '$server_addr:$server_port'"
              #       - "'server_url' '$request_uri'"
              #       - "'remote_addr' '$remote_addr:$remote_port'"
              #       - "'server_date' '$time_local'"
              #       - "'client_browser' '$http_user_agent'"
              #       - "'request_id' '$request_id'"
              #       - "'nginx_version' '$nginx_version'"
              #       - "'document_root' '$document_root'"
              #       - "'proxied_for_ip' '$http_x_forwarded_for'"
            upstreams:
              main:
                name: hydrogen
                lb_method: least_conn
                servers:
                  # server_one:
                  #   address: 0.0.0.0
                  #   port: 8081
                  # server_two:
                  #   address: 0.0.0.0
                  #   port: 8082
                  hydrogen:
                    address: 10.2.4.85
                    port: 80

        # nginx_config_html_demo_template_enable: true
        # nginx_config_html_demo_template:
        #   server_one:
        #     template_file: www/index.html.j2
        #     html_file_name: server_one.html
        #     html_file_location: /usr/share/nginx/html
        #     web_server_name: Ansible NGINX collection - Server one
        #   server_two:
        #     template_file: www/index.html.j2
        #     html_file_name: server_two.html
        #     html_file_location: /usr/share/nginx/html
        #     web_server_name: Ansible NGINX collection - Server two
```

### Certbot SSL Certificate Provisioning

I am not too happy with the approach used here to provision certificates.
The operating system provided version of `certbot` has explicitly been deprecated in the official lets encrypt documentation, but I do not want to install `snapd` (following their recommended guide).

In the future, this should be updated to use "[How To Acquire a Let's Encrypt Certificate Using Ansible on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-acquire-a-let-s-encrypt-certificate-using-ansible-on-ubuntu-18-04)", but additional work is still necessary as I do not want to recurringly generate scripts (instead having the host server automate this through cron).

```yml
- name: ssl-certbot
  become: yes
  hosts: all
  tags:
    - ssl
    - nginx
  tasks:
    - name: Install Certbot
      ansible.builtin.apt:
        name: certbot
        state: present
    - name: Install Certbot Nginx plugin
      ansible.builtin.apt:
        name: python3-certbot-nginx
        state: present
    - name: Provision SSL cert for nginx and udia.ca
      ansible.builtin.command: certbot -d txt.udia.ca -d www.udia.ca -d udia.ca -d media.udia.ca -d static.udia.ca --expand --agree-tos --email alex@udia.ca --nginx -n run
```

### Linux Hardening

This is an operational and optional next step, following the [ansible collection hardening](https://github.com/dev-sec/ansible-collection-hardening) roles.
I loosely inspected the tasks applied on the system- they are reasonable, but modifications to the SSH defaults were necessary to allow proxy-pass for my existing server (a limitation of one ipv4 address).

```yml
- name: harden-os
  become: yes
  hosts: all
  tags:
    - harden
  collections:
    - devsec.hardening
  roles:
    - os_hardening
  vars:
    sysctl_overwrite:
      # Enable IPv4 traffic forwarding.
      net.ipv4.ip_forward: 1

- name: harden-ssh
  become: yes
  hosts: all
  tags:
    - harden
  collections:
    - devsec.hardening
  roles:
    - ssh_hardening
  vars:
    ssh_banner: true
    ssh_print_motd: true
    ssh_print_last_log: true
    sftp_enabled: true
    ssh_permit_tunnel: false
    ssh_allow_tcp_forwarding: 'yes'
```

# Personal Thoughts

It was reasonably quick to spin up a new server and setup configuration using Ansible.
The experience of using Terraform is certainly more enjoyable than using Ansible, as many of the more advanced features in Ansible are provided by community maintained packages (hardening, nginx).
That being said, I do not see this eliminating the necessity of server administration, and additional manual effort (and learning) still remains for effective use of these tools.

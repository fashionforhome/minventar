Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, path: "vagrant/bootstrap.sh"
  config.vm.network "private_network", ip: "192.168.1.5"
end
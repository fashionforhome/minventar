#!/usr/bin/env bash

# enable colorful terminal
sed -i 's/^.*force_color_prompt=yes.*/force_color_prompt=yes/' .bashrc
source .bashrc

# install apache2
sudo apt-get update
sudo apt-get install -y apache2
if ! [ -L /var/www ]; then
  rm -rf /var/www/html
  ln -fs /vagrant/web /var/www/html
fi

# enable apache2 rewrite module
sudo a2enmod rewrite
sudo service apache2 restart

# install php 5.6
sudo add-apt-repository -y ppa:ondrej/php5-5.6
sudo apt-get update
sudo apt-get install -y python-software-properties
sudo apt-get install -y php5

# install Git
sudo apt-get install -y git

# install common command line tools
git clone https://github.com/DanShu93/common-command-line-tools.git /home/vagrant/common-command-line-tools

# enable .htaccess
sudo php /home/vagrant/common-command-line-tools/apache2/htaccessEnabler.php
sudo service apache2 restart

# install composer
curl -sS https://getcomposer.org/installer | sudo -H php -- --install-dir=/usr/local/bin --filename=composer

# install node.js 5
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs

# install MongoDB PHP extension
sudo apt-get install php5-mongo
sudo service apache2 restart

# configure MongoDB connection string
sed -i 's/^    mongo_connection_string: mongodb:\/\/localhost:27017$/    mongo_connection_string: mongodb:\/\/192\.168\.1\.4:27017/' /vagrant/app/config/config.yml

# composer install
cd /vagrant
sudo composer install

# npm install
cd /vagrant/web
sudo npm install
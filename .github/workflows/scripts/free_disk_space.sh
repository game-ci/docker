#!/usr/bin/env bash
#
# Based on: https://github.com/apache/flink/blob/master/tools/azure-pipelines/free_disk_space.sh
#
echo "=============================================================================="
echo "Freeing up disk space on CI system"
echo "=============================================================================="

# Before
echo ""
echo "Disk space before:"
df -h

# List packages
echo "Listing 25 largest packages"
dpkg-query -Wf '${Installed-Size}\t${Package}\n' | sort -n | tail -n 25

# Remove packages
echo ""
echo "Removing large packages"
sudo apt-get remove -y '^ghc-8.*'
#sudo apt-get remove -y '^dotnet-.*'
#sudo apt-get remove -y '^llvm-.*'
sudo apt-get remove -y 'php.*'
#sudo apt-get remove -y azure-cli google-cloud-sdk hhvm google-chrome-stable firefox powershell mono-devel
sudo apt-get autoremove -y
sudo apt-get clean
echo ""
echo "Disk space after apt-get:"
df -h

# Large dirs
echo "Removing large directories"
# https://github.com/apache/flink/blob/master/tools/azure-pipelines/free_disk_space.sh
sudo rm -rf /usr/share/dotnet
sudo rm -rf /usr/local/lib/android
sudo rm -rf /opt/ghc
echo ""
echo "Disk space after removing large directories:"
df -h

# https://github.com/actions/virtual-environments/issues/709#issuecomment-612569242
sudo rm -rf "/usr/local/share/boost"
sudo rm -rf "$AGENT_TOOLSDIRECTORY"

# After
echo ""
echo "Disk space after:"
df -h

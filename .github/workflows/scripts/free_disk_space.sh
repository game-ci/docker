#!/usr/bin/env bash
#
# Based on: https://github.com/apache/flink/blob/master/tools/azure-pipelines/free_disk_space.sh
#
echo "=============================================================================="
echo "Freeing up disk space on CI system"
echo "=============================================================================="

# Before
echo "Disk space before:"
df -h

#echo "Listing 100 largest packages"
#dpkg-query -Wf '${Installed-Size}\t${Package}\n' | sort -n | tail -n 100
#echo "Removing large packages"
#sudo apt-get remove -y '^ghc-8.*'
#sudo apt-get remove -y '^dotnet-.*'
#sudo apt-get remove -y '^llvm-.*'
#sudo apt-get remove -y 'php.*'
#sudo apt-get remove -y azure-cli google-cloud-sdk hhvm google-chrome-stable firefox powershell mono-devel
#sudo apt-get autoremove -y
#sudo apt-get clean
#df -h

echo "Removing large directories"
# https://github.com/apache/flink/blob/master/tools/azure-pipelines/free_disk_space.sh
rm -rf /usr/share/dotnet/

# https://github.com/actions/virtual-environments/issues/709#issuecomment-612569242
rm -rf "/usr/local/share/boost"
rm -rf "$AGENT_TOOLSDIRECTORY"

# After
echo "Disk space after:"
df -h

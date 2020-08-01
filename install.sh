#!/bin/sh

SHELL_PROFILE=$HOME/.bash_profile
LEVE_HOME=$HOME/.leve
NODE=$(which node)

rm -rf $LEVE_HOME

mkdir $LEVE_HOME

cp -r ./dist/* $LEVE_HOME

echo "source $HOME/.leve/vars.leve" >> $SHELL_PROFILE
echo "alias leve='$NODE $LEVE_HOME'" >> $SHELL_PROFILE

source $SHELL_PROFILE
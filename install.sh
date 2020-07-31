#!/bin/sh

SHELL_PROFILE=$HOME/.bash_profile
LEVE_HOME=$HOME/.leve

rm -rf $LEVE_HOME

mkdir $LEVE_HOME

cp ./dist/leve $LEVE_HOME/leve
cp ./dist/vars.json $LEVE_HOME/vars.json
cp ./dist/vars.leve $LEVE_HOME/vars.leve

echo "source $HOME/.leve/vars.leve" >> $SHELL_PROFILE

source $SHELL_PROFILE
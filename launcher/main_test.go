package main
import "testing"
func TestLocalPeers(t *testing.T){cases:=map[string]bool{"127.0.0.1:123":true,"192.168.1.2:123":true,"10.0.2.1:123":true,"172.16.3.4:123":true,"169.254.0.21:123":true,"8.8.8.8:123":false,"1.1.1.1:123":false,"invalid":false};for addr,want:=range cases{if got:=privatePeer(addr);got!=want{t.Errorf("%s: got %v, want %v",addr,got,want)}}}

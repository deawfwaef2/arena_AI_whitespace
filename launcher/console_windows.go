package main
import "syscall"
func init(){k:=syscall.NewLazyDLL("kernel32.dll");k.NewProc("SetConsoleOutputCP").Call(65001);k.NewProc("SetConsoleCP").Call(65001)}

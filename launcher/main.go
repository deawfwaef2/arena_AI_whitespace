// Last $100 LAN launcher. Standard library only. No installation, telemetry or file upload.
package main

import (
 "bytes"
 "compress/gzip"
 "context"
 "errors"
 "fmt"
 "io"
 "log"
 "net"
 "net/http"
 "os"
 "os/exec"
 "os/signal"
 "path/filepath"
 "runtime"
 "strconv"
 "strings"
 "time"
)
const signature = "last100-local-v1"
func main(){if err:=run();err!=nil{fmt.Println("\n无法启动 / Cannot start:",err);fmt.Println("请完整解压 ZIP，确保程序和 index.html 在同一文件夹。\nPress Enter to close.");var line string;fmt.Scanln(&line)}}
func openBrowser(url string){if os.Getenv("LAST100_NO_BROWSER")=="1"{return};if runtime.GOOS=="windows"{_ = exec.Command("rundll32","url.dll,FileProtocolHandler",url).Start()}}
func privatePeer(addr string)bool{host,_,err:=net.SplitHostPort(addr);if err!=nil{return false};ip:=net.ParseIP(host);return ip!=nil&&(ip.IsPrivate()||ip.IsLoopback()||ip.IsLinkLocalUnicast())}
func run()error{
 ex,err:=os.Executable();if err!=nil{return err};dir:=filepath.Dir(ex)
 candidates:=[]string{filepath.Join(dir,"index.html"),filepath.Join(dir,"play","index.html"),filepath.Join(dir,"..","release-production","index.html")}
 if v:=os.Getenv("LAST100_GAME");v!=""{candidates=append([]string{v},candidates...)}
 var raw []byte;var path string
 for _,p:=range candidates{b,e:=os.ReadFile(p);if e==nil{raw=b;path=p;break}}
 if len(raw)==0{return errors.New("找不到 index.html / game file not found")}
 var listener net.Listener;port:=8765
 client:=&http.Client{Timeout:600*time.Millisecond}
 for ;port<=8775;port++{resp,e:=client.Get(fmt.Sprintf("http://127.0.0.1:%d/health",port));if e==nil{b,_:=io.ReadAll(io.LimitReader(resp.Body,128));resp.Body.Close();if string(b)==signature{u:=fmt.Sprintf("http://127.0.0.1:%d/",port);fmt.Println("游戏服务已在运行 / Already running:",u);openBrowser(u);fmt.Println("手机地址请查看已经打开的服务窗口。按 Enter 退出这个重复窗口。");var line string;fmt.Scanln(&line);return nil}}
  listener,err=net.Listen("tcp4",fmt.Sprintf("0.0.0.0:%d",port));if err==nil{break}
 }
 if listener==nil{return errors.New("8765–8775 端口均被占用 / no available port")}
 var compressed bytes.Buffer;zw,_:=gzip.NewWriterLevel(&compressed,gzip.BestSpeed);if _,err=zw.Write(raw);err!=nil{return err};if err=zw.Close();err!=nil{return err};gz:=compressed.Bytes()
 handler:=http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  if !privatePeer(r.RemoteAddr){http.Error(w,"Local network only",http.StatusForbidden);return}
  w.Header().Set("X-Content-Type-Options","nosniff")
  if r.Method!="GET"&&r.Method!="HEAD"{w.Header().Set("Allow","GET, HEAD");http.Error(w,"Read-only game server",http.StatusMethodNotAllowed);return}
  if r.URL.Path=="/health"{w.Header().Set("Content-Type","text/plain; charset=utf-8");if r.Method!="HEAD"{io.WriteString(w,signature)};return}
  if r.URL.Path=="/favicon.ico"{w.WriteHeader(http.StatusNoContent);return}
  if r.URL.Path!="/"&&r.URL.Path!="/index.html"{http.NotFound(w,r);return}
  w.Header().Set("Content-Type","text/html; charset=utf-8");w.Header().Set("Cache-Control","no-cache");w.Header().Set("Vary","Accept-Encoding")
  data:=raw;if strings.Contains(r.Header.Get("Accept-Encoding"),"gzip"){w.Header().Set("Content-Encoding","gzip");data=gz}
  w.Header().Set("Content-Length",strconv.Itoa(len(data)));if r.Method!="HEAD"{_,_=w.Write(data)}
 })
 server:=&http.Server{Handler:handler,ReadHeaderTimeout:8*time.Second,IdleTimeout:30*time.Second,WriteTimeout:120*time.Second,MaxHeaderBytes:16384}
 local:=fmt.Sprintf("http://127.0.0.1:%d/",port)
 fmt.Println("============================================================")
 fmt.Println("  Last $100: Swipe to Rich — 手机局域网启动器")
 fmt.Println("============================================================")
 fmt.Println("电脑游玩 / Computer:",local)
 fmt.Println("手机与电脑连接同一 Wi-Fi，在手机浏览器输入下面的地址：")
 found:=false;interfaces,_:=net.Interfaces();for _,in:=range interfaces{if in.Flags&net.FlagUp==0||in.Flags&net.FlagLoopback!=0{continue};addresses,_:=in.Addrs();for _,a:=range addresses{ip,_,e:=net.ParseCIDR(a.String());if e!=nil||ip.To4()==nil||!ip.IsPrivate(){continue};fmt.Printf("  http://%s:%d/   [%s]\n",ip.String(),port,in.Name);found=true}}
 if !found{fmt.Println("  未发现私有 IPv4 地址，请先连接 Wi-Fi / No private IPv4 found.")}
 fmt.Println("\n首次运行若 Windows 提示防火墙授权，只允许「专用网络」。")
 fmt.Println("连不上时：检查同一 Wi-Fi、关闭访客隔离，必要时运行 Allow-Private-Network.cmd。")
 fmt.Println("不要在路由器转发端口；不要允许公用网络。本程序只服务当前游戏文件，不共享其他文件。")
 fmt.Println("电脑需保持开机；关闭此窗口或按 Ctrl+C 即停止。")
 fmt.Println("手机与电脑各自保存进度，不自动同步。音乐需要点击游戏后才会开始。")
 fmt.Println("Game file:",path)
 fmt.Printf("Read-only IPv4 listener: 0.0.0.0:%d | HTML %.2f MB | gzip %.2f MB\n",port,float64(len(raw))/1e6,float64(len(gz))/1e6)
 openBrowser(local)
 stopped:=make(chan os.Signal,1);signal.Notify(stopped,os.Interrupt)
 go func(){<-stopped;ctx,cancel:=context.WithTimeout(context.Background(),3*time.Second);defer cancel();_ = server.Shutdown(ctx)}()
 err=server.Serve(listener);if err!=nil&&!errors.Is(err,http.ErrServerClosed){return err};log.Println("Game server stopped.");return nil
}

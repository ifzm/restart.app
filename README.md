# restart.exe

默认打开一个 `notepad.exe` 并在每天零点零分关闭并重启，可自行修改代码或通过命令行输入参数

> install

```node
yarn
```

> build

```node
yarn build
```

> run

```shell
# 每 5s 运行一次 a.exe, 在运行之前会杀掉残留进程
node app.js 'd:\\a.exe' '0/5 * * * * *'
# or
./dist/app.exe 'd:\\a.exe' '0/5 * * * * *'
```

# restart.exe

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

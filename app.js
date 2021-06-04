const os = require('os')
const path = require('path')
const child = require('child_process')
const schedule = require('node-schedule')
const osu = require('node-os-utils')
const logger = require('pino')({
    prettyPrint: true,
})

/**
 * 休眠
 * @param {number} second 秒
 * @returns Promise
 */
function sleep(second) {
    return new Promise((resolve) => {
        setTimeout(resolve, second * 1000)
    })
}

/**
 * 根据名称杀死进程
 * @param {string} name 进程名称
 * @returns Promise
 */
function kill(name) {
    const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux'
    return new Promise((resolve, reject) => {
        child.exec(cmd, (err, stdout) => {
            if (err) {
                console.error(err)
                reject()
                return
            }
            stdout.split('\n').filter((line) => {
                const processMessage = line.trim().split(/\s+/)
                const processName = processMessage[0]
                if (processName === name) {
                    process.kill(processMessage[1])
                }
            })

            sleep(1).then(resolve)
        })
    })
}

/**
 * 计算 byte 到 GB
 * @param {number} bytes 字节数
 * @returns GB 单位字符串
 */
function format(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + 'GB'
}

// 读取命令行传入的参数
const [file = 'D:\\Applications\\YRMediaServer\\YRMediaServer.exe', cron = '0 0 0 * * *'] = process.argv.splice(2)

// 主程序
async function main() {
    const cpuUse = await osu.cpu.usage()
    const cpuFree = await osu.cpu.free()

    // 打印系统基本信息
    logger.info(`=====================================================`)
    logger.warn(`计划任务：${cron}`)
    logger.info(`当前时间：${new Date()}`)
    logger.info(`CPU：已用 %d%, 可用 %d%`, cpuUse, cpuFree)
    logger.info(
        `内存：已用 %s, 可用 %s, 共 %s`,
        format(os.totalmem() - os.freemem()),
        format(os.freemem()),
        format(os.totalmem()),
    )

    // kill
    await kill(path.basename(file))
    logger.info('Kill: %s', path.basename(file))

    // run
    child.exec(`cd ${path.dirname(file)} && start ${path.basename(file)}`)
    logger.info('Runing: %s', file)
    logger.info(`=====================================================\n`)
}

// 切换显示中文
child.execSync('chcp 65001')

// 运行程序并执行计划任务
let job
main().then(() => {
    function log() {
        logger.warn('下一次重启时间: %s\n', job.nextInvocation())
    }

    // 设置定时任务
    job = schedule.scheduleJob(cron, () => {
        main().then(log)
    })

    log()
})

// 监听 ctrl+c/ctrl+d 的事件
process.on('SIGINT', async () => {
    if (job) {
        job.cancel()
    }

    await kill(path.basename(file))
    logger.warn('Exit Kill: %s', path.basename(file))
    process.exit(0)
})

/**
 * DSH 右侧工具箱边栏（天气 · 待办 · 日历）— Host 半段
 *
 * 安装：将本文件完整内容粘贴到 cordis_define 的 code.host。
 * 说明：Host 沙箱禁用了全局 fetch/require/process，本段通过 cordis
 * 服务（web / subprocess / sandboxPolicy）完成网络与进程操作。
 * 详见仓库 README.md。
 */
return {
  apply(ctx) {
    // 待办事项：Host 进程内内存存储。页面刷新不丢，进程重启后重置。
    const todos = []
    // curl -w 写入的状态码分隔标记
    const WX_SEP = '\n__DSH_WX_HTTP__'

    // 安全转换：缺失/非法数值 → null（null 是合法 JSON，NaN/undefined 不是）
    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    const str = (v) => (typeof v === 'string' ? v : '')

    const buildWeather = (bodyText, city) => {
      let data
      try {
        data = JSON.parse(bodyText)
      } catch (err) {
        return { ok: false, error: '天气数据解析失败（响应不是 JSON）' }
      }
      const cur = (data.current_condition && data.current_condition[0]) || {}
      const area = (data.nearest_area && data.nearest_area[0]) || {}
      const areaName = area.areaName && area.areaName[0]
        ? str(area.areaName[0].value)
        : (city || '当前位置')
      // 每日预报条目没有顶层 weatherCode，从 hourly 中取（优先正午 12 点，否则第一条）
      const forecast = (Array.isArray(data.weather) ? data.weather : []).slice(0, 5).map((d) => {
        const hourly = Array.isArray(d.hourly) ? d.hourly : []
        let dayCode = null
        const noon = hourly.find((h) => h && String(h.time) === '1200') || hourly[0]
        if (noon && noon.weatherCode != null) dayCode = toNum(noon.weatherCode)
        return {
          date: str(d.date),
          min: str(d.mintempC),
          max: str(d.maxtempC),
          desc: str(d.weatherDesc && d.weatherDesc[0] ? d.weatherDesc[0].value : ''),
          code: dayCode,
        }
      })
      return {
        ok: true,
        city: areaName,
        temp: str(cur.temp_C),
        feels: str(cur.FeelsLikeC),
        humidity: str(cur.humidity),
        wind: str(cur.windspeedKmph),
        desc: str(cur.weatherDesc && cur.weatherDesc[0] ? cur.weatherDesc[0].value : ''),
        zh: str(cur.lang_zh && cur.lang_zh[0] ? cur.lang_zh[0].value : ''),
        code: cur.weatherCode != null ? toNum(cur.weatherCode) : null,
        forecast,
      }
    }

    // 通道 1：ctx.web（部署已注册 fetch provider 时使用）
    const tryWeb = async (url) => {
      const web = ctx.get('web')
      if (web === undefined) return null
      try {
        const result = await web.fetch({ url })
        if (result && result.statusCode >= 200 && result.statusCode < 300
          && result.body && typeof result.body.content === 'string') {
          return { statusCode: result.statusCode, body: result.body.content }
        }
      } catch (err) {
        // 无可用 provider 等失败 → 走通道 2
      }
      return null
    }

    // 通道 2：subprocess + curl.exe（Windows 10+ 系统自带，位于 System32）
    const tryCurl = async (url) => {
      const sub = ctx.get('subprocess')
      if (sub === undefined) return { error: 'subprocess 服务不可用' }
      let exe
      try {
        exe = await sub.resolveExecutable('curl.exe')
      } catch (err) {
        try {
          exe = await sub.resolveExecutable('C:\\Windows\\System32\\curl.exe')
        } catch (err2) {
          exe = undefined
        }
      }
      if (exe === undefined) return { error: '未找到 curl.exe' }
      const policy = ctx.get('sandboxPolicy')
      const cwd = policy && typeof policy.workspaceRoot === 'string' ? policy.workspaceRoot : 'C:\\'
      let handle
      try {
        handle = sub.spawn({
          argv: [exe, '-sS', '-L', '--max-time', '20', '-A', 'dsh-sidebar/1.0', '-w', WX_SEP + '%{http_code}', url],
          cwd,
          stdio: {
            stdin: 'ignore',
            stdout: { maxBytes: 262144, spill: { maxBytes: 524288 } },
            stderr: { maxBytes: 16384 },
          },
          graceMs: 3000,
        })
      } catch (err) {
        return { error: String((err && err.message) || err) }
      }
      let outcome
      try {
        outcome = await handle.done
      } catch (err) {
        return { error: '启动 curl 失败: ' + String((err && err.message) || err) }
      }
      const stdout = handle.collected.stdout ? handle.collected.stdout.readFrom(0) : null
      const stderrText = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
      if (outcome.exitCode !== 0) {
        return { error: 'curl 退出码 ' + String(outcome.exitCode) + (stderrText ? '：' + stderrText.trim().slice(0, 300) : '') }
      }
      const raw = stdout && stdout.text ? stdout.text : ''
      if (!raw) return { error: 'curl 无输出' }
      const marker = raw.lastIndexOf(WX_SEP)
      let statusCode = 0
      let body = raw
      if (marker !== -1) {
        statusCode = Number(raw.slice(marker + WX_SEP.length).trim())
        body = raw.slice(0, marker)
      }
      if (statusCode < 200 || statusCode >= 300) {
        return { error: '天气服务返回异常 (HTTP ' + statusCode + ')' }
      }
      return { statusCode, body }
    }

    harness.handle('weather.get', async (args) => {
      const city = args && typeof args === 'object' && typeof args.city === 'string'
        ? args.city.trim()
        : ''
      const url = 'https://wttr.in/' + encodeURIComponent(city) + '?format=j1'
      let got = await tryWeb(url)
      if (got === null) got = await tryCurl(url)
      if (got === null || got.error) {
        return { ok: false, error: '网络通道不可用' + (got && got.error ? '：' + got.error : '') }
      }
      if (!got.body) return { ok: false, error: '天气服务返回空内容' }
      return buildWeather(got.body, city)
    })

    harness.handle('todo.list', () => todos.map((t) => ({ ...t })))

    harness.handle('todo.add', (args) => {
      const text = args && typeof args.text === 'string' ? args.text.trim() : ''
      if (!text) return { ok: false, error: '待办内容不能为空' }
      const item = {
        id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
        text,
        done: false,
        createdAt: Date.now(),
      }
      todos.push(item)
      return { ok: true, item: { ...item } }
    })

    harness.handle('todo.toggle', (args) => {
      const id = args && typeof args.id === 'string' ? args.id : ''
      const item = todos.find((t) => t.id === id)
      if (!item) return { ok: false, error: '未找到该待办' }
      item.done = !item.done
      return { ok: true, item: { ...item } }
    })

    harness.handle('todo.remove', (args) => {
      const id = args && typeof args.id === 'string' ? args.id : ''
      const idx = todos.findIndex((t) => t.id === id)
      if (idx === -1) return { ok: false, error: '未找到该待办' }
      todos.splice(idx, 1)
      return { ok: true }
    })
  },
}

/**
 * DSH 右侧工具箱边栏（天气 · 待办 · 日历）— Host 半段
 *
 * 安装：将本文件完整内容粘贴到 cordis_define 的 code.host。
 * 说明：Host 沙箱禁用了全局 fetch/require/process，本段通过 cordis
 * 服务（web / subprocess / sandboxPolicy / fs）完成网络与进程操作。
 * 待办事项持久化到工作区文件 <workspaceRoot>\dsh-sidebar-todos.json，
 * 重启 / 更新后自动恢复；fs 不可用时自动降级为纯内存。
 * 每条待办含优先级（high/medium/low）与可选截止日期（YYYY-MM-DD）。
 * 详见仓库 README.md。
 */
return {
  apply(ctx) {
    // 待办事项：持久化到工作区文件 <workspaceRoot>\dsh-sidebar-todos.json，重启自动恢复。
    const todos = []
    const WX_SEP = '\n__DSH_WX_HTTP__'

    // ── 待办持久化 ────────────────────────────────────────────────
    const fsSvc = ctx.get('fs')
    let todoFile = null // FsTarget | null
    let ready = Promise.resolve() // 首轮文件加载完成后才放行 todo 操作

    const PRIORITIES = ['high', 'medium', 'low']
    // 截止时间：YYYY-MM-DD（仅日期）或 YYYY-MM-DDTHH:MM（日期+时间）
    const DUE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/

    if (fsSvc) {
      const policy = ctx.get('sandboxPolicy')
      const root = policy && typeof policy.workspaceRoot === 'string' ? policy.workspaceRoot : null
      if (root) {
        ready = (async () => {
          const target = await fsSvc.resolve(root + '\\dsh-sidebar-todos.json')
          todoFile = target
          let exists = false
          try {
            exists = (await fsSvc.stat(target)) !== undefined
          } catch (e) { /* 保留纯内存模式 */ }
          if (exists) {
            try {
              const text = await fsSvc.readText(target)
              const parsed = JSON.parse(text)
              if (Array.isArray(parsed)) {
                for (const it of parsed) {
                  if (it && typeof it.id === 'string' && typeof it.text === 'string') {
                    const rec = {
                      id: it.id,
                      text: it.text,
                      done: !!it.done,
                      createdAt: typeof it.createdAt === 'number' ? it.createdAt : Date.now(),
                      priority: PRIORITIES.includes(it.priority) ? it.priority : 'medium',
                    }
                    if (typeof it.due === 'string' && DUE_RE.test(it.due)) rec.due = it.due
                    todos.push(rec)
                  }
                }
              }
            } catch (e) { /* 文件损坏 → 从空列表开始 */ }
          }
          refreshIcs()
        })().catch(() => { /* fs 失败 → 纯内存模式 */ })
      }
    }

    const saveTodos = async () => {
      if (!todoFile) return
      try {
        await fsSvc.writeText(todoFile, JSON.stringify(todos, null, 2))
      } catch (e) { /* 写失败不致命，保持内存态 */ }
      refreshIcs()
    }

    // ── 日历同步（ICS 订阅，供 Windows 日历订阅）───────────────
    let icsCache = ''

    const escIcs = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
    const pad2 = (n) => String(n).padStart(2, '0')
    const fmtUtc = (d) => d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z'
    const PRIO_ICS = { high: 1, medium: 5, low: 9 }
    const PRIO_CN = { high: '高', medium: '中', low: '低' }

    const generateIcs = () => {
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//dsh-sidebar-tools//CN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:DSH 待办',
      ]
      const nowUtc = fmtUtc(new Date())
      const pending = todos
        .filter((t) => !t.done && typeof t.due === 'string' && t.due !== '')
        .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : (a.createdAt || 0) - (b.createdAt || 0)))
      for (const t of pending) {
        const due = t.due
        const dateOnly = !due.includes('T')
        const prio = PRIO_ICS[t.priority] || 5
        lines.push('BEGIN:VEVENT')
        lines.push('UID:' + t.id + '@dsh-sidebar')
        lines.push('DTSTAMP:' + nowUtc)
        if (dateOnly) {
          lines.push('DTSTART;VALUE=DATE:' + due.replace(/-/g, ''))
          const dt = new Date(Number(due.slice(0, 4)), Number(due.slice(5, 7)) - 1, Number(due.slice(8, 10)) + 1)
          lines.push('DTEND;VALUE=DATE:' + dt.getFullYear() + pad2(dt.getMonth() + 1) + pad2(dt.getDate()))
        } else {
          const y = Number(due.slice(0, 4))
          const mo = Number(due.slice(5, 7)) - 1
          const dd = Number(due.slice(8, 10))
          const hh = Number(due.slice(11, 13))
          const mm = Number(due.slice(14, 16))
          lines.push('DTSTART:' + y + pad2(mo + 1) + pad2(dd) + 'T' + pad2(hh) + pad2(mm) + '00')
          const end = new Date(y, mo, dd, hh, mm + 60)
          lines.push('DTEND:' + end.getFullYear() + pad2(end.getMonth() + 1) + pad2(end.getDate()) + 'T' + pad2(end.getHours()) + pad2(end.getMinutes()) + '00')
        }
        lines.push('SUMMARY:' + '[' + (PRIO_CN[t.priority] || '中') + '] ' + escIcs(t.text))
        lines.push('PRIORITY:' + prio)
        lines.push('STATUS:CONFIRMED')
        lines.push('DESCRIPTION:' + escIcs('优先级: ' + (PRIO_CN[t.priority] || '中') + '\n创建: ' + new Date(t.createdAt || Date.now()).toLocaleString('zh-CN')))
        lines.push('END:VEVENT')
      }
      lines.push('END:VCALENDAR')
      return lines.join('\r\n') + '\r\n'
    }

    const refreshIcs = () => {
      try {
        icsCache = generateIcs()
      } catch (e) { /* 保留上次有效内容 */ }
    }

    const wsSvc = ctx.get('webServer')
    if (wsSvc) {
      try {
        wsSvc.register({
          kind: 'exact',
          path: '/dsh-sidebar-todos.ics',
          handler: (req, res) => {
            try {
              res.writeHead(200, {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Cache-Control': 'no-cache, max-age=0',
              })
              res.end(icsCache)
            } catch (e) { /* ignore */ }
          },
        })
      } catch (e) { /* 路由冲突等 → 跳过同步路由 */ }
    }

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

    harness.handle('todo.list', async () => {
      await ready
      return todos.map((t) => ({ ...t }))
    })

    harness.handle('todo.syncInfo', async () => {
      const port = wsSvc && typeof wsSvc.port === 'number' ? wsSvc.port : 3080
      const pending = todos.filter((t) => !t.done && t.due).length
      return { url: 'http://127.0.0.1:' + port + '/dsh-sidebar-todos.ics', pending }
    })

    harness.handle('todo.add', async (args) => {
      await ready
      const text = args && typeof args.text === 'string' ? args.text.trim() : ''
      if (!text) return { ok: false, error: '待办内容不能为空' }
      const priority = args && PRIORITIES.includes(args.priority) ? args.priority : 'medium'
      const due = args && typeof args.due === 'string' && DUE_RE.test(args.due) ? args.due : null
      const item = {
        id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
        text,
        done: false,
        createdAt: Date.now(),
        priority,
      }
      if (due) item.due = due
      todos.push(item)
      await saveTodos()
      return { ok: true, item: { ...item } }
    })

    harness.handle('todo.toggle', async (args) => {
      await ready
      const id = args && typeof args.id === 'string' ? args.id : ''
      const item = todos.find((t) => t.id === id)
      if (!item) return { ok: false, error: '未找到该待办' }
      item.done = !item.done
      await saveTodos()
      return { ok: true, item: { ...item } }
    })

    harness.handle('todo.remove', async (args) => {
      await ready
      const id = args && typeof args.id === 'string' ? args.id : ''
      const idx = todos.findIndex((t) => t.id === id)
      if (idx === -1) return { ok: false, error: '未找到该待办' }
      todos.splice(idx, 1)
      await saveTodos()
      return { ok: true }
    })
  },
}

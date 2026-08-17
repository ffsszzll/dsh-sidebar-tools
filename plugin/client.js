/**
 * DSH 右侧工具箱边栏（天气 · 待办 · 日历）— Client 半段
 *
 * 安装：将本文件完整内容粘贴到 cordis_define 的 code.client。
 * 说明：纯 JavaScript（无 JSX / TypeScript / import），React 以全局
 * React 符号提供；UI 注册在 shell.overlay 插槽；配色完全自包含
 * （--dsx-* 变量 + body[data-ds-dark-theme] 深色硬覆盖）。
 * 待办支持优先级（高/中/低）与截止日期，按「未完成 → 优先级 → 创建时间」排序。
 * 详见仓库 README.md。
 */
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    styles.insert(`.dsh-sidebar-root{position:fixed;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:row;align-items:stretch;gap:10px;z-index:9999;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;line-height:1.45;--dsx-bg-rail:var(--dsw-alias-bg-layer-1,#ffffff);--dsx-bg-panel:var(--dsw-alias-bg-overlay,#ffffff);--dsx-bg-field:var(--dsw-alias-bg-base,#ffffff);--dsx-bg-chip:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.05));--dsx-border:var(--dsw-alias-border-l1,rgba(0,0,0,.12));--dsx-border-2:var(--dsw-alias-border-l2,rgba(0,0,0,.22));--dsx-text:var(--dsw-alias-label-primary,#1f2328);--dsx-text-2:var(--dsw-alias-label-secondary,#3f4550);--dsx-text-3:var(--dsw-alias-label-tertiary,#61666b);--dsx-accent:var(--dsw-alias-brand-primary,#3964fe);--dsx-accent-text:#ffffff;--dsx-success:var(--dsw-alias-state-success-primary,#16a34a);--dsx-error:var(--dsw-alias-state-error-primary,#dc2626);--dsx-hover:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.06))}\nbody[data-ds-dark-theme] .dsh-sidebar-root{--dsx-bg-rail:#232324;--dsx-bg-panel:#2c2c2e;--dsx-bg-field:#2c2c2e;--dsx-bg-chip:rgba(255,255,255,.08);--dsx-border:rgba(255,255,255,.14);--dsx-border-2:rgba(255,255,255,.24);--dsx-text:#f2f3f5;--dsx-text-2:#ccd0d7;--dsx-text-3:#9aa0a8;--dsx-accent:#4f7cff;--dsx-accent-text:#ffffff;--dsx-success:#34d399;--dsx-error:#f87171;--dsx-hover:rgba(255,255,255,.08)}\n.dsh-sidebar-rail{pointer-events:auto;display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:10px 6px 8px;background:var(--dsx-bg-rail);border:1px solid var(--dsx-border);border-right:none;border-radius:14px 0 0 14px;box-shadow:-2px 0 10px rgba(0,0,0,.08)}\n.dsh-sidebar-btn{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:46px;padding:8px 6px;border:none;border-radius:10px;background:transparent;color:var(--dsx-text-2);cursor:pointer;font-size:12px;font-weight:500;transition:background .15s,color .15s}\n.dsh-sidebar-btn:hover{background:var(--dsx-hover);color:var(--dsx-text)}\n.dsh-sidebar-btn.active{background:var(--dsx-accent);color:var(--dsx-accent-text)}\n.dsh-sidebar-btn .ic{font-size:19px;line-height:1}\n.dsh-sidebar-panel{pointer-events:auto;display:flex;flex-direction:column;width:300px;max-width:calc(100vw - 90px);max-height:72vh;overflow:auto;padding:14px;background:var(--dsx-bg-panel);border:1px solid var(--dsx-border);border-right:none;border-radius:14px;box-shadow:-4px 0 18px rgba(0,0,0,.12);color:var(--dsx-text)}\n.dsh-panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}\n.dsh-panel-title{font-size:14px;font-weight:600;color:var(--dsx-text)}\n.dsh-panel-actions{display:flex;align-items:center;gap:6px}\n.dsh-icon-btn{border:none;background:transparent;color:var(--dsx-text-3);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:6px}\n.dsh-icon-btn:hover{background:var(--dsx-hover);color:var(--dsx-text)}\n.dsh-wx-main{display:flex;flex-direction:column;gap:10px}\n.dsh-wx-row{display:flex;gap:6px;margin-bottom:10px}\n.dsh-wx-input{flex:1;padding:6px 8px;border:1px solid var(--dsx-border-2);border-radius:8px;background:var(--dsx-bg-field);color:var(--dsx-text);font-size:12px;outline:none;min-width:0}\n.dsh-wx-input:focus{border-color:var(--dsx-accent)}\n.dsh-wx-input::placeholder{color:var(--dsx-text-3)}\n.dsh-btn{border:none;border-radius:8px;padding:6px 12px;background:var(--dsx-accent);color:var(--dsx-accent-text);cursor:pointer;font-size:12px;flex:none}\n.dsh-btn:disabled{opacity:.5;cursor:default}\n.dsh-wx-temp{font-size:34px;font-weight:700;color:var(--dsx-text)}\n.dsh-wx-desc{font-size:15px;color:var(--dsx-text-2)}\n.dsh-wx-city{font-size:12px;color:var(--dsx-text-3)}\n.dsh-wx-meta{display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--dsx-text-2)}\n.dsh-wx-meta span{background:var(--dsx-bg-chip);padding:2px 8px;border-radius:999px}\n.dsh-wx-forecast{display:flex;flex-direction:column;border-top:1px solid var(--dsx-border);padding-top:8px;margin-top:2px}\n.dsh-wx-frow{display:flex;align-items:center;justify-content:space-between;padding:6px 2px;font-size:12px;border-bottom:1px dashed var(--dsx-border)}\n.dsh-wx-fdate{color:var(--dsx-text-3);min-width:52px}\n.dsh-wx-fdesc{flex:1;margin-left:8px;color:var(--dsx-text)}\n.dsh-wx-frange{color:var(--dsx-text-2)}\n.dsh-todo-add{display:flex;gap:6px;margin-bottom:10px}\n.dsh-todo-list{display:flex;flex-direction:column;gap:2px;overflow:auto}\n.dsh-todo-item{display:flex;align-items:center;gap:6px;padding:7px 4px;border-radius:8px}\n.dsh-todo-item:hover{background:var(--dsx-hover)}\n.dsh-todo-check{width:18px;height:18px;flex:none;border:1.5px solid var(--dsx-border-2);border-radius:50%;background:transparent;cursor:pointer;color:var(--dsx-success);font-size:11px;line-height:16px;text-align:center;padding:0}\n.dsh-todo-check.done{background:var(--dsx-success);border-color:var(--dsx-success);color:var(--dsx-accent-text)}\n.dsh-todo-text{flex:1;font-size:13px;word-break:break-all;color:var(--dsx-text)}\n.dsh-todo-text.done{text-decoration:line-through;color:var(--dsx-text-3)}\n.dsh-todo-del{border:none;background:transparent;color:var(--dsx-text-3);cursor:pointer;font-size:13px;padding:2px 6px;border-radius:6px}\n.dsh-todo-del:hover{color:var(--dsx-error)}\n.dsh-todo-empty{color:var(--dsx-text-3);font-size:12px;text-align:center;padding:18px 0}\n.dsh-todo-count{font-size:11px;color:var(--dsx-text-3);margin-bottom:8px}\n.dsh-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}\n.dsh-cal-title{font-size:13px;font-weight:600;color:var(--dsx-text)}\n.dsh-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}\n.dsh-cal-dow{text-align:center;font-size:11px;color:var(--dsx-text-3);padding:4px 0}\n.dsh-cal-cell{text-align:center;padding:6px 0;border-radius:8px;font-size:12px;color:var(--dsx-text);cursor:pointer}\n.dsh-cal-cell.blank{cursor:default}\n.dsh-cal-cell.today{background:var(--dsx-accent);color:var(--dsx-accent-text);font-weight:600}\n.dsh-cal-cell.sel:not(.today){background:var(--dsx-bg-chip)}\n.dsh-cal-cell:not(.blank):hover{background:var(--dsx-hover)}\n.dsh-cal-info{margin-top:8px;font-size:12px;color:var(--dsx-text-3);text-align:center}\n.dsh-wx-loading,.dsh-wx-error{font-size:12px;color:var(--dsx-text-3);padding:12px 0;text-align:center}\n.dsh-wx-error{color:var(--dsx-error)}`)

    styles.insert(`.dsh-sidebar-root{--dsx-warn:var(--dsw-alias-state-warn-primary,#f59e0b)}\nbody[data-ds-dark-theme] .dsh-sidebar-root{--dsx-warn:#fbbf24}\n.dsh-todo-opts{display:flex;align-items:center;gap:6px;margin:-4px 0 10px}\n.dsh-prio-pill{flex:none;border:1px solid var(--dsx-border-2);background:transparent;color:var(--dsx-text-2);cursor:pointer;font-size:11px;padding:2px 9px;border-radius:999px}\n.dsh-prio-pill:hover{color:var(--dsx-text)}\n.dsh-prio-pill.active{background:var(--dsx-accent);border-color:var(--dsx-accent);color:var(--dsx-accent-text)}\n.dsh-date-input{flex:1;min-width:0;padding:2px 6px;border:1px solid var(--dsx-border-2);border-radius:8px;background:var(--dsx-bg-field);color:var(--dsx-text);font-size:11px;outline:none}\n.dsh-date-input:focus{border-color:var(--dsx-accent)}\n.dsh-todo-prio{flex:none;font-size:10px;line-height:1;font-weight:600;padding:2px 5px;border-radius:999px}\n.dsh-todo-prio.high{background:rgba(239,68,68,.16);color:var(--dsx-error)}\n.dsh-todo-prio.medium{background:rgba(245,158,11,.18);color:var(--dsx-warn)}\n.dsh-todo-prio.low{background:var(--dsx-bg-chip);color:var(--dsx-text-3)}\n.dsh-todo-due{flex:none;font-size:11px;color:var(--dsx-text-3)}\n.dsh-todo-due.overdue{color:var(--dsx-error);font-weight:600}\n.dsh-viewer-path{display:flex;gap:6px;margin-bottom:8px}\n.dsh-viewer-body{flex:1;min-height:140px;overflow:auto;background:var(--dsx-bg-field);border:1px solid var(--dsx-border);border-radius:8px;padding:8px;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all;color:var(--dsx-text);font-family:ui-monospace,Consolas,'Courier New',monospace}\n.dsh-viewer-edit{flex:1;min-height:140px;width:100%;box-sizing:border-box;resize:vertical;overflow:auto;background:var(--dsx-bg-field);border:1px solid var(--dsx-border);border-radius:8px;padding:8px;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all;color:var(--dsx-text);font-family:ui-monospace,Consolas,'Courier New',monospace;outline:none}\n.dsh-viewer-edit:focus{border-color:var(--dsx-accent)}\n.dsh-viewer-foot{display:flex;align-items:center;gap:8px;margin-top:6px}\n.dsh-viewer-save{flex:none;padding:4px 10px}\n.dsh-viewer-status{flex:1;font-size:11px;color:var(--dsx-text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dsh-viewer-status.ok{color:var(--dsx-success)}\n.dsh-viewer-status.err{color:var(--dsx-error)}\n.dsh-viewer-meta{flex:1;font-size:11px;color:var(--dsx-text-3);margin-top:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dsh-viewer-empty{font-size:12px;color:var(--dsx-text-3);text-align:center;padding:24px 0}`)

    const WMO = {
      113: '☀️', 116: '⛅', 119: '☁️', 122: '☁️', 143: '🌫️',
      176: '🌦️', 179: '🌨️', 182: '🌨️', 185: '🌨️',
      200: '⛈️', 227: '🌨️', 230: '🌨️', 248: '🌫️', 260: '🌫️',
      263: '🌦️', 266: '🌦️', 281: '🌧️', 284: '🌧️',
      293: '🌦️', 296: '🌦️', 299: '🌧️', 302: '🌧️',
      305: '🌧️', 308: '🌧️', 311: '🌧️', 314: '🌧️',
      317: '🌨️', 320: '🌨️', 323: '🌨️', 326: '🌨️',
      329: '🌨️', 332: '🌨️', 335: '🌨️', 338: '🌨️',
      350: '🌧️', 353: '🌦️', 356: '🌧️', 359: '🌧️',
      362: '🌨️', 365: '🌨️', 368: '🌨️', 371: '🌨️',
      374: '🌧️', 377: '🌧️', 386: '⛈️', 389: '⛈️',
      392: '⛈️', 395: '⛈️',
    }

    // 人像 + 问号 图标：蓝色填充人形（放大）+ 旁边醒目的红色问号
    const personQuestionIcon = React.createElement('svg', {
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
    },
      React.createElement('circle', { cx: 7.5, cy: 8.5, r: 4.4, style: { fill: 'var(--dsx-accent)', stroke: 'none' } }),
      React.createElement('path', { d: 'M1.5 21Q7.5 11 13.5 21Z', style: { fill: 'var(--dsx-accent)', stroke: 'none' } }),
      React.createElement('text', {
        x: 18,
        y: 14,
        fontSize: 12.5,
        fontWeight: 800,
        textAnchor: 'middle',
        style: { fill: 'var(--dsx-error)', stroke: 'none' },
      }, '?'),
    )

    function PanelHeader(props) {
      return React.createElement('div', { className: 'dsh-panel-header' },
        React.createElement('span', { className: 'dsh-panel-title' }, props.title),
        React.createElement('div', { className: 'dsh-panel-actions' },
          props.actions ? props.actions : null,
          React.createElement('button', { className: 'dsh-icon-btn', onClick: props.onClose, title: '关闭' }, '✕'),
        ),
      )
    }

    function WeatherView(props) {
      const [city, setCity] = React.useState('')
      const [data, setData] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [loading, setLoading] = React.useState(true)
      const [reqKey, setReqKey] = React.useState(0)

      React.useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        host.call('weather.get', { city })
          .then((res) => {
            if (cancelled) return
            setLoading(false)
            if (res && res.ok) setData(res)
            else setError((res && res.error) || '获取天气失败')
          })
          .catch((err) => {
            if (cancelled) return
            setLoading(false)
            setError(String((err && err.message) || err))
          })
        return () => { cancelled = true }
      }, [reqKey])

      let body
      if (loading) {
        body = React.createElement('div', { className: 'dsh-wx-loading' }, '加载中…')
      } else if (error) {
        body = React.createElement('div', { className: 'dsh-wx-error' }, '⚠ ' + error)
      } else if (data) {
        const icon = WMO[data.code] || '🌡️'
        const desc = data.zh || data.desc || ''
        body = React.createElement('div', { className: 'dsh-wx-main' },
          React.createElement('div', { className: 'dsh-wx-temp' }, data.temp != null ? data.temp + '°C' : '--'),
          React.createElement('div', { className: 'dsh-wx-desc' }, icon + ' ' + desc),
          React.createElement('div', { className: 'dsh-wx-city' }, '📍 ' + data.city),
          React.createElement('div', { className: 'dsh-wx-meta' },
            data.feels != null ? React.createElement('span', null, '体感 ' + data.feels + '°C') : null,
            data.humidity != null ? React.createElement('span', null, '湿度 ' + data.humidity + '%') : null,
            data.wind != null ? React.createElement('span', null, '风速 ' + data.wind + ' km/h') : null,
          ),
          React.createElement('div', { className: 'dsh-wx-forecast' },
            (data.forecast || []).map((f, i) =>
              React.createElement('div', { key: f.date || i, className: 'dsh-wx-frow' },
                React.createElement('span', { className: 'dsh-wx-fdate' }, String(f.date || '').slice(5).replace('-', '/')),
                React.createElement('span', { className: 'dsh-wx-fdesc' }, (WMO[f.code] || '') + ' ' + f.desc),
                React.createElement('span', { className: 'dsh-wx-frange' }, f.min + '° / ' + f.max + '°'),
              ),
            ),
          ),
        )
      }

      return React.createElement('div', { className: 'dsh-sidebar-panel' },
        React.createElement(PanelHeader, {
          title: '🌤️ 天气',
          onClose: props.onClose,
          actions: React.createElement('button', {
            className: 'dsh-icon-btn',
            onClick: () => setReqKey((k) => k + 1),
            title: '刷新',
          }, '↻'),
        }),
        React.createElement('div', { className: 'dsh-wx-row' },
          React.createElement('input', {
            className: 'dsh-wx-input',
            placeholder: '城市（留空自动定位）',
            value: city,
            onChange: (e) => setCity(e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter') setReqKey((k) => k + 1) },
          }),
          React.createElement('button', { className: 'dsh-btn', onClick: () => setReqKey((k) => k + 1), disabled: loading }, '查询'),
        ),
        body,
      )
    }

    function TodoView(props) {
      const [items, setItems] = React.useState([])
      const [text, setText] = React.useState('')
      const [priority, setPriority] = React.useState('medium')
      const [due, setDue] = React.useState('')
      const [loaded, setLoaded] = React.useState(false)

      React.useEffect(() => {
        let cancelled = false
        host.call('todo.list').then((res) => {
          if (cancelled) return
          setItems(Array.isArray(res) ? res : [])
          setLoaded(true)
        }).catch(() => { if (!cancelled) setLoaded(true) })
        return () => { cancelled = true }
      }, [])

      const add = () => {
        const t = text.trim()
        if (!t) return
        setText('')
        host.call('todo.add', { text: t, priority, due: due || '' }).then((res) => {
          if (res && res.ok) setItems((prev) => [...prev, res.item])
        })
      }

      const toggle = (id) => {
        host.call('todo.toggle', { id }).then((res) => {
          if (res && res.ok) setItems((prev) => prev.map((it) => (it.id === id ? res.item : it)))
        })
      }

      const remove = (id) => {
        host.call('todo.remove', { id }).then((res) => {
          if (res && res.ok) setItems((prev) => prev.filter((it) => it.id !== id))
        })
      }

      const PRIO_ORDER = { high: 0, medium: 1, low: 2 }
      const sorted = [...items].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1
        const pa = PRIO_ORDER[a.priority] ?? 1
        const pb = PRIO_ORDER[b.priority] ?? 1
        if (pa !== pb) return pa - pb
        return (a.createdAt || 0) - (b.createdAt || 0)
      })

      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const nowStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes())
      const PRIO_LABEL = { high: '高', medium: '中', low: '低' }
      const undone = items.filter((it) => !it.done).length

      const isOverdue = (it) => {
        if (it.done || !it.due) return false
        const d = String(it.due)
        // 含时间：到期时刻 < 当前时刻；仅日期：当天 23:59 到期，日期 < 今天才算逾期
        return d.includes('T') ? d < nowStr : d < nowStr.slice(0, 10)
      }

      const fmtDue = (it) => {
        const d = String(it.due)
        const md = d.slice(5, 10).replace('-', '/')
        return d.includes('T') ? md + ' ' + d.slice(11, 16) : md
      }

      const listBody = !loaded
        ? React.createElement('div', { className: 'dsh-todo-empty' }, '加载中…')
        : items.length === 0
          ? React.createElement('div', { className: 'dsh-todo-empty' }, '暂无待办，添加一个吧 ✍️')
          : React.createElement('div', { className: 'dsh-todo-list' },
              sorted.map((it) =>
                React.createElement('div', { key: it.id, className: 'dsh-todo-item' },
                  React.createElement('button', {
                    className: 'dsh-todo-check' + (it.done ? ' done' : ''),
                    onClick: () => toggle(it.id),
                    title: it.done ? '标记为未完成' : '标记为完成',
                  }, it.done ? '✓' : ''),
                  React.createElement('span', { className: 'dsh-todo-prio ' + (it.priority || 'medium') }, PRIO_LABEL[it.priority] || '中'),
                  React.createElement('span', { className: 'dsh-todo-text' + (it.done ? ' done' : '') }, it.text),
                  it.due
                    ? React.createElement('span', { className: 'dsh-todo-due' + (isOverdue(it) ? ' overdue' : '') }, fmtDue(it))
                    : null,
                  React.createElement('button', { className: 'dsh-todo-del', onClick: () => remove(it.id), title: '删除' }, '✕'),
                ),
              ),
            )

      return React.createElement('div', { className: 'dsh-sidebar-panel' },
        React.createElement(PanelHeader, { title: '✅ 待办事项', onClose: props.onClose }),
        React.createElement('div', { className: 'dsh-todo-count' }, '共 ' + items.length + ' 项，未完成 ' + undone + ' 项'),
        React.createElement('div', { className: 'dsh-todo-add' },
          React.createElement('input', {
            className: 'dsh-wx-input',
            placeholder: '输入待办事项…',
            value: text,
            onChange: (e) => setText(e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter') add() },
          }),
          React.createElement('button', { className: 'dsh-btn', onClick: add }, '添加'),
        ),
        React.createElement('div', { className: 'dsh-todo-opts' },
          ['high', 'medium', 'low'].map((p) =>
            React.createElement('button', {
              key: p,
              className: 'dsh-prio-pill' + (priority === p ? ' active' : ''),
              onClick: () => setPriority(p),
              title: '优先级',
            }, PRIO_LABEL[p]),
          ),
          React.createElement('input', {
            type: 'datetime-local',
            className: 'dsh-date-input',
            value: due,
            onChange: (e) => setDue(e.target.value),
            title: '截止日期与时间（可选）',
          }),
        ),
        listBody,
      )
    }

    function FileViewer(props) {
      const [path, setPath] = React.useState('')
      const [data, setData] = React.useState(null)
      const [text, setText] = React.useState('')
      const [error, setError] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [saving, setSaving] = React.useState(false)
      const [status, setStatus] = React.useState(null)
      const [loadedPath, setLoadedPath] = React.useState('')
      const [reqKey, setReqKey] = React.useState(0)

      // 载入已保存的路径配置，然后自动打开
      React.useEffect(() => {
        let cancelled = false
        host.call('viewer.config').then((res) => {
          if (cancelled) return
          const p = res && typeof res.path === 'string' ? res.path : ''
          setPath(p)
          if (p) setLoadedPath(p)
        }).catch(() => { /* ignore */ })
        return () => { cancelled = true }
      }, [])

      // 打开文件
      React.useEffect(() => {
        const p = loadedPath.trim()
        if (!p) return
        let cancelled = false
        setLoading(true)
        setError(null)
        setStatus(null)
        host.call('file.read', { path: p }).then((res) => {
          if (cancelled) return
          setLoading(false)
          if (res && res.ok) {
            setData(res)
            setText(res.content)
            host.call('viewer.savePath', { path: p }).catch(() => { /* ignore */ })
          } else {
            setData(null)
            setText('')
            setError((res && res.error) || '打开失败')
          }
        }).catch((err) => {
          if (cancelled) return
          setLoading(false)
          setData(null)
          setText('')
          setError(String((err && err.message) || err))
        })
        return () => { cancelled = true }
      }, [loadedPath, reqKey])

      const open = () => {
        const p = path.trim()
        if (!p) return
        setLoadedPath(p)
      }

      const save = () => {
        const p = loadedPath.trim()
        if (!p) { setStatus({ ok: false, msg: '请先打开文件' }); return }
        setSaving(true)
        setStatus(null)
        host.call('file.save', { path: p, content: text }).then((res) => {
          setSaving(false)
          if (res && res.ok) {
            const t = new Date()
            const pad = (n) => String(n).padStart(2, '0')
            setStatus({ ok: true, msg: '已保存 ' + pad(t.getHours()) + ':' + pad(t.getMinutes()) + ':' + pad(t.getSeconds()) })
            setData((prev) => (prev ? { ...prev, content: text } : prev))
          } else {
            setStatus({ ok: false, msg: (res && res.error) || '保存失败' })
          }
        }).catch((err) => {
          setSaving(false)
          setStatus({ ok: false, msg: String((err && err.message) || err) })
        })
      }

      const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null
      const curBytes = enc ? enc.encode(text).length : text.length
      const curLines = text.split('\n').length

      let body
      if (loading) {
        body = React.createElement('div', { className: 'dsh-wx-loading' }, '加载中…')
      } else if (error) {
        body = React.createElement('div', { className: 'dsh-wx-error' }, '⚠ ' + error)
      } else if (data) {
        body = React.createElement('textarea', {
          className: 'dsh-viewer-edit',
          value: text,
          onChange: (e) => setText(e.target.value),
          spellCheck: false,
          placeholder: '（空文件）',
        })
      } else {
        body = React.createElement('div', { className: 'dsh-viewer-empty' }, '输入文件路径后点击「打开」')
      }

      return React.createElement('div', { className: 'dsh-sidebar-panel' },
        React.createElement(PanelHeader, {
          title: React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, personQuestionIcon, ' 查查'),
          onClose: props.onClose,
          actions: React.createElement('button', {
            className: 'dsh-icon-btn',
            onClick: () => setReqKey((k) => k + 1),
            title: '重新从磁盘加载（丢弃未保存修改）',
          }, '↻'),
        }),
        React.createElement('div', { className: 'dsh-viewer-path' },
          React.createElement('input', {
            className: 'dsh-wx-input',
            placeholder: '文件路径（绝对或相对工作区）',
            value: path,
            onChange: (e) => setPath(e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter') open() },
          }),
          React.createElement('button', { className: 'dsh-btn', onClick: open, disabled: loading }, '打开'),
        ),
        body,
        data ? React.createElement('div', { className: 'dsh-viewer-foot' },
          React.createElement('span', { className: 'dsh-viewer-meta' }, curLines + ' 行 · ' + curBytes + ' 字节 · ' + data.path),
          React.createElement('button', {
            className: 'dsh-btn dsh-viewer-save',
            onClick: save,
            disabled: saving || loading,
          }, saving ? '保存中…' : '保存'),
        ) : null,
        status ? React.createElement('div', { className: 'dsh-viewer-status' + (status.ok ? ' ok' : ' err') }, status.msg) : null,
      )
    }

    function CalendarView(props) {
      const now = new Date()
      const [year, setYear] = React.useState(now.getFullYear())
      const [month, setMonth] = React.useState(now.getMonth())
      const [selected, setSelected] = React.useState(null)

      const go = (delta) => {
        const m = month + delta
        setYear(year + Math.floor(m / 12))
        setMonth(((m % 12) + 12) % 12)
      }

      const goToday = () => {
        const d = new Date()
        setYear(d.getFullYear())
        setMonth(d.getMonth())
        setSelected(null)
      }

      const offset = (new Date(year, month, 1).getDay() + 6) % 7
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const cells = []
      for (let i = 0; i < offset; i++) cells.push(null)
      for (let d = 1; d <= daysInMonth; d++) cells.push(d)

      const today = new Date()
      const isToday = (d) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === d

      const dow = ['一', '二', '三', '四', '五', '六', '日']

      const info = selected
        ? React.createElement('div', { className: 'dsh-cal-info' }, '已选择 ' + year + ' 年 ' + (month + 1) + ' 月 ' + selected + ' 日')
        : React.createElement('div', { className: 'dsh-cal-info' }, '点击日期可选择 · 今天已高亮')

      return React.createElement('div', { className: 'dsh-sidebar-panel' },
        React.createElement(PanelHeader, { title: '📅 日历', onClose: props.onClose }),
        React.createElement('div', { className: 'dsh-cal-head' },
          React.createElement('button', { className: 'dsh-icon-btn', onClick: () => go(-1), title: '上个月' }, '‹'),
          React.createElement('span', { className: 'dsh-cal-title' }, year + ' 年 ' + (month + 1) + ' 月'),
          React.createElement('button', { className: 'dsh-icon-btn', onClick: () => go(1), title: '下个月' }, '›'),
        ),
        React.createElement('div', { className: 'dsh-cal-head' },
          React.createElement('button', { className: 'dsh-btn', onClick: goToday }, '回到今天'),
        ),
        React.createElement('div', { className: 'dsh-cal-grid' },
          dow.map((w) => React.createElement('div', { key: w, className: 'dsh-cal-dow' }, w)),
          cells.map((d, i) =>
            d === null
              ? React.createElement('div', { key: 'b' + i, className: 'dsh-cal-cell blank' })
              : React.createElement('div', {
                  key: d,
                  className: 'dsh-cal-cell'
                    + (isToday(d) ? ' today' : '')
                    + (selected === d ? ' sel' : ''),
                  onClick: () => setSelected(d),
                }, d),
          ),
        ),
        info,
      )
    }

    function ToolsSidebar() {
      const [tab, setTab] = React.useState(null)
      const buttons = [
        { id: 'weather', icon: '🌤️', label: '天气' },
        { id: 'todo', icon: '✅', label: '待办' },
        { id: 'viewer', icon: personQuestionIcon, label: '查查' },
        { id: 'calendar', icon: '📅', label: '日历' },
      ]
      const toggle = (id) => setTab(tab === id ? null : id)

      let panel = null
      if (tab === 'weather') panel = React.createElement(WeatherView, { onClose: () => setTab(null) })
      else if (tab === 'todo') panel = React.createElement(TodoView, { onClose: () => setTab(null) })
      else if (tab === 'viewer') panel = React.createElement(FileViewer, { onClose: () => setTab(null) })
      else if (tab === 'calendar') panel = React.createElement(CalendarView, { onClose: () => setTab(null) })

      const rail = React.createElement('div', { className: 'dsh-sidebar-rail' },
        buttons.map((b) =>
          React.createElement('button', {
            key: b.id,
            className: 'dsh-sidebar-btn' + (tab === b.id ? ' active' : ''),
            onClick: () => toggle(b.id),
            title: b.label,
          },
            React.createElement('span', { className: 'ic' }, b.icon),
            React.createElement('span', null, b.label),
          ),
        ),
      )

      return React.createElement('div', { className: 'dsh-sidebar-root' },
        panel,
        rail,
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'dsh-tools-sidebar' },
      () => React.createElement(ToolsSidebar, null),
    ))
  },
}

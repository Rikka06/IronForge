/**
 * 淬火工坊 - IronForge
 * 作者：弦 | 抖音：LOVE54760 | B站：北极弦
 *
 * IronForge 工具模块
 * 峰值检测、SPM计算、评级系统、数据持久化
 */

/**
 * 往复动作计数器 - 识别手腕上下往复运动
 *
 * 算法：三轴合力幅值 → 滑动窗口均值基线 → 均值穿越检测（计步器原理）
 *
 * 计步器为什么准：用最近N帧的均值作为动态基线，检测信号从低于均值
 * 上升到高于均值的时刻（上升沿）= 一次冲程。动态基线自适应运动强度，
 * 静止时均值低（噪声不易超过），运动时均值高（跟随运动强度）。
 */
export class HammerDetector {
  constructor(options) {
    options = options || {}
    // 均值穿越需要超过均值的额外裕量（m/s²），防止均值附近的噪声误触发
    // 对应 minThreshold(g) * 9.8，默认 0.15g = 1.47 m/s²
    this.margin = options.minThreshold !== undefined
      ? options.minThreshold * 9.8
      : 1.47
    // 防抖时间 (ms)：两次计数最小间隔，支持 SSS 级别（167ms/次）
    this.debounceMs = options.debounceMs !== undefined ? options.debounceMs : 140
    // 滑动窗口大小（帧数）：约0.5秒的数据（game模式约50Hz → 25帧）
    this.windowSize = 25

    // 状态
    this.window = []       // 滑动窗口（存储最近N帧的幅值）
    this.windowSum = 0     // 窗口内幅值之和（快速计算均值）
    this.prevMag = 0       // 上一帧幅值
    this.aboveMean = false // 上一帧是否在均值以上
    this.initialized = false
    this.lastCount = 0
  }

  /**
   * 输入三轴加速度数据，返回是否完成一次冲程
   * @param {number} x - X轴加速度 (m/s²)
   * @param {number} y - Y轴加速度 (m/s²)
   * @param {number} z - Z轴加速度 (m/s²)
   * @param {number} timestamp - 当前时间戳 (ms)
   * @returns {boolean}
   */
  detect(x, y, z, timestamp) {
    // 三轴合力幅值（包含重力，约9.8 m/s²静止时）
    var mag = Math.sqrt(x * x + y * y + z * z)

    // 维护滑动窗口和窗口均值
    this.window.push(mag)
    this.windowSum += mag
    if (this.window.length > this.windowSize) {
      this.windowSum -= this.window.shift()
    }

    // 窗口未满时不检测
    if (this.window.length < this.windowSize) {
      this.prevMag = mag
      return false
    }

    var mean = this.windowSum / this.window.length
    // 动态阈值 = 均值 + 裕量（需要明显超过均值才算）
    var threshold = mean + this.margin

    var result = false

    // 上升沿检测：上一帧低于阈值，这一帧高于阈值 = 一次冲程开始
    // 每次往复运动只有一个上升沿，所以不会重复计数
    if (this.prevMag <= threshold && mag > threshold) {
      if (timestamp - this.lastCount >= this.debounceMs) {
        this.lastCount = timestamp
        result = true
      }
    }

    this.prevMag = mag
    return result
  }

  reset() {
    this.window = []
    this.windowSum = 0
    this.prevMag = 0
    this.aboveMean = false
    this.initialized = false
    this.lastCount = 0
  }
}

/**
 * SPM计算器 - Strokes Per Minute
 * 使用滑动窗口统计
 */
export class SPMCalculator {
  constructor(windowSizeMs = 60000) {
    this.windowSizeMs = windowSizeMs // 60秒窗口
    this.timestamps = [] // 锤击时间戳队列
  }

  /**
   * 记录一次锤击
   * @param {number} timestamp
   */
  record(timestamp) {
    this.timestamps.push(timestamp)
    this._cleanup(timestamp)
  }

  /**
   * 获取当前SPM
   * @param {number} currentTime
   * @returns {number}
   */
  getSPM(currentTime) {
    this._cleanup(currentTime)
    if (this.timestamps.length < 2) return 0

    const windowStart = currentTime - this.windowSizeMs
    const firstStamp = this.timestamps[0]
    const effectiveWindow = (currentTime - Math.max(firstStamp, windowStart)) / 1000

    // 修复：必须有足够的时间跨度（例如至少3秒）或足够的数据点（例如5个），才开始计算SPM
    // 否则在刚开始时，时间窗口极小（如0.2秒），SPM会飙升到几千
    if (effectiveWindow < 3 && this.timestamps.length < 5) return 0

    if (effectiveWindow <= 0) return 0

    // 计算逻辑优化：timestamps.length - 1 才是间隔数，但为了平滑显示，保持原逻辑或微调
    // 原逻辑：count / window * 60
    return Math.round((this.timestamps.length / effectiveWindow) * 60)
  }

  /**
   * 获取SPM历史记录（每5秒采样一次）
   * @returns {Array<number>}
   */
  getHistory() {
    return this._spmHistory || []
  }

  /**
   * 清理过期数据
   */
  _cleanup(currentTime) {
    const cutoff = currentTime - this.windowSizeMs
    while (this.timestamps.length > 0 && this.timestamps[0] < cutoff) {
      this.timestamps.shift()
    }
  }

  reset() {
    this.timestamps = []
  }
}

// ===== 评级颜色定义 =====
var TIER_COLORS = {
  SSS: '#FFD700',
  SS: '#FF6B35',
  S: '#E040FB',
  A: '#4ECDC4',
  B: '#95E1D3',
  C: '#A8A8A8',
  D: '#666666'
}

function tierColor(tier) {
  return TIER_COLORS[tier] || '#FFFFFF'
}

function tierToScore(tier) {
  var map = { SSS: 7, SS: 6, S: 5, A: 4, B: 3, C: 2, D: 1 }
  return map[tier] || 1
}

/**
 * 第1维: 炉火纯度 - 持续时长评级
 * @param {number} durationSec - 秒
 */
export function getDurationRating(durationSec) {
  var T = durationSec / 60
  var tier, desc
  if (T >= 45) { tier = 'SSS'; desc = '永恒之焰' }
  else if (T >= 30) { tier = 'SS'; desc = '不灭炉火' }
  else if (T >= 20) { tier = 'S'; desc = '持久燃烧' }
  else if (T >= 10) { tier = 'A'; desc = '稳定火候' }
  else if (T >= 5) { tier = 'B'; desc = '初燃之焰' }
  else if (T >= 2) { tier = 'C'; desc = '星星之火' }
  else { tier = 'D'; desc = '一闪即灭' }
  return { name: '炉火纯度', tier: tier, color: tierColor(tier), desc: desc, value: Math.round(T * 10) / 10 + '分钟' }
}

/**
 * 第2维: 锻打极速 - 峰值频率评级
 * @param {number} maxSPM
 */
export function getPeakSPMRating(maxSPM) {
  var tier, desc
  if (maxSPM >= 350) { tier = 'SSS'; desc = '音速锤击' }
  else if (maxSPM >= 280) { tier = 'SS'; desc = '疾风迅雷' }
  else if (maxSPM >= 220) { tier = 'S'; desc = '极速连击' }
  else if (maxSPM >= 160) { tier = 'A'; desc = '快速节奏' }
  else if (maxSPM >= 100) { tier = 'B'; desc = '中等手速' }
  else if (maxSPM >= 60) { tier = 'C'; desc = '慢速敲打' }
  else { tier = 'D'; desc = '蜗牛速度' }
  return { name: '锻打极速', tier: tier, color: tierColor(tier), desc: desc, value: maxSPM + ' SPM' }
}

/**
 * 第3维: 锤炼精度 - 节奏稳定性评级
 * @param {number} sdPercent - SPM标准差百分比
 */
export function getStabilityRating(sdPercent) {
  var tier, desc
  if (sdPercent < 5) { tier = 'SSS'; desc = '机械精度' }
  else if (sdPercent < 10) { tier = 'SS'; desc = '极致稳定' }
  else if (sdPercent < 15) { tier = 'S'; desc = '节奏大师' }
  else if (sdPercent < 20) { tier = 'A'; desc = '节奏良好' }
  else if (sdPercent < 30) { tier = 'B'; desc = '略有波动' }
  else if (sdPercent < 50) { tier = 'C'; desc = '起伏不定' }
  else { tier = 'D'; desc = '断断续续' }
  return { name: '锤炼精度', tier: tier, color: tierColor(tier), desc: desc, value: Math.round(sdPercent) + '%' }
}

/**
 * 第4维: 产出总量 - 总次数评级
 * @param {number} count
 */
export function getTotalCountRating(count) {
  var tier, desc
  if (count >= 5000) { tier = 'SSS'; desc = '万锤百炼' }
  else if (count >= 3500) { tier = 'SS'; desc = '千锤不息' }
  else if (count >= 2000) { tier = 'S'; desc = '大量产出' }
  else if (count >= 1000) { tier = 'A'; desc = '稳定产出' }
  else if (count >= 500) { tier = 'B'; desc = '小有成就' }
  else if (count >= 100) { tier = 'C'; desc = '初步积累' }
  else { tier = 'D'; desc = '寥寥数锤' }
  return { name: '产出总量', tier: tier, color: tierColor(tier), desc: desc, value: count + '次' }
}

/**
 * 综合评级 - 加权积分法
 * 时长40% + 总量30% + 极速20% + 精度10%
 */
export function getOverallRating(durationR, countR, peakR, stabilityR) {
  var score = tierToScore(durationR.tier) * 0.4
    + tierToScore(countR.tier) * 0.3
    + tierToScore(peakR.tier) * 0.2
    + tierToScore(stabilityR.tier) * 0.1
  score = Math.round(score * 100) / 100

  var tier, desc
  if (score >= 6.5) { tier = 'SSS'; desc = '传世神器' }
  else if (score >= 5.5) { tier = 'SS'; desc = '史诗杰作' }
  else if (score >= 4.5) { tier = 'S'; desc = '大师之作' }
  else if (score >= 3.5) { tier = 'A'; desc = '精良工艺' }
  else if (score >= 2.5) { tier = 'B'; desc = '合格量产' }
  else if (score >= 1.5) { tier = 'C'; desc = '粗制滥造' }
  else { tier = 'D'; desc = '废料' }
  return { name: '神匠综合评级', tier: tier, color: tierColor(tier), desc: desc, score: score }
}

/**
 * 计算SPM标准差百分比
 * @param {Array} spmHistory - [{time, spm}]
 * @returns {number} 标准差百分比
 */
export function computeSPMStdDevPercent(spmHistory) {
  if (!spmHistory || spmHistory.length < 2) return 100
  var values = []
  for (var i = 0; i < spmHistory.length; i++) {
    if (spmHistory[i].spm > 0) values.push(spmHistory[i].spm)
  }
  if (values.length < 2) return 100
  var sum = 0
  for (var j = 0; j < values.length; j++) sum += values[j]
  var mean = sum / values.length
  if (mean === 0) return 100
  var sqDiffSum = 0
  for (var k = 0; k < values.length; k++) {
    sqDiffSum += (values[k] - mean) * (values[k] - mean)
  }
  var sd = Math.sqrt(sqDiffSum / values.length)
  return (sd / mean) * 100
}

/**
 * 格式化时长 (秒 → MM:SS)
 */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * 历史记录管理
 */
const STORAGE_KEY = 'ironforge_history'

export function serializeSession(session) {
  return JSON.stringify(session)
}

export function deserializeSession(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

/**
 * 保存会话到历史记录
 * @param {Object} storage - @system.storage 实例
 * @param {Object} session - 会话数据
 * @param {Function} callback - 回调
 */
export function saveSession(storage, session, callback) {
  storage.get({
    key: STORAGE_KEY,
    success: function (data) {
      let history = []
      try {
        history = JSON.parse(data) || []
      } catch (e) {
        history = []
      }
      history.unshift(session)
      // 最多保留50条记录
      if (history.length > 50) {
        history = history.slice(0, 50)
      }
      storage.set({
        key: STORAGE_KEY,
        value: JSON.stringify(history),
        success: function () {
          callback && callback(true)
        },
        fail: function () {
          callback && callback(false)
        }
      })
    },
    fail: function () {
      // 首次保存
      const history = [session]
      storage.set({
        key: STORAGE_KEY,
        value: JSON.stringify(history),
        success: function () {
          callback && callback(true)
        },
        fail: function () {
          callback && callback(false)
        }
      })
    }
  })
}

/**
 * 读取所有历史记录
 */
export function loadHistory(storage, callback) {
  storage.get({
    key: STORAGE_KEY,
    success: function (data) {
      let history = []
      try {
        history = JSON.parse(data) || []
      } catch (e) {
        history = []
      }
      callback(history)
    },
    fail: function () {
      callback([])
    }
  })
}

/**
 * 删除指定索引的记录
 */
export function deleteRecord(storage, index, callback) {
  loadHistory(storage, function (history) {
    if (index >= 0 && index < history.length) {
      history.splice(index, 1)
      storage.set({
        key: STORAGE_KEY,
        value: JSON.stringify(history),
        success: function () {
          callback && callback(true, history)
        },
        fail: function () {
          callback && callback(false, history)
        }
      })
    } else {
      callback && callback(false, history)
    }
  })
}

/**
 * 清空所有历史记录
 */
export function clearHistory(storage, callback) {
  storage.delete({
    key: STORAGE_KEY,
    success: function () {
      callback && callback(true)
    },
    fail: function () {
      callback && callback(false)
    }
  })
}

/**
 * 获取本周统计数据
 * @param {Array} history - 历史记录数组
 */
export function getWeeklyStats(history) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)
  // 获取周一作为一周的开始 (0是周日，1是周一)
  const day = startOfWeek.getDay() || 7
  startOfWeek.setDate(startOfWeek.getDate() - day + 1)

  let stats = {
    totalStrokes: 0,
    totalDuration: 0,
    days: [0, 0, 0, 0, 0, 0, 0], // 周一到周日
    count: 0
  }

  history.forEach(record => {
    const date = new Date(record.timestamp)
    if (date >= startOfWeek) {
      stats.totalStrokes += record.strokes
      stats.totalDuration += record.duration
      stats.count++

      const dayIndex = (date.getDay() || 7) - 1
      stats.days[dayIndex] += record.strokes
    }
  })

  stats.avgSPM = stats.totalDuration > 0 ? Math.round((stats.totalStrokes / stats.totalDuration) * 60) : 0
  return stats
}

/**
 * 获取本月统计数据
 * @param {Array} history - 历史记录数组
 */
export function getMonthlyStats(history) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let stats = {
    totalStrokes: 0,
    totalDuration: 0,
    count: 0
  }

  history.forEach(record => {
    const date = new Date(record.timestamp)
    if (date >= startOfMonth) {
      stats.totalStrokes += record.strokes
      stats.totalDuration += record.duration
      stats.count++
    }
  })

  stats.avgSPM = stats.totalDuration > 0 ? Math.round((stats.totalStrokes / stats.totalDuration) * 60) : 0
  return stats
}

// ===== 设置管理 =====
var SETTINGS_KEY = 'ironforge_settings'

export function getDefaultSettings() {
  return {
    hand: 'right',
    vibration: 'normal',
    sensitivity: {
      minThreshold: 0.20,
      debounceMs: 140,
      dropRatio: 0.35,
      adaptRatio: 0.55
    },
    handChanged: false
  }
}

export function loadSettings(storage, callback) {
  var defaults = getDefaultSettings()
  storage.get({
    key: SETTINGS_KEY,
    success: function (data) {
      try {
        var s = JSON.parse(data)
        var result = getDefaultSettings()
        if (s.hand) result.hand = s.hand
        if (s.vibration) result.vibration = s.vibration
        if (typeof s.handChanged === 'boolean') result.handChanged = s.handChanged
        if (s.sensitivity) {
          if (s.sensitivity.minThreshold !== undefined) result.sensitivity.minThreshold = s.sensitivity.minThreshold
          if (s.sensitivity.debounceMs !== undefined) result.sensitivity.debounceMs = s.sensitivity.debounceMs
          if (s.sensitivity.dropRatio !== undefined) result.sensitivity.dropRatio = s.sensitivity.dropRatio
          if (s.sensitivity.adaptRatio !== undefined) result.sensitivity.adaptRatio = s.sensitivity.adaptRatio
        }
        callback(result)
      } catch (e) {
        callback(defaults)
      }
    },
    fail: function () {
      callback(defaults)
    }
  })
}

export function saveSettings(storage, settings, callback) {
  storage.set({
    key: SETTINGS_KEY,
    value: JSON.stringify(settings),
    success: function () { callback && callback(true) },
    fail: function () { callback && callback(false) }
  })
}

// ===== 成就系统 =====
var ACHIEVEMENTS_KEY = 'ironforge_achievements'

export var ACHIEVEMENT_DEFS = [
  { id: 'apprentice', name: '初入铁匠铺', desc: '点燃炉火，完成人生第一次锻造', hint: '完成首次锻造', rare: 1 },
  { id: 'steam', name: '炉火升温', desc: '锻造节奏加快，铁炉温度攀升', hint: '提升锻造速度', rare: 2 },
  { id: 'lightspeed', name: '雷霆万钧', desc: '锤击速度突破极限，铁砧上火花四溅', hint: '极致爆发力', rare: 4 },
  { id: 'premature', name: '极速爆破', desc: '高强度短时爆发式锻造，瞬间释放全部力量', hint: '短时高强度', rare: 3 },
  { id: 'quickdraw', name: '闪电出击', desc: '高效率完成一次快速锻造', hint: '速战速决', rare: 2 },
  { id: 'edging', name: '精准控制', desc: '张弛有度，精确掌控锻造节奏的起停', hint: '多次暂停与恢复', rare: 4 },
  { id: 'sleepyhead', name: '晨练先锋', desc: '在周末清晨开始一天的锻造', hint: '特定时间段', rare: 3 },
  { id: 'midnight', name: '夜间淬炼', desc: '万籁俱寂，唯有锤声回荡在深夜铁匠铺', hint: '深夜锻造', rare: 3 },
  { id: 'singles', name: '铁匠节庆典', desc: '在这个特别的日子里，以锤代笔书写传奇', hint: '特别的日子', rare: 5 },
  { id: 'valentine', name: '以铁为伴', desc: '浪漫佳节依然坚守铁匠铺，与铁砧为伴', hint: '浪漫节日锻造', rare: 5 },
  { id: 'machine', name: '精密锻压', desc: '锤击节奏如同精密机械般稳定而持久', hint: '极致稳定性', rare: 4 },
  { id: 'ambidex', name: '双臂均衡', desc: '切换至非惯用手锻造，追求全面发展', hint: '切换佩戴手', rare: 3 },
  { id: 'sage', name: '静心冥想', desc: '锻造后静坐沉思，领悟工匠之道的真谛', hint: '锻后深度沉思', rare: 4 },
  { id: 'clean', name: '工位整理', desc: '锻造完毕后认真审视成果，整理工位', hint: '锻后短暂停留', rare: 2 },
  { id: 'kirin', name: '千锤百炼', desc: '累计锻造达到惊人数量，真正的钢铁之臂', hint: '量变引起质变', rare: 5 }
]

// ===== 成就系统存储 =====
// 每个成就独立存储，键名格式：ach_<id>
var ACH_PREFIX = 'ach_'

export function loadAchievements(storage, callback) {
  var ids = []
  for (var i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
    ids.push(ACHIEVEMENT_DEFS[i].id)
  }
  var achievements = {}
  var remaining = ids.length
  if (remaining === 0) { callback({}); return }

  for (var k = 0; k < ids.length; k++) {
    (function (id) {
      storage.get({
        key: ACH_PREFIX + id,
        success: function (data) {
          if (data === '1') {
            achievements[id] = true
          }
          remaining--
          if (remaining === 0) callback(achievements)
        },
        fail: function () {
          remaining--
          if (remaining === 0) callback(achievements)
        }
      })
    })(ids[k])
  }
}

export function saveAchievements(storage, achievements, callback) {
  // 只保存已解锁的（value='1'）
  var keys = []
  for (var k in achievements) {
    if (achievements[k]) keys.push(k)
  }
  var remaining = keys.length
  if (remaining === 0) { callback && callback(true); return }
  for (var i = 0; i < keys.length; i++) {
    (function (id) {
      storage.set({
        key: ACH_PREFIX + id,
        value: '1',
        success: function () {
          remaining--
          if (remaining === 0) callback && callback(true)
        },
        fail: function () {
          remaining--
          if (remaining === 0) callback && callback(false)
        }
      })
    })(keys[i])
  }
}

/**
 * 检查本次锻造解锁了哪些成就
 * @param {Object} session - 本次会话数据
 * @param {Object} settings - 用户设置
 * @param {Object} achievements - 已解锁成就 map
 * @param {Array} history - 历史记录（含本次）
 * @returns {Array} 新解锁的成就ID列表
 */
export function checkSessionAchievements(session, settings, achievements, history) {
  var newlyUnlocked = []
  var dateStr = new Date().toLocaleString()

  function tryUnlock(id) {
    if (!achievements[id]) {
      newlyUnlocked.push(id)
      achievements[id] = { unlocked: true, date: dateStr }
    }
  }

  // 1. 铁匠学徒 - 累计完成1次运动
  if (history.length >= 1) tryUnlock('apprentice')

  // 2. 蒸汽动力 - 瞬时SPM >= 180
  if (session.maxSPM >= 180) tryUnlock('steam')

  // 3. 光速锻造 - 瞬时SPM >= 350
  if (session.maxSPM >= 350) tryUnlock('lightspeed')

  // 4. 早发性冷却 - 前30s SPM高 + 时长 < 60s
  if (session.earlySPM && session.earlySPM >= 120 && session.duration < 60) tryUnlock('premature')

  // 5. 快枪手 - 时长 < 2分钟
  if (session.duration > 0 && session.duration < 120) tryUnlock('quickdraw')

  // 6. 寸止挑战 - 高频中暂停3次+
  if (session.pauseCount && session.pauseCount >= 3) tryUnlock('edging')

  // 7-10. 时间相关
  var now = new Date(session.timestamp)
  var dayOfWeek = now.getDay()
  var hour = now.getHours()
  var month = now.getMonth()
  var date = now.getDate()

  // 回笼觉 - 周末 09:00-11:00
  if ((dayOfWeek === 0 || dayOfWeek === 6) && hour >= 9 && hour < 11) tryUnlock('sleepyhead')

  // 午夜凶铃 - 00:00-01:00
  if (hour >= 0 && hour < 1) tryUnlock('midnight')

  // 光棍节万岁 - 11月11日
  if (month === 10 && date === 11) tryUnlock('singles')

  // 这种日子... - 2月14日
  if (month === 1 && date === 14) tryUnlock('valentine')

  // 11. 打桩机 - 方差极小 + 持续5分钟以上
  if (session.sdPercent < 5 && session.duration >= 300) tryUnlock('machine')

  // 12. 双持狂战 - 佩戴方向改变后完成
  if (settings && settings.handChanged) tryUnlock('ambidex')

  // 13. 麒麟臂 - 累计总次数 >= 1,000,000
  var totalStrokes = 0
  for (var i = 0; i < history.length; i++) {
    totalStrokes += (history[i].strokes || 0)
  }
  if (totalStrokes >= 1000000) tryUnlock('kirin')

  // 注意：sage 和 clean 在 report 页面通过计时器检查

  return newlyUnlocked
}

/**
 * 获取成就稀有度颜色
 */
export function getAchievementColor(rare) {
  if (rare >= 5) return '#FF4500'  // 传说 - 橙红
  if (rare >= 4) return '#E040FB'  // 史诗 - 紫色
  if (rare >= 3) return '#FFD700'  // 稀有 - 金色
  if (rare >= 2) return '#4ECDC4'  // 罕见 - 青色
  return '#A8A8A8'                 // 普通 - 灰色
}

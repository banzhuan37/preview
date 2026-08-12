const iconPaths = {
  home: '<path d="M3 8.5 9 3l6 5.5V15H4V8.5Z"/><path d="M7 15v-4h4v4"/>',
  folder: '<path d="M2.5 5.5h5L9 7h6.5v7H2.5v-8.5Z"/><path d="M2.5 7h13"/>',
  target: '<circle cx="9" cy="9" r="6"/><circle cx="9" cy="9" r="2.5"/><path d="M9 1v3M9 14v3M1 9h3M14 9h3"/>',
  activity: '<path d="M2 10h3l2-5 3 9 2-6 1.5 2H16"/>',
  map: '<path d="m2.5 4 4-1.5 5 1.5 4-1.5v11L11.5 15l-5-1.5-4 1.5V4Z"/><path d="M6.5 2.5v11M11.5 4v11"/>',
  moon: '<path d="M13.8 12.8A6.5 6.5 0 1 1 6.2 3.2a5.6 5.6 0 0 0 7.6 9.6Z"/>',
  social: '<circle cx="6" cy="6" r="2.3"/><circle cx="13" cy="7" r="2"/><path d="M2.5 15c.3-3 1.7-4.6 3.5-4.6s3.3 1.6 3.5 4.6M10 14.5c.3-2.3 1.4-3.6 3-3.6 1.5 0 2.6 1.2 2.9 3.6"/>',
  stats: '<path d="M3 15V9h3v6H3Zm5 0V3h3v12H8Zm5 0V6h3v9h-3Z"/>',
  report: '<path d="M4 2.5h7l3 3V15.5H4v-13Z"/><path d="M11 2.5v3h3M6.5 8h5M6.5 10.5h5M6.5 13h3"/>',
  database: '<ellipse cx="9" cy="4" rx="6" ry="2.5"/><path d="M3 4v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V4M3 9v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V9"/>',
  distance: '<path d="M2.5 9h13M4.5 6.5 2 9l2.5 2.5M13.5 6.5 16 9l-2.5 2.5"/>',
  speed: '<path d="M3 13a6 6 0 1 1 12 0M9 13l3-5"/><path d="M5 7.5 3.5 6M13 7.5 14.5 6"/>',
  clock: '<circle cx="9" cy="9" r="6.5"/><path d="M9 5v4l2.5 1.5"/>',
  check: '<path d="m3 9 3.5 3.5L15 4.5"/>',
  upload: '<path d="M9 12V3M5.5 6.5 9 3l3.5 3.5M3 11.5V15h12v-3.5"/>',
  flask: '<path d="M6 2.5h6M7.5 2.5v4L3.5 14c-.4.8.2 1.5 1.1 1.5h8.8c.9 0 1.5-.7 1.1-1.5l-4-7.5v-4"/><path d="M5.5 11h7"/>'
};

const pageMeta = {
  dashboard: ['工作空间', '科研总览'], projects: ['工作空间', '实验项目'], projectSetup: ['实验项目', '分析配置'], videoImport: ['新建实验', '导入视频'], tracking: ['工作空间', '轨迹工作台'],
  locomotion: ['分析中心', '运动能力'], spatial: ['分析中心', '空间偏好'], social: ['分析中心', '社交行为'],
  statistics: ['分析中心', '组间统计'], data: ['成果', '数据管理']
};

function svgIcon(name) {
  return `<svg viewBox="0 0 18 18" aria-hidden="true">${iconPaths[name] || iconPaths.activity}</svg>`;
}

function installIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = svgIcon(node.dataset.icon); });
}

function metricCard(label, value, unit, icon, delta, color = '#0a9189', tint = '#dff5f2', down = false) {
  return `<article class="metric-card" style="--metric-color:${color};--metric-tint:${tint}">
    <div class="metric-top"><span>${label}</span><span class="metric-icon">${svgIcon(icon)}</span></div>
    <div class="metric-value">${value}${unit ? `<small>${unit}</small>` : ''}</div>
    <div class="metric-foot"><span class="metric-delta ${down ? 'down' : ''}">${delta}</span></div>
  </article>`;
}

function pageHeader(eyebrow, title, description, actions = '') {
  return `<header class="page-header">
    <div class="page-title-group"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>
    <div class="page-actions">${actions}</div>
  </header>`;
}

function lineChart({secondary = false, stimulus = false} = {}) {
  const points = '40,160 70,151 100,157 130,133 160,142 190,117 220,124 250,90 280,101 310,68 340,77 370,48 400,61 430,40 460,50 490,31';
  const points2 = '40,171 70,164 100,162 130,153 160,148 190,141 220,137 250,129 280,118 310,111 340,101 370,88 400,82 430,71 460,64 490,58';
  return `<svg class="chart-svg" viewBox="0 0 520 210" role="img" aria-label="活动趋势折线图">
    <defs><linearGradient id="tealArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#13a89e" stop-opacity=".27"/><stop offset="1" stop-color="#13a89e" stop-opacity="0"/></linearGradient></defs>
    ${[35,75,115,155,195].map(y => `<line class="chart-grid" x1="40" y1="${y}" x2="500" y2="${y}"/>`).join('')}
    ${stimulus ? '<rect x="282" y="25" width="56" height="170" fill="#fff2d9" opacity=".66"/><line x1="310" y1="25" x2="310" y2="195" stroke="#e8a02e" stroke-dasharray="3 3"/><text x="290" y="18" fill="#bd7712">光刺激</text>' : ''}
    <line class="chart-axis" x1="40" y1="195" x2="500" y2="195"/>
    <polygon class="chart-area-teal" points="${points} 490,195 40,195"/>
    <polyline class="chart-line-teal" points="${points}"/>
    ${secondary ? `<polyline class="chart-line-blue" points="${points2}"/>` : ''}
    ${[40,130,220,310,400,490].map((x,i) => `<text x="${x}" y="207" text-anchor="middle">${i*6}:00</text>`).join('')}
    ${['0','25','50','75','100'].map((t,i) => `<text x="32" y="${198-i*40}" text-anchor="end">${t}</text>`).join('')}
  </svg>`;
}

function distributionChart() {
  return `<svg class="chart-svg" viewBox="0 0 520 215" role="img" aria-label="组间分布图">
    ${[35,75,115,155,195].map(y => `<line class="chart-grid" x1="45" y1="${y}" x2="500" y2="${y}"/>`).join('')}
    <line class="chart-axis" x1="45" y1="195" x2="500" y2="195"/>
    <path d="M90 58C60 86 65 148 90 173C115 148 120 86 90 58Z" fill="#93d9d2" opacity=".55"/><rect x="78" y="96" width="24" height="42" fill="#fff" stroke="#0a9189"/><line x1="78" y1="117" x2="102" y2="117" stroke="#0a9189" stroke-width="2"/>
    <path d="M200 75C169 101 172 158 200 180C228 158 231 101 200 75Z" fill="#a8c9f1" opacity=".65"/><rect x="188" y="111" width="24" height="38" fill="#fff" stroke="#2f72d6"/><line x1="188" y1="130" x2="212" y2="130" stroke="#2f72d6" stroke-width="2"/>
    <path d="M310 92C281 111 285 168 310 185C335 168 339 111 310 92Z" fill="#f2c67e" opacity=".65"/><rect x="298" y="125" width="24" height="35" fill="#fff" stroke="#e8a02e"/><line x1="298" y1="143" x2="322" y2="143" stroke="#e8a02e" stroke-width="2"/>
    <path d="M420 43C387 68 391 142 420 169C449 142 453 68 420 43Z" fill="#d1c5f1" opacity=".7"/><rect x="408" y="82" width="24" height="52" fill="#fff" stroke="#8066c8"/><line x1="408" y1="107" x2="432" y2="107" stroke="#8066c8" stroke-width="2"/>
    ${[[90,83],[90,109],[90,129],[90,151],[90,72],[200,103],[200,123],[200,145],[200,161],[310,119],[310,139],[310,155],[310,171],[420,71],[420,93],[420,118],[420,143]].map((p,i)=>`<circle cx="${p[0]+((i%3)-1)*7}" cy="${p[1]}" r="2.7" fill="#fff" stroke="#637982"/>`).join('')}
    <text x="90" y="209" text-anchor="middle">对照组</text><text x="200" y="209" text-anchor="middle">低剂量</text><text x="310" y="209" text-anchor="middle">高剂量</text><text x="420" y="209" text-anchor="middle">恢复组</text>
  </svg>`;
}

function dashboardPage() {
  return `<section class="page">
    ${pageHeader('RESEARCH OVERVIEW','科研总览','集中查看实验进度、数据质量与近期分析结果。', '<span class="date-chip">2026年8月10日 · 周一</span><span class="status-chip success"><i class="status-dot"></i>分析服务正常</span>')}
    <article class="new-experiment-hero">
      <div class="hero-symbol">${svgIcon('flask')}</div>
      <div class="hero-copy"><span class="eyebrow">START A NEW STUDY</span><h2>开始一项新的果蝇行为实验</h2><p>创建实验信息后，直接从本地电脑选择视频并进入标准化分析流程。</p></div>
      <div class="hero-flow"><span>填写信息</span><i>→</i><span>导入视频</span><i>→</i><span>轨迹分析</span></div>
      <button class="primary-button hero-button open-experiment"><span>＋</span> 新建实验</button>
    </article>
    <div class="metric-grid">
      ${metricCard('本月实验', '12', '项', 'flask', '本月新增 2 项', '#0a9189','#dff5f2')}
      ${metricCard('已分析个体', '368', '只', 'target', '完成 31 个样本批次', '#2f72d6','#e9f1fd')}
      ${metricCard('有效分析时长', '286.4', '小时', 'clock', '可用于统计的累计时长', '#2c9b74','#e5f5ee')}
      ${metricCard('实验报告总数', '24', '份', 'report', '已归档 21 份', '#8066c8','#f0ecfb')}
    </div>
    <div class="content-grid">
      <article class="card">
        <div class="card-header"><div class="card-title"><h2>实验活动趋势</h2><p>近 30 天累计有效分析时长与实验报告数量</p></div><div class="card-actions"><div class="legend"><span><i style="--legend-color:#13a89e"></i>有效分析时长</span><span><i style="--legend-color:#2f72d6"></i>实验报告</span></div><select class="select-compact"><option>近30天</option><option>近90天</option></select></div></div>
        <div class="card-body">${lineChart({secondary:true})}<div class="chart-summary"><div><span>有效分析时长</span><strong>286.4h</strong></div><div><span>实验报告总数</span><strong>24</strong></div><div><span>平均分析耗时</span><strong>4m 18s</strong></div></div></div>
      </article>
      <article class="card">
        <div class="card-header"><div class="card-title"><h2>近期实验</h2><p>按最近更新时间排序</p></div><button class="ghost-button page-link" data-target="projects">查看全部 →</button></div>
        <div class="card-body"><div class="experiment-list">
          ${recentExperiment('光照刺激行为实验','刺激响应 · 24只','光','88%','分析中','#0a9189','#dff5f2')}
          ${recentExperiment('帕金森模型运动评估','运动能力 · 36只','运','100%','已完成','#2f72d6','#e9f1fd')}
          ${recentExperiment('咖啡因睡眠干预','节律睡眠 · 48只','眠','62%','采集中','#8066c8','#f0ecfb')}
          ${recentExperiment('气味双选偏好实验','空间偏好 · 32只','偏','34%','待分析','#e8a02e','#fff2d9')}
        </div></div>
      </article>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><h2>快速开始</h2><p>按科研任务进入标准化工作流</p></div></div>
      <div class="card-body"><div class="quick-grid">
        ${quickAction('⌁','导入并校验轨迹','检查跳点、断轨与身份交换','tracking','#0a9189','#dff5f2')}
        ${quickAction('↗','分析运动能力','距离、速度、转向与活动片段','locomotion','#2f72d6','#e9f1fd')}
        ${quickAction('◎','计算区域偏好','热图、停留时间与偏好指数','spatial','#e8a02e','#fff2d9')}
        ${quickAction('⇩','导出实验数据','选择实验并导出全部原始数据','data','#8066c8','#f0ecfb')}
      </div></div>
    </div>
  </section>`;
}

function recentExperiment(name, meta, initial, value, status, color, bg) {
  return `<div class="experiment-row"><div class="experiment-thumb" style="--thumb-color:${color};--thumb-bg:${bg}">${initial}</div><div class="experiment-copy"><strong>${name}</strong><span>${meta}</span></div><div class="experiment-progress"><strong>${value}</strong><small>${status}</small></div></div>`;
}

function quickAction(symbol, title, text, target, color, bg) {
  return `<button class="quick-action page-link" data-target="${target}" style="--qa-color:${color};--qa-bg:${bg}"><span class="quick-action-icon">${symbol}</span><span><strong>${title}</strong><span>${text}</span></span></button>`;
}

function projectsPage() {
  const cards = [
    ['光照刺激行为实验','评估三种光照强度对果蝇运动能力与区域选择的影响。','刺激响应','光','24只','分析中','今天 14:32','#0a9189','#dff5f2',['w1118','3组','光刺激']],
    ['帕金森模型运动评估','比较模型组与对照组在不同日龄下的运动能力。','运动能力','运','36只','已完成','昨天 18:06','#2f72d6','#e9f1fd',['PINK1','4组','纵向']],
    ['咖啡因睡眠干预','分析不同咖啡因浓度对昼夜活动和睡眠结构的影响。','节律睡眠','眠','48只','采集中','8月8日','#8066c8','#f0ecfb',['Canton-S','4组','72小时']],
    ['气味双选偏好实验','量化果蝇对苹果醋与乙酸乙酯的趋向性。','空间偏好','偏','32只','待分析','8月6日','#e8a02e','#fff2d9',['Orco','2组','双选']],
    ['衰老过程攀爬能力','连续记录7、14、21、28日龄果蝇的负趋地行为。','攀爬实验','攀','64只','已完成','8月3日','#e76b62','#fceae8',['w1118','4时间点','RING']],
    ['群体聚集行为探索','不同密度下的聚集指数与个体间距离分析。','社交行为','群','40只','草稿','7月29日','#2c9b74','#e5f5ee',['CS','5密度','群体']]
  ];
  return `<section class="page">
    ${pageHeader('EXPERIMENT LIBRARY','实验项目','以项目为单位管理视频、轨迹、样本信息、分析方案和科研报告。')}
    <div class="project-toolbar"><div class="toolbar-left"><label class="search-box"><span class="search-icon"></span><input id="projectSearch" placeholder="搜索实验名称、品系或标签" /></label><select class="select-compact"><option>全部实验类型</option><option>运动能力</option><option>空间偏好</option></select><select class="select-compact"><option>全部状态</option><option>分析中</option><option>已完成</option></select></div><div class="toolbar-right"><div class="view-toggle"><button class="active">▦</button><button>☷</button></div></div></div>
    <div class="project-grid" id="projectGrid">${cards.map(projectCard).join('')}</div>
  </section>`;
}

function projectCard(p) {
  const flyCount = parseInt(p[4], 10) || 1;
  return `<article class="project-card" tabindex="0" data-project-name="${p[0]} ${p[9].join(' ')}" data-project-title="${p[0]}" data-project-type="${p[2]}" data-fly-count="${flyCount}"><div class="project-card-top"><div class="project-type" style="--pc-color:${p[7]};--pc-bg:${p[8]}">${p[3]}</div><button class="project-menu" aria-label="项目菜单">•••</button></div><h3>${p[0]}</h3><p>${p[1]}</p><div class="tag-row">${p[9].map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="project-card-footer"><div class="avatar-stack"><i style="--avatar-color:#0a9189">许</i><i style="--avatar-color:#2f72d6">周</i></div><span>${p[4]} · ${p[5]}</span><span>${p[6]}</span></div><span class="project-open-hint">配置并开始分析 →</span></article>`;
}

function projectSetupPage() {
  const projectName = sessionStorage.getItem('selectedProjectName') || '光照刺激行为实验';
  const projectType = sessionStorage.getItem('selectedProjectType') || '刺激响应';
  const flyCount = sessionStorage.getItem('selectedProjectFlyCount') || '24';
  return `<section class="page project-setup-page">
    ${pageHeader('PROJECT ANALYSIS SETUP','配置项目分析',`为“${projectName}”补充实验信息，然后启动 AI 视频分析。`,'<button class="secondary-button page-link" data-target="projects">← 返回项目</button>')}
    <div class="analysis-setup-grid">
      <article class="card analysis-source-card">
        <div class="card-header"><div class="card-title"><h2>项目信息</h2><p>AI 分析所使用的实验与采集信息</p></div><span class="status-chip success"><i class="status-dot"></i>数据已就绪</span></div>
        <div class="project-info-hero"><span>${svgIcon('flask')}</span><div><small>当前分析项目</small><strong>${projectName}</strong><p>项目视频仅在本机参与 AI 计算，不在此页面播放。</p></div></div>
        <div class="analysis-source-info vertical">
          <div><span>项目名称</span><strong>${projectName}</strong></div>
          <div><span>实验类型</span><strong>${projectType}</strong></div>
          <div><span>视频文件</span><strong>REC_20260810_143205.mp4</strong></div>
          <div><span>采集参数</span><strong>30 FPS · 1920 × 1080 · 12 min</strong></div>
        </div>
        <div class="smart-analysis-block" id="aiAnalysisPanel">
          <div class="smart-analysis-title"><div><span class="ai-pulse idle-pulse"></span><strong>智能分析进度</strong><small id="aiStatusText">等待点击“开始 AI 分析”</small></div><b id="aiProgressText">0%</b></div>
          <div class="ai-progress-track light"><span id="aiProgressBar"></span></div>
          <div class="ai-stage-list light"><span>① 视频解码</span><span>② 果蝇检测</span><span>③ 身份跟踪</span><span>④ 轨迹生成</span></div>
          <div class="smart-analysis-idle" id="smartAnalysisIdle">准备就绪，启动后将在此实时展示分析状态</div>
        </div>
      </article>
      <article class="card analysis-config-card">
        <div class="card-header"><div class="card-title"><h2>分析信息</h2><p>这些参数将写入分析记录和科研报告</p></div><span class="date-chip">必填项</span></div>
        <div class="card-body">
          <div class="analysis-form">
            <label class="analysis-field"><span>观察器皿 <i>*</i></span><input id="observationVessel" value="直径 90 mm 透明培养皿" placeholder="例如：直径 90 mm 培养皿" /><small>填写器皿类型、尺寸或有效观察区域</small></label>
            <label class="analysis-field"><span>果蝇数量 <i>*</i></span><div class="number-input"><button type="button" data-count-step="-1">−</button><input id="analysisFlyCount" type="number" min="1" max="999" value="${flyCount}" /><button type="button" data-count-step="1">＋</button><em>只</em></div><small>AI 将按照该数量校验检测与身份连续性</small></label>
          </div>
          <div class="analysis-mode-block"><span class="field-title">AI 分析内容</span><div class="analysis-mode-grid"><div class="analysis-mode selected"><i>${svgIcon('target')}</i><span><strong>个体检测与跟踪</strong><small>识别每只果蝇并保持身份连续</small></span><b>✓</b></div><div class="analysis-mode selected"><i>${svgIcon('activity')}</i><span><strong>轨迹与运动指标</strong><small>生成轨迹、速度、距离和活动状态</small></span><b>✓</b></div></div></div>
          <div class="analysis-ready"><span class="quality-check">✓</span><div><strong>可以开始分析</strong><small>视频完整，AI 模型与本地计算资源均已就绪</small></div></div>
          <button class="primary-button start-ai-button" id="startAiAnalysis"><span class="ai-spark">✦</span> 开始 AI 分析</button>
        </div>
      </article>
    </div>
  </section>`;
}

function videoImportPage() {
  const projectName = sessionStorage.getItem('newExperimentName') || '果蝇光照刺激行为实验';
  const experimentType = sessionStorage.getItem('newExperimentType') || '光照刺激行为分析';
  const researcher = sessionStorage.getItem('newResearcherName') || '许研究员';
  return `<section class="page import-page">
    ${pageHeader('NEW EXPERIMENT · STEP 2','导入实验视频',`实验“${projectName}”已创建，请从本地电脑选择需要分析的视频。`,'<button class="secondary-button page-link" data-target="projects">保存并退出</button>')}
    <div class="creation-progress">
      <div class="creation-step done"><i>✓</i><span><strong>基本信息</strong><small>实验信息已保存</small></span></div><b></b>
      <div class="creation-step active"><i>2</i><span><strong>导入视频</strong><small>选择本地实验视频</small></span></div><b></b>
      <div class="creation-step"><i>3</i><span><strong>分析配置</strong><small>校验轨迹与分析区域</small></span></div>
    </div>
    <div class="import-layout">
      <article class="card upload-card">
        <div class="card-header"><div class="card-title"><h2>选择本地视频</h2><p>支持单个或批量导入；视频仅在本地处理</p></div><span class="status-chip success"><i class="status-dot"></i>本地导入</span></div>
        <div class="card-body">
          <input id="videoFileInput" type="file" accept="video/*,.mp4,.avi,.mov,.mkv,.wmv" multiple hidden />
          <label class="video-dropzone" id="videoDropzone" for="videoFileInput">
            <span class="upload-orbit"><span class="upload-core">${svgIcon('upload')}</span></span>
            <strong>将实验视频拖放到这里</strong>
            <p>或点击下方按钮，从这台电脑中选择视频文件</p>
            <span class="primary-button choose-video">选择本地视频</span>
            <small>MP4、AVI、MOV、MKV、WMV · 建议单文件不超过 20 GB</small>
          </label>
          <div class="import-notice"><span>ⓘ</span><p><strong>数据隐私</strong>　原始视频不会上传至云端。导入后将在本机建立项目副本，并保留来源文件信息。</p></div>
        </div>
      </article>
      <aside class="import-sidebar">
        <article class="card project-summary-card"><div class="card-header"><div class="card-title"><h2>当前实验</h2><p>基本信息</p></div><button class="ghost-button open-experiment">修改</button></div><div class="card-body"><dl class="project-summary"><div><dt>实验名称</dt><dd>${projectName}</dd></div><div><dt>实验类型</dt><dd>${experimentType}</dd></div><div><dt>研究员</dt><dd>${researcher}</dd></div><div><dt>实验日期</dt><dd>2026年8月10日</dd></div></dl></div></article>
        <article class="card queue-card"><div class="card-header"><div class="card-title"><h2>待导入视频</h2><p id="queueSummary">尚未选择文件</p></div><button class="ghost-button" id="clearVideoQueue" hidden>清空</button></div><div class="card-body" id="videoQueue"><div class="queue-empty"><span>▤</span><strong>暂无视频</strong><p>选择文件后将在这里显示导入队列</p></div></div><div class="import-action"><div class="import-progress" id="importProgress" hidden><span id="importProgressBar"></span></div><button class="primary-button" id="importVideoButton" disabled>选择视频后导入</button></div></article>
      </aside>
    </div>
  </section>`;
}

function trackingPage() {
  const projectName = sessionStorage.getItem('selectedProjectName') || sessionStorage.getItem('newExperimentName') || '光照刺激行为实验';
  const flyCount = sessionStorage.getItem('analysisFlyCount') || sessionStorage.getItem('selectedProjectFlyCount') || '24';
  const vessel = sessionStorage.getItem('observationVessel') || '直径 90 mm 透明培养皿';
  const videoSource = selectedTrackingVideoUrl || 'assets/tracking-demo.mp4';
  return `<section class="page">
    ${pageHeader('TRACKING WORKBENCH','轨迹工作台',`正在展示“${projectName}”的 AI 跟踪视频、个体轨迹和实时运动指标。`,'<span class="status-chip success"><i class="status-dot"></i>AI 分析已启动</span><button class="primary-button" id="saveTrack">保存轨迹</button>')}
    <div class="tracking-shell">
      <div class="video-stage">
        <div class="video-toolbar"><div class="video-toolbar-left"><i class="live-dot ai-live"></i><strong>${projectName}</strong><span class="dark-chip">跟踪个体 ${flyCount} / ${flyCount}</span></div><div class="video-toolbar-right"><span>1920 × 1080</span><span>30 FPS</span><span class="dark-chip">AI 跟踪视频</span></div></div>
        <div class="fly-canvas video-canvas"><video id="trackingVideo" class="tracking-video" src="${videoSource}" autoplay muted loop playsinline></video><div class="tracking-video-overlay"><span class="ai-overlay-badge"><i></i>AI TRACKING · LIVE</span><svg class="live-track-overlay" viewBox="0 0 1000 560" preserveAspectRatio="none"><path d="M570 180C602 158 636 170 658 202S710 240 732 207 770 146 811 155"/></svg><span class="fly-label video-fly-label">Fly 01 · 8.4 mm/s</span><span class="canvas-scale">10 mm</span></div></div>
        <div class="video-controls"><button class="play-button" id="playButton">Ⅱ</button><div class="timeline"><div class="timeline-track"></div><div class="timeline-labels"><span>00:04:32</span><span>00:12:00</span></div></div><span class="dark-chip">1.0×</span><span>🔇</span></div>
      </div>
      <aside class="tracking-panel">
        <div class="dark-stat-grid"><div class="dark-stat"><span>轨迹置信度</span><strong>98.7%</strong></div><div class="dark-stat"><span>跟踪个体</span><strong>${flyCount} 只</strong></div><div class="dark-stat"><span>波动方差</span><strong>0.018 σ²</strong></div><div class="dark-stat"><span>身份置信度</span><strong>99.1%</strong></div></div>
        <div class="control-group current-analysis-info"><h4>当前实验</h4><div><span>项目</span><strong>${projectName}</strong></div><div><span>观察器皿</span><strong>${vessel}</strong></div><div><span>果蝇数量</span><strong>${flyCount} 只</strong></div></div>
        <div class="control-group"><h4>显示图层</h4><label class="check-row"><input type="checkbox" checked><span>运动轨迹</span><small>#07</small></label><label class="check-row"><input type="checkbox" checked><span>个体标签</span></label><label class="check-row"><input type="checkbox" checked><span>中心分析区</span></label><label class="check-row"><input type="checkbox"><span>速度热度</span></label></div>
        <div class="control-group"><h4>追踪参数</h4><div class="slider-row"><div class="slider-label"><span>检测置信度</span><strong>0.72</strong></div><div class="slider" style="--slider-value:72%"><span></span></div></div><div class="slider-row"><div class="slider-label"><span>轨迹平滑</span><strong>中等</strong></div><div class="slider" style="--slider-value:54%"><span></span></div></div><div class="slider-row"><div class="slider-label"><span>最大连接距离</span><strong>18 px</strong></div><div class="slider" style="--slider-value:38%"><span></span></div></div><div class="quality-row"><span class="quality-check">✓</span><span>未发现明显跳点或身份交换</span></div></div>
        <div class="control-group"><h4>轨迹事件</h4><label class="check-row"><span>04:12 短时遮挡</span><small>已修复</small></label><label class="check-row"><span>08:46 进入目标区</span><small>事件</small></label><button class="secondary-button" style="width:100%;margin-top:5px">＋ 添加时间事件</button></div>
      </aside>
    </div>
  </section>`;
}

function filterPanel() {
  return `<aside class="card filter-panel"><div class="filter-section"><h4>当前实验</h4><select class="filter-input"><option>光照刺激行为实验</option><option>帕金森模型运动评估</option></select></div><div class="filter-section"><h4>实验分组</h4><label class="check-row"><input type="checkbox" checked><span>对照组</span><small>n=12</small></label><label class="check-row"><input type="checkbox" checked><span>低强度光照</span><small>n=12</small></label><label class="check-row"><input type="checkbox" checked><span>高强度光照</span><small>n=12</small></label></div><div class="filter-section"><h4>分析时间窗</h4><select class="filter-input"><option>全程 00:00–12:00</option><option>刺激前 00:00–04:00</option><option>刺激后 04:00–12:00</option></select></div><div class="filter-section"><h4>数据处理</h4><label class="check-row"><input type="checkbox" checked><span>排除无效轨迹</span></label><label class="check-row"><input type="checkbox" checked><span>按个体汇总</span></label><label class="check-row"><input type="checkbox"><span>归一化到体长</span></label></div><div class="filter-footer"><button class="secondary-button">重置</button><button class="primary-button apply-analysis">应用</button></div></aside>`;
}

function locomotionPage() {
  return `<section class="page">
    ${pageHeader('LOCOMOTION ANALYSIS','运动能力分析','从个体到群体量化运动距离、速度差值、转向、兴奋度以及休息—运动节奏变化。','<button class="secondary-button">保存分析方案</button><button class="primary-button">导出运动数据</button>')}
    <div class="analysis-layout">${filterPanel()}<div class="analysis-main">
      <div class="mini-metrics"><div class="mini-metric"><span>个体运动总距离</span><strong>2.86 <small>m</small></strong></div><div class="mini-metric"><span>个体平均速度</span><strong>7.42 <small>mm/s</small></strong></div><div class="mini-metric"><span>个体转向次数</span><strong>42 <small>次</small></strong></div><div class="mini-metric"><span>休息不动时间占比</span><strong>21.4 <small>%</small></strong></div></div>
      <article class="card"><div class="card-header"><div class="card-title"><h2>个体运动指标明细</h2><p>输出每只果蝇的运动总距离、平均速度、转向次数、速度差值和兴奋度</p></div><select class="select-compact"><option>按兴奋度排序</option><option>按个体编号排序</option></select></div><div class="card-body flush">${individualMotionTable()}</div></article>
      <article class="card"><div class="card-header"><div class="card-title"><h2>个体与群体运动差异</h2><p>距离、速度差值与兴奋度的标准化对比</p></div><div class="legend"><span><i style="--legend-color:#13a89e"></i>实验组</span><span><i style="--legend-color:#2f72d6"></i>对照组</span><span><i style="--legend-color:#e8a02e"></i>群体均值</span></div></div><div class="card-body">${motionDifferenceChart()}</div></article>
      <div class="content-grid equal"><article class="card"><div class="card-header"><div class="card-title"><h2>个体运动节律</h2><p>逐只展示休息、低速和活跃运动片段及节奏变化</p></div><span class="date-chip">休息占比 21.4%</span></div><div class="card-body">${movementRhythmRaster()}</div></article><article class="card"><div class="card-header"><div class="card-title"><h2>群体运动节律</h2><p>群体休息不动比例与运动节奏随时间变化</p></div><span class="date-chip">群体休息占比 24.8%</span></div><div class="card-body">${groupRhythmChart()}</div></article></div>
    </div></div>
  </section>`;
}

function individualMotionTable() {
  const rows = [['Fly 01','2.86 m','7.42 mm/s','42','+0.84','高','21.4%'],['Fly 02','2.41 m','6.88 mm/s','36','+0.30','中高','24.7%'],['Fly 03','1.92 m','5.61 mm/s','29','−0.97','中','31.8%'],['Fly 04','3.12 m','8.06 mm/s','48','+1.48','高','17.9%'],['Fly 05','1.58 m','4.92 mm/s','24','−1.66','低','38.6%']];
  return `<table class="stats-table motion-table"><thead><tr><th>个体</th><th>运动总距离</th><th>平均速度</th><th>转向次数</th><th>速度差值</th><th>兴奋度</th><th>休息占比</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><strong><i class="fly-color" style="--fly:${['#13a89e','#2f72d6','#e8a02e','#8066c8','#e76b62'][i]}"></i>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td class="${r[4].startsWith('+')?'effect-positive':'effect-negative'}">${r[4]} mm/s</td><td><span class="activity-level level-${r[5]==='低'?'low':'high'}">${r[5]}</span></td><td>${r[6]}</td></tr>`).join('')}</tbody></table>`;
}

function motionDifferenceChart() {
  return `<svg class="chart-svg" viewBox="0 0 720 220" aria-label="距离速度差值和兴奋度对比">${[35,75,115,155,195].map(y=>`<line class="chart-grid" x1="48" y1="${y}" x2="700" y2="${y}"/>`).join('')}<line class="chart-axis" x1="48" y1="195" x2="700" y2="195"/>${[['运动距离',78,105,91],['速度差值',61,96,82],['兴奋度',88,68,79]].map((g,i)=>{const x=125+i*210;return `<rect x="${x}" y="${195-g[1]*1.45}" width="34" height="${g[1]*1.45}" rx="3" fill="#13a89e"/><rect x="${x+40}" y="${195-g[2]*1.45}" width="34" height="${g[2]*1.45}" rx="3" fill="#2f72d6"/><rect x="${x+80}" y="${195-g[3]*1.45}" width="34" height="${g[3]*1.45}" rx="3" fill="#e8a02e"/><text x="${x+57}" y="212" text-anchor="middle">${g[0]}</text>`}).join('')}<text x="42" y="38" text-anchor="end">高</text><text x="42" y="198" text-anchor="end">低</text></svg>`;
}

function movementRhythmRaster() {
  const tracks = ['linear-gradient(90deg,#13a89e 0 18%,#dbe3e5 18% 28%,#7db2e8 28% 44%,#13a89e 44% 68%,#dbe3e5 68% 79%,#13a89e 79%)','linear-gradient(90deg,#dbe3e5 0 12%,#13a89e 12% 35%,#7db2e8 35% 52%,#dbe3e5 52% 61%,#13a89e 61% 86%,#dbe3e5 86%)','linear-gradient(90deg,#13a89e 0 28%,#dbe3e5 28% 43%,#7db2e8 43% 57%,#13a89e 57% 74%,#dbe3e5 74% 89%,#13a89e 89%)'];
  return `<div class="movement-rhythm">${Array.from({length:6},(_,i)=>`<div><span>Fly ${String(i+1).padStart(2,'0')}</span><i style="--rhythm:${tracks[i%3]}"></i></div>`).join('')}</div><div class="rhythm-axis"><span>0 min</span><span>3 min</span><span>6 min</span><span>9 min</span><span>12 min</span></div><div class="legend rhythm-legend"><span><i style="--legend-color:#13a89e"></i>活跃运动</span><span><i style="--legend-color:#7db2e8"></i>低速运动</span><span><i style="--legend-color:#dbe3e5"></i>休息不动</span></div>`;
}

function groupRhythmChart() {
  return `<svg class="chart-svg" viewBox="0 0 520 215">${[40,80,120,160,195].map(y=>`<line class="chart-grid" x1="40" y1="${y}" x2="500" y2="${y}"/>`).join('')}<path d="M40 150C75 126 90 57 125 83s51 86 86 57 52-91 88-61 54 94 88 55 56-75 113-33" fill="none" stroke="#13a89e" stroke-width="2.2"/><path d="M40 75C79 95 92 154 128 137s50-72 85-44 51 79 87 50 52-75 89-47 55 67 111 43" fill="none" stroke="#9aa9ae" stroke-width="1.8" stroke-dasharray="4 3"/><text x="40" y="208">0 min</text><text x="500" y="208" text-anchor="end">12 min</text></svg><div class="legend" style="justify-content:center"><span><i style="--legend-color:#13a89e"></i>群体运动强度</span><span><i style="--legend-color:#9aa9ae"></i>休息不动比例</span></div>`;
}

function stackedBehaviorChart() {
  const rows = [['对照组',52,31,17],['低强度',43,36,21],['高强度',28,41,31],['恢复组',47,35,18]];
  return `<div style="padding:12px 4px 5px">${rows.map(r=>`<div style="display:grid;grid-template-columns:55px 1fr;align-items:center;gap:9px;margin:19px 0"><span style="font-size:9px;color:#6a7c84">${r[0]}</span><div style="height:22px;display:flex;border-radius:5px;overflow:hidden;background:#eee"><i style="width:${r[1]}%;background:#13a89e"></i><i style="width:${r[2]}%;background:#7db2e8"></i><i style="width:${r[3]}%;background:#d8e1e4"></i></div></div>`).join('')}<div class="legend" style="justify-content:center;margin-top:25px"><span><i style="--legend-color:#13a89e"></i>快速运动</span><span><i style="--legend-color:#7db2e8"></i>低速运动</span><span><i style="--legend-color:#d8e1e4"></i>静止</span></div></div>`;
}

function spatialPage() {
  return `<section class="page">
    ${pageHeader('SPATIAL DENSITY','空间偏好分析','基于轨迹密度热图定位果蝇主要活动位置，并自动高亮高活跃区域。','<button class="secondary-button">编辑空间分区</button><button class="primary-button">导出密度热图</button>')}
    <div class="analysis-layout">${filterPanel()}<div class="analysis-main">
      <article class="card"><div class="card-header"><div class="card-title"><h2>轨迹密度热图</h2><p>颜色越暖表示单位面积内轨迹出现频率越高；A、B 为自动识别的高活跃区</p></div><div class="legend"><span><i style="--legend-color:#e94f42"></i>高活跃</span><span><i style="--legend-color:#f2ca3c"></i>中活跃</span><span><i style="--legend-color:#238cad"></i>低活跃</span></div></div><div class="heatmap-layout"><div class="heatmap-arena"><div class="heatmap-disc scientific-heat"><span class="hotspot hotspot-a">A</span><span class="hotspot hotspot-b">B</span></div><div class="heat-scale"><span>低密度</span><i></i><span>高密度</span></div></div><div class="card-body"><div class="card-title" style="margin-bottom:12px"><h2>高活跃区域总结</h2><p>当前实验 · 24只 · 全时段</p></div>${zoneStat('A区 · 培养皿左上','31.8%',92,'#e76b62')}${zoneStat('B区 · 中心偏右','24.6%',71,'#e8a02e')}${zoneStat('边缘环带','18.9%',55,'#2f72d6')}<div class="hotspot-summary"><span>高亮结论</span><strong>果蝇主要在培养皿左上方和中心偏右位置活动</strong><p>A、B 两个区域合计贡献 56.4% 的轨迹密度。</p></div></div></div></article>
      <div class="content-grid equal"><article class="card"><div class="card-header"><div class="card-title"><h2>主要活动位置排行</h2><p>按轨迹密度和停留时长综合排序</p></div><span class="date-chip">自动高亮 Top 3</span></div><div class="card-body">${spatialRegionRanking()}</div></article><article class="card"><div class="card-header"><div class="card-title"><h2>空间位置活动占比</h2><p>中心、边缘及高活跃区域的活动构成</p></div></div><div class="card-body">${locationDistributionChart()}</div></article></div>
    </div></div>
  </section>`;
}

function spatialRegionRanking() {
  const regions = [['A','左上象限','31.8%','高活跃','#e76b62'],['B','中心偏右','24.6%','高活跃','#e8a02e'],['C','下方边缘','18.9%','中活跃','#2f72d6'],['D','中心区域','14.2%','一般','#8066c8'],['E','右上边缘','10.5%','低活跃','#91a1a7']];
  return `<div class="region-ranking">${regions.map((r,i)=>`<div><b>${i+1}</b><i style="--region:${r[4]}">${r[0]}</i><span><strong>${r[1]}</strong><small>${r[3]}</small></span><em>${r[2]}</em></div>`).join('')}</div>`;
}

function locationDistributionChart() {
  return `<div class="location-distribution"><div class="donut-location"><div><strong>56.4%</strong><span>高活跃区</span></div></div><div class="location-legend"><div><i style="--location:#e76b62"></i><span>高活跃 A+B</span><strong>56.4%</strong></div><div><i style="--location:#2f72d6"></i><span>边缘环带</span><strong>18.9%</strong></div><div><i style="--location:#8066c8"></i><span>中心区域</span><strong>14.2%</strong></div><div><i style="--location:#b7c3c7"></i><span>其他位置</span><strong>10.5%</strong></div></div></div>`;
}

function zoneStat(name,value,width,color) { return `<div class="zone-stat"><div class="zone-stat-top"><span>${name}</span><strong>${value}</strong></div><div class="zone-bar" style="--zone-color:${color}"><span style="width:${width}%"></span></div></div>`; }

function preferenceChart() {
  return `<svg class="chart-svg" viewBox="0 0 520 215">${[40,80,120,160,195].map(y=>`<line class="chart-grid" x1="40" y1="${y}" x2="500" y2="${y}"/>`).join('')}<line x1="40" y1="120" x2="500" y2="120" stroke="#9ba9ae" stroke-dasharray="4 4"/><line x1="100" y1="83" x2="100" y2="141" stroke="#0a9189" stroke-width="2"/><circle cx="100" cy="108" r="6" fill="#0a9189"/><line x1="240" y1="61" x2="240" y2="112" stroke="#2f72d6" stroke-width="2"/><circle cx="240" cy="86" r="6" fill="#2f72d6"/><line x1="380" y1="118" x2="380" y2="176" stroke="#e8a02e" stroke-width="2"/><circle cx="380" cy="147" r="6" fill="#e8a02e"/>${[[87,111],[95,103],[106,116],[113,98],[228,90],[236,77],[249,92],[253,83],[368,151],[376,139],[389,156],[394,143]].map((p)=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#fff" stroke="#74878e"/>`).join('')}<text x="100" y="205" text-anchor="middle">对照组</text><text x="240" y="205" text-anchor="middle">低强度</text><text x="380" y="205" text-anchor="middle">高强度</text><text x="34" y="123" text-anchor="end">0</text></svg>`;
}

function wallChart() {
  return `<svg class="chart-svg" viewBox="0 0 520 215">${[40,80,120,160,195].map(y=>`<line class="chart-grid" x1="40" y1="${y}" x2="500" y2="${y}"/>`).join('')}<path d="M40 183C90 111 127 64 170 72s50 72 94 80 72-38 115-51 74 18 121 48" fill="none" stroke="#13a89e" stroke-width="2.2"/><path d="M40 190C87 156 126 108 170 101s63 31 105 20 58-63 102-57 71 55 123 73" fill="none" stroke="#2f72d6" stroke-width="1.8"/><text x="40" y="208">0</text><text x="500" y="208" text-anchor="end">距边界 25 mm</text><div></div></svg><div class="legend" style="justify-content:center"><span><i style="--legend-color:#13a89e"></i>对照组</span><span><i style="--legend-color:#2f72d6"></i>实验组</span></div>`;
}

function socialPage() {
  return `<section class="page">
    ${pageHeader('SOCIAL BEHAVIOR','社交行为分析','量化个体距离、接近与离开、接触、跟随追逐、聚集程度以及群体空间结构。','<button class="secondary-button">社交事件设置</button><button class="primary-button">导出社交数据</button>')}
    <div class="analysis-layout">${filterPanel()}<div class="analysis-main">
      <div class="mini-metrics"><div class="mini-metric"><span>平均个体间距离</span><strong>18.6 <small>mm</small></strong></div><div class="mini-metric"><span>接近 / 离开</span><strong>128 / 104 <small>次</small></strong></div><div class="mini-metric"><span>有效接触</span><strong>46 <small>次</small></strong></div><div class="mini-metric"><span>聚集指数</span><strong>0.72 <small>/ 1.00</small></strong></div></div>
      <article class="card"><div class="card-header"><div class="card-title"><h2>个体间距离与互动事件</h2><p>群体平均距离曲线，并标记接近、离开和接触次数</p></div><div class="legend"><span><i style="--legend-color:#13a89e"></i>平均个体间距离</span><span><i style="--legend-color:#e76b62"></i>接触事件</span></div></div><div class="card-body">${socialDistanceChart()}</div></article>
      <div class="content-grid equal"><article class="card"><div class="card-header"><div class="card-title"><h2>跟随与追逐行为</h2><p>各类社交事件的持续时间与发生次数</p></div></div><div class="card-body">${socialBehaviorComposition()}</div></article><article class="card"><div class="card-header"><div class="card-title"><h2>群体中心与扩散范围</h2><p>节点为个体，连线代表频繁互动；虚线为群体扩散边界</p></div><span class="date-chip">扩散半径 28.4 mm</span></div><div class="card-body">${socialNetworkChart()}</div></article></div>
      <article class="card"><div class="card-header"><div class="card-title"><h2>个体社交活跃程度</h2><p>综合接近、接触、跟随、追逐和网络中心性进行排序</p></div><select class="select-compact"><option>活跃程度降序</option><option>个体编号</option></select></div><div class="card-body flush">${individualSocialTable()}</div></article>
    </div></div>
  </section>`;
}

function socialDistanceChart() {
  return `<svg class="chart-svg" viewBox="0 0 720 220">${[35,75,115,155,195].map(y=>`<line class="chart-grid" x1="45" y1="${y}" x2="700" y2="${y}"/>`).join('')}<path d="M45 72C82 58 95 121 132 110s54-67 93-40 55 99 94 58 56-82 96-54 59 80 98 54 57-70 92-38 57 61 95 44" fill="none" stroke="#13a89e" stroke-width="2.2"/>${[[132,110],[319,128],[513,128],[605,90]].map(p=>`<g><line x1="${p[0]}" y1="${p[1]}" x2="${p[0]}" y2="195" stroke="#e76b62" stroke-dasharray="3 3"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#e76b62"/></g>`).join('')}<text x="45" y="211">0 min</text><text x="700" y="211" text-anchor="end">12 min</text><text x="39" y="38" text-anchor="end">30 mm</text><text x="39" y="198" text-anchor="end">0</text></svg><div class="social-event-summary"><div><span>接近</span><strong>128次</strong></div><div><span>离开</span><strong>104次</strong></div><div><span>接触</span><strong>46次</strong></div><div><span>平均接触</span><strong>3.8s</strong></div></div>`;
}

function socialBehaviorComposition() {
  const rows = [['接近',82,128,'#13a89e'],['离开',66,104,'#2f72d6'],['接触',38,46,'#e76b62'],['跟随',58,72,'#e8a02e'],['追逐',31,28,'#8066c8']];
  return `<div class="social-bars">${rows.map(r=>`<div><span>${r[0]}</span><i><b style="width:${r[1]}%;background:${r[3]}"></b></i><strong>${r[2]}次</strong></div>`).join('')}</div><div class="social-insight"><span>行为结论</span><p>跟随行为主要发生在群体中心附近；追逐行为持续时间短但速度增幅明显。</p></div>`;
}

function socialNetworkChart() {
  return `<svg class="social-network" viewBox="0 0 420 245"><ellipse cx="210" cy="122" rx="154" ry="88" fill="#f1f8f7" stroke="#78bcb6" stroke-dasharray="5 4"/><circle cx="210" cy="122" r="12" fill="#0a9189" opacity=".18"/><path d="M96 91 176 78 210 122 278 82 331 129M96 91l37 78 77-47 58 57 63-50M176 78l92 101M133 169l145-87" stroke="#9ec5c3" stroke-width="2" opacity=".8"/>${[[96,91,8],[176,78,11],[210,122,13],[278,82,9],[331,129,8],[133,169,10],[268,179,8]].map((p,i)=>`<g><circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${i===2?'#0a9189':'#2f72d6'}"/><text x="${p[0]}" y="${p[1]+3}" text-anchor="middle" fill="#fff" font-size="7">${i+1}</text></g>`).join('')}<text x="210" y="228" text-anchor="middle">群体中心偏移 4.2 mm · 扩散范围 6,340 mm²</text></svg>`;
}

function individualSocialTable() {
  const rows = [['Fly 03','14.2 mm','22','12','8 / 3','0.86','高'],['Fly 01','16.8 mm','19','10','6 / 2','0.78','高'],['Fly 07','18.1 mm','16','8','5 / 1','0.65','中高'],['Fly 05','21.4 mm','11','6','3 / 1','0.48','中'],['Fly 09','27.6 mm','6','2','1 / 0','0.24','低']];
  return `<table class="stats-table"><thead><tr><th>个体</th><th>平均社交距离</th><th>主动接近</th><th>有效接触</th><th>跟随 / 追逐</th><th>社交活跃指数</th><th>活跃程度</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}次</td><td>${r[3]}次</td><td>${r[4]}</td><td>${r[5]}</td><td><span class="activity-level level-${r[6]==='低'?'low':'high'}">${r[6]}</span></td></tr>`).join('')}</tbody></table>`;
}

function rhythmChart() {
  return `<svg class="chart-svg" viewBox="0 0 520 210"><rect x="40" y="24" width="230" height="171" fill="#fff6cf" opacity=".55"/><rect x="270" y="24" width="230" height="171" fill="#263e56" opacity=".08"/>${[35,75,115,155,195].map(y=>`<line class="chart-grid" x1="40" y1="${y}" x2="500" y2="${y}"/>`).join('')}<path d="M40 165C75 168 88 138 110 86s42-17 60 34 48 35 77 21 32-47 58-55 40 10 57 47 44 36 64 11 34-65 74-80" class="chart-line-teal"/><path d="M40 177C70 174 93 148 115 112s35-17 57 27 43 39 72 24 37-51 64-61 39 22 59 50 46 22 61-8 34-51 72-63" class="chart-line-blue"/><line x1="270" y1="24" x2="270" y2="195" stroke="#566b79" stroke-dasharray="4 3"/><text x="150" y="18" text-anchor="middle">光照期</text><text x="385" y="18" text-anchor="middle">黑暗期</text>${[40,155,270,385,500].map((x,i)=>`<text x="${x}" y="207" text-anchor="middle">${i*6}:00</text>`).join('')}</svg>`;
}

function sleepRaster() {
  const gradients = [
    'linear-gradient(90deg,#263e56 0 12%,#eff3f4 12% 20%,#263e56 20% 45%,#eff3f4 45% 61%,#263e56 61% 86%,#eff3f4 86%)',
    'linear-gradient(90deg,#263e56 0 7%,#eff3f4 7% 18%,#263e56 18% 40%,#eff3f4 40% 55%,#263e56 55% 91%,#eff3f4 91%)',
    'linear-gradient(90deg,#eff3f4 0 14%,#263e56 14% 34%,#eff3f4 34% 48%,#263e56 48% 72%,#eff3f4 72% 81%,#263e56 81%)'
  ];
  return `<div class="raster"><div class="raster-labels">${Array.from({length:10},(_,i)=>`<span>Fly ${String(i+1).padStart(2,'0')}</span>`).join('')}</div><div class="raster-lines">${Array.from({length:10},(_,i)=>`<div class="raster-line" style="--raster:${gradients[i%3]}"></div>`).join('')}</div></div><div class="day-night-strip"><span>0–6 h</span><span>6–12 h</span><span>12–18 h</span><span>18–24 h</span></div>`;
}

function sleepBars() {
  return `<svg class="chart-svg" viewBox="0 0 520 215">${[40,80,120,160,195].map(y=>`<line class="chart-grid" x1="45" y1="${y}" x2="500" y2="${y}"/>`).join('')}<rect x="90" y="126" width="42" height="69" rx="3" fill="#f0c95c"/><rect x="136" y="72" width="42" height="123" rx="3" fill="#4c6680"/><rect x="260" y="142" width="42" height="53" rx="3" fill="#f0c95c"/><rect x="306" y="96" width="42" height="99" rx="3" fill="#4c6680"/><rect x="410" y="151" width="42" height="44" rx="3" fill="#f0c95c"/><rect x="456" y="116" width="42" height="79" rx="3" fill="#4c6680"/><text x="134" y="208" text-anchor="middle">对照组</text><text x="304" y="208" text-anchor="middle">低剂量</text><text x="454" y="208" text-anchor="middle">高剂量</text></svg><div class="legend" style="justify-content:center"><span><i style="--legend-color:#f0c95c"></i>白天</span><span><i style="--legend-color:#4c6680"></i>夜间</span></div>`;
}

function statisticsPage() {
  return `<section class="page">
    ${pageHeader('CROSS-EXPERIMENT STATISTICS','组间统计','选择多个实验和多个行为指标，比较不同实验之间的指标差异、效应方向与显著性。','<button class="secondary-button">保存比较方案</button><button class="primary-button">生成跨实验比较</button>')}
    <div class="content-grid wide-right"><article class="card comparison-selector"><div class="card-header"><div class="card-title"><h2>比较范围</h2><p>已选择 4 个实验 · 6 项指标</p></div></div><div class="card-body"><div class="filter-section"><h4>选择实验</h4><label class="check-row"><input type="checkbox" checked><span>光照刺激行为实验</span><small>n=24</small></label><label class="check-row"><input type="checkbox" checked><span>帕金森模型运动评估</span><small>n=36</small></label><label class="check-row"><input type="checkbox" checked><span>气味双选偏好实验</span><small>n=32</small></label><label class="check-row"><input type="checkbox" checked><span>群体聚集行为探索</span><small>n=40</small></label></div><div class="filter-section"><h4>选择指标</h4><div class="metric-check-grid"><label><input type="checkbox" checked>运动总距离</label><label><input type="checkbox" checked>平均速度</label><label><input type="checkbox" checked>转向次数</label><label><input type="checkbox" checked>休息占比</label><label><input type="checkbox" checked>聚集指数</label><label><input type="checkbox" checked>社交活跃度</label></div></div><button class="primary-button apply-analysis" style="width:100%">更新对比</button></div></article><article class="card"><div class="card-header"><div class="card-title"><h2>实验 × 指标标准化对比</h2><p>每个指标按 Z-score 标准化；暖色高于总体均值，冷色低于总体均值</p></div><div class="legend"><span><i style="--legend-color:#2f72d6"></i>低</span><span><i style="--legend-color:#f2f4f4"></i>均值</span><span><i style="--legend-color:#e76b62"></i>高</span></div></div><div class="card-body">${experimentMetricHeatmap()}</div></article></div>
    <article class="card"><div class="card-header"><div class="card-title"><h2>不同实验的多指标比较结果</h2><p>同时展示各实验均值、最大实验间差异及校正后的统计显著性</p></div><button class="ghost-button">导出对比数据 CSV</button></div><div class="card-body flush">${crossExperimentTable()}</div></article>
  </section>`;
}

function experimentMetricHeatmap() {
  const experiments = ['光照刺激','帕金森模型','气味偏好','群体聚集'];
  const metrics = [['运动总距离',[.72,-.88,.18,.44]],['平均速度',[.65,-.92,.21,.36]],['转向次数',[.31,-.46,.58,.12]],['休息占比',[-.42,.91,-.14,.22]],['聚集指数',[-.18,-.35,.27,.94]],['社交活跃度',[.08,-.53,.34,.87]]];
  const color = v => v>0 ? `rgba(231,107,98,${.18+Math.abs(v)*.68})` : `rgba(47,114,214,${.18+Math.abs(v)*.68})`;
  return `<div class="metric-heatmap"><div></div>${experiments.map(e=>`<strong>${e}</strong>`).join('')}${metrics.map(m=>`<span>${m[0]}</span>${m[1].map(v=>`<i style="background:${color(v)}">${v>0?'+':''}${v.toFixed(2)}</i>`).join('')}`).join('')}</div>`;
}

function crossExperimentTable() {
  const rows = [['运动总距离','2.86 m','1.74 m','2.42 m','3.08 m','76.9%','0.001','帕金森模型显著降低'],['平均速度','7.42','4.81','6.78','7.95','65.3%','0.003','帕金森模型显著降低'],['转向次数','42','31','48','39','54.8%','0.018','气味实验转向更多'],['休息占比','21.4%','38.7%','25.1%','19.8%','95.5%','0.002','模型组休息占比升高'],['聚集指数','0.43','0.36','0.51','0.82','127.8%','<0.001','群体实验聚集最强'],['社交活跃度','0.58','0.41','0.62','0.86','109.8%','0.004','群体实验社交最活跃']];
  return `<table class="stats-table cross-table"><thead><tr><th>行为指标</th><th>光照刺激</th><th>帕金森模型</th><th>气味偏好</th><th>群体聚集</th><th>最大实验间差异</th><th>校正 p 值</th><th>主要结论</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td class="effect-positive">${r[5]}</td><td><span class="p-value" style="--p-color:#147e5c;--p-bg:#e5f5ee">${r[6]}</span></td><td>${r[7]}</td></tr>`).join('')}</tbody></table>`;
}

function reportsPage() {
  return `<section class="page">
    ${pageHeader('REPORT BUILDER','报告中心','将实验方法、质量控制、科研图表和统计结果自动整理为标准报告。','<button class="secondary-button">保存模板</button><button class="primary-button" id="exportReport">导出 PDF 报告</button>')}
    <div class="content-grid wide-right"><article class="card"><div class="card-header"><div class="card-title"><h2>报告结构</h2><p>拖动调整章节顺序</p></div></div><div class="card-body"><div class="folder-tree"><div class="tree-row active"><span>☷</span><span>1. 实验摘要</span><small>已完成</small></div><div class="tree-row"><span>☷</span><span>2. 样本与方法</span><small>已完成</small></div><div class="tree-row"><span>☷</span><span>3. 数据质量</span><small>96.8%</small></div><div class="tree-row"><span>☷</span><span>4. 运动能力</span><small>4图</small></div><div class="tree-row"><span>☷</span><span>5. 空间偏好</span><small>3图</small></div><div class="tree-row"><span>☷</span><span>6. 组间统计</span><small>已完成</small></div><div class="tree-row"><span>☷</span><span>7. 参数与审计</span><small>附录</small></div></div><button class="secondary-button" style="width:100%;margin-top:10px">＋ 添加章节</button><div class="filter-section" style="margin-top:14px"><h4>输出设置</h4><label class="check-row"><input type="checkbox" checked><span>显示个体原始点</span></label><label class="check-row"><input type="checkbox" checked><span>包含统计方法</span></label><label class="check-row"><input type="checkbox" checked><span>包含分析参数</span></label></div></div></article><article class="card"><div class="card-header"><div class="card-title"><h2>页面预览</h2><p>A4 · 论文图版样式 · 第 3 / 8 页</p></div><div class="segmented"><button>−</button><button class="active">85%</button><button>＋</button></div></div><div class="report-preview"><div class="report-page"><div class="report-brand"><strong>BioSearch Vision</strong><span>QUANTITATIVE BEHAVIOR REPORT</span></div><h2>光照刺激对果蝇运动与空间偏好的影响</h2><div class="report-meta">项目编号 BSV-2026-0810 · 分析日期 2026-08-10 · 有效个体 n=36</div><div class="report-abstract">本实验评估三种光照强度下果蝇的运动能力和区域偏好。轨迹有效率为 96.8%，数据以单只果蝇为统计单位，并对多重比较进行校正。</div><div class="report-figure-grid"><div class="report-figure"><label>A</label>${miniTrackFigure()}</div><div class="report-figure"><label>B</label>${miniHeatFigure()}</div><div class="report-figure"><label>C</label>${miniLineFigure()}</div><div class="report-figure"><label>D</label>${miniDotsFigure()}</div></div><p class="report-caption"><strong>图 2｜光照刺激后的运动与空间行为变化。</strong> A，代表性运动轨迹；B，组内空间停留密度；C，刺激前后平均速度；D，各组总运动距离。点表示单只果蝇，误差线表示 95% 置信区间。</p></div></div></article></div>
  </section>`;
}

function miniTrackFigure(){ return '<svg viewBox="0 0 160 100"><ellipse cx="80" cy="50" rx="65" ry="39" fill="#eef2ef" stroke="#87989a"/><path d="M26 62C42 31 51 70 71 45s31-21 41 8 22-5 30 10" fill="none" stroke="#13a89e" stroke-width="2"/></svg>'; }
function miniHeatFigure(){ return '<svg viewBox="0 0 160 100"><defs><radialGradient id="mh"><stop stop-color="#ee5547"/><stop offset=".35" stop-color="#f0ca3c"/><stop offset=".7" stop-color="#2a9bb8"/><stop offset="1" stop-color="#18465b"/></radialGradient></defs><ellipse cx="80" cy="50" rx="65" ry="39" fill="url(#mh)" stroke="#87989a"/></svg>'; }
function miniLineFigure(){ return '<svg viewBox="0 0 160 100"><path d="M15 80H150M15 15V80" stroke="#ccd7d9"/><path d="M15 70 38 63 60 69 82 42 105 49 128 29 150 35" fill="none" stroke="#13a89e" stroke-width="2"/><path d="M15 74 38 72 60 68 82 62 105 57 128 54 150 48" fill="none" stroke="#2f72d6" stroke-width="1.6"/></svg>'; }
function miniDotsFigure(){ return '<svg viewBox="0 0 160 100"><path d="M15 80H150" stroke="#ccd7d9"/>' + [[38,51],[38,60],[38,68],[80,43],[80,52],[80,57],[122,63],[122,69],[122,74]].map(p=>`<circle cx="${p[0]+(Math.random()-.5)*8}" cy="${p[1]}" r="3" fill="#fff" stroke="#0a9189"/>`).join('') + '<path d="M26 59H50M68 50H92M110 68H134" stroke="#172a34" stroke-width="2"/></svg>'; }

function dataPage() {
  return `<section class="page">
    ${pageHeader('RAW DATA EXPORT','数据管理','选择指定实验并一次性导出原始视频、轨迹坐标、事件记录、实验元数据和分析参数。','<button class="secondary-button">校验数据完整性</button>')}
    <div class="metric-grid">${metricCard('实验项目','12','项','flask','全部数据可追溯','#0a9189','#dff5f2')}${metricCard('原始视频','286','个','upload','共 68.7 GB','#2f72d6','#e9f1fd')}${metricCard('原始轨迹文件','1,482','个','activity','CSV / JSON','#8066c8','#f0ecfb')}${metricCard('数据完整率','99.8','%','check','最近校验：今天 17:30','#2c9b74','#e5f5ee')}</div>
    <article class="card raw-export-card"><div class="card-header"><div class="card-title"><h2>导出指定实验的全部原始数据</h2><p>选择一个实验，并确认需要写入导出包的数据类型</p></div><span class="status-chip success"><i class="status-dot"></i>本地导出</span></div><div class="raw-export-layout"><div class="export-project-select"><label><span>选择实验项目</span><select id="exportExperimentSelect"><option value="light">光照刺激行为实验</option><option value="parkinson">帕金森模型运动评估</option><option value="odor">气味双选偏好实验</option><option value="social">群体聚集行为探索</option></select></label><div class="export-project-meta" id="exportProjectMeta"><div><span>项目编号</span><strong>BSV-2026-0810</strong></div><div><span>实验日期</span><strong>2026-08-10</strong></div><div><span>原始数据量</span><strong>2.46 GB</strong></div><div><span>文件数量</span><strong>41 个</strong></div></div></div><div class="export-type-list"><span>导出内容</span><label><input type="checkbox" checked><i>VIDEO</i><b>原始实验视频</b><small>12 个文件 · 2.40 GB</small></label><label><input type="checkbox" checked><i>CSV</i><b>逐帧轨迹坐标</b><small>24 个文件 · 18.6 MB</small></label><label><input type="checkbox" checked><i>JSON</i><b>事件与实验元数据</b><small>3 个文件 · 186 KB</small></label><label><input type="checkbox" checked><i>YAML</i><b>分析参数与模型配置</b><small>2 个文件 · 24 KB</small></label></div><div class="export-summary"><span class="export-package-icon">ZIP</span><div><small>将生成</small><strong id="exportPackageName">光照刺激行为实验_全部原始数据.zip</strong><p>包含 41 个文件 · 约 2.46 GB</p></div><button class="primary-button" id="exportRawDataButton">导出全部原始数据</button></div></div></article>
    <article class="card"><div class="card-header"><div class="card-title"><h2>当前实验原始文件</h2><p id="currentDataProject">光照刺激行为实验 · 所有原始数据</p></div><label class="search-box" style="height:30px;min-width:190px"><span class="search-icon"></span><input placeholder="搜索原始文件" /></label></div><div class="card-body flush"><table class="file-table"><thead><tr><th>名称</th><th>数据类型</th><th>大小</th><th>采集时间</th><th>完整性</th></tr></thead><tbody>${fileRow('REC_20260810_143205.mp4','VIDEO','原始视频','2.4 GB','今天 14:32','已校验','#2f72d6','#e9f1fd')}${fileRow('tracking_raw_fly_01-24.csv','CSV','逐帧轨迹','18.6 MB','今天 15:08','完整','#0a9189','#dff5f2')}${fileRow('experiment_events.json','JSON','事件记录','142 KB','今天 15:08','完整','#e8a02e','#fff2d9')}${fileRow('experiment_metadata.json','JSON','实验元数据','44 KB','今天 14:31','完整','#8066c8','#f0ecfb')}${fileRow('analysis_config.yaml','YAML','分析参数','24 KB','今天 15:09','完整','#2c9b74','#e5f5ee')}</tbody></table></div></article>
  </section>`;
}

function fileRow(name,ext,type,size,date,status,color,bg){ return `<tr><td><span class="file-type" style="--file-color:${color};--file-bg:${bg}">${ext}</span><strong>${name}</strong></td><td>${type}</td><td>${size}</td><td>${date}</td><td><span class="status-chip success" style="height:22px">${status}</span></td></tr>`; }

const pages = { dashboard: dashboardPage, projects: projectsPage, projectSetup: projectSetupPage, videoImport: videoImportPage, tracking: trackingPage, locomotion: locomotionPage, spatial: spatialPage, social: socialPage, statistics: statisticsPage, data: dataPage };
let currentPage = 'dashboard';
let selectedVideoFiles = [];
let selectedTrackingVideoUrl = 'assets/tracking-demo.mp4';

function renderPage(page, pushHash = true) {
  if (!pages[page]) page = 'dashboard';
  currentPage = page;
  document.getElementById('pageContent').innerHTML = pages[page]();
  const navPage = page === 'videoImport' || page === 'projectSetup' ? 'projects' : page;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === navPage));
  const [section, name] = pageMeta[page];
  document.getElementById('breadcrumb').innerHTML = `<span>${section}</span><i>›</i><strong>${name}</strong>`;
  document.getElementById('windowContext').textContent = name;
  if (pushHash && location.hash !== `#${page}`) history.replaceState(null,'',`#${page}`);
  bindPageEvents();
  document.getElementById('pageContent').scrollTop = 0;
}

function bindPageEvents() {
  document.querySelectorAll('.page-link').forEach(btn => btn.addEventListener('click', () => renderPage(btn.dataset.target)));
  document.querySelectorAll('.open-experiment').forEach(btn => btn.addEventListener('click', openModal));
  document.querySelectorAll('.segmented button,.tabbar button,.view-toggle button').forEach(btn => btn.addEventListener('click', () => { const group = btn.parentElement; group.querySelectorAll('button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); showToast(`已切换至“${btn.textContent.trim()}”视图`); }));
  document.querySelectorAll('.apply-analysis').forEach(btn => btn.addEventListener('click', () => { btn.textContent = '已应用 ✓'; showToast('分析条件已更新，图表已重新计算'); setTimeout(()=>btn.textContent='应用',1400); }));
  const projectSearch = document.getElementById('projectSearch');
  if (projectSearch) projectSearch.addEventListener('input', e => { const q=e.target.value.toLowerCase(); document.querySelectorAll('.project-card').forEach(card => card.style.display = card.dataset.projectName.toLowerCase().includes(q) ? '' : 'none'); });
  document.querySelectorAll('.project-card').forEach(card => {
    const openProject = () => {
      sessionStorage.setItem('selectedProjectName', card.dataset.projectTitle);
      sessionStorage.setItem('selectedProjectType', card.dataset.projectType);
      sessionStorage.setItem('selectedProjectFlyCount', card.dataset.flyCount);
      renderPage('projectSetup');
    };
    card.addEventListener('click', event => { if (!event.target.closest('.project-menu')) openProject(); });
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProject(); } });
  });
  document.querySelectorAll('.project-menu').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); showToast('项目操作菜单'); }));
  const save = document.getElementById('saveTrack'); if (save) save.addEventListener('click',()=>showToast('轨迹修正和分析区域已保存'));
  const play = document.getElementById('playButton'); if (play) play.addEventListener('click',()=>{ const video=document.getElementById('trackingVideo'); if (!video) return; if (video.paused) { video.play(); play.textContent='Ⅱ'; } else { video.pause(); play.textContent='▶'; } });
  const exportReport = document.getElementById('exportReport'); if (exportReport) exportReport.addEventListener('click',()=>showToast('报告已加入导出队列，格式：PDF（A4）'));
  bindProjectSetupEvents();
  bindVideoImportEvents();
  bindDataExportEvents();
}

function bindProjectSetupEvents() {
  const countInput = document.getElementById('analysisFlyCount');
  document.querySelectorAll('[data-count-step]').forEach(button => button.addEventListener('click', () => {
    const nextValue = Math.min(999, Math.max(1, Number(countInput.value || 1) + Number(button.dataset.countStep)));
    countInput.value = nextValue;
  }));
  const previewButton = document.getElementById('previewPlayButton');
  if (previewButton) previewButton.addEventListener('click', () => {
    const video = document.querySelector('.analysis-video-preview video');
    if (video.paused) { video.play(); previewButton.textContent = 'Ⅱ'; } else { video.pause(); previewButton.textContent = '▶'; }
  });
  const startButton = document.getElementById('startAiAnalysis');
  if (!startButton) return;
  startButton.addEventListener('click', () => {
    const vesselInput = document.getElementById('observationVessel');
    const count = Number(countInput.value);
    if (!vesselInput.value.trim()) { vesselInput.focus(); vesselInput.classList.add('invalid'); showToast('请填写观察器皿信息'); return; }
    if (!Number.isInteger(count) || count < 1) { countInput.focus(); countInput.classList.add('invalid'); showToast('请输入正确的果蝇数量'); return; }
    sessionStorage.setItem('observationVessel', vesselInput.value.trim());
    sessionStorage.setItem('analysisFlyCount', String(count));
    selectedTrackingVideoUrl = 'assets/tracking-demo.mp4';
    const panel = document.getElementById('aiAnalysisPanel');
    const bar = document.getElementById('aiProgressBar');
    const text = document.getElementById('aiProgressText');
    const status = document.getElementById('aiStatusText');
    const stages = Array.from(panel.querySelectorAll('.ai-stage-list span'));
    const stageLabels = ['正在解码实验视频…','正在检测果蝇个体…','正在建立身份与帧间关联…','正在生成轨迹和运动指标…'];
    panel.hidden = false;
    panel.classList.add('running');
    document.getElementById('smartAnalysisIdle').textContent = 'AI 分析已启动，正在读取本地计算进度';
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    startButton.disabled = true;
    startButton.innerHTML = '<span class="ai-spinner"></span> AI 分析运行中';
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 10);
      const stageIndex = Math.min(3, Math.floor(progress / 26));
      bar.style.width = `${progress}%`;
      text.textContent = `${progress}%`;
      status.textContent = stageLabels[stageIndex];
      stages.forEach((stage,index) => stage.classList.toggle('active', index <= stageIndex));
      if (progress === 100) {
        clearInterval(timer);
        panel.classList.add('complete');
        status.textContent = '分析启动成功，正在打开轨迹工作台…';
        startButton.innerHTML = '分析已启动 ✓';
        showToast('AI 分析已启动，正在加载跟踪视频');
        setTimeout(() => renderPage('tracking'), 550);
      }
    }, 180);
  });
}

function bindDataExportEvents() {
  const select = document.getElementById('exportExperimentSelect');
  const button = document.getElementById('exportRawDataButton');
  if (!select || !button) return;
  const projects = {
    light: ['光照刺激行为实验','BSV-2026-0810','2026-08-10','2.46 GB','41 个'],
    parkinson: ['帕金森模型运动评估','BSV-2026-0728','2026-07-28','4.82 GB','68 个'],
    odor: ['气味双选偏好实验','BSV-2026-0806','2026-08-06','3.18 GB','53 个'],
    social: ['群体聚集行为探索','BSV-2026-0729','2026-07-29','5.64 GB','76 个']
  };
  select.addEventListener('change', () => {
    const p = projects[select.value];
    document.getElementById('exportProjectMeta').innerHTML = `<div><span>项目编号</span><strong>${p[1]}</strong></div><div><span>实验日期</span><strong>${p[2]}</strong></div><div><span>原始数据量</span><strong>${p[3]}</strong></div><div><span>文件数量</span><strong>${p[4]}</strong></div>`;
    document.getElementById('exportPackageName').textContent = `${p[0]}_全部原始数据.zip`;
    document.getElementById('currentDataProject').textContent = `${p[0]} · 所有原始数据`;
  });
  button.addEventListener('click', () => {
    const projectName = projects[select.value][0];
    button.disabled = true;
    button.innerHTML = '<span class="ai-spinner"></span> 正在整理原始数据';
    setTimeout(() => {
      button.disabled = false;
      button.textContent = '导出包已生成 ✓';
      showToast(`${projectName}的全部原始数据已准备导出`);
    }, 1100);
  });
}

function bindVideoImportEvents() {
  const input = document.getElementById('videoFileInput');
  const dropzone = document.getElementById('videoDropzone');
  const clearButton = document.getElementById('clearVideoQueue');
  const importButton = document.getElementById('importVideoButton');
  if (!input || !dropzone || !importButton) return;
  selectedVideoFiles = [];
  input.addEventListener('change', event => updateVideoQueue(Array.from(event.target.files || [])));
  ['dragenter','dragover'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.add('dragging'); }));
  ['dragleave','drop'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.remove('dragging'); }));
  dropzone.addEventListener('drop', event => {
    const files = Array.from(event.dataTransfer?.files || []).filter(file => file.type.startsWith('video/') || /\.(mp4|avi|mov|mkv|wmv)$/i.test(file.name));
    updateVideoQueue(files);
  });
  clearButton?.addEventListener('click', () => { input.value = ''; updateVideoQueue([]); });
  importButton.addEventListener('click', () => {
    if (importButton.dataset.imported === 'true') { renderPage('tracking'); return; }
    if (!selectedVideoFiles.length) return;
    const progress = document.getElementById('importProgress');
    const progressBar = document.getElementById('importProgressBar');
    let value = 0;
    progress.hidden = false;
    importButton.disabled = true;
    importButton.textContent = '正在导入 0%';
    const timer = setInterval(() => {
      value = Math.min(100, value + 20);
      progressBar.style.width = `${value}%`;
      importButton.textContent = `正在导入 ${value}%`;
      if (value === 100) {
        clearInterval(timer);
        if (selectedVideoFiles[0]) selectedTrackingVideoUrl = URL.createObjectURL(selectedVideoFiles[0]);
        importButton.disabled = false;
        importButton.dataset.imported = 'true';
        importButton.textContent = '导入完成，进入轨迹校验 →';
        showToast(`${selectedVideoFiles.length} 个视频已成功导入当前实验`);
      }
    }, 180);
  });
}

function updateVideoQueue(files) {
  selectedVideoFiles = files;
  const queue = document.getElementById('videoQueue');
  const summary = document.getElementById('queueSummary');
  const clearButton = document.getElementById('clearVideoQueue');
  const importButton = document.getElementById('importVideoButton');
  if (!queue || !summary || !importButton) return;
  if (!files.length) {
    summary.textContent = '尚未选择文件';
    clearButton.hidden = true;
    importButton.disabled = true;
    importButton.textContent = '选择视频后导入';
    queue.innerHTML = '<div class="queue-empty"><span>▤</span><strong>暂无视频</strong><p>选择文件后将在这里显示导入队列</p></div>';
    return;
  }
  const totalBytes = files.reduce((sum,file) => sum + file.size, 0);
  summary.textContent = `${files.length} 个文件 · ${formatFileSize(totalBytes)}`;
  clearButton.hidden = false;
  importButton.disabled = false;
  importButton.textContent = `导入 ${files.length} 个视频`;
  queue.innerHTML = `<div class="video-file-list">${files.map((file,index) => `<div class="video-file-row"><span class="video-file-icon">▶</span><span class="video-file-copy"><strong title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</strong><small>${formatFileSize(file.size)} · 等待导入</small></span><i>${String(index + 1).padStart(2,'0')}</i></div>`).join('')}</div>`;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024,index)).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(()=>toast.classList.remove('show'),2200);
}

function openModal() { const modal=document.getElementById('experimentModal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
function closeModal() { const modal=document.getElementById('experimentModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => { renderPage(item.dataset.page); document.querySelector('.sidebar').classList.remove('open'); }));
document.getElementById('newExperimentButton').addEventListener('click', openModal);
document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
document.getElementById('experimentModal').addEventListener('click', e => { if (e.target.id === 'experimentModal') closeModal(); });
document.getElementById('createProject').addEventListener('click', () => {
  sessionStorage.setItem('newExperimentName', document.getElementById('experimentName').value.trim() || '未命名实验');
  sessionStorage.setItem('newExperimentType', document.getElementById('experimentType').value.trim() || '行为分析实验');
  sessionStorage.setItem('newResearcherName', document.getElementById('researcherName').value.trim() || '未指定研究员');
  closeModal();
  showToast('基本信息已保存，下一步请选择实验视频');
  setTimeout(()=>renderPage('videoImport'),300);
});
document.getElementById('mobileMenu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); document.getElementById('globalSearch').focus(); } if (e.key==='Escape') closeModal(); });
window.addEventListener('hashchange',()=>renderPage(location.hash.slice(1),false));

installIcons();
renderPage(location.hash.slice(1) || 'dashboard', false);

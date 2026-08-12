#!/bin/zsh

set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "未找到 Node.js。请先安装 Node.js 20.19 或更高版本。"
  read -r "?按回车键关闭窗口。"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "首次启动，正在准备网页依赖……"
  npm install
fi

echo "BioVision 本地预览正在启动……"
npm run dev &
preview_pid=$!

cleanup() {
  kill "$preview_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

for attempt in {1..40}; do
  if curl --silent --fail http://127.0.0.1:1420 >/dev/null 2>&1; then
    open http://127.0.0.1:1420
    echo "预览地址：http://127.0.0.1:1420"
    wait "$preview_pid"
    exit $?
  fi
  sleep 0.25
done

echo "本地预览启动失败，请检查上方错误信息。"
wait "$preview_pid"

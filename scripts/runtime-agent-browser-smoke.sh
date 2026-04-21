#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-${RUNTIME_SMOKE_BASE_URL:-http://localhost:5173}}"
LOGIN_URL="${BASE_URL}/login"
WORKLINES_URL="${BASE_URL}/runtime/worklines"
DEVICES_URL="${BASE_URL}/runtime/devices"
USERNAME="${RUNTIME_SMOKE_USERNAME:-admin}"
PASSWORD="${RUNTIME_SMOKE_PASSWORD:-admin123}"
SESSION="runtime-smoke-$$"
KEEP_SESSION="${RUNTIME_SMOKE_KEEP_SESSION:-0}"

ab() {
  agent-browser --session "$SESSION" "$@"
}

cleanup() {
  if [[ "${KEEP_SESSION}" == "1" ]]; then
    return
  fi
  ab close >/dev/null 2>&1 || true
}

fail() {
  echo "runtime-agent-browser-smoke: $*" >&2
  echo "runtime-agent-browser-smoke: session=${SESSION}" >&2
  exit 1
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    fail "$message"
  fi
}

extract_query_value() {
  local url="$1"
  local key="$2"
  if [[ "${url}" =~ (^|[?&])${key}=([^&]+) ]]; then
    printf '%s\n' "${BASH_REMATCH[2]}"
    return 0
  fi
  return 1
}

trap cleanup EXIT

command -v agent-browser >/dev/null 2>&1 || fail "agent-browser 未安装"
command -v rg >/dev/null 2>&1 || fail "rg 未安装"
command -v curl >/dev/null 2>&1 || fail "curl 未安装"

curl --silent --show-error --fail "${LOGIN_URL}" >/dev/null \
  || fail "无法访问 ${LOGIN_URL}，请先启动 Docker 前端开发实例"

ab open "${LOGIN_URL}" >/dev/null
ab storage local clear >/dev/null
ab storage session clear >/dev/null
ab open "${LOGIN_URL}" >/dev/null
ab wait 1500 >/dev/null

ab fill "input[autocomplete='username']" "${USERNAME}" >/dev/null
ab fill "input[autocomplete='current-password']" "${PASSWORD}" >/dev/null
ab click "button[type='submit']" >/dev/null
ab wait 5000 >/dev/null

login_url="$(ab get url)"
access_token="$(ab storage local get access_token || true)"
current_user="$(ab storage session get wes_current_user || true)"

assert_contains "${login_url}" "/dashboard" "登录后未进入 dashboard: ${login_url}"
assert_contains "${access_token}" "access_token:" "登录后未写入 access_token"
assert_contains "${current_user}" "wes_current_user:" "登录后未写入当前用户缓存"

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab open "${WORKLINES_URL}" >/dev/null
ab wait 5000 >/dev/null

workline_url="$(ab get url)"
workline_text="$(ab get text body)"
console_log="$(ab console || true)"
page_errors="$(ab errors || true)"

assert_contains "${workline_url}" "/runtime/worklines?worklineId=" "工作线页未自动同步默认 worklineId: ${workline_url}"
assert_contains "${workline_text}" "工作线运行监控" "工作线页未渲染监控标题，页面内容: ${workline_text}"
assert_contains "${workline_text}" "SSE CONNECTED" "工作线页未建立实时连接，页面内容: ${workline_text}"

workline_id="$(extract_query_value "${workline_url}" "worklineId" || true)"
if [[ -z "${workline_id}" ]]; then
  fail "无法从工作线页 URL 提取 worklineId: ${workline_url}"
fi

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab open "${DEVICES_URL}?worklineId=${workline_id}" >/dev/null
ab wait 5000 >/dev/null

device_url="$(ab get url)"
device_text="$(ab get text body)"
device_request_log="$(ab network requests)"
device_console_log="$(ab console || true)"
device_page_errors="$(ab errors || true)"

assert_contains "${device_url}" "/runtime/devices?worklineId=${workline_id}&deviceId=" "设备页未自动同步默认 deviceId: ${device_url}"
assert_contains "${device_text}" "线内设备监控" "设备页未渲染监控标题，页面内容: ${device_text}"
assert_contains "${device_text}" "设备健康" "设备页未展示设备健康详情，页面内容: ${device_text}"

device_id="$(extract_query_value "${device_url}" "deviceId" || true)"
if [[ -z "${device_id}" ]]; then
  fail "无法从设备页 URL 提取 deviceId: ${device_url}"
fi

device_detail_request_count="$(printf '%s' "${device_request_log}" | rg -c "/api/v1/workline/runtime/devices/${device_id}")"
if [[ "${device_detail_request_count}" -lt 1 ]]; then
  fail "未观察到目标设备详情请求: deviceId=${device_id}"
fi

combined_console="$(printf '%s\n%s' "${console_log}" "${device_console_log}")"
combined_errors="$(printf '%s\n%s' "${page_errors}" "${device_page_errors}")"
filtered_console="$(printf '%s' "${combined_console}" | rg -v "\\[vite\\]|\\[useMenu\\]|🍍|SSE CONNECTED|SSE] 正在连接|SSE] 连接已建立" || true)"
filtered_errors="$(printf '%s' "${combined_errors}" | rg -v '^$' || true)"

if [[ -n "${filtered_console}" ]]; then
  fail "浏览器控制台出现异常日志:\n${filtered_console}"
fi

if [[ -n "${filtered_errors}" ]]; then
  fail "页面运行时出现异常错误:\n${filtered_errors}"
fi

echo "runtime-agent-browser-smoke: PASS"
echo "  worklines: ${workline_url}"
echo "  devices:   ${device_url}"
echo "  device_id: ${device_id}"

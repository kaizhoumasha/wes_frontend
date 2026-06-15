#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-${RUNTIME_SMOKE_BASE_URL:-http://localhost:5173}}"
LOGIN_URL="${BASE_URL}/login"
MONITOR_URL="${BASE_URL}/runtime/monitor"
DEVICES_URL="${BASE_URL}/runtime/devices"
USERNAME="${RUNTIME_SMOKE_USERNAME:-admin}"
PASSWORD="${RUNTIME_SMOKE_PASSWORD:-admin123}"
SESSION="runtime-smoke-$$"
KEEP_SESSION="${RUNTIME_SMOKE_KEEP_SESSION:-0}"
BACKEND_DIR="${RUNTIME_SMOKE_BACKEND_DIR:-../wes_backend}"
SEED_BASIC_DATA="${RUNTIME_SMOKE_SEED_BASIC_DATA:-1}"
SEED_MONITOR_SCENE_DATA="${RUNTIME_SMOKE_SEED_MONITOR_SCENE_DATA:-1}"
# Default smoke follows the real backend contract path. Set this to 1 only for
# local UI fixture checks when backend debug-data cannot create monitor states.
USE_FIXED_MONITOR_FIXTURE="${RUNTIME_SMOKE_USE_FIXED_MONITOR_FIXTURE:-0}"
CAPTURE_SCREENSHOTS="${RUNTIME_SMOKE_CAPTURE_SCREENSHOTS:-0}"
SEEDED_SINGLE_LAYER_WORKLINE_ID=""
SEEDED_FALLBACK_WORKLINE_ID=""
SEEDED_TRACE_ID=""

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

capture_screenshot() {
  local path="$1"
  if [[ "${CAPTURE_SCREENSHOTS}" != "1" ]]; then
    return
  fi

  if ! ab screenshot "${path}" >/dev/null; then
    echo "runtime-agent-browser-smoke: warning: screenshot capture failed: ${path}" >&2
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    fail "$message"
  fi
}

is_local_base_url() {
  python3 - "${BASE_URL}" <<'PY'
from urllib.parse import urlparse
import sys

hostname = (urlparse(sys.argv[1]).hostname or "").lower()
sys.exit(0 if hostname in {"localhost", "127.0.0.1", "::1"} else 1)
PY
}

assert_seed_target_is_local() {
  if [[ "${SEED_BASIC_DATA}" != "1" && "${SEED_MONITOR_SCENE_DATA}" != "1" ]]; then
    return
  fi
  if is_local_base_url; then
    return
  fi
  fail "默认 seed 只允许本地 BASE_URL: ${BASE_URL}。测试非本地页面时，请设置 RUNTIME_SMOKE_SEED_BASIC_DATA=0 且 RUNTIME_SMOKE_SEED_MONITOR_SCENE_DATA=0。"
}

run_basic_debug_seed() {
  if [[ "${SEED_BASIC_DATA}" != "1" ]]; then
    return
  fi

  local seed_script="${BACKEND_DIR}/scripts/data/sync_test_workline_devices.py"
  if [[ ! -f "${seed_script}" ]]; then
    fail "未找到后端 debug-data 基础种子脚本: ${seed_script}"
  fi
  command -v uv >/dev/null 2>&1 || fail "启用基础数据种子时需要 uv"

  (
    cd "${BACKEND_DIR}"
    uv run python scripts/data/sync_test_workline_devices.py >/dev/null
  ) || fail "后端 debug-data 基础种子执行失败"
}

json_field() {
  local payload="$1"
  local expression="$2"
  printf '%s' "${payload}" | python3 -c "import json, sys; data = json.load(sys.stdin); print(${expression})"
}

run_monitor_scene_seed() {
  if [[ "${SEED_MONITOR_SCENE_DATA}" != "1" || "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
    return
  fi

  local seed_script="${BACKEND_DIR}/scripts/data/seed_runtime_monitor_smoke.py"
  if [[ ! -f "${seed_script}" ]]; then
    fail "未找到后端 runtime monitor smoke 种子脚本: ${seed_script}"
  fi
  command -v uv >/dev/null 2>&1 || fail "启用 runtime monitor smoke 种子时需要 uv"

  local seed_output
  seed_output="$(
    cd "${BACKEND_DIR}"
    uv run python scripts/data/seed_runtime_monitor_smoke.py --json
  )" || fail "后端 runtime monitor smoke 种子执行失败"

  SEEDED_SINGLE_LAYER_WORKLINE_ID="$(json_field "${seed_output}" "data['single_layer_workline']['id']")"
  SEEDED_FALLBACK_WORKLINE_ID="$(json_field "${seed_output}" "data['fallback_workline']['id']")"
  SEEDED_TRACE_ID="$(json_field "${seed_output}" "data.get('trace_id', '')")"
  if [[ -z "${SEEDED_TRACE_ID}" && -n "${SEEDED_SINGLE_LAYER_WORKLINE_ID}" ]]; then
    SEEDED_TRACE_ID="runtime-monitor-smoke-wms-callback"
  fi
}

reset_monitor_fixture_routes() {
  local workline_id="$1"

  ab network unroute "**/api/v1/workline/runtime/worklines/${workline_id}" >/dev/null 2>&1 || true
  ab network unroute "**/api/v1/workline/plugins/smoke_single_layer/manifest" >/dev/null 2>&1 || true
  ab network unroute "**/api/v1/workline/plugins/smoke_fallback/manifest" >/dev/null 2>&1 || true
}

install_monitor_fixture_routes() {
  local workline_id="$1"
  local detail_body
  local manifest_body

  reset_monitor_fixture_routes "${workline_id}"

  detail_body="$(
    python3 - "${workline_id}" <<'PY'
import json
import sys

workline_id = int(sys.argv[1])
summary = {
    "id": workline_id,
    "line_code": "WL-SMOKE-SINGLE-LAYER",
    "line_name": "Smoke 单层货架线",
    "line_type": "SORTING",
    "zone_name": "SMOKE",
    "plugin_key": "smoke_single_layer",
    "contract_version": "smoke-v1",
    "is_active": True,
    "device_count": 2,
    "active_session_count": 1,
    "waiting_session_count": 1,
    "failed_session_count": 0,
    "error_device_count": 0,
    "offline_device_count": 0,
    "maintenance_device_count": 0,
    "run_mode": "SIMULATION",
    "runtime_status": "READY",
}
detail = {
    "summary": summary,
    "boundary": {
        "workline_readiness": "READY",
        "station_lease": "ACTIVE_DISPATCH_LEASE",
        "single_layer_rack_snapshot": "ACTIVE",
        "rack_operation_wait": "WAITING_WMS",
    },
    "resource_evidence": {
        "kind": "WMS_CALLBACK_EVIDENCE",
        "items": [
            {
                "resource_kind": "RACK",
                "resource_code": "RACK-SMOKE-001",
                "display_label": "Rack RACK-SMOKE-001",
                "evidence_kind": "WES_ACTIVE_SNAPSHOT",
                "station_code": "TARGET_ARM",
                "position_code": "SINGLE_LAYER_A",
                "rack_code": "RACK-SMOKE-001",
                "source_trace_id": "trace-smoke-resource-layout",
                "occurred_at": "2026-06-08T00:00:00Z",
            },
            {
                "resource_kind": "BIN",
                "resource_code": "BIN-SMOKE-001",
                "display_label": "Bin BIN-SMOKE-001",
                "evidence_kind": "WMS_CALLBACK_EVIDENCE",
                "station_code": "TARGET_ARM",
                "position_code": "SINGLE_LAYER_A",
                "rack_code": "RACK-SMOKE-001",
                "bin_code": "BIN-SMOKE-001",
                "source_session_id": 88001,
                "source_trace_id": "trace-smoke-wms-callback",
                "occurred_at": "2026-06-08T00:00:01Z",
            },
            {
                "resource_kind": "SLOT",
                "resource_code": "SLOT-SMOKE-A1",
                "display_label": "Slot SLOT-SMOKE-A1",
                "evidence_kind": "TRACE_RESOURCE_EVIDENCE",
                "station_code": "TARGET_ARM",
                "position_code": "SINGLE_LAYER_A",
                "rack_code": "RACK-SMOKE-001",
                "bin_code": "BIN-SMOKE-001",
                "slot_code": "SLOT-SMOKE-A1",
                "source_trace_id": "trace-smoke-resource-layout",
                "occurred_at": "2026-06-08T00:00:02Z",
            },
            {
                "resource_kind": "CELL",
                "resource_code": "CELL-SMOKE-A1",
                "display_label": "Cell CELL-SMOKE-A1",
                "evidence_kind": "TRACE_RESOURCE_EVIDENCE",
                "station_code": "TARGET_ARM",
                "position_code": "SINGLE_LAYER_A",
                "rack_code": "RACK-SMOKE-001",
                "bin_code": "BIN-SMOKE-001",
                "material_code": "620100L00-011-G",
                "date_code": "2401",
                "lot_code": "LOT-A",
                "reel_count": 2,
                "source_trace_id": "trace-smoke-resource-layout",
                "occurred_at": "2026-06-08T00:00:03Z",
            },
            {
                "resource_kind": "PKG",
                "resource_code": "PKG-SMOKE-001",
                "display_label": "PKG PKG-SMOKE-001",
                "evidence_kind": "WMS_CALLBACK_EVIDENCE",
                "station_code": "TARGET_ARM",
                "position_code": "SINGLE_LAYER_A",
                "rack_code": "RACK-SMOKE-001",
                "bin_code": "BIN-SMOKE-001",
                "pkg_code": "PKG-SMOKE-001",
                "cell_code": "CELL-SMOKE-A1",
                "material_code": "620100L00-011-G",
                "date_code": "2401",
                "lot_code": "LOT-A",
                "reel_code": "REEL-BOTTOM",
                "position_index": 1,
                "source_session_id": 88001,
                "source_trace_id": "trace-smoke-wms-callback",
                "occurred_at": "2026-06-08T00:00:04Z",
            },
            {
                "resource_kind": "PART_SN",
                "resource_code": "PART-SMOKE-001",
                "display_label": "Part SN PART-SMOKE-001",
                "evidence_kind": "TRACE_RESOURCE_EVIDENCE",
                "station_code": "TARGET_ARM",
                "position_code": "SINGLE_LAYER_A",
                "rack_code": "RACK-SMOKE-001",
                "bin_code": "BIN-SMOKE-001",
                "part_sn": "PART-SMOKE-001",
                "cell_code": "CELL-SMOKE-A1",
                "material_code": "620100L00-011-G",
                "date_code": "2401",
                "lot_code": "LOT-A",
                "reel_code": "REEL-TOP",
                "position_index": 2,
                "source_trace_id": "trace-smoke-resource-layout",
                "occurred_at": "2026-06-08T00:00:05Z",
            },
            {
                "resource_kind": "PKG",
                "resource_code": "PKG-SMOKE-UNLOCATED",
                "display_label": "PKG PKG-SMOKE-UNLOCATED",
                "evidence_kind": "GENERIC_EVIDENCE",
                "source_trace_id": "trace-smoke-unlocated",
                "occurred_at": "2026-06-08T00:00:06Z",
            },
        ],
        "total_count": 8,
        "truncated": True,
    },
    "device_nodes": [
        {
            "id": 91001,
            "device_code": "SMOKE-SOURCE-ARM",
            "device_name": "Smoke SOURCE_ARM",
            "device_role": "SOURCE_ARM",
            "role_index": 1,
            "device_status": "IDLE",
            "maintenance_mode": False,
            "active_runtime_hold_ids": [],
        },
        {
            "id": 91002,
            "device_code": "SMOKE-TARGET-ARM",
            "device_name": "Smoke TARGET_ARM",
            "device_role": "TARGET_ARM",
            "role_index": 1,
            "device_status": "BUSY",
            "maintenance_mode": False,
            "active_runtime_hold_ids": [],
        },
    ],
    "active_sessions": {
        "items": [],
        "total_count": 0,
        "truncated": False,
    },
    "recent_failed_traces": {
        "items": [],
        "total_count": 0,
        "truncated": False,
    },
    "recent_completed_traces": {
        "items": [],
        "total_count": 0,
        "truncated": False,
    },
    "action_candidates": {
        "pending_reconciliation": None,
    },
    "generated_at": "2026-06-08T00:00:00Z"
}
print(json.dumps({
    "code": "1000",
    "message": "success",
    "data": detail,
    "timestamp": "2026-06-08T00:00:00Z",
}, ensure_ascii=False))
PY
  )"

  manifest_body="$(
    python3 <<'PY'
import json

manifest = {
    "plugin_key": "smoke_single_layer",
    "contract_version": "smoke-v1",
    "devices": [
        {
            "role": "SOURCE_ARM",
            "min_count": 1,
            "required": True,
        },
        {
            "role": "TARGET_ARM",
            "min_count": 1,
            "required": True,
        },
    ],
    "rack_positions": [
        {
            "code": "SINGLE_LAYER_A",
            "role": "TARGET_ARM",
            "station_code": "TARGET_ARM",
            "carrier_capability": {
                "allowed_rack_kinds": ["SINGLE_LAYER"],
                "allowed_slot_kinds": [],
                "min_capacity": 0,
                "max_capacity": 1,
            },
        }
    ],
    "topology": {
        "flow_edges": [
            {
                "type": "material_flow",
                "from_node": {"kind": "DEVICE_ROLE", "ref": "SOURCE_ARM"},
                "to_node": {"kind": "RACK_POSITION", "ref": "SINGLE_LAYER_A"},
            }
        ]
    },
    "events": [],
    "commands": [],
    "resource_boundaries": [
        {
            "rack_position_code": "SINGLE_LAYER_A",
            "rack_kind": "SINGLE_LAYER",
            "snapshot_kind": "ACTIVE_BIN_RACK",
            "lease_scope": "POSITION",
            "business_demand_type": "SORTING_TARGET",
            "wms_operation_type": "RACK_MOVE",
        }
    ],
}
print(json.dumps({
    "code": "1000",
    "message": "success",
    "data": manifest,
    "timestamp": "2026-06-08T00:00:00Z",
}, ensure_ascii=False))
PY
  )"

  ab network route "**/api/v1/workline/runtime/worklines/${workline_id}" --body "${detail_body}" >/dev/null
  ab network route "**/api/v1/workline/plugins/smoke_single_layer/manifest" --body "${manifest_body}" >/dev/null
}

install_monitor_fallback_fixture_routes() {
  local workline_id="$1"
  local detail_body
  local manifest_body

  reset_monitor_fixture_routes "${workline_id}"

  detail_body="$(
    python3 - "${workline_id}" <<'PY'
import json
import sys

workline_id = int(sys.argv[1])
summary = {
    "id": workline_id,
    "line_code": "WL-SMOKE-FALLBACK",
    "line_name": "Smoke fallback 语义线",
    "line_type": "SORTING",
    "zone_name": "SMOKE",
    "plugin_key": "smoke_fallback",
    "contract_version": "smoke-v1",
    "is_active": True,
    "device_count": 1,
    "active_session_count": 0,
    "waiting_session_count": 0,
    "failed_session_count": 0,
    "error_device_count": 0,
    "offline_device_count": 0,
    "maintenance_device_count": 0,
    "run_mode": "SIMULATION",
    "runtime_status": "READY",
}
detail = {
    "summary": summary,
    "boundary": {
        "workline_readiness": "UNKNOWN",
    },
    "resource_evidence": {
        "kind": "GENERIC_EVIDENCE",
        "items": [
            {
                "resource_kind": "UNKNOWN",
                "resource_code": "GENERIC-FALLBACK-001",
                "display_label": "Generic evidence GENERIC-FALLBACK-001",
                "evidence_kind": "GENERIC_EVIDENCE",
                "station_code": "FALLBACK_STATION",
                "position_code": "FALLBACK_POSITION",
                "source_trace_id": "trace-smoke-generic-fallback",
                "occurred_at": "2026-06-08T00:00:02Z",
            }
        ],
        "total_count": 1,
        "truncated": False,
    },
    "device_nodes": [
        {
            "id": 92001,
            "device_code": "SMOKE-FALLBACK-STATION",
            "device_name": "Smoke fallback station",
            "device_role": "STATION",
            "role_index": 1,
            "device_status": "IDLE",
            "maintenance_mode": False,
            "active_runtime_hold_ids": [],
        }
    ],
    "active_sessions": {
        "items": [],
        "total_count": 0,
        "truncated": False,
    },
    "recent_failed_traces": {
        "items": [],
        "total_count": 0,
        "truncated": False,
    },
    "recent_completed_traces": {
        "items": [],
        "total_count": 0,
        "truncated": False,
    },
    "action_candidates": {
        "pending_reconciliation": None,
    },
    "generated_at": "2026-06-08T00:00:00Z"
}
print(json.dumps({
    "code": "1000",
    "message": "success",
    "data": detail,
    "timestamp": "2026-06-08T00:00:00Z",
}, ensure_ascii=False))
PY
  )"

  manifest_body="$(
    python3 <<'PY'
import json

manifest = {
    "plugin_key": "smoke_fallback",
    "contract_version": "smoke-v1",
    "devices": [],
    "rack_positions": [],
    "topology": {
        "flow_edges": [],
    },
    "events": [],
    "commands": [],
    "resource_boundaries": [],
}
print(json.dumps({
    "code": "1000",
    "message": "success",
    "data": manifest,
    "timestamp": "2026-06-08T00:00:00Z",
}, ensure_ascii=False))
PY
  )"

  ab network route "**/api/v1/workline/runtime/worklines/${workline_id}" --body "${detail_body}" >/dev/null
  ab network route "**/api/v1/workline/plugins/smoke_fallback/manifest" --body "${manifest_body}" >/dev/null
}

assert_monitor_scene_dom() {
  local viewport_label="$1"
  local scenario="$2"
  local script_path="/tmp/${SESSION}-${viewport_label}-monitor-assert.js"

  python3 - "${scenario}" >"${script_path}" <<'PY'
import json
import sys

scenario = sys.argv[1]
structured_scenarios = {"happy", "seeded", "fallback", "seeded-fallback"}
rack_layout_scenarios = {"happy", "seeded"}
legacy_resource_scenarios = {"fallback", "seeded-fallback"}
required_texts = [
    "Station lease",
    "Rack operation",
]
if scenario == "happy":
    required_texts.extend([
        "Station lease：调度租约占用",
        "Rack operation：等待 WMS 搬运到位",
        "WMS 回调证据",
        "仅展示前 7 条证据 / 共 8 条",
        "TARGET_ARM",
        "RACK-SMOKE-001",
        "BIN-SMOKE-001",
        "SLOT-SMOKE-A1",
        "CELL-SMOKE-A1",
        "PKG-SMOKE-001",
        "PART-SMOKE-001",
        "620100L00-011-G",
        "DC 2401",
        "LC LOT-A",
        "2 盘",
        "REEL-BOTTOM",
        "REEL-TOP",
        "PKG-SMOKE-UNLOCATED",
    ])
elif scenario == "seeded":
    required_texts.extend([
        "Station lease：调度租约占用",
        "Rack operation：等待 WMS 搬运到位",
        "WMS 回调证据",
        "仅展示前 50 条证据 / 共",
        "TARGET_STATION",
        "PKG-SMOKE",
    ])
elif scenario == "fallback":
    required_texts.extend([
        "运行态边界字段未加载",
        "Station lease：语义未加载",
        "Rack operation：语义未加载",
        "通用 evidence",
        "FALLBACK_POSITION",
    ])
elif scenario == "seeded-fallback":
    required_texts.extend([
        "manifest 加载失败",
        "Station lease：语义未加载",
        "Rack operation：语义未加载",
        "通用 evidence",
        "FALLBACK_POSITION",
    ])

required_selectors = [
    '[data-test="runtime-scene-map"]',
    '[data-test="runtime-scene-readiness"]',
    '[data-test="runtime-scene-device-flow"]',
]
if scenario in structured_scenarios:
    required_selectors.extend([
        '[data-test="runtime-scene-position-group"]',
        '[data-test="runtime-scene-station-lease"]',
        '[data-test="runtime-scene-rack-snapshot"]',
        '[data-test="runtime-scene-rack-operation"]',
        '[data-test="runtime-scene-evidence-panel"]',
        '[data-test="runtime-scene-evidence-row"]',
    ])
if scenario in rack_layout_scenarios:
    required_selectors.extend([
        '[data-test="runtime-rack-layout-panel"]',
        '[data-test="runtime-rack-slot"]',
        '[data-test="runtime-rack-inspector"]',
        '[data-test="runtime-bin-cell-grid"]',
        '[data-test="runtime-bin-cell"]',
    ])
if scenario in legacy_resource_scenarios:
    required_selectors.extend([
        '[data-test="runtime-scene-resource-stack"]',
        '[data-test="runtime-scene-focus-panel"]',
    ])
if scenario == "happy":
    required_selectors.append('[data-test="runtime-scene-unlocated-audit"]')
    required_selectors.extend([
        '[data-test="runtime-rack-cell-summary"]',
        '[data-test="runtime-rack-material-stack"]',
        '[data-test="runtime-rack-material-reel"]',
    ])
if scenario in {"fallback", "seeded-fallback"}:
    required_selectors.append('[data-test="runtime-scene-fallback"]')

print(f"""
(() => {{
  const errors = [];
  const requiredSelectors = {json.dumps(required_selectors, ensure_ascii=False)};
  const evidenceSelector = '[data-test="runtime-scene-evidence-row"], [data-test="runtime-scene-empty-evidence"]';
  const visible = el => {{
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }};
  for (const details of document.querySelectorAll('details')) {{
    details.open = true;
  }}
  for (const selector of requiredSelectors) {{
    const el = document.querySelector(selector);
    if (!visible(el)) errors.push(`missing or hidden selector: ${{selector}}`);
  }}
  if (!visible(document.querySelector(evidenceSelector))) {{
    errors.push(`missing or hidden selector: ${{evidenceSelector}}`);
  }}
  const bodyText = document.body.innerText || '';
  for (const text of {json.dumps(required_texts, ensure_ascii=False)}) {{
    if (!bodyText.includes(text)) errors.push(`missing text: ${{text}}`);
  }}
  const checkedNodes = document.querySelectorAll([
    '[data-test="runtime-scene-readiness"]',
    '[data-test="runtime-scene-position-group"]',
    '[data-test="runtime-rack-layout-panel"]',
    '[data-test="runtime-rack-slot"]',
    '[data-test="runtime-rack-inspector"]',
    '[data-test="runtime-bin-cell-grid"]',
    '[data-test="runtime-bin-cell"]',
    '[data-test="runtime-rack-cell-summary"]',
    '[data-test="runtime-rack-material-stack"]',
    '[data-test="runtime-rack-material-reel"]',
    '[data-test="runtime-scene-station-lease"]',
    '[data-test="runtime-scene-rack-snapshot"]',
    '[data-test="runtime-scene-rack-operation"]',
    '[data-test="runtime-scene-truncated"]',
    '[data-test="runtime-scene-evidence-panel"]',
    '[data-test="runtime-scene-evidence-row"]',
    '[data-test="runtime-scene-empty-evidence"]'
  ].join(','));
  for (const el of checkedNodes) {{
    if (!visible(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.left < -1 || rect.right > window.innerWidth + 1) {{
      errors.push(`viewport overflow: ${{el.getAttribute('data-test') || el.className}}`);
    }}
    if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) {{
      errors.push(`content overflow: ${{el.getAttribute('data-test') || el.className}}`);
    }}
  }}
  const overlap = (a, b) => {{
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const width = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
    const height = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
    return width > 1 && height > 1;
  }};
  const checkOverlapGroup = (label, nodes) => {{
    const visibleNodes = Array.from(nodes).filter(visible);
    for (let i = 0; i < visibleNodes.length; i += 1) {{
      for (let j = i + 1; j < visibleNodes.length; j += 1) {{
        if (overlap(visibleNodes[i], visibleNodes[j])) {{
          errors.push(`overlap: ${{label}}[${{i}}] with ${{label}}[${{j}}]`);
        }}
      }}
    }}
  }};
  checkOverlapGroup('device', document.querySelectorAll('[data-test="runtime-scene-device"]'));
  checkOverlapGroup('position', document.querySelectorAll('[data-test="runtime-scene-position-group"]'));
  checkOverlapGroup('rack-slot', document.querySelectorAll('[data-test="runtime-rack-slot"]'));
  checkOverlapGroup('bin-cell', document.querySelectorAll('[data-test="runtime-bin-cell"]'));
  checkOverlapGroup('rack-inspector', document.querySelectorAll('[data-test="runtime-rack-inspector"]'));
  checkOverlapGroup('evidence', document.querySelectorAll('[data-test="runtime-scene-evidence-row"]'));
  if (errors.length) throw new Error(errors.join('\\n'));
  return 'runtime scene assertions passed';
}})()
""")
PY

  ab eval "$(cat "${script_path}")" >/dev/null || fail "${viewport_label} monitor scene DOM 断言失败"
  rm -f "${script_path}"
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
command -v python3 >/dev/null 2>&1 || fail "python3 未安装"

assert_seed_target_is_local
run_basic_debug_seed
run_monitor_scene_seed

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

ab set viewport 1440 900 >/dev/null
if [[ -n "${SEEDED_SINGLE_LAYER_WORKLINE_ID}" ]]; then
  workline_id="${SEEDED_SINGLE_LAYER_WORKLINE_ID}"
  ab open "${MONITOR_URL}?worklineId=${workline_id}" >/dev/null
else
  ab open "${MONITOR_URL}" >/dev/null
fi
ab wait 5000 >/dev/null

monitor_url="$(ab get url)"
monitor_text="$(ab get text body)"
console_log="$(ab console || true)"
page_errors="$(ab errors || true)"

if [[ -n "${SEEDED_SINGLE_LAYER_WORKLINE_ID}" ]]; then
  assert_contains "${monitor_url}" "/runtime/monitor?worklineId=${workline_id}" "工作线监控页未打开 seed worklineId: ${monitor_url}"
else
  assert_contains "${monitor_url}" "/runtime/monitor?worklineId=" "工作线监控页未自动同步默认 worklineId: ${monitor_url}"
fi
assert_contains "${monitor_text}" "工作线监控" "工作线监控页未渲染标题，页面内容: ${monitor_text}"
assert_contains "${monitor_text}" "拓扑主视图" "工作线监控页未渲染拓扑主视图，页面内容: ${monitor_text}"
assert_contains "${monitor_text}" "SSE CONNECTED" "工作线监控页未建立实时连接，页面内容: ${monitor_text}"

workline_id="${workline_id:-$(extract_query_value "${monitor_url}" "worklineId" || true)}"
if [[ -z "${workline_id}" ]]; then
  fail "无法从工作线监控页 URL 提取 worklineId: ${monitor_url}"
fi

if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
  install_monitor_fixture_routes "${workline_id}"
  ab open "${MONITOR_URL}?worklineId=${workline_id}" >/dev/null
  ab wait 5000 >/dev/null

  monitor_url="$(ab get url)"
  monitor_text="$(ab get text body)"
  console_log="$(ab console || true)"
  page_errors="$(ab errors || true)"
fi

desktop_screenshot="/tmp/${SESSION}-monitor-desktop.png"
capture_screenshot "${desktop_screenshot}"
if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
  assert_monitor_scene_dom "desktop" "happy"
elif [[ -n "${SEEDED_SINGLE_LAYER_WORKLINE_ID}" ]]; then
  assert_monitor_scene_dom "desktop" "seeded"
else
  assert_monitor_scene_dom "desktop" "live"
fi

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab set viewport 390 844 >/dev/null
ab open "${MONITOR_URL}?worklineId=${workline_id}" >/dev/null
ab wait 5000 >/dev/null

mobile_monitor_url="$(ab get url)"
mobile_monitor_text="$(ab get text body)"
mobile_console_log="$(ab console || true)"
mobile_page_errors="$(ab errors || true)"
mobile_screenshot="/tmp/${SESSION}-monitor-mobile.png"
capture_screenshot "${mobile_screenshot}"

assert_contains "${mobile_monitor_url}" "/runtime/monitor?worklineId=${workline_id}" "移动视口工作线监控 URL 异常: ${mobile_monitor_url}"
assert_contains "${mobile_monitor_text}" "工作线监控" "移动视口未渲染工作线监控标题，页面内容: ${mobile_monitor_text}"
assert_contains "${mobile_monitor_text}" "拓扑主视图" "移动视口未渲染拓扑主视图，页面内容: ${mobile_monitor_text}"
if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
  assert_monitor_scene_dom "mobile" "happy"
elif [[ -n "${SEEDED_SINGLE_LAYER_WORKLINE_ID}" ]]; then
  assert_monitor_scene_dom "mobile" "seeded"
else
  assert_monitor_scene_dom "mobile" "live"
fi

fallback_desktop_screenshot=""
fallback_mobile_screenshot=""
fallback_console_log=""
fallback_page_errors=""
fallback_mobile_console_log=""
fallback_mobile_page_errors=""

if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" || -n "${SEEDED_FALLBACK_WORKLINE_ID}" ]]; then
  ab console --clear >/dev/null || true
  ab errors --clear >/dev/null || true
  ab network requests --clear >/dev/null || true

  if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
    install_monitor_fallback_fixture_routes "${workline_id}"
    fallback_workline_id="${workline_id}"
    fallback_scenario="fallback"
  else
    fallback_workline_id="${SEEDED_FALLBACK_WORKLINE_ID}"
    fallback_scenario="seeded-fallback"
  fi

  ab set viewport 1440 900 >/dev/null
  ab open "${MONITOR_URL}?worklineId=${fallback_workline_id}" >/dev/null
  ab wait 5000 >/dev/null

  fallback_monitor_text="$(ab get text body)"
  fallback_console_log="$(ab console || true)"
  fallback_page_errors="$(ab errors || true)"
  fallback_desktop_screenshot="/tmp/${SESSION}-monitor-fallback-desktop.png"
  capture_screenshot "${fallback_desktop_screenshot}"
  assert_contains "${fallback_monitor_text}" "通用 evidence" "fallback 场景未展示通用 evidence，页面内容: ${fallback_monitor_text}"
  assert_monitor_scene_dom "fallback-desktop" "${fallback_scenario}"

  ab console --clear >/dev/null || true
  ab errors --clear >/dev/null || true
  ab network requests --clear >/dev/null || true

  ab set viewport 390 844 >/dev/null
  ab open "${MONITOR_URL}?worklineId=${fallback_workline_id}" >/dev/null
  ab wait 5000 >/dev/null

  fallback_mobile_monitor_text="$(ab get text body)"
  fallback_mobile_console_log="$(ab console || true)"
  fallback_mobile_page_errors="$(ab errors || true)"
  fallback_mobile_screenshot="/tmp/${SESSION}-monitor-fallback-mobile.png"
  capture_screenshot "${fallback_mobile_screenshot}"
  assert_contains "${fallback_mobile_monitor_text}" "语义未加载" "移动 fallback 场景未展示语义未加载，页面内容: ${fallback_mobile_monitor_text}"
  assert_monitor_scene_dom "fallback-mobile" "${fallback_scenario}"
fi

sandbox_desktop_url=""
sandbox_mobile_url=""
sandbox_desktop_console_log=""
sandbox_desktop_page_errors=""
sandbox_mobile_console_log=""
sandbox_mobile_page_errors=""

if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
  install_monitor_fixture_routes "${workline_id}"
fi

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab set viewport 1440 900 >/dev/null
ab open "${BASE_URL}/runtime/sandbox/${workline_id}" >/dev/null
ab wait 5000 >/dev/null

sandbox_desktop_url="$(ab get url)"
sandbox_desktop_text="$(ab get text body)"
sandbox_desktop_console_log="$(ab console || true)"
sandbox_desktop_page_errors="$(ab errors || true)"

assert_contains "${sandbox_desktop_text}" "设备拓扑" "sandbox 桌面视口未展示设备拓扑，页面内容: ${sandbox_desktop_text}"
if [[ "${USE_FIXED_MONITOR_FIXTURE}" == "1" ]]; then
  assert_contains "${sandbox_desktop_text}" "SMOKE-TARGET-ARM" "sandbox 桌面视口未展示目标设备，页面内容: ${sandbox_desktop_text}"
fi

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab set viewport 390 844 >/dev/null
ab open "${BASE_URL}/runtime/sandbox/${workline_id}" >/dev/null
ab wait 5000 >/dev/null

sandbox_mobile_url="$(ab get url)"
sandbox_mobile_text="$(ab get text body)"
sandbox_mobile_console_log="$(ab console || true)"
sandbox_mobile_page_errors="$(ab errors || true)"

assert_contains "${sandbox_mobile_text}" "设备拓扑" "sandbox 移动视口未展示设备拓扑，页面内容: ${sandbox_mobile_text}"

trace_desktop_url=""
trace_mobile_url=""
trace_desktop_console_log=""
trace_desktop_page_errors=""
trace_mobile_console_log=""
trace_mobile_page_errors=""
trace_smoke_status="skipped"

if [[ -n "${SEEDED_TRACE_ID:-}" ]]; then
  trace_smoke_status="covered:${SEEDED_TRACE_ID}"
  ab console --clear >/dev/null || true
  ab errors --clear >/dev/null || true
  ab network requests --clear >/dev/null || true

  ab set viewport 1440 900 >/dev/null
  ab open "${BASE_URL}/runtime/cases?traceId=${SEEDED_TRACE_ID}" >/dev/null
  ab wait 5000 >/dev/null

  trace_desktop_url="$(ab get url)"
  trace_desktop_text="$(ab get text body)"
  trace_desktop_console_log="$(ab console || true)"
  trace_desktop_page_errors="$(ab errors || true)"

  assert_contains "${trace_desktop_text}" "工作线拓扑" "trace 桌面视口未展示工作线拓扑，页面内容: ${trace_desktop_text}"
  assert_contains "${trace_desktop_text}" "完整设备拓扑" "trace 桌面视口未展示完整设备拓扑，页面内容: ${trace_desktop_text}"

  ab console --clear >/dev/null || true
  ab errors --clear >/dev/null || true
  ab network requests --clear >/dev/null || true

  ab set viewport 390 844 >/dev/null
  ab open "${BASE_URL}/runtime/cases?traceId=${SEEDED_TRACE_ID}" >/dev/null
  ab wait 5000 >/dev/null

  trace_mobile_url="$(ab get url)"
  trace_mobile_text="$(ab get text body)"
  trace_mobile_console_log="$(ab console || true)"
  trace_mobile_page_errors="$(ab errors || true)"

  assert_contains "${trace_mobile_text}" "工作线拓扑" "trace 移动视口未展示工作线拓扑，页面内容: ${trace_mobile_text}"
fi

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab set viewport 1440 900 >/dev/null
ab open "${DEVICES_URL}?worklineId=${workline_id}" >/dev/null
ab wait 5000 >/dev/null

device_url="$(ab get url)"
device_text="$(ab get text body)"
device_request_log="$(ab network requests)"
device_console_log="$(ab console || true)"
device_page_errors="$(ab errors || true)"

assert_contains "${device_url}" "/runtime/devices?worklineId=${workline_id}" "设备页 URL 未保留 worklineId: ${device_url}"
assert_contains "${device_text}" "设备运行时" "设备页未渲染监控标题，页面内容: ${device_text}"
assert_contains "${device_text}" "状态筛选" "设备页未展示状态筛选，页面内容: ${device_text}"

device_id="$(extract_query_value "${device_url}" "deviceId" || true)"
if [[ -n "${device_id}" ]]; then
  device_detail_request_count="$(printf '%s' "${device_request_log}" | rg -c "/api/v1/workline/runtime/devices/${device_id}")"
  if [[ "${device_detail_request_count}" -lt 1 ]]; then
    fail "未观察到目标设备详情请求: deviceId=${device_id}"
  fi
fi

combined_console="$(
  printf '%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s' \
    "${console_log:-}" \
    "${mobile_console_log:-}" \
    "${fallback_console_log:-}" \
    "${fallback_mobile_console_log:-}" \
    "${sandbox_desktop_console_log:-}" \
    "${sandbox_mobile_console_log:-}" \
    "${trace_desktop_console_log:-}" \
    "${trace_mobile_console_log:-}" \
    "${device_console_log:-}"
)"
combined_errors="$(
  printf '%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s' \
    "${page_errors:-}" \
    "${mobile_page_errors:-}" \
    "${fallback_page_errors:-}" \
    "${fallback_mobile_page_errors:-}" \
    "${sandbox_desktop_page_errors:-}" \
    "${sandbox_mobile_page_errors:-}" \
    "${trace_desktop_page_errors:-}" \
    "${trace_mobile_page_errors:-}" \
    "${device_page_errors:-}"
)"
filtered_console="$(printf '%s' "${combined_console}" | rg -v "\\[vite\\]|\\[useMenu\\]|🍍|SSE CONNECTED|SSE] 正在连接|SSE] 连接已建立|SSE] 连接已关闭，准备重连|工作线插件不存在: runtime_monitor_smoke_missing_manifest" || true)"
filtered_errors="$(printf '%s' "${combined_errors}" | rg -v '^$' || true)"

if [[ -n "${filtered_console}" ]]; then
  fail "浏览器控制台出现异常日志:\n${filtered_console}"
fi

if [[ -n "${filtered_errors}" ]]; then
  fail "页面运行时出现异常错误:\n${filtered_errors}"
fi

echo "runtime-agent-browser-smoke: PASS"
echo "  monitor desktop: ${monitor_url}"
echo "  monitor mobile:  ${mobile_monitor_url}"
echo "  sandbox desktop: ${sandbox_desktop_url}"
echo "  sandbox mobile:  ${sandbox_mobile_url}"
echo "  trace:           ${trace_smoke_status}"
echo "  devices:         ${device_url}"
echo "  device_id:       ${device_id:-not-selected}"
if [[ "${CAPTURE_SCREENSHOTS}" == "1" ]]; then
  echo "  screenshots:     ${desktop_screenshot} ${mobile_screenshot}"
else
  echo "  screenshots:     skipped (set RUNTIME_SMOKE_CAPTURE_SCREENSHOTS=1 to capture)"
fi
if [[ "${CAPTURE_SCREENSHOTS}" == "1" && -n "${fallback_desktop_screenshot}" ]]; then
  echo "  fallback shots:  ${fallback_desktop_screenshot} ${fallback_mobile_screenshot}"
fi

pipeline {
    agent {
        label 'WES'
    }

    parameters {
        string(name: 'BACKEND_IMAGE_TAG', description: '已批准的后端不可变镜像标签（构建号-commit 前 7 位）')
        string(name: 'BACKEND_COMMIT_SHA', description: '已批准且用于冻结前端契约的后端完整 commit SHA')
        string(name: 'FRONTEND_COMMIT_SHA', description: '已批准发布的前端完整 commit SHA')
    }

    environment {
        REGISTRY_URL = '192.168.0.220:5050'
        IMAGE_REPO = '192.168.0.220:5050/wes/wes_frontend'
    }

    options {
        buildDiscarder(logRotator(daysToKeepStr: '14', numToKeepStr: '10', artifactDaysToKeepStr: '7', artifactNumToKeepStr: '3'))
        timeout(time: 60, unit: 'MINUTES')
        skipDefaultCheckout(true)
        disableConcurrentBuilds(abortPrevious: true)
        timestamps()
    }

    stages {
        stage('Checkout Source') {
            steps {
                script {
                    String sourceBranch = env.gitlabSourceBranch ?: env.gitlabBranch ?: 'develop'
                    String targetBranch = env.gitlabTargetBranch ?: ''
                    String gitlabActionType = (env.gitlabActionType ?: env.GITLAB_OBJECT_KIND ?: '').trim().toUpperCase()
                    boolean hasMergeRequestId = ((env.gitlabMergeRequestId ?: '').trim()) as boolean
                    boolean isMergeRequest = gitlabActionType.contains('MERGE') || hasMergeRequestId

                    env.CI_SOURCE_BRANCH = sourceBranch
                    env.CI_TARGET_BRANCH = targetBranch
                    env.CI_EVENT_TYPE = gitlabActionType ?: 'MANUAL'

                    echo "📥 检出前端源码: source=${sourceBranch}, target=${targetBranch ?: '-'}, event=${env.CI_EVENT_TYPE}"

                    def extensions = [[$class: 'CleanBeforeCheckout']]
                    if (isMergeRequest && targetBranch) {
                        extensions << [
                            $class: 'PreBuildMerge',
                            options: [
                                fastForwardMode: 'FF',
                                mergeRemote: 'origin',
                                mergeTarget: targetBranch
                            ]
                        ]
                    }

                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "origin/${sourceBranch}"]],
                        userRemoteConfigs: [[
                            name: 'origin',
                            url: 'https://zt_git.happyjack.cn/wes/wes_frontend.git',
                            credentialsId: 'gitlab-http-creds',
                            refspec: '+refs/heads/*:refs/remotes/origin/*'
                        ]],
                        extensions: extensions
                    ])

                    String fullCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    String sourceTree = sh(returnStdout: true, script: 'git rev-parse HEAD^{tree}').trim()
                    def contractSyncRecord = new groovy.json.JsonSlurperClassic().parseText(readFile(file: '.contract-sync-record.json'))
                    def permissionSyncRecord = new groovy.json.JsonSlurperClassic().parseText(readFile(file: '.permission-sync-record.json'))
                    String approvedBackendCommit = params.BACKEND_COMMIT_SHA?.trim()
                    String approvedBackendTag = params.BACKEND_IMAGE_TAG?.trim()
                    String approvedFrontendCommit = params.FRONTEND_COMMIT_SHA?.trim()
                    String contractBackendCommit = contractSyncRecord.backendCommit?.toString()?.trim()
                    String permissionsBackendCommit = permissionSyncRecord.backendCommit?.toString()?.trim()
                    String openApiSha256 = contractSyncRecord.openApiSha256?.toString()?.trim()
                    String permissionsSha256 = permissionSyncRecord.permissionsSha256?.toString()?.trim()
                    boolean hasAnyReleaseInput = approvedBackendCommit || approvedBackendTag || approvedFrontendCommit
                    boolean hasAllReleaseInputs = approvedBackendCommit && approvedBackendTag && approvedFrontendCommit
                    if (hasAnyReleaseInput && !hasAllReleaseInputs) {
                        error('成对发布必须同时提供 BACKEND_IMAGE_TAG、BACKEND_COMMIT_SHA 和 FRONTEND_COMMIT_SHA')
                    }
                    if (!(contractBackendCommit ==~ /[0-9a-f]{40}/)) {
                        error('contract sync record 中的 backendCommit 必须是 40 位小写 commit SHA')
                    }
                    if (permissionsBackendCommit != contractBackendCommit) {
                        error('contract 与 permission sync record 未绑定到同一后端 commit')
                    }
                    if (!(openApiSha256 ==~ /[0-9a-f]{64}/)) {
                        error('contract sync record 中的 openApiSha256 必须是 64 位小写 SHA-256')
                    }
                    if (!(permissionsSha256 ==~ /[0-9a-f]{64}/)) {
                        error('permission sync record 中的 permissionsSha256 必须是 64 位小写 SHA-256')
                    }
                    if (hasAllReleaseInputs) {
                        if (!(approvedBackendCommit ==~ /[0-9a-f]{40}/)) {
                            error('BACKEND_COMMIT_SHA 必须是已批准的 40 位小写 commit SHA')
                        }
                        if (contractBackendCommit != approvedBackendCommit) {
                            error('contract sync record 未绑定到已批准的后端 commit')
                        }
                        if (!(approvedBackendTag ==~ /[0-9]+-${approvedBackendCommit.take(7)}/)) {
                            error('BACKEND_IMAGE_TAG 必须是已批准后端 commit 对应的不可变构建标签')
                        }
                        if (!(approvedFrontendCommit ==~ /[0-9a-f]{40}/)) {
                            error('FRONTEND_COMMIT_SHA 必须是已批准的 40 位小写 commit SHA')
                        }
                        if (approvedFrontendCommit != fullCommit) {
                            error('FRONTEND_COMMIT_SHA 与实际检出的前端 commit 不一致')
                        }
                        if (sourceBranch != 'develop') {
                            error('成对发布只能从 develop 分支执行')
                        }
                        if (env.CI_EVENT_TYPE != 'MANUAL') {
                            error('成对发布只能通过显式参数化构建执行')
                        }
                    }
                    String shortCommit = fullCommit.take(7)
                    String branchTag = sourceBranch.replaceAll(/[^A-Za-z0-9_.-]+/, '-')

                    env.CI_COMMIT_SHA = fullCommit
                    env.CI_SOURCE_TREE = sourceTree
                    env.CI_BACKEND_COMMIT_SHA = contractBackendCommit
                    env.CI_BACKEND_IMAGE_TAG = approvedBackendTag
                    env.CI_OPENAPI_SHA256 = openApiSha256
                    env.CI_PERMISSIONS_SHA256 = permissionsSha256
                    env.CI_PAIRED_RELEASE = hasAllReleaseInputs ? 'true' : 'false'
                    env.CI_SHORT_COMMIT = shortCommit
                    env.CI_BRANCH_TAG = branchTag
                    env.CI_DOCKER_IMAGE_LOCAL = "wes-frontend-ci:${env.BUILD_NUMBER}-${shortCommit}"
                    env.CI_DOCKER_IMAGE_COMMIT = "${env.IMAGE_REPO}:${env.BUILD_NUMBER}-${shortCommit}"
                    env.CI_DOCKER_IMAGE_BRANCH = "${env.IMAGE_REPO}:${branchTag}"

                    echo "🐳 前端镜像标签: ${env.CI_DOCKER_IMAGE_COMMIT}"
                }
            }
        }

        stage('Frontend Quality Checks') {
            steps {
                sh '''
                    set -e
                    mkdir -p /opt/jenkins_cache/pnpm-store
                    docker run --rm \
                        -e HUSKY=0 \
                        -e CI=true \
                        -e ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
                        -e ELECTRON_SKIP_DOWNLOAD=1 \
                        -e PNPM_STORE_DIR=/pnpm/store \
                        -v "$WORKSPACE:/app" \
                        -v /opt/jenkins_cache/pnpm-store:/pnpm/store \
                        -w /app \
                        node:22-bookworm-slim \
                        sh -lc '
                            apt-get update -qq &&
                            apt-get install -y --no-install-recommends git &&
                            rm -rf /var/lib/apt/lists/* &&
                            corepack enable &&
                            corepack prepare pnpm@10.10.0 --activate &&
                            pnpm config set store-dir "${PNPM_STORE_DIR}" &&
                            pnpm install --frozen-lockfile --prefer-offline &&
                            pnpm run menu:generate &&
                            pnpm run test &&
                            pnpm run contract:test &&
                            pnpm run contract:verify &&
                            pnpm run lint &&
                            pnpm run build:dev
                        '
                '''
                archiveArtifacts artifacts: 'artifacts/menu-manifest.json', fingerprint: true
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    set -e
                    docker build \
                        --provenance=false \
                        --sbom=false \
                        --build-arg WES_VCS_REVISION="${CI_COMMIT_SHA}" \
                        --build-arg WES_SOURCE_TREE="${CI_SOURCE_TREE}" \
                        --build-arg WES_OPENAPI_SHA256="${CI_OPENAPI_SHA256}" \
                        --build-arg WES_PERMISSIONS_SHA256="${CI_PERMISSIONS_SHA256}" \
                        --build-arg WES_BACKEND_CONTRACT_REVISION="${CI_BACKEND_COMMIT_SHA}" \
                        --build-arg VITE_API_BASE_URL=/api/v1 \
                        --build-arg VITE_APP_DEV=false \
                        --build-arg VITE_APP_TITLE="P9 MCS" \
                        -t "${CI_DOCKER_IMAGE_LOCAL}" \
                        .
                '''
            }
        }

        stage('Push Frontend Image') {
            when {
                expression {
                    env.CI_PAIRED_RELEASE == 'true'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-http-creds', usernameVariable: 'GITLAB_USER', passwordVariable: 'GITLAB_TOKEN')]) {
                    sh '''
                        set -e
                        printf '%s' "$GITLAB_TOKEN" | docker login "${REGISTRY_URL}" -u "$GITLAB_USER" --password-stdin
                        docker tag "${CI_DOCKER_IMAGE_LOCAL}" "${CI_DOCKER_IMAGE_COMMIT}"
                        docker tag "${CI_DOCKER_IMAGE_LOCAL}" "${CI_DOCKER_IMAGE_BRANCH}"
                        docker push "${CI_DOCKER_IMAGE_COMMIT}"
                        docker push "${CI_DOCKER_IMAGE_BRANCH}"
                    '''
                }
            }
        }


        stage('Trigger Test Deploy') {
            when {
                expression {
                    env.CI_PAIRED_RELEASE == 'true'
                }
            }
            steps {
                script {
                    echo "🚀 Trigger Test Deploy: source=${env.CI_SOURCE_BRANCH}, event=${env.CI_EVENT_TYPE}, frontend_tag=${env.BUILD_NUMBER}-${env.CI_SHORT_COMMIT}"
                    build job: 'wes_test_deploy',
                        wait: true,
                        propagate: true,
                        parameters: [
                            string(name: 'BACKEND_IMAGE_TAG', value: env.CI_BACKEND_IMAGE_TAG),
                            string(name: 'FRONTEND_IMAGE_TAG', value: "${env.BUILD_NUMBER}-${env.CI_SHORT_COMMIT}"),
                            string(name: 'BACKEND_COMMIT_SHA', value: env.CI_BACKEND_COMMIT_SHA),
                            string(name: 'DEPLOY_SOURCE_COMMIT_SHA', value: env.CI_BACKEND_COMMIT_SHA),
                            string(name: 'FRONTEND_COMMIT_SHA', value: env.CI_COMMIT_SHA),
                            string(name: 'OPENAPI_SHA256', value: env.CI_OPENAPI_SHA256),
                            string(name: 'PERMISSIONS_SHA256', value: env.CI_PERMISSIONS_SHA256),
                            string(name: 'SOURCE_BRANCH', value: env.CI_SOURCE_BRANCH)
                        ]
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker image rm -f "${CI_DOCKER_IMAGE_LOCAL}" >/dev/null 2>&1 || true
                docker image rm -f "${CI_DOCKER_IMAGE_COMMIT}" >/dev/null 2>&1 || true
                docker image rm -f "${CI_DOCKER_IMAGE_BRANCH}" >/dev/null 2>&1 || true
            '''
            cleanWs()
        }
        success {
            echo '✅ Frontend Pipeline 执行成功'
        }
        failure {
            echo '❌ Frontend Pipeline 执行失败'
        }
    }
}

pipeline {
    agent {
        label 'WES'
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
                    env.CI_IS_MERGE_REQUEST = isMergeRequest ? 'true' : 'false'

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
                    String shortCommit = fullCommit.take(7)
                    String branchTag = sourceBranch.replaceAll(/[^A-Za-z0-9_.-]+/, '-')

                    env.CI_COMMIT_SHA = fullCommit
                    env.CI_SOURCE_TREE = sourceTree
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
                    env.CI_IS_MERGE_REQUEST != 'true'
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
                    env.CI_SOURCE_BRANCH == 'develop' &&
                    env.CI_EVENT_TYPE == 'PUSH'
                }
            }
            steps {
                script {
                    echo "🚀 Trigger Test Deploy: source=${env.CI_SOURCE_BRANCH}, event=${env.CI_EVENT_TYPE}, frontend_tag=${env.BUILD_NUMBER}-${env.CI_SHORT_COMMIT}"
                    build job: 'wes_test_deploy',
                        wait: true,
                        propagate: true,
                        parameters: [
                            string(name: 'BACKEND_IMAGE_TAG', value: 'develop'),
                            string(name: 'FRONTEND_IMAGE_TAG', value: "${env.BUILD_NUMBER}-${env.CI_SHORT_COMMIT}"),
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

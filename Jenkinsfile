pipeline {
    agent {
        label 'WES'
    }

    environment {
        REGISTRY_URL = '192.168.0.220:5050'
        IMAGE_REPO = '192.168.0.220:5050/wes/wes_frontend'
        CI_TOOLS_IMAGE = 'wes-frontend-ci-tools:node22-pnpm10'
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
                    String beforeCommit = (env.gitlabBefore ?: '').trim()
                    String afterCommit = (env.gitlabAfter ?: '').trim()
                    boolean hasMergeRequestId = ((env.gitlabMergeRequestId ?: '').trim()) as boolean
                    boolean isMergeRequest = gitlabActionType.contains('MERGE') || hasMergeRequestId
                    boolean isDevelopPush = gitlabActionType == 'PUSH' && sourceBranch == 'develop' && !isMergeRequest
                    String mergeRequestCommit = (env.gitlabMergeRequestLastCommit ?: '').trim()
                    String trustedSourceCommit = isMergeRequest ? mergeRequestCommit : afterCommit

                    env.CI_SOURCE_BRANCH = sourceBranch
                    env.CI_TARGET_BRANCH = targetBranch
                    env.CI_EVENT_TYPE = gitlabActionType ?: 'MANUAL'
                    env.CI_IS_MERGE_REQUEST = isMergeRequest ? 'true' : 'false'
                    env.CI_RELEASE_GATE_READY = 'false'

                    echo "📥 检出前端源码: source=${sourceBranch}, target=${targetBranch ?: '-'}, event=${env.CI_EVENT_TYPE}"

                    withCredentials([usernamePassword(
                        credentialsId: 'gitlab-http-creds',
                        usernameVariable: 'GITLAB_USERNAME',
                        passwordVariable: 'GITLAB_PASSWORD'
                    )]) {
                        deleteDir()
                        sh '''
                            set +x
                            set -eu
                            git init
                            git remote add origin https://git.zontecmes.com/wes/wes_frontend.git
                            timeout --kill-after=10s 180s git -c credential.helper= \
                                -c 'credential.helper=!f() { printf "%s\\n" \
                                    "username=$GITLAB_USERNAME" "password=$GITLAB_PASSWORD"; }; f' \
                                fetch --no-tags --force origin \
                                "+refs/heads/${CI_SOURCE_BRANCH}:refs/remotes/origin/${CI_SOURCE_BRANCH}"
                            git checkout --detach "refs/remotes/origin/${CI_SOURCE_BRANCH}"
                        '''
                    }

                    if (!(trustedSourceCommit ==~ /^[0-9a-fA-F]{40}$/) || trustedSourceCommit ==~ /^0{40}$/) {
                        error('Source event requires a non-zero 40-character trusted commit')
                    }
                    String fetchedSourceCommit = sh(
                        returnStdout: true,
                        script: 'git rev-parse "refs/remotes/origin/${CI_SOURCE_BRANCH}^{commit}"'
                    ).trim()
                    if (!trustedSourceCommit.equalsIgnoreCase(fetchedSourceCommit)) {
                        error('Fetched source ref must match the trusted event commit')
                    }

                    String fullCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    String sourceTree = sh(returnStdout: true, script: 'git rev-parse HEAD^{tree}').trim()
                    if (isDevelopPush) {
                        if (!(beforeCommit ==~ /^[0-9a-fA-F]{40}$/) || beforeCommit ==~ /^0{40}$/) {
                            error('Develop push requires a non-zero 40-character gitlabBefore')
                        }
                        if (!(afterCommit ==~ /^[0-9a-fA-F]{40}$/) || !afterCommit.equalsIgnoreCase(fullCommit)) {
                            error('Develop push gitlabAfter must match the checked out HEAD')
                        }
                        int ancestryStatus = sh(
                            returnStatus: true,
                            script: "git merge-base --is-ancestor '${beforeCommit}' '${fullCommit}'"
                        )
                        if (ancestryStatus != 0) {
                            error('Develop push must fast-forward from gitlabBefore')
                        }
                        env.CI_RELEASE_GATE_READY = 'true'
                    }
                    String shortCommit = fullCommit.take(7)

                    env.CI_COMMIT_SHA = fullCommit
                    env.CI_SOURCE_TREE = sourceTree
                    env.CI_SHORT_COMMIT = shortCommit
                    env.CI_DOCKER_IMAGE_LOCAL = "wes-frontend-ci:${env.BUILD_NUMBER}-${shortCommit}"
                    env.CI_DOCKER_IMAGE_COMMIT = "${env.IMAGE_REPO}:${fullCommit}"
                    env.CI_DOCKER_IMAGE_CHANNEL = "${env.IMAGE_REPO}:develop"

                    echo "🐳 前端镜像标签: ${env.CI_DOCKER_IMAGE_COMMIT}"
                }
            }
        }

        stage('Build Frontend CI Tools Image') {
            steps {
                sh '''
                    set -e
                    docker build \
                        --provenance=false \
                        --sbom=false \
                        -f docker/ci/Dockerfile \
                        -t "${CI_TOOLS_IMAGE}" \
                        docker/ci
                '''
            }
        }

        stage('Frontend Quality Checks') {
            steps {
                script {
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
                            "${CI_TOOLS_IMAGE}" \
                            sh -lc '
                                pnpm config set store-dir "${PNPM_STORE_DIR}" &&
                                pnpm install --frozen-lockfile --prefer-offline &&
                                pnpm run test &&
                                pnpm run contract:test &&
                                pnpm run contract:verify &&
                                pnpm permission:verify &&
                                pnpm export:release-consumer --out-dir artifacts/release-consumer &&
                                pnpm run lint &&
                                pnpm run build:dev
                            '
                    '''
                    String rawFacts = sh(
                        returnStdout: true,
                        script: '''
                            docker run --rm \
                                -e PNPM_STORE_DIR=/pnpm/store \
                                -v "$WORKSPACE:/app" \
                                -v /opt/jenkins_cache/pnpm-store:/pnpm/store \
                                -w /app \
                                "${CI_TOOLS_IMAGE}" \
                                pnpm exec tsx -e 'import { validateReleaseConsumerArtifacts } from "./scripts/lib/release-consumer.ts"; const f = validateReleaseConsumerArtifacts("artifacts/release-consumer"); console.log([f.consumer_openapi_sha256, f.required_operations_sha256, f.required_permissions_sha256, f.dependencies_sha256, f.recipe_sha256].join("\\n"))'
                        '''
                    )
                    List<String> values = rawFacts.split('\n', -1) as List<String>
                    if (values.size() != 6 || values[-1] != '') {
                        error('Frontend release facts must contain exactly five newline-terminated values')
                    }
                    if (!values[0..4].every { it ==~ /^[0-9a-f]{64}$/ }) {
                        error('Frontend release SHA-256 facts must be lowercase hex')
                    }
                    env.WES_CONSUMER_OPENAPI_SHA256 = values[0]
                    env.WES_REQUIRED_OPERATIONS_SHA256 = values[1]
                    env.WES_REQUIRED_PERMISSIONS_SHA256 = values[2]
                    env.WES_FRONTEND_DEPENDENCIES_SHA256 = values[3]
                    env.WES_FRONTEND_RECIPE_SHA256 = values[4]
                }
                archiveArtifacts artifacts: 'artifacts/release-consumer/*', fingerprint: true
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    set -eu
                    docker build \
                        --provenance=false \
                        --sbom=false \
                        --build-arg WES_VCS_REVISION="${CI_COMMIT_SHA}" \
                        --build-arg WES_SOURCE_TREE="${CI_SOURCE_TREE}" \
                        --build-arg WES_CONSUMER_OPENAPI_SHA256="${WES_CONSUMER_OPENAPI_SHA256}" \
                        --build-arg WES_REQUIRED_OPERATIONS_SHA256="${WES_REQUIRED_OPERATIONS_SHA256}" \
                        --build-arg WES_REQUIRED_PERMISSIONS_SHA256="${WES_REQUIRED_PERMISSIONS_SHA256}" \
                        --build-arg WES_FRONTEND_DEPENDENCIES_SHA256="${WES_FRONTEND_DEPENDENCIES_SHA256}" \
                        --build-arg WES_FRONTEND_RECIPE_SHA256="${WES_FRONTEND_RECIPE_SHA256}" \
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
                    env.CI_EVENT_TYPE == 'PUSH' &&
                    env.CI_IS_MERGE_REQUEST != 'true' &&
                    env.CI_SOURCE_BRANCH == 'develop' &&
                    env.CI_RELEASE_GATE_READY == 'true'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-http-creds', usernameVariable: 'GITLAB_USER', passwordVariable: 'GITLAB_TOKEN')]) {
                    sh '''
                        set -e
                        printf '%s' "$GITLAB_TOKEN" | docker login "${REGISTRY_URL}" -u "$GITLAB_USER" --password-stdin
                        docker tag "${CI_DOCKER_IMAGE_LOCAL}" "${CI_DOCKER_IMAGE_COMMIT}"
                        docker tag "${CI_DOCKER_IMAGE_LOCAL}" "${CI_DOCKER_IMAGE_CHANNEL}"
                        docker push "${CI_DOCKER_IMAGE_COMMIT}"
                        docker push "${CI_DOCKER_IMAGE_CHANNEL}"
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker image rm -f "${CI_DOCKER_IMAGE_LOCAL}" >/dev/null 2>&1 || true
                docker image rm -f "${CI_DOCKER_IMAGE_COMMIT}" >/dev/null 2>&1 || true
                docker image rm -f "${CI_DOCKER_IMAGE_CHANNEL}" >/dev/null 2>&1 || true
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

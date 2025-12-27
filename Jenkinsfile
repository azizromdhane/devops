pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        IMAGE_NAME_SERVER = 'azizrom/mern-server'
        IMAGE_NAME_CLIENT = 'azizrom/mern-client'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'git@github.com:azizromdhane/mern-app.git',
                    credentialsId: 'github_ssh'
            }
        }

        stage('Build Server Image') {
            when { changeset "server/**" }
            steps {
                dir('server') {
                    script {
                        dockerImageServer = docker.build("${IMAGE_NAME_SERVER}:${BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Build Client Image') {
            when { changeset "client/**" }
            steps {
                dir('client') {
                    script {
                        dockerImageClient = docker.build("${IMAGE_NAME_CLIENT}:${BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Scan Server Image (Trivy)') {
            when { changeset "server/**" }
            steps {
                sh """
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy:latest image \
                --severity LOW,MEDIUM,HIGH,CRITICAL \
                ${IMAGE_NAME_SERVER}:${BUILD_NUMBER} > trivy_server_report.txt
                """
            }
        }

        stage('Scan Client Image (Trivy)') {
            when { changeset "client/**" }
            steps {
                sh """
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy:latest image \
                --severity LOW,MEDIUM,HIGH,CRITICAL \
                ${IMAGE_NAME_CLIENT}:${BUILD_NUMBER} > trivy_client_report.txt
                """
            }
        }

        stage('Push Server Image to Docker Hub') {
            when { changeset "server/**" }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        dockerImageServer.push("${BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Push Client Image to Docker Hub') {
            when { changeset "client/**" }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        dockerImageClient.push("${BUILD_NUMBER}")
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'trivy_*_report.txt', fingerprint: true

            sh 'docker system prune -af || true'
            echo 'Cleanup successfully done!'
        }
    }
}

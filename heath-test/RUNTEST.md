aws ecs describe-tasks \
  --cluster cluster-dev-tmp-test \
  --tasks 6a96a5c95c234e31a2d32cf880cb13e5 \
  --output json | jq

aws ecs describe-tasks --cluster cluster-dev-tmp-test --tasks 6a96a5c95c234e31a2d32cf880cb13e5 --output json

aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:ap-northeast-2:365485194891:targetgroup/tg-dev-tmp-test/37e20c7b0d30f709 --output json


aws ecs describe-services --cluster cluster-dev-tmp-test --services service-dev-tmp-test --output json | jq '.services[0].events[0:10]'

aws ecs describe-tasks --cluster cluster-dev-tmp-test --tasks 6a96a5c95c234e31a2d32cf880cb13e5 --output json | jq '{taskArn: .tasks[0].taskArn, createdAt: .tasks[0].createdAt, startedAt: .tasks[0].startedAt, stoppingAt: .tasks[0].stoppingAt, healthStatus: .tasks[0].healthStatus, lastStatus: .tasks[0].lastStatus, containers: .tasks[0].containers[0].healthStatus}'



------------------------------------------------------------------------------------

aws ecs describe-tasks \
  --cluster cluster-dev-tmp-test \
  --tasks 6a96a5c95c234e31a2d32cf880cb13e5 \
  --output json | jq '{
    created: .tasks[0].createdAt,
    started: .tasks[0].startedAt,
    stopping: .tasks[0].stoppingAt,
    containerHealth: .tasks[0].containers[0].healthStatus,
    taskHealth: .tasks[0].healthStatus
  }'

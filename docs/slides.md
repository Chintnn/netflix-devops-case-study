# Slide 1 - The Problem
- 2008: a database corruption stopped DVD shipping for 3 days
- One database, tightly coupled parts, so one fault broke everything
- Goal of this project: build a small service that survives failures

# Slide 2 - Architecture
- Node.js service with health, metrics, and a recommendation fallback
- Docker image -> Kubernetes (3 replicas) -> Prometheus -> Grafana
- Ansible prepares the runtime environment

# Slide 3 - Pipeline Flow
- Push to main -> GitHub Actions
- Job 1: install and test. Job 2: build image and push to GHCR
- (Insert pipeline diagram screenshot)

# Slide 4 - Challenges
- Ansible playbook had to be written for macOS (Homebrew, not apt)
- Monitoring stack needed more Docker memory
- ServiceMonitor needed the right release label

# Slide 5 - Lessons Learned
- Assume failure and test for it (pod deletion, fallback)
- Rolling update and rollback make releases safe
- Dashboards turn "it feels slow" into numbers
(Insert Grafana dashboard screenshot)